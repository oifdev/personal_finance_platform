import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default async function DashboardPage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    // Fechas para estadísticas mensuales
    const now = new Date()
    // Primer día del mes actual
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    // Último día del mes actual
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // 1. Obtener Ingresos Mensuales
    const { data: incomeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'income')
        .gte('date', firstDay)
        .lte('date', lastDay)

    const monthlyIncome = incomeData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    // 2. Obtener Gastos Mensuales
    const { data: expenseData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', firstDay)
        .lte('date', lastDay)

    const monthlyExpenses = expenseData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0

    // 3. Obtener Deuda de Tarjetas
    const { data: cardsData } = await supabase
        .from('credit_cards')
        .select('current_balance')
        .eq('user_id', user.id)

    const creditDebt = cardsData?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0

    // 4. Calcular Balance Total
    const { data: allIncome } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'income')

    const { data: allExpense } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')

    // Balance inicial (si existiera) no se contempla, asumimos flujo neto
    const totalIncome = allIncome?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    const totalExpense = allExpense?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    const totalBalance = totalIncome - totalExpense

    // Transacciones Recientes
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            *,
            categories (name, icon, color)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(5)

    const stats = [
        {
            name: 'Balance Total',
            value: formatCurrency(totalBalance),
            icon: DollarSign,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10'
        },
        {
            name: 'Ingresos (Mes)',
            value: formatCurrency(monthlyIncome),
            icon: TrendingUp,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            name: 'Gastos (Mes)',
            value: formatCurrency(monthlyExpenses),
            icon: TrendingDown,
            color: 'text-rose-500',
            bg: 'bg-rose-500/10'
        },
        {
            name: 'Deuda Tarjetas',
            value: formatCurrency(creditDebt),
            icon: CreditCard,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10'
        },
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-foreground">Resumen</h2>
                <p className="text-muted-foreground mt-1">
                    Bienvenido de nuevo, {user.user_metadata.full_name || user.email}
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass-card p-6 rounded-xl border bg-card text-card-foreground shadow-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                <h3 className="text-2xl font-bold mt-2">{stat.value}</h3>
                            </div>
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Transactions */}
            <div className="glass-card rounded-xl p-6 border bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Transacciones Recientes</h3>
                <div className="space-y-4">
                    {recentTransactions && recentTransactions.length > 0 ? (
                        recentTransactions.map((t: any) => (
                            <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div
                                        className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                                        style={{ backgroundColor: `${t.categories?.color}20`, color: t.categories?.color || '#888' }}
                                    >
                                        <span className="text-sm font-bold uppercase">
                                            {t.categories?.name?.[0] || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{t.description || t.categories?.name}</p>
                                        <p className="text-sm text-muted-foreground capitalize">
                                            {new Date(t.date).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold tabular-nums ${t.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                                </span>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-muted-foreground border border-dashed border-border rounded-lg">
                            No hay transacciones recientes. ¡Comienza a agregar algunas!
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
