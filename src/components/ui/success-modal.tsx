'use client'

import { CheckCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SuccessModalProps {
    isOpen: boolean
    onClose: () => void
    title: string
    description: string
    buttonText?: string
}

export function SuccessModal({
    isOpen,
    onClose,
    title,
    description,
    buttonText = 'Entendido'
}: SuccessModalProps) {
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
                    <div className="flex flex-col items-center text-center gap-4 mb-4">
                        <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">{title}</h3>
                        </div>
                    </div>

                    <p className="text-muted-foreground text-center text-sm mb-6">
                        {description}
                    </p>

                    <button
                        onClick={onClose}
                        className="w-full py-2.5 rounded-lg btn-primary font-bold shadow-lg shadow-primary/20"
                    >
                        {buttonText}
                    </button>
                </div>
            </div>
        </div>
    )
}
