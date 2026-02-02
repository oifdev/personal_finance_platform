'use client'

import { useState } from 'react'
import { ThemeProvider } from '@/components/theme-provider'
import Navbar from '@/components/landing/navbar'
import HeroSection from '@/components/landing/hero-section'
import FeaturesSection from '@/components/landing/features-section'
import HowItWorksSection from '@/components/landing/how-it-works'
import PricingSection from '@/components/landing/pricing-section'
import TestimonialsSection from '@/components/landing/testimonials'
import CTASection from '@/components/landing/cta-section'
import Footer from '@/components/landing/footer'

export default function LandingPage() {
    const [lang, setLang] = useState<'es' | 'en'>('es')

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
                <Navbar lang={lang} onLangChange={setLang} />
                <main>
                    <HeroSection lang={lang} />
                    <FeaturesSection lang={lang} />
                    <HowItWorksSection lang={lang} />
                    <PricingSection lang={lang} />
                    <TestimonialsSection lang={lang} />
                    <CTASection lang={lang} />
                </main>
                <Footer lang={lang} />
            </div>
        </ThemeProvider>
    )
}
