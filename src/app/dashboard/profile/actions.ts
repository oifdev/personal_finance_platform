'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getProfile() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        // PGRST116 is "The result contains 0 rows"
        return { error: error.message }
    }

    // If no profile exists, return basic user info from auth
    if (!profile) {
        return {
            data: {
                id: user.id,
                full_name: user.user_metadata?.full_name || '',
                username: user.email?.split('@')[0] || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                website: '',
                email: user.email || '',
                currency: 'USD'
            }
        }
    }

    return { data: profile }
}

import { z } from 'zod'

const profileSchema = z.object({
    full_name: z.string().min(2, 'El nombre es muy corto').trim(),
    username: z.string().min(2, 'El nombre de usuario es muy corto').trim().toLowerCase(),
    website: z.string().url('URL inválida').or(z.literal('')).nullable().optional(),
    currency: z.string().min(1, 'La moneda es requerida'),
    email: z.string().email('Correo inválido').trim().toLowerCase(),
    avatar_url: z.string().nullable().optional(),
})

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const validatedFields = profileSchema.safeParse({
        full_name: formData.get('full_name'),
        username: formData.get('username'),
        website: formData.get('website'),
        avatar_url: formData.get('avatar_url'),
        currency: formData.get('currency'),
        email: formData.get('email'),
    })

    if (!validatedFields.success) {
        const errors = validatedFields.error.flatten().fieldErrors
        return { error: Object.values(errors).flat()[0] || 'Datos inválidos' }
    }

    const updates = {
        id: user.id,
        ...validatedFields.data,
        updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)

    if (error) {
        console.error('Server Update Error:', error)
        return { error: error.message }
    }

    revalidatePath('/profile')
    return { success: true }
}

export async function uploadAvatar(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

    if (uploadError) {
        return { error: uploadError.message }
    }

    // Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    return { url: publicUrl }
}

const passwordSchema = z.object({
    password: z.string()
        .min(8, 'Mínimo 8 caracteres')
        .regex(/[A-Z]/, 'Al menos una mayúscula')
        .regex(/[a-z]/, 'Al menos una minúscula')
        .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Al menos un carácter especial'),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword']
})

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const rawPassword = formData.get('password') as string || formData.get('newPassword') as string
    const rawConfirm = formData.get('confirmPassword') as string

    const validatedFields = passwordSchema.safeParse({
        password: rawPassword,
        confirmPassword: rawConfirm
    })

    if (!validatedFields.success) {
        const error = validatedFields.error.flatten().fieldErrors.password?.[0] ||
            validatedFields.error.flatten().fieldErrors.confirmPassword?.[0]
        return { error: error || 'Contraseña inválida' }
    }

    const { password } = validatedFields.data

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
