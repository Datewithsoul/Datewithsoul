import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Sync user to database
      const supabaseUser = data.user
      const email = supabaseUser.email || undefined
      const name = supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name || 'LINE User'
      
      await prisma.user.upsert({
        where: { id: supabaseUser.id },
        update: {
          name,
          email,
        },
        create: {
          id: supabaseUser.id,
          name,
          email,
        }
      })

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalNode = process.env.NODE_ENV === 'development'
      if (isLocalNode) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/login?error=Authentication failed`)
}
