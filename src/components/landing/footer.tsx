'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Mail, MapPin, Phone, Github, Twitter, Linkedin, Instagram } from 'lucide-react'

const content = {
    es: {
        description: 'Tu aliado para gestionar tus finanzas personales de manera inteligente.',
        product: {
            title: 'Producto',
            links: [
                { label: 'Características', href: '#features' },
                { label: 'Precios', href: '#pricing' },
                { label: 'Testimonios', href: '#testimonials' },
                { label: 'Cómo Funciona', href: '#how-it-works' },
            ],
        },
        company: {
            title: 'Empresa',
            links: [
                { label: 'Sobre Nosotros', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Carreras', href: '#' },
                { label: 'Contacto', href: '#' },
            ],
        },
        legal: {
            title: 'Legal',
            links: [
                { label: 'Términos de Uso', href: '#' },
                { label: 'Política de Privacidad', href: '#' },
                { label: 'Cookies', href: '#' },
            ],
        },
        contact: {
            title: 'Contacto',
            email: 'hola@OGFinance  .com',
            phone: '+504 3335-5352',
            address: 'Ciudad de Tegucigalpa, Honduras',
        },
        copyright: '© 2026 OGFinance. Todos los derechos reservados.',
        madeWith: 'Hecho con ❤️ en Honduras',
    },
    en: {
        description: 'Your ally to manage your personal finances intelligently.',
        product: {
            title: 'Product',
            links: [
                { label: 'Features', href: '#features' },
                { label: 'Pricing', href: '#pricing' },
                { label: 'Testimonials', href: '#testimonials' },
                { label: 'How It Works', href: '#how-it-works' },
            ],
        },
        company: {
            title: 'Company',
            links: [
                { label: 'About Us', href: '#' },
                { label: 'Blog', href: '#' },
                { label: 'Careers', href: '#' },
                { label: 'Contact', href: '#' },
            ],
        },
        legal: {
            title: 'Legal',
            links: [
                { label: 'Terms of Use', href: '#' },
                { label: 'Privacy Policy', href: '#' },
                { label: 'Cookies', href: '#' },
            ],
        },
        contact: {
            title: 'Contact',
            email: 'hello@OGFinance.com',
            phone: '+504 3335-5352',
            address: 'Honduras City, Honduras',
        },
        copyright: '© 2026 OGFinance. All rights reserved.',
        madeWith: 'Made with ❤️ in Honduras',
    },
}

const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Github, href: '#', label: 'GitHub' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
]

export default function Footer({ lang = 'es' }: { lang?: 'es' | 'en' }) {
    const t = content[lang]

    return (
        <footer className="relative bg-foreground/[0.02] border-t border-border">
            {/* Main Footer */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
                    {/* Brand Column */}
                    <div className="col-span-2 lg:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <Image
                                src="/logo.png"
                                alt="Finance Platform"
                                width={40}
                                height={40}
                                className="w-10 h-10"
                            />
                            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                OGFinance
                            </span>
                        </Link>
                        <p className="text-foreground/60 text-sm mb-6">{t.description}</p>

                        {/* Social Links */}
                        <div className="flex gap-3">
                            {socialLinks.map((social) => (
                                <a
                                    key={social.label}
                                    href={social.href}
                                    className="w-9 h-9 rounded-full bg-foreground/5 hover:bg-primary hover:text-white flex items-center justify-center transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-4 h-4" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4">{t.product.title}</h4>
                        <ul className="space-y-3">
                            {t.product.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground/60 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4">{t.company.title}</h4>
                        <ul className="space-y-3">
                            {t.company.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground/60 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="font-bold text-foreground mb-4">{t.legal.title}</h4>
                        <ul className="space-y-3">
                            {t.legal.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-foreground/60 hover:text-primary transition-colors text-sm"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="col-span-2 md:col-span-1">
                        <h4 className="font-bold text-foreground mb-4">{t.contact.title}</h4>
                        <ul className="space-y-3">
                            <li>
                                <a
                                    href={`mailto:${t.contact.email}`}
                                    className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors text-sm"
                                >
                                    <Mail className="w-4 h-4" />
                                    {t.contact.email}
                                </a>
                            </li>
                            <li>
                                <a
                                    href={`tel:${t.contact.phone}`}
                                    className="flex items-center gap-2 text-foreground/60 hover:text-primary transition-colors text-sm"
                                >
                                    <Phone className="w-4 h-4" />
                                    {t.contact.phone}
                                </a>
                            </li>
                            <li className="flex items-center gap-2 text-foreground/60 text-sm">
                                <MapPin className="w-4 h-4" />
                                {t.contact.address}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-border">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-foreground/50 text-sm">{t.copyright}</p>
                        <p className="text-foreground/50 text-sm">{t.madeWith}</p>
                    </div>
                </div>
            </div>
        </footer>
    )
}
