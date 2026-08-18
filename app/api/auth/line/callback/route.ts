import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { prisma } from '@/lib/prisma'

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
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const redirectUri = `${siteUrl}/api/auth/line/callback`;

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
    if (tokenData.error) throw new Error(tokenData.error_description)

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
    const defaultPassword = profile.userId // use their LINE ID as password internally

    let authUser;
    
    // Check if user exists in Supabase Auth
    const { data: usersData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = usersData.users.find(u => u.email === dummyEmail)

    if (existingUser) {
      authUser = existingUser
      // Ensure the user has the correct password set (in case they were created via OIDC previously)
      await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
        password: defaultPassword
      })
    } else {
      // Create new user in Supabase Auth
      const { data: newUserData, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: dummyEmail,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          name: profile.displayName,
          avatar_url: profile.pictureUrl
        }
      })
      if (createError) throw createError
      authUser = newUserData.user
    }

    // 4. Sync with Prisma DB
    const dbUser = await prisma.user.upsert({
      where: { id: authUser.id },
      update: {
        name: profile.displayName,
        image: profile.pictureUrl,
      },
      create: {
        id: authUser.id,
        name: profile.displayName,
        image: profile.pictureUrl,
      }
    })

    // 5. Sign the user in (creates session cookies via our normal SSR client)
    const { createClient: createSSRClient } = await import('@/utils/supabase/server')
    const supabase = await createSSRClient()
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: dummyEmail,
      password: defaultPassword
    })

    if (signInError) throw signInError

    // 6. Check if onboarding is required
    if (!dbUser.phone || !dbUser.email) {
      return NextResponse.redirect(`${origin}/onboarding`)
    }

    // Success! Redirect home
    return NextResponse.redirect(`${origin}/`)

  } catch (err: any) {
    console.error('LINE Auth Error:', err)
    return NextResponse.redirect(`${origin}/login?error=Authentication failed: ${err.message}`)
  }
}
