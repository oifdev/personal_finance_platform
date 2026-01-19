import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    const next = searchParams.get('next') ?? '/'

    // Check for errors returned by Supabase directly in the URL
    const error = searchParams.get('error')
    const error_description = searchParams.get('error_description')

    if (error) {
        console.error('Callback: Error param received:', error, error_description)
        return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(error_description || error)}`)
    }

    if (code) {
        const supabase = await createClient()
        const { error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

        if (!sessionError) {
            console.log('Callback: Session exchanged successfully. Redirecting to:', next)
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('Callback: Error exchanging code for session:', sessionError)
            return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent(sessionError.message)}`)
        }
    } else {
        console.error('Callback: No code provided in URL')
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/login?error=Enlace inválido o expirado`)
}
