'use client'

import * as Icons from 'lucide-react'
import { deleteCategory } from './actions'
import { Trash2, Pencil } from 'lucide-react'
import { getIcon } from '@/lib/icons'
import { useState } from 'react'
import { ConfirmModal } from '@/components/ui/confirm-modal'

export function CategoryList({ categories, onEdit }: { categories: any[], onEdit: (category: any) => void }) {
    const [deleteId, setDeleteId] = useState<string | null>(null)

    return (
        <div className="grid gap-3">
            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={() => deleteId && deleteCategory(deleteId)}
                title="Eliminar Categoría"
                description="¿Estás seguro de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                isDanger
            />

            {categories.length === 0 && (
                <p className="text-muted-foreground text-sm">No se encontraron categorías.</p>
            )}

            {categories.map((cat) => {
                const Icon = getIcon(cat.icon || 'HelpCircle')
                return (
                    <div key={cat.id} className="glass p-4 rounded-lg flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div
                                className="h-10 w-10 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: cat.color }}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium">{cat.name}</p>
                                <p className="text-xs text-muted-foreground capitalize">
                                    {cat.type === 'income' ? 'Ingreso' : 'Gasto'}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => onEdit(cat)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Pencil className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setDeleteId(cat.id)}
                                className="text-muted-foreground hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
