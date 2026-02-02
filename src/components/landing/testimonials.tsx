'use client'

import { useEffect, useRef, useState } from 'react'
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react'

const content = {
    es: {
        badge: 'TESTIMONIOS',
        title: 'Lo que dicen',
        titleHighlight: 'nuestros usuarios',
        subtitle: 'Miles de personas ya controlan sus finanzas con nuestra plataforma.',
        testimonials: [
            {
                name: 'María González',
                role: 'Emprendedora',
                avatar: 'MG',
                rating: 5,
                text: 'Esta app cambió mi forma de ver mis finanzas. Ahora sé exactamente a dónde va cada peso y he logrado ahorrar un 30% más cada mes.',
            },
            {
                name: 'Carlos Rodríguez',
                role: 'Ingeniero de Software',
                avatar: 'CR',
                rating: 5,
                text: 'El asistente de IA es increíble. Me da recomendaciones personalizadas basadas en mis patrones de gasto. Totalmente recomendado.',
            },
            {
                name: 'Ana Martínez',
                role: 'Diseñadora UX',
                avatar: 'AM',
                rating: 5,
                text: 'La interfaz es hermosa y súper intuitiva. Puedo ver todos mis gastos, tarjetas y presupuestos en un solo lugar. ¡Me encanta!',
            },
            {
                name: 'Roberto Sánchez',
                role: 'Contador',
                avatar: 'RS',
                rating: 5,
                text: 'Como profesional de finanzas, aprecio la precisión y los reportes detallados. La exportación a Excel me ahorra horas de trabajo.',
            },
            {
                name: 'Laura Hernández',
                role: 'Médico',
                avatar: 'LH',
                rating: 5,
                text: 'Con mi agenda tan ocupada, necesitaba algo simple pero efectivo. Esta app es perfecta - registro mis gastos en segundos.',
            },
        ],
    },
    en: {
        badge: 'TESTIMONIALS',
        title: 'What our',
        titleHighlight: 'users say',
        subtitle: 'Thousands of people already control their finances with our platform.',
        testimonials: [
            {
                name: 'María González',
                role: 'Entrepreneur',
                avatar: 'MG',
                rating: 5,
                text: 'This app changed the way I see my finances. Now I know exactly where every dollar goes and I\'ve managed to save 30% more each month.',
            },
            {
                name: 'Carlos Rodríguez',
                role: 'Software Engineer',
                avatar: 'CR',
                rating: 5,
                text: 'The AI assistant is incredible. It gives me personalized recommendations based on my spending patterns. Totally recommended.',
            },
            {
                name: 'Ana Martínez',
                role: 'UX Designer',
                avatar: 'AM',
                rating: 5,
                text: 'The interface is beautiful and super intuitive. I can see all my expenses, cards and budgets in one place. I love it!',
            },
            {
                name: 'Roberto Sánchez',
                role: 'Accountant',
                avatar: 'RS',
                rating: 5,
                text: 'As a finance professional, I appreciate the precision and detailed reports. Excel export saves me hours of work.',
            },
            {
                name: 'Laura Hernández',
                role: 'Doctor',
                avatar: 'LH',
                rating: 5,
                text: 'With my busy schedule, I needed something simple but effective. This app is perfect - I record my expenses in seconds.',
            },
        ],
    },
}

export default function TestimonialsSection({ lang = 'es' }: { lang?: 'es' | 'en' }) {
    const [currentIndex, setCurrentIndex] = useState(0)
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

    // Auto-rotate testimonials
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % t.testimonials.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [t.testimonials.length])

    const next = () => setCurrentIndex((prev) => (prev + 1) % t.testimonials.length)
    const prev = () => setCurrentIndex((prev) => (prev - 1 + t.testimonials.length) % t.testimonials.length)

    return (
        <section
            id="testimonials"
            ref={sectionRef}
            className="relative py-24 md:py-32 overflow-hidden"
        >
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

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

                {/* Testimonials Carousel */}
                <div
                    className={`max-w-4xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                        }`}
                >
                    <div className="relative">
                        {/* Main Card */}
                        <div className="glass-card rounded-2xl p-8 md:p-12">
                            {/* Quote Icon */}
                            <div className="absolute top-6 right-6 text-primary/20">
                                <Quote className="w-16 h-16" />
                            </div>

                            {/* Content */}
                            <div className="relative">
                                {/* Stars */}
                                <div className="flex gap-1 mb-6">
                                    {Array.from({ length: t.testimonials[currentIndex].rating }).map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>

                                {/* Text */}
                                <p className="text-xl md:text-2xl text-foreground/90 leading-relaxed mb-8 italic">
                                    "{t.testimonials[currentIndex].text}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                        {t.testimonials[currentIndex].avatar}
                                    </div>
                                    <div>
                                        <div className="font-bold text-foreground">{t.testimonials[currentIndex].name}</div>
                                        <div className="text-foreground/60">{t.testimonials[currentIndex].role}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center justify-center gap-4 mt-8">
                            <button
                                onClick={prev}
                                className="p-3 rounded-full glass hover:bg-primary/10 transition-colors"
                                aria-label="Previous testimonial"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>

                            {/* Dots */}
                            <div className="flex gap-2">
                                {t.testimonials.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`w-2 h-2 rounded-full transition-all ${index === currentIndex
                                                ? 'w-8 bg-primary'
                                                : 'bg-foreground/20 hover:bg-foreground/40'
                                            }`}
                                        aria-label={`Go to testimonial ${index + 1}`}
                                    />
                                ))}
                            </div>

                            <button
                                onClick={next}
                                className="p-3 rounded-full glass hover:bg-primary/10 transition-colors"
                                aria-label="Next testimonial"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Small Cards Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-16 max-w-5xl mx-auto">
                    {t.testimonials.slice(0, 3).map((testimonial, index) => (
                        <div
                            key={index}
                            className={`glass-card rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                                } ${currentIndex === index ? 'ring-2 ring-primary' : ''}`}
                            style={{ transitionDelay: `${(index + 1) * 150}ms` }}
                            onClick={() => setCurrentIndex(index)}
                        >
                            <div className="flex gap-1 mb-3">
                                {Array.from({ length: testimonial.rating }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                ))}
                            </div>
                            <p className="text-sm text-foreground/70 line-clamp-3 mb-4">"{testimonial.text}"</p>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-semibold text-foreground">{testimonial.name}</div>
                                    <div className="text-xs text-foreground/50">{testimonial.role}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
