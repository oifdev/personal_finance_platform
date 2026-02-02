'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, ChevronDown } from 'lucide-react'

const content = {
    es: {
        title: 'Toma el Control de',
        titleHighlight: 'Tus Finanzas Personales',
        subtitle: 'Gestiona tus ingresos, gastos, tarjetas de crédito y presupuestos en un solo lugar. Con análisis inteligente impulsado por IA.',
        cta: 'Comienza Gratis',
        secondary: 'Ver Demo',
        stats: [
            { value: '10K+', label: 'Usuarios Activos' },
            { value: '$50M+', label: 'Transacciones' },
            { value: '99.9%', label: 'Uptime' },
        ],
    },
    en: {
        title: 'Take Control of',
        titleHighlight: 'Your Personal Finances',
        subtitle: 'Manage your income, expenses, credit cards and budgets in one place. With AI-powered intelligent analysis.',
        cta: 'Get Started Free',
        secondary: 'View Demo',
        stats: [
            { value: '10K+', label: 'Active Users' },
            { value: '$50M+', label: 'Transactions' },
            { value: '99.9%', label: 'Uptime' },
        ],
    },
}

export default function HeroSection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
    const [isVisible, setIsVisible] = useState(false)
    const t = content[lang]

    useEffect(() => {
        setIsVisible(true)
    }, [])

    return (
        <section
            id="hero"
            className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
        >
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10 dark:to-primary/5" />

            {/* Animated Shapes */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-primary/5 to-accent/5 rounded-full blur-3xl" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(56,182,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(56,182,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-5xl mx-auto text-center">
                    {/* Badge */}
                    <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-sm font-medium text-foreground/80">
                            {lang === 'es' ? 'Nueva versión disponible' : 'New version available'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1
                        className={`text-4xl md:text-5xl lg:text-7xl font-bold mb-6 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <span className="text-foreground">{t.title}</span>
                        <br />
                        <span className="bg-gradient-to-r from-primary via-primary to-accent bg-clip-text text-transparent">
                            {t.titleHighlight}
                        </span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        {t.subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div
                        className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        <Link
                            href="/login?register=true"
                            className="btn-primary px-8 py-4 rounded-full text-lg font-semibold flex items-center gap-2 group"
                        >
                            {t.cta}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-4 rounded-full text-lg font-semibold border border-border hover:border-primary hover:text-primary transition-all"
                        >
                            {t.secondary}
                        </Link>
                    </div>

                    {/* Stats */}
                    <div
                        className={`grid grid-cols-3 gap-8 max-w-xl mx-auto transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                            }`}
                    >
                        {t.stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-2xl md:text-3xl font-bold text-primary">{stat.value}</div>
                                <div className="text-sm text-foreground/60">{stat.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* App Preview */}
                    <div
                        className={`mt-16 relative transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                            }`}
                    >
                        <div className="glass-card rounded-2xl p-2 md:p-4 max-w-4xl mx-auto">
                            <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-secondary to-background">
                                {/* Dashboard Preview Mockup */}
                                <div className="absolute inset-0 p-4 md:p-8">
                                    <div className="h-full w-full rounded-lg bg-background/50 backdrop-blur-sm border border-border/50 p-4">
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-primary/20" />
                                                <div className="h-4 w-24 bg-foreground/10 rounded" />
                                            </div>
                                            <div className="flex gap-2">
                                                <div className="h-8 w-20 bg-primary/20 rounded-lg" />
                                                <div className="h-8 w-20 bg-accent/20 rounded-lg" />
                                            </div>
                                        </div>
                                        {/* Cards */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="h-20 rounded-lg bg-gradient-to-br from-primary/30 to-primary/10 p-3">
                                                <div className="h-3 w-16 bg-white/30 rounded mb-2" />
                                                <div className="h-5 w-20 bg-white/50 rounded" />
                                            </div>
                                            <div className="h-20 rounded-lg bg-gradient-to-br from-green-500/30 to-green-500/10 p-3">
                                                <div className="h-3 w-16 bg-white/30 rounded mb-2" />
                                                <div className="h-5 w-20 bg-white/50 rounded" />
                                            </div>
                                            <div className="h-20 rounded-lg bg-gradient-to-br from-accent/30 to-accent/10 p-3">
                                                <div className="h-3 w-16 bg-white/30 rounded mb-2" />
                                                <div className="h-5 w-20 bg-white/50 rounded" />
                                            </div>
                                        </div>
                                        {/* Chart Area */}
                                        <div className="h-32 rounded-lg bg-foreground/5 flex items-end justify-around p-4">
                                            {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 65, 90].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="w-4 rounded-t bg-gradient-to-t from-primary to-primary/50"
                                                    style={{ height: `${h}%` }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Glow Effect */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-transparent to-accent/20 blur-2xl -z-10" />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                <ChevronDown className="w-6 h-6 text-foreground/50" />
            </div>
        </section>
    )
}
