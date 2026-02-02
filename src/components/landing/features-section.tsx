'use client'

import { useEffect, useRef, useState } from 'react'
import {
    LayoutDashboard,
    CreditCard,
    FolderOpen,
    BarChart3,
    PiggyBank,
    Bot,
    Sparkles,
    Shield,
    Zap
} from 'lucide-react'

const content = {
    es: {
        badge: 'CARACTERÍSTICAS',
        title: 'Todo lo que necesitas para',
        titleHighlight: 'gestionar tu dinero',
        subtitle: 'Herramientas poderosas diseñadas para simplificar tu vida financiera y ayudarte a alcanzar tus metas.',
        features: [
            {
                icon: LayoutDashboard,
                title: 'Dashboard Inteligente',
                description: 'Visualiza ingresos, gastos y balance en tiempo real con gráficas interactivas.',
            },
            {
                icon: CreditCard,
                title: 'Gestión de Tarjetas',
                description: 'Controla tus tarjetas de crédito, fechas de corte y pagos pendientes.',
            },
            {
                icon: FolderOpen,
                title: 'Categorías Personalizadas',
                description: 'Organiza tus transacciones con iconos y colores personalizados.',
            },
            {
                icon: BarChart3,
                title: 'Reportes Detallados',
                description: 'Gráficas avanzadas y exportación a PDF/Excel para análisis profundo.',
            },
            {
                icon: PiggyBank,
                title: 'Control de Presupuestos',
                description: 'Establece límites mensuales y recibe alertas cuando te acerques.',
            },
            {
                icon: Bot,
                title: 'Asistente IA',
                description: 'Análisis inteligente de tus finanzas con recomendaciones personalizadas.',
            },
        ],
    },
    en: {
        badge: 'FEATURES',
        title: 'Everything you need to',
        titleHighlight: 'manage your money',
        subtitle: 'Powerful tools designed to simplify your financial life and help you reach your goals.',
        features: [
            {
                icon: LayoutDashboard,
                title: 'Smart Dashboard',
                description: 'Visualize income, expenses and balance in real-time with interactive charts.',
            },
            {
                icon: CreditCard,
                title: 'Card Management',
                description: 'Control your credit cards, cut-off dates and pending payments.',
            },
            {
                icon: FolderOpen,
                title: 'Custom Categories',
                description: 'Organize your transactions with custom icons and colors.',
            },
            {
                icon: BarChart3,
                title: 'Detailed Reports',
                description: 'Advanced charts and PDF/Excel export for deep analysis.',
            },
            {
                icon: PiggyBank,
                title: 'Budget Control',
                description: 'Set monthly limits and get alerts when you approach them.',
            },
            {
                icon: Bot,
                title: 'AI Assistant',
                description: 'Smart analysis of your finances with personalized recommendations.',
            },
        ],
    },
}

export default function FeaturesSection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
    const [visibleItems, setVisibleItems] = useState<number[]>([])
    const sectionRef = useRef<HTMLElement>(null)
    const t = content[lang]

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = parseInt(entry.target.getAttribute('data-index') || '0')
                        setVisibleItems((prev) => [...new Set([...prev, index])])
                    }
                })
            },
            { threshold: 0.2 }
        )

        const cards = sectionRef.current?.querySelectorAll('.feature-card')
        cards?.forEach((card) => observer.observe(card))

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="features"
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
                        {t.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        <span className="text-foreground">{t.title}</span>
                        <br />
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {t.titleHighlight}
                        </span>
                    </h2>
                    <p className="text-lg text-foreground/70">{t.subtitle}</p>
                </div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {t.features.map((feature, index) => {
                        const Icon = feature.icon
                        return (
                            <div
                                key={index}
                                data-index={index}
                                className={`feature-card group glass-card rounded-2xl p-6 lg:p-8 transition-all duration-700 hover:scale-[1.02] hover:shadow-xl ${visibleItems.includes(index)
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                    }`}
                                style={{ transitionDelay: `${index * 100}ms` }}
                            >
                                {/* Icon */}
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <Icon className="w-7 h-7 text-white" />
                                </div>

                                {/* Content */}
                                <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-foreground/70 leading-relaxed">
                                    {feature.description}
                                </p>

                                {/* Hover Glow */}
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                            </div>
                        )
                    })}
                </div>

                {/* Additional Benefits */}
                <div className="mt-16 grid md:grid-cols-3 gap-6">
                    {[
                        { icon: Sparkles, label: lang === 'es' ? 'Diseño Moderno' : 'Modern Design' },
                        { icon: Shield, label: lang === 'es' ? 'Datos Seguros' : 'Secure Data' },
                        { icon: Zap, label: lang === 'es' ? 'Ultra Rápido' : 'Ultra Fast' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center gap-3 py-4 px-6 rounded-xl bg-foreground/5 hover:bg-primary/10 transition-colors"
                        >
                            <item.icon className="w-5 h-5 text-primary" />
                            <span className="font-medium text-foreground/80">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
