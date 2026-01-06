'use client'

import { useState } from 'react'
import { CardForm } from '@/components/cards/card-form'
import { CardList } from '@/components/cards/card-list'

interface CardsManagerProps {
    cards: any[]
}

export function CardsManager({ cards }: CardsManagerProps) {
    const [editingCard, setEditingCard] = useState<any | null>(null)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Tarjetas de Crédito</h2>
                    <p className="text-muted-foreground mt-1">Gestiona tus tarjetas y deudas.</p>
                </div>
                <CardForm
                    initialData={editingCard}
                    onCancel={() => setEditingCard(null)}
                    // Force open if editing
                    key={editingCard?.id || 'new'}
                />
            </div>

            {!cards?.length ? (
                <div className="text-center py-12 text-muted-foreground glass-card rounded-xl">
                    No has agregado ninguna tarjeta de crédito aún.
                </div>
            ) : (
                <CardList
                    cards={cards}
                    onEdit={setEditingCard}
                />
            )}
        </div>
    )
}
