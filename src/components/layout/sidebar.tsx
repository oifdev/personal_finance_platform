'use client'

import {
    LayoutDashboard,
    CreditCard,
    Wallet,
    PieChart,
    LogOut,
    Settings,
    TrendingUp,
    ArrowRightLeft
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { signout } from '@/app/login/actions'

import { ThemeToggle } from '@/components/theme-toggle'

const navigation = [
    { name: 'Resumen', href: '/', icon: LayoutDashboard },
    { name: 'Transacciones', href: '/transactions', icon: ArrowRightLeft },
    { name: 'Presupuestos', href: '/budget', icon: TrendingUp },
    { name: 'Tarjetas', href: '/cards', icon: CreditCard },
    { name: 'Categorías', href: '/categories', icon: Wallet },
    { name: 'Reportes', href: '/reports', icon: PieChart },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-screen flex-col justify-between border-r border-border bg-background/50 glass w-64 hidden md:flex fixed left-0 top-0">
            <div className="px-4 py-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2 px-2">
                        <div className="h-8 w-8 rounded-lg bg-[#38b6ff]/20 flex items-center justify-center text-[#38b6ff]">
                            <Wallet className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold">
                            <span className="text-[#38b6ff]">OG</span>
                            <span className="text-[#f1d77a]">Finance</span>
                        </span>
                    </div>
                    <ThemeToggle />
                </div>

                <nav className="space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="mt-8 pt-8 border-t border-border/50">
                    <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Cuenta</p>
                    <Link
                        href="/profile"
                        className={cn(
                            "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group",
                            pathname === '/profile'
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                        )}
                    >
                        <Settings className={cn("h-4 w-4", pathname === '/profile' ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                        Configuración
                    </Link>
                </div>
            </div>

            <div className="p-4 border-t border-border">
                <form action={signout}>
                    <button
                        type="submit"
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="h-4 w-4" />
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    )
}
