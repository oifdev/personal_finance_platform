'use client'

import * as Icons from 'lucide-react'
import { deleteCategory } from './actions'
import { Trash2 } from 'lucide-react'

import { getIcon } from '@/lib/icons'

export function CategoryList({ categories }: { categories: any[] }) {
    return (
        <div className="grid gap-3">
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
                        <button
                            onClick={() => deleteCategory(cat.id)}
                            className="text-muted-foreground hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
