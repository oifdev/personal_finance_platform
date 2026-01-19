import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import {
    DollarSign,
    TrendingUp,
    TrendingDown,
    CreditCard,
    Wallet
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
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString()

    // Obtener IDs de tipos de transacción
    const { data: transactionTypes } = await supabase
        .from('transaction_types')
        .select('id, code')

    const incomeTypeId = transactionTypes?.find(t => t.code === 'income')?.id
    const expenseTypeId = transactionTypes?.find(t => t.code === 'expense')?.id

    // 1. Obtener Ingresos Mensuales
    let monthlyIncome = 0
    if (incomeTypeId) {
        const { data: incomeData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('transaction_type_id', incomeTypeId)
            .gte('date', firstDay)
            .lte('date', lastDay)

        monthlyIncome = incomeData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    }

    // 2. Obtener Gastos Mensuales
    let monthlyExpenses = 0
    if (expenseTypeId) {
        const { data: expenseData } = await supabase
            .from('transactions')
            .select('amount')
            .eq('user_id', user.id)
            .eq('transaction_type_id', expenseTypeId)
            .gte('date', firstDay)
            .lte('date', lastDay)

        monthlyExpenses = expenseData?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0
    }

    // 3. Obtener tipo de cuenta de tarjeta de crédito
    const { data: creditCardType } = await supabase
        .from('account_types')
        .select('id')
        .eq('code', 'credit_card')
        .single()

    // 4. Obtener Deuda de Tarjetas (from accounts table now)
    let creditDebt = 0
    if (creditCardType) {
        const { data: cardsData } = await supabase
            .from('accounts')
            .select('current_balance')
            .eq('user_id', user.id)
            .eq('account_type_id', creditCardType.id)

        creditDebt = cardsData?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0
    }

    // 5. Obtener saldo total de cuentas (excluyendo tarjetas de crédito)
    const { data: accountsData } = await supabase
        .from('accounts')
        .select('current_balance, account_types(code)')
        .eq('user_id', user.id)
        .eq('is_active', true)

    const totalAccountBalance = accountsData
        ?.filter(a => (a.account_types as any)?.code !== 'credit_card')
        ?.reduce((acc, curr) => acc + Number(curr.current_balance), 0) || 0

    // Balance total = saldo en cuentas - deuda de tarjetas
    const totalBalance = totalAccountBalance - creditDebt

    // Transacciones Recientes con nuevas relaciones
    const { data: recentTransactions } = await supabase
        .from('transactions')
        .select(`
            *,
            transaction_types (code, name),
            categories (name, icon, color),
            accounts (name)
        `)
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(5)

    const stats = [
        {
            name: 'Balance Total',
            value: formatCurrency(totalBalance),
            icon: Wallet,
            color: totalBalance >= 0 ? 'text-emerald-500' : 'text-rose-500',
            bg: totalBalance >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
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
                        recentTransactions.map((t: any) => {
                            const typeCode = t.transaction_types?.code
                            const isIncome = typeCode === 'income'
                            const isExpense = typeCode === 'expense'

                            return (
                                <div key={t.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="h-10 w-10 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${t.categories?.color || '#888'}20`, color: t.categories?.color || '#888' }}
                                        >
                                            <span className="text-sm font-bold uppercase">
                                                {t.categories?.name?.[0] || t.transaction_types?.name?.[0] || '?'}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium">{t.description || t.categories?.name || t.transaction_types?.name}</p>
                                            <p className="text-sm text-muted-foreground capitalize">
                                                {new Date(t.date).toLocaleDateString('es-HN', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                {t.accounts?.name && (
                                                    <span className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded">{t.accounts.name}</span>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`font-bold tabular-nums ${isIncome ? 'text-emerald-500' :
                                            isExpense ? 'text-rose-500' :
                                                'text-blue-500'
                                        }`}>
                                        {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(t.amount)}
                                    </span>
                                </div>
                            )
                        })
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
