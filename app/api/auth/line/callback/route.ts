import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://datewithsoul.vercel.app";
    const redirectUri = `${siteUrl}/api/auth/line/callback`;

    if (!process.env.LINE_CLIENT_ID || !process.env.LINE_CLIENT_SECRET) {
      console.error("Missing LINE credentials");
      return NextResponse.redirect(`${origin}/login?error=ConfigurationError`);
    }

    // 1. Exchange code for LINE token
    const tokenResponse = await fetch('https://api.line.me/oauth2/v2.1/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri,
        client_id: process.env.LINE_CLIENT_ID!,
        client_secret: process.env.LINE_CLIENT_SECRET!
      })
    })

    const tokenData = await tokenResponse.json()
    if (tokenData.error) throw new Error("Token exchange failed")

    // 2. Get LINE Profile
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    })
    
    const profile = await profileResponse.json()
    if (!profile.userId) throw new Error('Failed to get LINE profile')

    // 3. Sync with Supabase (Bypass Email requirement)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    const dummyEmail = `${profile.userId.toLowerCase()}@line.datewithsoul.local`
    
    // Check if user exists in our DB first
    let dbUser = await prisma.user.findFirst({ where: { lineId: profile.userId } });
    const oneTimePassword = crypto.randomUUID(); // Secure dynamic password

    let authUserId = "";

    if (dbUser) {
      authUserId = dbUser.id;
      // Update the user's password in Supabase for this login session
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, {
        password: oneTimePassword
      });
      if (updateError) throw new Error("Failed to update auth session");
      
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          name: profile.displayName,
          image: profile.pictureUrl,
        }
      });
    } else {
      // Create new user in Supabase Auth
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: oneTimePassword,
        email_confirm: true,
        user_metadata: {
          name: profile.displayName,
          avatar_url: profile.pictureUrl
        }
      })
      let authUserId = "";
      if (createError) {
        if (createError.message.includes("already") || createError.message.includes("registered") || createError.message.includes("Database error")) {
          // Check if there is an orphaned user or identity using Supabase API
          const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
          const existingUser = usersData?.users.find(u => u.email === dummyEmail);
          
          if (existingUser) {
            authUserId = existingUser.id;
            const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(authUserId, { password: oneTimePassword });
            if (updateError) {
              throw new Error("Failed to update user password: " + updateError.message);
            }
          } else {
            // It might be an orphaned identity blocking the creation
            console.log("Checking for orphaned identity for", dummyEmail);
            await prisma.$executeRaw`DELETE FROM auth.identities WHERE provider = 'email' AND provider_id = ${dummyEmail}`;
            
            // Try creating the user again
            const { data: retryData, error: retryError } = await supabaseAdmin.auth.admin.createUser({
              email: dummyEmail,
              password: oneTimePassword,
              email_confirm: true,
              user_metadata: {
                name: profile.displayName,
                avatar_url: profile.pictureUrl
              }
            });
            
            if (retryError) {
              console.error("Retry Create User Error:", retryError);
              throw new Error(retryError.message || "Failed to create auth profile after cleanup");
            }
            authUserId = retryData!.user.id;
          }
        } else {
          console.error("Create User Error:", createError);
          throw new Error(createError.message || "Failed to create auth profile");
        }
      } else {
        authUserId = newUserData!.user.id;
      }

      // Check if any admin exists
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const roleToAssign = adminCount === 0 ? 'ADMIN' : undefined;

      dbUser = await prisma.user.create({
        data: {
          id: authUserId,
          lineId: profile.userId,
          name: profile.displayName,
          email: dummyEmail,
          image: profile.pictureUrl,
          ...(roleToAssign ? { role: roleToAssign } : {}),
        }
      });

      // Send Welcome Notification
      const { sendLineMessage } = await import('@/lib/line')
      await sendLineMessage(profile.userId, `สวัสดีคุณ ${profile.displayName} เข้าสู่ระบบ Date with Soul เรียบร้อยแล้วค่ะ`)
    }

    // 4. Sign the user in (creates session cookies via our normal SSR client)
    const { createClient: createSSRClient } = await import('@/utils/supabase/server')
    const supabase = await createSSRClient()
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: oneTimePassword
    })

    if (signInError) {
      console.error("Sign In Error:", signInError);
      throw new Error(signInError.message || "Sign in failed");
    }

    // 5. Check if onboarding is required
    if (!dbUser.phone || !dbUser.email || dbUser.email === dummyEmail) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Success! Redirect home
    return NextResponse.redirect(`${origin}/`)

  } catch (err: any) {
    console.error('LINE Auth Error:', err)
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(err.message || "AuthenticationFailed")}`)
  }
}
