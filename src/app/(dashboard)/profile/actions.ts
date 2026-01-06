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

export async function updateProfile(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const full_name = formData.get('full_name') as string
    const username = formData.get('username') as string
    const website = formData.get('website') as string
    const avatar_url = formData.get('avatar_url') as string
    const currency = formData.get('currency') as string
    // Email is usually read-only from auth, but if we store it in profile we can update it (contact email)
    const email = formData.get('email') as string

    const updates = {
        id: user.id,
        full_name,
        username,
        website,
        avatar_url,
        currency,
        email,
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

export async function updatePassword(formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const password = formData.get('password') as string || formData.get('newPassword') as string // Handle both field names used in different forms
    const confirmPassword = formData.get('confirmPassword') as string

    if (!password || password.length < 6) {
        return { error: 'La contraseña debe tener al menos 6 caracteres.' }
    }

    if (password !== confirmPassword) {
        return { error: 'Las contraseñas no coinciden.' }
    }

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}
