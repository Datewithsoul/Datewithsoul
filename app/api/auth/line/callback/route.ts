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
        // "Database error creating new user" = Supabase has orphaned auth.users or auth.identities record
        console.log("Create user error:", createError.message, "- attempting cleanup and retry...");

        // Find any orphaned auth user with this email and delete it completely
        let page = 1;
        let orphanId: string | null = null;
        while (!orphanId) {
          const { data: usersData } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
          if (!usersData || usersData.users.length === 0) break;
          const found = usersData.users.find(u => u.email === dummyEmail);
          if (found) { orphanId = found.id; break; }
          if (usersData.users.length < 1000) break;
          page++;
        }

        if (orphanId) {
          console.log("Deleting orphaned auth user:", orphanId);
          await supabaseAdmin.auth.admin.deleteUser(orphanId);
          // Small delay to allow Supabase to process the deletion
          await new Promise(r => setTimeout(r, 500));
        }

        // Retry creating the user fresh
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
          throw new Error("ไม่สามารถสร้างบัญชีได้ กรุณาลองใหม่อีกครั้ง: " + retryError.message);
        }
        authUserId = retryData!.user.id;
      } else {
        authUserId = newUserData!.user.id;
      }

      // Check if any admin exists
      const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
      const roleToAssign = adminCount === 0 ? 'ADMIN' : undefined;

      // Use upsert to handle cases where Supabase trigger may have already created the row
      dbUser = await prisma.user.upsert({
        where: { id: authUserId },
        create: {
          id: authUserId,
          lineId: profile.userId,
          name: profile.displayName,
          email: dummyEmail,
          image: profile.pictureUrl,
          ...(roleToAssign ? { role: roleToAssign } : {}),
        },
        update: {
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
