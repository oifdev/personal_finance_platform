'use client'

import { useEffect, useRef, useState } from 'react'
import { UserPlus, Link2, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const content = {
    es: {
        badge: 'CÓMO FUNCIONA',
        title: 'Empieza en',
        titleHighlight: '3 simples pasos',
        subtitle: 'Configurar tu cuenta es rápido y sencillo. En minutos estarás listo para tomar el control.',
        steps: [
            {
                icon: UserPlus,
                number: '01',
                title: 'Crea tu cuenta',
                description: 'Regístrate gratis en segundos. Solo necesitas un correo electrónico.',
            },
            {
                icon: Link2,
                number: '02',
                title: 'Configura tus categorías',
                description: 'Personaliza las categorías de ingresos y gastos según tus necesidades.',
            },
            {
                icon: TrendingUp,
                number: '03',
                title: 'Empieza a ahorrar',
                description: 'Registra tus transacciones y observa cómo mejoran tus finanzas.',
            },
        ],
        cta: 'Comenzar Ahora',
    },
    en: {
        badge: 'HOW IT WORKS',
        title: 'Get started in',
        titleHighlight: '3 simple steps',
        subtitle: 'Setting up your account is quick and easy. In minutes you\'ll be ready to take control.',
        steps: [
            {
                icon: UserPlus,
                number: '01',
                title: 'Create your account',
                description: 'Sign up for free in seconds. You only need an email address.',
            },
            {
                icon: Link2,
                number: '02',
                title: 'Set up your categories',
                description: 'Customize income and expense categories according to your needs.',
            },
            {
                icon: TrendingUp,
                number: '03',
                title: 'Start saving',
                description: 'Record your transactions and watch your finances improve.',
            },
        ],
        cta: 'Get Started Now',
    },
}

export default function HowItWorksSection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
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
            { threshold: 0.3 }
        )

        const steps = sectionRef.current?.querySelectorAll('.step-card')
        steps?.forEach((step) => observer.observe(step))

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="how-it-works"
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background to-secondary/20" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="inline-block px-4 py-2 rounded-full bg-accent/20 text-accent text-sm font-bold mb-4">
                        {t.badge}
                    </span>
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                        <span className="text-foreground">{t.title}</span>{' '}
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            {t.titleHighlight}
                        </span>
                    </h2>
                    <p className="text-lg text-foreground/70">{t.subtitle}</p>
                </div>

                {/* Steps */}
                <div className="relative max-w-5xl mx-auto">
                    {/* Connection Line */}
                    <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-primary to-primary/20 -translate-y-1/2" />

                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {t.steps.map((step, index) => {
                            const Icon = step.icon
                            return (
                                <div
                                    key={index}
                                    data-index={index}
                                    className={`step-card relative transition-all duration-700 ${visibleItems.includes(index)
                                            ? 'opacity-100 translate-y-0'
                                            : 'opacity-0 translate-y-8'
                                        }`}
                                    style={{ transitionDelay: `${index * 200}ms` }}
                                >
                                    {/* Card */}
                                    <div className="glass-card rounded-2xl p-8 text-center relative overflow-hidden group hover:scale-[1.02] transition-transform">
                                        {/* Number Badge */}
                                        <div className="absolute top-4 right-4 text-6xl font-black text-foreground/5 group-hover:text-primary/10 transition-colors">
                                            {step.number}
                                        </div>

                                        {/* Icon */}
                                        <div className="relative z-10 w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/25">
                                            <Icon className="w-10 h-10 text-white" />
                                        </div>

                                        {/* Content */}
                                        <h3 className="text-xl font-bold text-foreground mb-3">
                                            {step.title}
                                        </h3>
                                        <p className="text-foreground/70 leading-relaxed">
                                            {step.description}
                                        </p>

                                        {/* Step Indicator */}
                                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-lg lg:hidden">
                                            {index + 1}
                                        </div>
                                    </div>

                                    {/* Desktop Step Indicator */}
                                    <div className="hidden lg:flex absolute -bottom-12 left-1/2 -translate-x-1/2 flex-col items-center">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent text-white font-bold flex items-center justify-center shadow-lg shadow-primary/25">
                                            {index + 1}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* CTA */}
                <div className="text-center mt-20">
                    <Link
                        href="/login?register=true"
                        className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold group"
                    >
                        {t.cta}
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
            </div>
        </section>
    )
}
