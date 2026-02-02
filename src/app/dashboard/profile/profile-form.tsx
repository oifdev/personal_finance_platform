'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { updateProfile, uploadAvatar, updatePassword } from '@/app/dashboard/profile/actions'
import { User, Camera, Loader2, Lock } from 'lucide-react'
import Image from 'next/image'
import { SuccessModal } from '@/components/ui/success-modal'
import { PasswordField } from '@/components/ui/password-field'

export function ProfileForm({ initialData }: { initialData?: any }) {
    const [loading, setLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState<string | null>(initialData?.avatar_url || null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // UI States
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [successTitle, setSuccessTitle] = useState('')

    const passwordFormRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        if (initialData?.avatar_url) {
            setAvatarUrl(initialData.avatar_url)
        }
    }, [initialData])

    async function handleAvatarUpload(event: React.ChangeEvent<HTMLInputElement>) {
        try {
            setUploading(true)
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debe seleccionar una imagen.')
            }

            const file = event.target.files[0]
            const formData = new FormData()
            formData.append('file', file)

            const { url, error } = await uploadAvatar(formData)

            if (error) throw error
            if (url) setAvatarUrl(url)

        } catch (error: any) {
            alert('Error al subir imagen: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    async function handleSubmit(formData: FormData) {
        try {
            setLoading(true)
            if (avatarUrl) {
                formData.append('avatar_url', avatarUrl)
            }

            const { error } = await updateProfile(formData)
            if (error) throw error

            setSuccessTitle('Perfil Actualizado')
            setSuccessMessage('Tu información de perfil ha sido guardada correctamente.')
        } catch (error: any) {
            alert('Error al actualizar el perfil: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    async function handlePasswordSubmit(formData: FormData) {
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        try {
            setPasswordLoading(true)
            const { error, success } = await updatePassword(formData)

            if (error) throw new Error(error)

            if (success) {
                setSuccessTitle('Contraseña Actualizada')
                setSuccessMessage('Tu contraseña ha sido cambiada exitosamente.')
                passwordFormRef.current?.reset()
                setPassword('')
                setConfirmPassword('')
            }
        } catch (error: any) {
            alert('Error al cambiar contraseña: ' + error.message)
        } finally {
            setPasswordLoading(false)
        }
    }

    return (
        <div className="max-w-xl mx-auto space-y-8">
            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title={successTitle}
                description={successMessage || ''}
            />

            {/* Profile Info Form */}
            <div className="glass-card p-8 rounded-xl ring-1 ring-border/50">
                <form action={handleSubmit} className="space-y-8">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <User className="w-5 h-5 text-[#38b6ff]" />
                        Información Personal
                    </h2>

                    {/* Avatar Section */}
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer">
                            <div className="h-24 w-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#38b6ff]/30 flex items-center justify-center relative">
                                {avatarUrl ? (
                                    <Image
                                        src={avatarUrl}
                                        alt="Avatar"
                                        width={96}
                                        height={96}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <User className="h-10 w-10 text-muted-foreground" />
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                            </div>

                            {uploading && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full z-10">
                                    <Loader2 className="h-6 w-6 text-[#38b6ff] animate-spin" />
                                </div>
                            )}

                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarUpload}
                                disabled={uploading}
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Toca para cambiar tu foto</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nombre Completo</label>
                            <input
                                name="full_name"
                                type="text"
                                defaultValue={initialData?.full_name || ''}
                                placeholder="Tu nombre"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-[#38b6ff]/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Usuario</label>
                            <input
                                name="username"
                                type="text"
                                defaultValue={initialData?.username || ''}
                                placeholder="username"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-[#38b6ff]/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Sitio Web</label>
                            <input
                                name="website"
                                type="url"
                                defaultValue={initialData?.website || ''}
                                placeholder="https://example.com"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-[#38b6ff]/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Correo Electrónico (Contacto)</label>
                            <input
                                name="email"
                                type="email"
                                defaultValue={initialData?.email || initialData?.user_email || ''}
                                placeholder="tu@email.com"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-[#38b6ff]/50 outline-none transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Moneda Preferida</label>
                            <select
                                name="currency"
                                defaultValue={initialData?.currency || 'USD'}
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-[#38b6ff]/50 outline-none transition-all"
                            >
                                <option value="USD" className="bg-background text-foreground">USD - Dólar Estadounidense ($)</option>
                                <option value="HNL" className="bg-background text-foreground">HNL - Lempira (L)</option>
                                <option value="EUR" className="bg-background text-foreground">EUR - Euro (€)</option>
                                <option value="MXN" className="bg-background text-foreground">MXN - Peso Mexicano ($)</option>
                            </select>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || uploading}
                        className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? 'Guardando...' : 'Actualizar Perfil'}
                    </button>
                </form>
            </div>

            {/* Password Change Form */}
            <div className="glass-card p-8 rounded-xl ring-1 ring-border/50">
                <form ref={passwordFormRef} action={handlePasswordSubmit} className="space-y-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#38b6ff]" />
                        Seguridad
                    </h2>

                    <PasswordField
                        id="password"
                        name="password"
                        label="Nueva Contraseña"
                        placeholder="••••••••"
                        required
                        showValidation
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <PasswordField
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirmar Contraseña"
                        placeholder="••••••••"
                        required
                        confirmValue={password}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={passwordLoading || password !== confirmPassword || password.length < 8}
                        className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {passwordLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {passwordLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                    </button>
                </form>
            </div>
        </div>
    )
}
