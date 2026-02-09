'use client'

import { useState, useMemo } from 'react'
import { DateRangeFilter, type DateRange } from './date-range-filter'
import { StatsCards } from './stats-cards'
import { FinancialCharts } from './financial-charts'
import { TopExpenses } from './top-expenses'
import { ComparisonCard } from './comparison-card'
import { subMonths, isWithinInterval, startOfMonth, endOfMonth, format } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReportsDashboardProps {
    transactions: any[]
}

export function ReportsDashboard({ transactions }: ReportsDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange>({
        start: startOfMonth(new Date()),
        end: endOfMonth(new Date()),
        label: 'Este mes'
    })

    // Filter transactions based on selected date range
    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => {
            const date = new Date(t.date)
            return isWithinInterval(date, { start: dateRange.start, end: dateRange.end })
        })
    }, [transactions, dateRange])

    // Calculate previous period stats for comparison
    const previousPeriodStats = useMemo(() => {
        // Calculate previous period based on current duration
        const duration = dateRange.end.getTime() - dateRange.start.getTime()
        const previousEnd = new Date(dateRange.start.getTime() - 1)
        const previousStart = new Date(previousEnd.getTime() - duration)

        const previousTransactions = transactions.filter(t => {
            const date = new Date(t.date)
            return isWithinInterval(date, { start: previousStart, end: previousEnd })
        })

        let income = 0
        let expenses = 0

        previousTransactions.forEach(t => {
            const amount = Number(t.amount)
            if (t.transaction_types?.code === 'income') {
                income += amount
            } else if (t.transaction_types?.code === 'expense') {
                expenses += amount
            }
        })

        return {
            income,
            expenses,
            label: `${format(previousStart, 'd MMM')} - ${format(previousEnd, 'd MMM')}`
        }
    }, [transactions, dateRange])

    // Calculate current period stats
    const stats = useMemo(() => {
        let income = 0
        let expenses = 0

        filteredTransactions.forEach(t => {
            const amount = Number(t.amount)
            if (t.transaction_types?.code === 'income') {
                income += amount
            } else if (t.transaction_types?.code === 'expense') {
                expenses += amount
            }
        })

        const daysInPeriod = Math.ceil((dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)) || 1

        return {
            income,
            expenses,
            transactionCount: filteredTransactions.length,
            daysInPeriod
        }
    }, [filteredTransactions, dateRange])

    // Prepare chart data
    const chartData = useMemo(() => {
        // Monthly Data (grouped by day for shorter periods, or month for longer)
        const timeMap = new Map()
        const isLongPeriod = (dateRange.end.getTime() - dateRange.start.getTime()) > (1000 * 60 * 60 * 24 * 60) // > 60 days

        filteredTransactions.forEach(tx => {
            const date = new Date(tx.date)
            const key = isLongPeriod
                ? format(date, 'MMM', { locale: es })
                : format(date, 'd MMM', { locale: es })

            if (!timeMap.has(key)) {
                timeMap.set(key, { name: key, income: 0, expense: 0, order: date.getTime() })
            }

            const entry = timeMap.get(key)
            if (tx.transaction_types?.code === 'income') {
                entry.income += Number(tx.amount)
            } else if (tx.transaction_types?.code === 'expense') {
                entry.expense += Number(tx.amount)
            }
        })

        const monthlyData = Array.from(timeMap.values()).sort((a, b) => a.order - b.order)

        // Category Data
        const categoryMap = new Map()
        filteredTransactions
            .filter(t => t.transaction_types?.code === 'expense')
            .forEach(tx => {
                const catName = tx.categories?.name || 'Sin Categoría'
                const color = tx.categories?.color || '#888'

                if (!categoryMap.has(catName)) {
                    categoryMap.set(catName, { name: catName, value: 0, color })
                }
                categoryMap.get(catName).value += Number(tx.amount)
            })

        const categoryData = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value)

        return { monthlyData, categoryData }
    }, [filteredTransactions, dateRange])

    // Top Expenses
    const topExpenses = useMemo(() => {
        return filteredTransactions
            .filter(t => t.transaction_types?.code === 'expense')
            .sort((a, b) => Number(b.amount) - Number(a.amount))
            .slice(0, 5)
            .map(t => ({
                id: t.id,
                description: t.description,
                amount: Number(t.amount),
                date: t.date,
                category: t.categories?.name || 'Sin Categoría',
                categoryColor: t.categories?.color || '#888'
            }))
    }, [filteredTransactions])

    const maxExpenseAmount = topExpenses.length > 0 ? topExpenses[0].amount : 0

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Reportes</h2>
                    <p className="text-muted-foreground mt-1">Visualiza y analiza tus finanzas</p>
                </div>
                <DateRangeFilter onRangeChange={setDateRange} />
            </div>

            <StatsCards
                totalIncome={stats.income}
                totalExpenses={stats.expenses}
                previousIncome={previousPeriodStats.income}
                previousExpenses={previousPeriodStats.expenses}
                transactionCount={stats.transactionCount}
                daysInPeriod={stats.daysInPeriod}
            />

            <FinancialCharts
                monthlyData={chartData.monthlyData}
                categoryData={chartData.categoryData}
                transactions={filteredTransactions}
            />

            <div className="grid lg:grid-cols-2 gap-8">
                <TopExpenses
                    expenses={topExpenses}
                    maxAmount={maxExpenseAmount}
                />

                <ComparisonCard
                    currentIncome={stats.income}
                    currentExpenses={stats.expenses}
                    previousIncome={previousPeriodStats.income}
                    previousExpenses={previousPeriodStats.expenses}
                    currentLabel={dateRange.label}
                    previousLabel={previousPeriodStats.label}
                />
            </div>
        </div>
    )
}
