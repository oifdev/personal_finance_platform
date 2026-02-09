'use client'

import { TrendingUp, TrendingDown, Wallet, ArrowDownCircle, ArrowUpCircle, Scale } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface StatsCardsProps {
    totalIncome: number
    totalExpenses: number
    previousIncome: number
    previousExpenses: number
    transactionCount: number
    daysInPeriod: number
}

function calculateChange(current: number, previous: number): { value: number; isPositive: boolean } {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
}

export function StatsCards({
    totalIncome,
    totalExpenses,
    previousIncome,
    previousExpenses,
    transactionCount,
    daysInPeriod
}: StatsCardsProps) {
    const balance = totalIncome - totalExpenses
    const dailyAverage = daysInPeriod > 0 ? totalExpenses / daysInPeriod : 0

    const incomeChange = calculateChange(totalIncome, previousIncome)
    const expenseChange = calculateChange(totalExpenses, previousExpenses)
    const balanceChange = calculateChange(balance, previousIncome - previousExpenses)

    const stats = [
        {
            title: 'Ingresos',
            value: totalIncome,
            change: incomeChange,
            icon: ArrowUpCircle,
            iconColor: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            changePositiveIsGood: true // More income is good
        },
        {
            title: 'Gastos',
            value: totalExpenses,
            change: expenseChange,
            icon: ArrowDownCircle,
            iconColor: 'text-rose-500',
            bgColor: 'bg-rose-500/10',
            changePositiveIsGood: false // More expenses is bad
        },
        {
            title: 'Balance',
            value: balance,
            change: balanceChange,
            icon: Scale,
            iconColor: balance >= 0 ? 'text-primary' : 'text-rose-500',
            bgColor: balance >= 0 ? 'bg-primary/10' : 'bg-rose-500/10',
            changePositiveIsGood: true
        },
        {
            title: 'Promedio Diario',
            value: dailyAverage,
            subtitle: `${transactionCount} transacciones`,
            icon: Wallet,
            iconColor: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            noChange: true
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
                const Icon = stat.icon
                const isGoodChange = stat.noChange ? false :
                    stat.changePositiveIsGood ? stat.change?.isPositive : !stat.change?.isPositive

                return (
                    <div
                        key={stat.title}
                        className="glass-card p-5 rounded-xl relative overflow-hidden group hover:border-primary/30 transition-all duration-300"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Background Decoration */}
                        <div className={`absolute -right-4 -top-4 h-24 w-24 ${stat.bgColor} rounded-full blur-2xl opacity-50 group-hover:opacity-70 transition-opacity`} />

                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                    <Icon className={`h-5 w-5 ${stat.iconColor}`} />
                                </div>

                                {!stat.noChange && stat.change && (
                                    <div className={`flex items-center gap-1 text-xs font-medium ${isGoodChange ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                        {stat.change.isPositive ? (
                                            <TrendingUp className="h-3 w-3" />
                                        ) : (
                                            <TrendingDown className="h-3 w-3" />
                                        )}
                                        {stat.change.value.toFixed(1)}%
                                    </div>
                                )}
                            </div>

                            <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                            <p className={`text-2xl font-bold mt-1 ${stat.title === 'Balance' && stat.value < 0 ? 'text-rose-500' : ''
                                }`}>
                                {formatCurrency(stat.value)}
                            </p>

                            {stat.subtitle && (
                                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
