'use client'

import {
    BarChart,
    Bar,
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
import { Download } from 'lucide-react'
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
                {/* Monthly Trends */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Ingresos mensuales vs. gastos</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                                <XAxis dataKey="name" stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke={axisColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                    itemStyle={{ color: tooltipText }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Ingresos" fill="#38b6ff" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Gastos" fill="#f1d77a" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Gastos por categoría</h3>
                    <div className="h-[300px] w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: '8px', color: tooltipText }}
                                    itemStyle={{ color: tooltipText }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    )
}
