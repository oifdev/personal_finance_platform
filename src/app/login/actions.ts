'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email('Correo inválido').trim().toLowerCase(),
    password: z.string().min(1, 'La contraseña es requerida')
})

export async function login(formData: FormData) {
    const supabase = await createClient()

    const rawEmail = formData.get('email') as string
    const rawPassword = formData.get('password') as string

    const validatedFields = loginSchema.safeParse({
        email: rawEmail,
        password: rawPassword,
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Datos inválidos' }
    }

    const { email, password } = validatedFields.data

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

const signupSchema = z.object({
    email: z.string().email('Correo inválido').trim().toLowerCase(),
    password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
    fullName: z.string().min(2, 'El nombre es muy corto').trim()
})

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const validatedFields = signupSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password'),
        fullName: formData.get('fullName'),
    })

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        return { error: errors.email?.[0] || errors.password?.[0] || errors.fullName?.[0] || 'Datos inválidos' }
    }

    const { email, password, fullName } = validatedFields.data

    const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                full_name: fullName,
            },
        },
    })

    if (error) {
        console.error('Signup error:', error)
        return { error: error.message }
    }

    if (user && user.identities && user.identities.length === 0) {
        return { error: 'Este correo ya está registrado.' }
    }

    // If successful signup but requires verification
    return { success: true, message: 'Revisa tu correo para confirmar la cuenta.' }
}

export async function signout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/login')
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
            queryParams: {
                access_type: 'offline',
                prompt: 'consent',
            },
        },
    })

    if (error) {
        redirect('/login?error=oauth-error')
    }

    if (data.url) {
        redirect(data.url)
    }
}

const forgotPasswordSchema = z.object({
    email: z.string().email('Correo inválido').trim().toLowerCase()
})

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient()

    const validatedFields = forgotPasswordSchema.safeParse({
        email: formData.get('email')
    })

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.email?.[0] || 'Correo inválido' }
    }

    const { email } = validatedFields.data

    // Redirect to dedicated update-password page after login via magic link
    // NOTE: NEXT_PUBLIC_SITE_URL must be correctly set for prod/mobile testing
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/update-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: 'Revisa tu correo para restablecer tu contraseña.' }
}
