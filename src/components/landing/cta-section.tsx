'use client'

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Rocket } from 'lucide-react'
import Link from 'next/link'

const content = {
    es: {
        title: '¿Listo para tomar el control',
        titleHighlight: 'de tus finanzas?',
        subtitle: 'Únete a miles de usuarios que ya están ahorrando más y gastando mejor.',
        cta: 'Comenzar Gratis',
        secondary: 'Ver Características',
        note: 'Sin tarjeta de crédito requerida',
    },
    en: {
        title: 'Ready to take control',
        titleHighlight: 'of your finances?',
        subtitle: 'Join thousands of users who are already saving more and spending better.',
        cta: 'Get Started Free',
        secondary: 'View Features',
        note: 'No credit card required',
    },
}

export default function CTASection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
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
            { threshold: 0.3 }
        )

        if (sectionRef.current) {
            observer.observe(sectionRef.current)
        }

        return () => observer.disconnect()
    }, [])

    return (
        <section ref={sectionRef} className="relative py-24 md:py-32 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-accent" />

            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" />

            {/* Floating Shapes */}
            <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute bottom-10 right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent/30 rounded-full blur-xl" />

            <div className="container mx-auto px-4 relative z-10">
                <div
                    className={`max-w-4xl mx-auto text-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-8">
                        <Rocket className="w-8 h-8 text-white" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                        {t.title}
                        <br />
                        <span className="text-accent">{t.titleHighlight}</span>
                    </h2>

                    {/* Subtitle */}
                    <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
                        {t.subtitle}
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                        <Link
                            href="/login?register=true"
                            className="px-8 py-4 rounded-full bg-white text-primary font-bold text-lg flex items-center gap-2 hover:bg-accent hover:text-foreground transition-all group shadow-xl"
                        >
                            {t.cta}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            href="#features"
                            className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold text-lg hover:bg-white/10 transition-all"
                        >
                            {t.secondary}
                        </Link>
                    </div>

                    {/* Note */}
                    <p className="text-white/60 text-sm">✓ {t.note}</p>
                </div>
            </div>
        </section>
    )
}
