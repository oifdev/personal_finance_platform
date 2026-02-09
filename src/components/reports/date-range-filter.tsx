'use client'

import { useState } from 'react'
import { Calendar, ChevronDown } from 'lucide-react'
import {
    startOfDay,
    endOfDay,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
    subMonths,
    subDays,
    format
} from 'date-fns'
import { es } from 'date-fns/locale'

export type DateRangeOption = 'today' | 'week' | 'month' | 'year' | 'last30' | 'last90' | 'custom'

interface DateRange {
    start: Date
    end: Date
    label: string
}

interface DateRangeFilterProps {
    onRangeChange: (range: DateRange) => void
    initialRange?: DateRangeOption
}

const PRESET_OPTIONS: { key: DateRangeOption; label: string }[] = [
    { key: 'today', label: 'Hoy' },
    { key: 'week', label: 'Esta semana' },
    { key: 'month', label: 'Este mes' },
    { key: 'year', label: 'Este año' },
    { key: 'last30', label: 'Últimos 30 días' },
    { key: 'last90', label: 'Últimos 90 días' },
]

function getDateRange(option: DateRangeOption, customStart?: Date, customEnd?: Date): DateRange {
    const now = new Date()

    switch (option) {
        case 'today':
            return {
                start: startOfDay(now),
                end: endOfDay(now),
                label: 'Hoy'
            }
        case 'week':
            return {
                start: startOfWeek(now, { weekStartsOn: 1 }),
                end: endOfWeek(now, { weekStartsOn: 1 }),
                label: 'Esta semana'
            }
        case 'month':
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
                label: 'Este mes'
            }
        case 'year':
            return {
                start: startOfYear(now),
                end: endOfYear(now),
                label: 'Este año'
            }
        case 'last30':
            return {
                start: subDays(now, 30),
                end: now,
                label: 'Últimos 30 días'
            }
        case 'last90':
            return {
                start: subDays(now, 90),
                end: now,
                label: 'Últimos 90 días'
            }
        case 'custom':
            return {
                start: customStart || subMonths(now, 1),
                end: customEnd || now,
                label: 'Personalizado'
            }
        default:
            return {
                start: startOfMonth(now),
                end: endOfMonth(now),
                label: 'Este mes'
            }
    }
}

export function DateRangeFilter({ onRangeChange, initialRange = 'month' }: DateRangeFilterProps) {
    const [activeOption, setActiveOption] = useState<DateRangeOption>(initialRange)
    const [showCustom, setShowCustom] = useState(false)
    const [customStart, setCustomStart] = useState<string>(format(subMonths(new Date(), 1), 'yyyy-MM-dd'))
    const [customEnd, setCustomEnd] = useState<string>(format(new Date(), 'yyyy-MM-dd'))

    function handleOptionClick(option: DateRangeOption) {
        if (option === 'custom') {
            setShowCustom(true)
            return
        }

        setActiveOption(option)
        setShowCustom(false)
        const range = getDateRange(option)
        onRangeChange(range)
    }

    function handleCustomApply() {
        setActiveOption('custom')
        const range = getDateRange('custom', new Date(customStart), new Date(customEnd))
        onRangeChange(range)
        setShowCustom(false)
    }

    const currentRange = getDateRange(activeOption, new Date(customStart), new Date(customEnd))

    return (
        <div className="space-y-4">
            {/* Quick Select Buttons */}
            <div className="flex flex-wrap items-center gap-2">
                {PRESET_OPTIONS.map((option) => (
                    <button
                        key={option.key}
                        onClick={() => handleOptionClick(option.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 border ${activeOption === option.key
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                            : 'bg-background text-foreground border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary'
                            }`}
                    >
                        {option.label}
                    </button>
                ))}

                {/* Custom Button */}
                <button
                    onClick={() => setShowCustom(!showCustom)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 flex items-center gap-2 border ${activeOption === 'custom'
                        ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25'
                        : 'bg-background text-foreground border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary'
                        }`}
                >
                    <Calendar className="h-4 w-4" />
                    Personalizado
                    <ChevronDown className={`h-4 w-4 transition-transform ${showCustom ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {/* Custom Date Range Picker */}
            {showCustom && (
                <div className="flex flex-wrap items-end gap-4 p-4 glass-card rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Fecha inicio</label>
                        <input
                            type="date"
                            value={customStart}
                            onChange={(e) => setCustomStart(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Fecha fin</label>
                        <input
                            type="date"
                            value={customEnd}
                            onChange={(e) => setCustomEnd(e.target.value)}
                            className="px-3 py-2 bg-background border border-border/50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                    </div>
                    <button
                        onClick={handleCustomApply}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
                    >
                        Aplicar
                    </button>
                </div>
            )}

            {/* Current Range Display */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                    Mostrando: {format(currentRange.start, "d 'de' MMMM, yyyy", { locale: es })}
                    {' — '}
                    {format(currentRange.end, "d 'de' MMMM, yyyy", { locale: es })}
                </span>
            </div>
        </div>
    )
}

export { getDateRange }
export type { DateRange }
