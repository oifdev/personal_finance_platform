'use client'

import { useState } from 'react'
import { BudgetForm } from '@/components/budget/budget-form'
import { deleteBudget } from '@/app/dashboard/budget/actions'
import { Wallet, Trash2, Pencil } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { AIChat } from '@/components/ai/ai-chat'

interface BudgetsManagerProps {
    budgets: any[]
    categories: any[]
}

export function BudgetsManager({ budgets, categories }: BudgetsManagerProps) {
    const [editingBudget, setEditingBudget] = useState<any | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    return (
        <div className="space-y-6">
            {/* AI Chat Section */}
            <AIChat />

            <div className="grid lg:grid-cols-3 gap-8">
                <ConfirmModal
                    isOpen={!!deleteId}
                    onClose={() => setDeleteId(null)}
                    onConfirm={() => deleteId && deleteBudget(deleteId)}
                    title="Eliminar Presupuesto"
                    description="¿Estás seguro de que deseas eliminar este presupuesto? Podrás crearlo de nuevo en cualquier momento."
                    confirmText="Eliminar"
                    isDanger
                />

                <div className="lg:col-span-1">
                    <BudgetForm
                        categories={categories}
                        initialData={editingBudget}
                        onCancel={() => setEditingBudget(null)}
                        key={editingBudget?.id || 'new'}
                    />
                </div>

                <div className="lg:col-span-2 space-y-4">
                    {budgets.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground glass-card rounded-xl border-dashed border">
                            No hay presupuestos configurados.
                        </div>
                    )}

                    {budgets.map(budget => (
                        <div key={budget.id} className="glass p-6 rounded-xl space-y-3 relative overflow-hidden group">
                            <div className="flex justify-between items-center z-10 relative">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                                        <Wallet className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{budget.category_id ? budget.categories.name : 'Presupuesto Global'}</h4>
                                        <p className="text-sm text-muted-foreground">Límite Mensual</p>
                                    </div>
                                </div>

                                <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingBudget(budget)}
                                        className="text-muted-foreground hover:text-primary transition-colors p-1"
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(budget.id)}
                                        className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1 relative z-10">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium">{formatCurrency(budget.spent)} gastado</span>
                                    <span className="text-muted-foreground">de {formatCurrency(budget.amount)}</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${budget.progress >= 100 ? 'bg-red-500' : budget.progress > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                                        style={{ width: `${budget.progress}%` }}
                                    />
                                </div>
                            </div>

                            {budget.progress >= 100 && (
                                <p className="text-xs text-red-500 mt-2 font-bold relative z-10">¡Presupuesto excedido!</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
