'use client'

import { login, signup, signInWithGoogle, forgotPassword } from './actions'
import { Check, Wallet } from 'lucide-react'
import { GoogleLogo } from '@/components/ui/google-logo'
import { useState } from 'react'
import { SuccessModal } from '@/components/ui/success-modal'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        setSuccessMessage(null)

        let action;
        if (isForgotPassword) {
            action = forgotPassword
        } else {
            action = isLogin ? login : signup
        }

        const result = await action(formData)

        if (result?.error) {
            console.error('Action error:', result.error)
            setError(result.error)
        } else if (result && 'message' in result && typeof result.message === 'string') {
            setSuccessMessage(result.message)
            // If forgot password success, maybe switch back to login or just show modal
            if (isForgotPassword) {
                // Keep modal open, user understands they need to check email
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title="Registro Exitoso"
                description={successMessage || ''}
            />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 glass">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Platform</h1>
                    <p className="text-muted-foreground mt-2">
                        {isLogin ? '¡Bienvenido de nuevo! Introduce tus datos.' : 'Crea una cuenta para comenzar a administrar tus finanzas.'}
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <form action={handleSubmit} className="space-y-4">
                        {/* Show Name field only for signup and NOT forgot password */}
                        {!isLogin && !isForgotPassword && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="fullName">Nombre completo</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required={!isLogin && !isForgotPassword}
                                    placeholder="Carlos Flores"
                                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Correo electrónico</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="carlos.flores@example.com"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>

                        {/* Hide Password field for forgot password */}
                        {!isForgotPassword && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-medium" htmlFor="password">Contraseña</label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    )}
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required={!isForgotPassword}
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                />
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-emerald-600 transition-colors focus:ring-4 focus:ring-primary/20"
                        >
                            {isForgotPassword
                                ? 'Enviar enlace de recuperación'
                                : (isLogin ? 'Iniciar sesión' : 'Registrarse')}
                        </button>

                        {isForgotPassword && (
                            <button
                                type="button"
                                onClick={() => setIsForgotPassword(false)}
                                className="w-full text-sm text-muted-foreground hover:text-foreground mt-2"
                            >
                                Cancelar y volver al inicio de sesión
                            </button>
                        )}
                    </form>

                    {!isForgotPassword && (
                        <>
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">O continuar con</span>
                                </div>
                            </div>

                            <form action={signInWithGoogle}>
                                <button
                                    type="submit"
                                    className="w-full py-2.5 bg-white text-zinc-900 font-medium rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                >
                                    <GoogleLogo className="w-5 h-5" />
                                    Google
                                </button>
                            </form>

                            <div className="mt-6 text-center text-sm">
                                <span className="text-muted-foreground">
                                    {isLogin ? "¿No tienes una cuenta? " : "¿Ya tienes una cuenta? "}
                                </span>
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="font-medium text-primary hover:underline hover:text-emerald-400 transition-colors"
                                >
                                    {isLogin ? 'Registrarse' : 'Iniciar sesión'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
