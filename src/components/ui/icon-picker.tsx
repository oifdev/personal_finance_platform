'use client'

import * as Icons from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const ICON_LIST = [
    'Wallet', 'Briefcase', 'ShoppingCart', 'Fuel', 'GraduationCap', 'Film', 'Heart',
    'Home', 'Smartphone', 'Wifi', 'Zap', 'Coffee', 'Utensils', 'Car', 'Plane',
    'Gift', 'Music', 'Book', 'Dumbbell', 'Stethoscope', 'Baby', 'Dog', 'Cat',
    'CreditCard', 'Banknote', 'PiggyBank', 'DollarSign', 'Euro'
] as const

interface IconPickerProps {
    value: string
    onChange: (icon: string) => void
}

export function IconPicker({ value, onChange }: IconPickerProps) {
    const [search, setSearch] = useState('')

    const filteredIcons = ICON_LIST.filter(icon =>
        icon.toLowerCase().includes(search.toLowerCase())
    )

    const SelectedIcon = (Icons as any)[value] || Icons.HelpCircle

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                    <SelectedIcon className="h-6 w-6" />
                </div>
                <input
                    type="text"
                    placeholder="Search icons..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                />
            </div>

            <div className="grid grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1">
                {filteredIcons.map((iconName) => {
                    const Icon = (Icons as any)[iconName]
                    if (!Icon) return null

                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => onChange(iconName)}
                            className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors",
                                value === iconName ? "bg-primary/20 text-primary ring-2 ring-primary/50" : "text-muted-foreground"
                            )}
                            title={iconName}
                        >
                            <Icon className="h-5 w-5" />
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
