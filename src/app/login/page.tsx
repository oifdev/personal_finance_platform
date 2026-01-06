'use client'

import { login, signup } from './actions'
import { Check, Wallet } from 'lucide-react'
import { useState } from 'react'

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function handleSubmit(formData: FormData) {
        setError(null)
        const action = isLogin ? login : signup
        const result = await action(formData)
        if (result?.error) {
            setError(result.error)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/20 text-primary mb-4 glass">
                        <Wallet className="w-8 h-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Finance Platform</h1>
                    <p className="text-muted-foreground mt-2">
                        {isLogin ? 'Welcome back! Please enter your details.' : 'Create an account to start managing your finances.'}
                    </p>
                </div>

                <div className="glass-card rounded-2xl p-8">
                    <form action={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium" htmlFor="fullName">Full Name</label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    placeholder="John Doe"
                                    className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                />
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="email">Email</label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                placeholder="hello@example.com"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium" htmlFor="password">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-sm rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-lg hover:bg-emerald-600 transition-colors focus:ring-4 focus:ring-primary/20"
                        >
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="mt-6 text-center text-sm">
                        <span className="text-muted-foreground">
                            {isLogin ? "Don't have an account? " : "Already have an account? "}
                        </span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="font-medium text-primary hover:underline hover:text-emerald-400 transition-colors"
                        >
                            {isLogin ? 'Sign up' : 'Log in'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
