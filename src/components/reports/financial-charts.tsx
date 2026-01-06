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

// Aggregated data props
interface ChartsProps {
    monthlyData: any[] // { name: 'Jan', income: 100, expense: 50 }
    categoryData: any[] // { name: 'Food', value: 400, color: '#...' }
    transactions: any[] // flat list for export
}

export function FinancialCharts({ monthlyData, categoryData, transactions }: ChartsProps) {

    const downloadPDF = () => {
        const data = transactions.map(t => ({
            date: new Date(t.date).toLocaleDateString(),
            type: t.type,
            category: t.categories?.name,
            description: t.description,
            amount: t.amount
        }))
        exportToPDF(data)
    }

    const downloadExcel = () => {
        const data = transactions.map(t => ({
            Date: new Date(t.date).toLocaleDateString(),
            Type: t.type,
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
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
                >
                    <Download className="h-4 w-4" /> Export PDF
                </button>
                <button
                    onClick={downloadExcel}
                    className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 text-sm"
                >
                    <Download className="h-4 w-4" /> Export Excel
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Monthly Trends */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Monthly Income vs Expenses</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                                <YAxis stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Distribution */}
                <div className="glass-card p-6 rounded-xl">
                    <h3 className="text-lg font-semibold mb-6">Expenses by Category</h3>
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
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#333' }}
                                    itemStyle={{ color: '#fff' }}
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
