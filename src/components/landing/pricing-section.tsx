'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, X, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const content = {
    es: {
        badge: 'PRECIOS',
        title: 'Planes simples y',
        titleHighlight: 'transparentes',
        subtitle: 'Elige el plan que mejor se adapte a tus necesidades. Sin costos ocultos.',
        monthly: 'Mensual',
        yearly: 'Anual',
        save: 'Ahorra 20%',
        plans: [
            {
                name: 'Gratis',
                description: 'Perfecto para empezar',
                price: { monthly: 0, yearly: 0 },
                popular: false,
                features: [
                    { text: 'Hasta 100 transacciones/mes', included: true },
                    { text: '3 categorías personalizadas', included: true },
                    { text: '1 tarjeta de crédito', included: true },
                    { text: 'Reportes básicos', included: true },
                    { text: 'Dashboard en tiempo real', included: true },
                    { text: 'Exportación a PDF', included: false },
                    { text: 'Asistente IA', included: false },
                    { text: 'Soporte prioritario', included: false },
                ],
                cta: 'Comenzar Gratis',
            },
            {
                name: 'Premium',
                description: 'Para control total',
                price: { monthly: 9.99, yearly: 95.88 },
                popular: true,
                features: [
                    { text: 'Transacciones ilimitadas', included: true },
                    { text: 'Categorías ilimitadas', included: true },
                    { text: 'Tarjetas ilimitadas', included: true },
                    { text: 'Reportes avanzados', included: true },
                    { text: 'Dashboard en tiempo real', included: true },
                    { text: 'Exportación PDF/Excel', included: true },
                    { text: 'Asistente IA', included: true },
                    { text: 'Soporte prioritario', included: true },
                ],
                cta: 'Obtener Premium',
            },
        ],
    },
    en: {
        badge: 'PRICING',
        title: 'Simple and',
        titleHighlight: 'transparent plans',
        subtitle: 'Choose the plan that best fits your needs. No hidden costs.',
        monthly: 'Monthly',
        yearly: 'Yearly',
        save: 'Save 20%',
        plans: [
            {
                name: 'Free',
                description: 'Perfect to start',
                price: { monthly: 0, yearly: 0 },
                popular: false,
                features: [
                    { text: 'Up to 100 transactions/month', included: true },
                    { text: '3 custom categories', included: true },
                    { text: '1 credit card', included: true },
                    { text: 'Basic reports', included: true },
                    { text: 'Real-time dashboard', included: true },
                    { text: 'PDF export', included: false },
                    { text: 'AI Assistant', included: false },
                    { text: 'Priority support', included: false },
                ],
                cta: 'Start Free',
            },
            {
                name: 'Premium',
                description: 'For total control',
                price: { monthly: 9.99, yearly: 95.88 },
                popular: true,
                features: [
                    { text: 'Unlimited transactions', included: true },
                    { text: 'Unlimited categories', included: true },
                    { text: 'Unlimited cards', included: true },
                    { text: 'Advanced reports', included: true },
                    { text: 'Real-time dashboard', included: true },
                    { text: 'PDF/Excel export', included: true },
                    { text: 'AI Assistant', included: true },
                    { text: 'Priority support', included: true },
                ],
                cta: 'Get Premium',
            },
        ],
    },
}

export default function PricingSection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
    const [isYearly, setIsYearly] = useState(false)
    const [isVisible, setIsVisible] = useState(false)
    const sectionRef = useRef<HTMLElement>(null)
    const t = content[lang]

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                }
            },
            { threshold: 0.2 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section
            id="pricing"
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 via-background to-background" />
            <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2" />
            <div className="absolute top-1/2 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -translate-y-1/2" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">
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

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mb-12">
                    <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-foreground/50'}`}>
                        {t.monthly}
                    </span>
                    <button
                        onClick={() => setIsYearly(!isYearly)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${isYearly ? 'bg-primary' : 'bg-foreground/20'
                            }`}
                    >
                        <span
                            className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${isYearly ? 'translate-x-8' : 'translate-x-1'
                                }`}
                        />
                    </button>
                    <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-foreground/50'}`}>
                        {t.yearly}
                    </span>
                    <span className="px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-xs font-bold">
                        {t.save}
                    </span>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {t.plans.map((plan, index) => (
                        <div
                            key={index}
                            className={`relative glass-card rounded-2xl p-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                } ${plan.popular ? 'ring-2 ring-primary shadow-xl shadow-primary/10' : ''}`}
                            style={{ transitionDelay: `${index * 200}ms` }}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                    <span className="inline-flex items-center gap-1 px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-lg">
                                        <Sparkles className="w-4 h-4" />
                                        {lang === 'es' ? 'Más Popular' : 'Most Popular'}
                                    </span>
                                </div>
                            )}

                            {/* Plan Header */}
                            <div className="text-center mb-8">
                                <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                                <p className="text-foreground/60">{plan.description}</p>
                                <div className="mt-4">
                                    <span className="text-5xl font-black text-foreground">
                                        ${isYearly ? (plan.price.yearly / 12).toFixed(2) : plan.price.monthly}
                                    </span>
                                    <span className="text-foreground/60">/mes</span>
                                </div>
                                {isYearly && plan.price.yearly > 0 && (
                                    <p className="text-sm text-foreground/50 mt-1">
                                        ${plan.price.yearly} {lang === 'es' ? 'facturado anualmente' : 'billed yearly'}
                                    </p>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-center gap-3">
                                        {feature.included ? (
                                            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Check className="w-3 h-3 text-green-500" />
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center">
                                                <X className="w-3 h-3 text-foreground/30" />
                                            </div>
                                        )}
                                        <span className={feature.included ? 'text-foreground' : 'text-foreground/40'}>
                                            {feature.text}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA */}
                            <Link
                                href="/login?register=true"
                                className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-semibold transition-all group ${plan.popular
                                        ? 'btn-primary'
                                        : 'border border-border hover:border-primary hover:text-primary'
                                    }`}
                            >
                                {plan.cta}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
