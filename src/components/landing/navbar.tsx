'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Menu, X, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

const navItems = {
    es: [
        { label: 'Inicio', href: '#hero' },
        { label: 'Características', href: '#features' },
        { label: 'Cómo Funciona', href: '#how-it-works' },
        { label: 'Precios', href: '#pricing' },
        { label: 'Testimonios', href: '#testimonials' },
    ],
    en: [
        { label: 'Home', href: '#hero' },
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Testimonials', href: '#testimonials' },
    ],
}

interface NavbarProps {
    lang: 'es' | 'en'
    onLangChange: (lang: 'es' | 'en') => void
}

export default function Navbar({ lang, onLangChange }: NavbarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const handleScroll = () => {
            setScrolled(window.scrollY > 50)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        e.preventDefault()
        const target = document.querySelector(href)
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' })
            setIsOpen(false)
        }
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'glass py-3 shadow-lg'
                : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4">
                <nav className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <Image
                            src="/logo.png"
                            alt="Finance Platform"
                            width={45}
                            height={45}
                            className="w-10 h-10 md:w-12 md:h-12"
                        />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hidden sm:block">
                            OGFinance
                        </span>
                    </Link>

                    {/* Desktop Nav */}
                    <ul className="hidden lg:flex items-center gap-8">
                        {navItems[lang].map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    onClick={(e) => handleSmoothScroll(e, item.href)}
                                    className="text-foreground/80 hover:text-primary transition-colors font-medium"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Language Toggle */}
                        <button
                            onClick={() => onLangChange(lang === 'es' ? 'en' : 'es')}
                            className="px-2 py-1 text-sm font-semibold rounded-full border border-border hover:border-primary transition-colors"
                        >
                            {lang === 'es' ? 'EN' : 'ES'}
                        </button>

                        {/* Theme Toggle */}
                        {mounted && (
                            <button
                                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                                className="p-2 rounded-full hover:bg-secondary transition-colors"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? (
                                    <Sun className="w-5 h-5" />
                                ) : (
                                    <Moon className="w-5 h-5" />
                                )}
                            </button>
                        )}

                        {/* CTA Buttons */}
                        <Link
                            href="/login"
                            className="hidden md:block px-4 py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
                        >
                            {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                        </Link>
                        <Link
                            href="/login?register=true"
                            className="btn-primary px-4 py-2 rounded-full text-sm font-semibold"
                        >
                            {lang === 'es' ? 'Registrarse' : 'Get Started'}
                        </Link>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
                            aria-label="Toggle menu"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </nav>

                {/* Mobile Menu */}
                <div
                    className={`lg:hidden overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 mt-4' : 'max-h-0'
                        }`}
                >
                    <ul className="glass rounded-xl p-4 space-y-3">
                        {navItems[lang].map((item) => (
                            <li key={item.href}>
                                <a
                                    href={item.href}
                                    onClick={(e) => handleSmoothScroll(e, item.href)}
                                    className="block py-2 px-4 rounded-lg text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors font-medium"
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                        <li>
                            <Link
                                href="/login"
                                className="block py-2 px-4 rounded-lg text-foreground/80 hover:text-primary hover:bg-secondary/50 transition-colors font-medium"
                            >
                                {lang === 'es' ? 'Iniciar Sesión' : 'Sign In'}
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}
