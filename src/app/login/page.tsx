'use client'

import { login, signup, signInWithGoogle, forgotPassword } from './actions'
import { Wallet } from 'lucide-react'
import { GoogleLogo } from '@/components/ui/google-logo'
import { useState } from 'react'
import { SuccessModal } from '@/components/ui/success-modal'
import { PasswordField } from '@/components/ui/password-field'
import { ThemeToggle } from '@/components/theme-toggle'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [isForgotPassword, setIsForgotPassword] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    async function handleSubmit(formData: FormData) {
        setError(null)
        setSuccessMessage(null)

        // Validation for signup
        if (!isLogin && !isForgotPassword) {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden')
                return
            }
            if (password.length < 8) {
                setError('La contraseña debe tener al menos 8 caracteres')
                return
            }
        }

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

            // If signup or forgot password success, show modal and then potential redirect
            if (!isLogin || isForgotPassword) {
                // If signup success, maybe clear form and suggest login
                // User requirement: "redirigir automáticamente al login"
                setTimeout(() => {
                    setSuccessMessage(null)
                    setIsLogin(true)
                    setIsForgotPassword(false)
                }, 4000)
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
            <div className="absolute top-4 right-4 animate-in fade-in slide-in-from-top-4 duration-500">
                <ThemeToggle />
            </div>
            <SuccessModal
                isOpen={!!successMessage}
                onClose={() => setSuccessMessage(null)}
                title={isForgotPassword ? "Correo Enviado" : (isLogin ? "Acceso Correcto" : "Registro Exitoso")}
                description={successMessage || ''}
            />

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#38b6ff]/20 text-[#38b6ff] mb-4 glass">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        <span className="text-[#38b6ff]">OG</span>
                        <span className="text-[#f1d77a]">Finance</span>
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        {isLogin ? '¡Bienvenido de nuevo! Introduce tus datos.' :
                            isForgotPassword ? 'Recupera el acceso a tu cuenta.' :
                                'Crea una cuenta para comenzar a administrar tus finanzas.'}
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

                        {/* Password Fields */}
                        {!isForgotPassword && (
                            <>
                                <PasswordField
                                    id="password"
                                    name="password"
                                    label="Contraseña"
                                    placeholder="••••••••"
                                    required
                                    showValidation={!isLogin}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                {isLogin && (
                                    <div className="flex justify-end mt-[-8px]">
                                        <button
                                            type="button"
                                            onClick={() => setIsForgotPassword(true)}
                                            className="text-xs text-[#38b6ff] hover:underline"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </button>
                                    </div>
                                )}
                                {!isLogin && (
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
                                )}
                            </>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20"
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
                                    className="w-full py-2.5 bg-surface text-foreground font-medium rounded-lg hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2 border border-border shadow-sm"
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
                                    onClick={() => {
                                        setIsLogin(!isLogin)
                                        setError(null)
                                    }}
                                    className="font-medium text-[#38b6ff] hover:underline transition-colors"
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
