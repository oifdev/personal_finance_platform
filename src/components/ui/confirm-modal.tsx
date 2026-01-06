'use client'

import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    isDanger?: boolean
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Continuar',
    cancelText = 'Cancelar',
    isDanger = false
}: ConfirmModalProps) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) return null
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-sm overflow-hidden border border-border rounded-xl glass-card shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-2">
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-full ${isDanger ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'}`}>
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold">{title}</h3>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-sm mb-6">
                        {description}
                    </p>

                    <div className="flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium transition-colors hover:text-foreground text-muted-foreground"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm()
                                onClose()
                            }}
                            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-emerald-600'
                                }`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        </div>
    )
}
