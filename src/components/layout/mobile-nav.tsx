'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signout } from '@/app/login/actions'
import {
    LayoutDashboard,
    ArrowRightLeft,
    Wallet,
    CreditCard,
    Tags,
    LogOut,
    Settings,
    PieChart
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
    { name: 'Inicio', href: '/', icon: LayoutDashboard },
    { name: 'Transac.', href: '/transactions', icon: ArrowRightLeft },
    { name: 'Categorías', href: '/categories', icon: Tags },
    { name: 'Tarjetas', href: '/cards', icon: CreditCard },
    { name: 'Reportes', href: '/reports', icon: PieChart },
    { name: 'Pptos.', href: '/budget', icon: Wallet },
    { name: 'Config.', href: '/profile', icon: Settings },
]

export function MobileNav() {
    const pathname = usePathname()

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border" />

            <nav className="relative flex justify-around items-center h-16 px-2">
                {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200",
                                isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <div className={cn(
                                "p-1 rounded-full transition-all duration-200",
                                isActive && "bg-primary/10"
                            )}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <span className="text-[10px] font-medium">{item.name}</span>
                        </Link>
                    )
                })}

                {/* Theme Toggle */}
                <div className="flex flex-col items-center justify-center w-full h-full space-y-1">
                    <ThemeToggle className="border-none bg-transparent hover:bg-transparent" />
                    <span className="text-[10px] font-medium">Tema</span>
                </div>

                {/* Logout Button */}
                <form action={signout} className="flex flex-col items-center justify-center w-full h-full space-y-1">
                    <button
                        type="submit"
                        className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-red-500 transition-colors duration-200"
                    >
                        <div className="p-1 rounded-full transition-all duration-200">
                            <LogOut className="h-5 w-5" />
                        </div>
                        <span className="text-[10px] font-medium">Salir</span>
                    </button>
                </form>
            </nav>
        </div>
    )
}
