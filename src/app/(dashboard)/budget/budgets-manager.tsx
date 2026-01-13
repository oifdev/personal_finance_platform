'use client'

import { useState } from 'react'
import { BudgetForm } from '@/components/budget/budget-form'
import { deleteBudget } from '@/app/(dashboard)/budget/actions'
import { Wallet, Trash2, Pencil, Sparkles, Brain, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { ConfirmModal } from '@/components/ui/confirm-modal'
import { getAIInsights, getAIHistory, deleteAIInsight } from './actions'
import { SuccessModal } from '@/components/ui/success-modal'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface BudgetsManagerProps {
    budgets: any[]
    categories: any[]
}

export function BudgetsManager({ budgets, categories }: BudgetsManagerProps) {
    const [editingBudget, setEditingBudget] = useState<any | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [isAIAnalyzing, setIsAIAnalyzing] = useState(false)
    const [aiInsights, setAiInsights] = useState<string | null>(null)
    const [aiHistory, setAiHistory] = useState<any[]>([])
    const [showHistory, setShowHistory] = useState(false)

    async function loadAIHistory() {
        const result = await getAIHistory()
        if (result.history) setAiHistory(result.history)
    }

    // Initial load
    useState(() => {
        loadAIHistory()
    })

    async function handleConsultAI() {
        setIsAIAnalyzing(true)
        const result = await getAIInsights()
        if (result.insights) {
            setAiInsights(result.insights)
            loadAIHistory() // Refresh history after new insight
        } else if (result.error) {
            alert(result.error)
        }
        setIsAIAnalyzing(false)
    }

    async function handleDeleteInsight(id: string) {
        const result = await deleteAIInsight(id)
        if (result.success) loadAIHistory()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-zinc-900/50 p-4 rounded-xl border border-border/50">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Brain className="h-6 w-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">OGFINANCE</h3>
                        <p className="text-xs text-muted-foreground whitespace-pre-wrap">Asistente de Presupuestos Inteligente</p>
                    </div>
                </div>
                <button
                    onClick={handleConsultAI}
                    disabled={isAIAnalyzing}
                    className="btn-primary px-4 py-2 flex items-center gap-2 text-sm font-bold shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                    {isAIAnalyzing ? (
                        <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Sparkles className="h-4 w-4" />
                    )}
                    Consultar IA
                </button>
            </div>

            {aiInsights && (
                <div className="glass-card p-6 rounded-xl border-primary/20 animate-in fade-in slide-in-from-top-4 relative">
                    <button
                        onClick={() => setAiInsights(null)}
                        className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition-colors"
                        title="Cerrar análisis"
                    >
                        <X className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2 text-primary font-bold mb-4">
                        <Sparkles className="h-5 w-5" />
                        Recomendaciones de OGFINANCE
                    </div>
                    <div className="prose prose-invert prose-sm max-w-none text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {aiInsights}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50 text-[10px] text-muted-foreground italic flex justify-between items-center">
                        <span>Generado ahora mismo por OGFINANCE</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(aiInsights || "")
                            }}
                            className="hover:text-primary transition-colors font-medium"
                        >
                            Copiar análisis
                        </button>
                    </div>
                </div>
            )}

            {/* History Toggle Button */}
            <div className="flex justify-end">
                <button
                    onClick={() => setShowHistory(!showHistory)}
                    className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-800/40"
                >
                    {showHistory ? "Ocultar historial de OGFINANCE" : "Ver historial de consejos"}
                </button>
            </div>

            {/* AI History List */}
            {showHistory && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <h4 className="text-sm font-semibold text-zinc-400 flex items-center gap-2">
                        <Brain className="h-4 w-4" /> Historial de recomendaciones
                    </h4>
                    {aiHistory.length === 0 ? (
                        <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-dashed border-border/50">
                            <p className="text-sm text-muted-foreground">No hay consultas guardadas aún.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-1">
                            {aiHistory.map((item) => (
                                <div key={item.id} className="bg-zinc-900/40 border border-border/40 rounded-xl p-4 relative group">
                                    <button
                                        onClick={() => handleDeleteInsight(item.id)}
                                        className="absolute top-3 right-3 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all rounded-md"
                                        title="Eliminar del historial"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                    <div className="text-[10px] font-medium text-zinc-500 mb-2 flex items-center gap-2">
                                        <span className="capitalize">
                                            {format(new Date(item.created_at), "eeee, d 'de' MMMM", { locale: es })}
                                        </span>
                                        <span>•</span>
                                        <span>{format(new Date(item.created_at), "HH:mm")}</span>
                                    </div>
                                    <div className="prose prose-invert prose-xs max-w-none text-muted-foreground/90 whitespace-pre-wrap line-clamp-4 group-hover:line-clamp-none transition-all duration-300">
                                        {item.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
