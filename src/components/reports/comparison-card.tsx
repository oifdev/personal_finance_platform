'use client'

import { formatCurrency } from '@/lib/utils'
import { ArrowUp, ArrowDown, Minus, BarChart3 } from 'lucide-react'

interface ComparisonCardProps {
    currentIncome: number
    currentExpenses: number
    previousIncome: number
    previousExpenses: number
    currentLabel: string
    previousLabel: string
}

export function ComparisonCard({
    currentIncome,
    currentExpenses,
    previousIncome,
    previousExpenses,
    currentLabel,
    previousLabel
}: ComparisonCardProps) {
    const incomeChange = previousIncome > 0
        ? ((currentIncome - previousIncome) / previousIncome) * 100
        : 0
    const expenseChange = previousExpenses > 0
        ? ((currentExpenses - previousExpenses) / previousExpenses) * 100
        : 0

    const maxValue = Math.max(currentIncome, currentExpenses, previousIncome, previousExpenses, 1)

    function ChangeIndicator({ value, positive }: { value: number; positive: boolean }) {
        if (Math.abs(value) < 0.1) {
            return (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Minus className="h-3 w-3" /> Sin cambio
                </span>
            )
        }

        const isUp = value > 0
        const isGood = positive ? isUp : !isUp

        return (
            <span className={`flex items-center gap-1 text-xs font-medium ${isGood ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(value).toFixed(1)}%
            </span>
        )
    }

    function ComparisonBar({ current, previous, color }: { current: number; previous: number; color: string }) {
        const currentWidth = (current / maxValue) * 100
        const previousWidth = (previous / maxValue) * 100

        return (
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{currentLabel}</span>
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 ${color}`}
                            style={{ width: `${currentWidth}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium w-20 text-right">{formatCurrency(current)}</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-20 shrink-0">{previousLabel}</span>
                    <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-700 opacity-50 ${color}`}
                            style={{ width: `${previousWidth}%` }}
                        />
                    </div>
                    <span className="text-xs font-medium w-20 text-right text-muted-foreground">{formatCurrency(previous)}</span>
                </div>
            </div>
        )
    }

    return (
        <div className="glass-card p-6 rounded-xl">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-primary/10">
                    <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">Comparación</h3>
            </div>

            <div className="space-y-6">
                {/* Income Comparison */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Ingresos</span>
                        <ChangeIndicator value={incomeChange} positive={true} />
                    </div>
                    <ComparisonBar
                        current={currentIncome}
                        previous={previousIncome}
                        color="bg-emerald-500"
                    />
                </div>

                {/* Expenses Comparison */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium">Gastos</span>
                        <ChangeIndicator value={expenseChange} positive={false} />
                    </div>
                    <ComparisonBar
                        current={currentExpenses}
                        previous={previousExpenses}
                        color="bg-rose-500"
                    />
                </div>
            </div>
        </div>
    )
}
