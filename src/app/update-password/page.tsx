'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/(dashboard)/profile/actions'
import { Lock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { SuccessModal } from '@/components/ui/success-modal'
import Link from 'next/link'

export default function UpdatePasswordPage() {
    const [loading, setLoading] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const router = useRouter()

    async function handleSubmit(formData: FormData) {
        try {
            setLoading(true)
            const result = await updatePassword(formData)

            if (result.error) {
                alert(result.error)
                return
            }

            if (result.success) {
                setSuccessMessage('Tu contraseña ha sido actualizada correctamente. Ahora serás redirigido al inicio.')
                setTimeout(() => {
                    router.push('/')
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 glass">
                        <Lock className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Recuperar Contraseña</h1>
                    <p className="text-muted-foreground mt-2">
                        Ingresa una nueva contraseña para tu cuenta.
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <form action={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Nueva Contraseña</label>
                            <input
                                name="newPassword"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Confirmar Contraseña</label>
                            <input
                                name="confirmPassword"
                                type="password"
                                required
                                minLength={6}
                                placeholder="••••••••"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-emerald-600 transition-colors focus:ring-4 focus:ring-primary/20 flex items-center justify-center gap-2"
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
