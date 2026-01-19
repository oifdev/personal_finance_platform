'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/(dashboard)/profile/actions'
import { Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SuccessModal } from '@/components/ui/success-modal'
import Link from 'next/link'
import { PasswordField } from '@/components/ui/password-field'

export default function UpdatePasswordPage() {
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden')
            return
        }

        try {
            setLoading(true)
            const result = await updatePassword(formData)

            if (result.error) {
                if (result.error === 'Unauthorized') {
                    alert('Tu sesión ha expirado o es inválida. Por favor solicita un nuevo enlace de recuperación.')
                    router.push('/login')
                    return
                }
                alert(result.error)
                return
            }

            if (result.success) {
                setSuccessMessage('Tu contraseña ha sido actualizada correctamente. Ahora serás redirigido al inicio de sesión.')
                setTimeout(() => {
                    router.push('/login')
                }, 3000)
            }
        } catch (error: any) {
            alert('Ocurrió un error: ' + (error.message || error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => { }}
                title="Contraseña Actualizada"
                description={successMessage || ''}
            />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#38b6ff]/20 text-[#38b6ff] mb-4 glass">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="text-[#38b6ff]">Recuperar</span>
                        <span className="text-[#f1d77a]"> Contraseña</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Ingresa una nueva contraseña segura para tu cuenta.
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <form action={handleSubmit} className="space-y-4">
                        <PasswordField
                            id="newPassword"
                            name="newPassword"
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
                            disabled={loading || password !== confirmPassword || password.length < 8}
                            className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                            Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
