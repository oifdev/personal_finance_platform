'use client'

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { exportToPDF, exportToExcel } from '@/lib/export'
import { Download, TrendingUp, PieChart as PieChartIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

// Aggregated data props
interface ChartsProps {
    monthlyData: any[] // { name: 'Jan', income: 100, expense: 50 }
    categoryData: any[] // { name: 'Food', value: 400, color: '#...' }
    transactions: any[] // flat list for export
}

export function FinancialCharts({ monthlyData, categoryData, transactions }: ChartsProps) {
    const { theme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = theme === 'dark'
    const axisColor = isDark ? '#888888' : '#64748b'
    const gridColor = isDark ? '#333333' : '#e2e8f0'
    const tooltipBg = isDark ? '#18181b' : '#ffffff'
    const tooltipText = isDark ? '#ffffff' : '#0f172a'
    const tooltipBorder = isDark ? '#333333' : '#e2e8f0'

    if (!mounted) return <div className="h-[400px] w-full animate-pulse bg-muted rounded-xl" />

    const downloadPDF = () => {
        const data = transactions.map(t => ({
            date: new Date(t.date).toLocaleDateString(),
            type: t.transaction_types?.name || t.type,
            category: t.categories?.name,
            description: t.description,
            amount: t.amount
        }))
        exportToPDF(data)
    }

    const downloadExcel = () => {
        const data = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Type: t.transaction_types?.name || t.type,
            Category: t.categories?.name,
            Description: t.description,
            Amount: t.amount
        }))
        exportToExcel(data)
    }

    return (
        <div className="space-y-8">
            <div className="flex gap-4 justify-end">
                <button
                    onClick={downloadPDF}
                    className="flex items-center gap-2 px-4 py-2 btn-secondary text-sm rounded-lg font-bold shadow-sm"
                >
                    <Download className="h-4 w-4" /> Exportar PDF
                </button>
                <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2 px-4 py-2 btn-secondary text-sm rounded-lg font-bold shadow-sm"
                >
                    <Download className="h-4 w-4" /> Exportar Excel
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Monthly Trends - Area Chart */}
                <div className="glass-card p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <TrendingUp className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Tendencia de Ingresos vs Gastos</h3>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#38b6ff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#38b6ff" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f1d77a" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#f1d77a" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke={axisColor}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <YAxis
                                    stroke={axisColor}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                    tickMargin={10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: tooltipBg,
                                        borderColor: tooltipBorder,
                                        borderRadius: '12px',
                                        color: tooltipText,
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ color: tooltipText }}
                                    formatter={(value: any) => [`L ${Number(value).toLocaleString()}`, '']}
                                />
                                <Legend iconType="circle" />
                                <Area
                                    type="monotone"
                                    dataKey="income"
                                    name="Ingresos"
                                    stroke="#38b6ff"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorIncome)"
                                />
                                <Area
                                    type="monotone"
                                    dataKey="expense"
                                    name="Gastos"
                                    stroke="#f1d77a"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorExpense)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution - Improved Pie Chart */}
                <div className="glass-card p-6 rounded-xl animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <PieChartIcon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">Gastos por Categoría</h3>
                    </div>
                    <div className="h-[300px] w-full flex justify-center relative">
                        {categoryData.length === 0 ? (
                            <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                                No hay datos de gastos
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={categoryData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={80}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                        cornerRadius={5}
                                        stroke="none"
                                    >
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: tooltipBg,
                                            borderColor: tooltipBorder,
                                            borderRadius: '12px',
                                            color: tooltipText,
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: tooltipText }}
                                        formatter={(value: any) => [`L ${Number(value).toLocaleString()}`, '']}
                                    />
                                    <Legend
                                        layout="vertical"
                                        verticalAlign="middle"
                                        align="right"
                                        iconType="circle"
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        )}

                        {/* Center Text for Pie Chart */}
                        {categoryData.length > 0 && (
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                                <span className="text-xs text-muted-foreground font-medium block">Total</span>
                                <span className="text-xl font-bold">
                                    L{categoryData.reduce((acc, curr) => acc + curr.value, 0).toLocaleString()}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

