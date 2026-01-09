'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return <div className={cn("w-9 h-9", className)} />

    const isDark = theme === 'dark'

    return (
        <button
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={cn(
                "relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background hover:bg-accent/10 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50",
                className
            )}
            title={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
            <div className="relative h-5 w-5">
                <Sun className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-500",
                    isDark ? "scale-100 rotate-0 opacity-100" : "scale-0 rotate-90 opacity-0"
                )} />
                <Moon className={cn(
                    "absolute inset-0 h-5 w-5 transition-all duration-500",
                    isDark ? "scale-0 -rotate-90 opacity-0" : "scale-100 rotate-0 opacity-100"
                )} />
            </div>
            <span className="sr-only">Cambiar tema</span>
        </button>
    )
}
