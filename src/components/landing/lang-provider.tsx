'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'es' | 'en'

interface LangContextType {
    lang: Language
    setLang: (lang: Language) => void
    toggleLang: () => void
}

const LangContext = createContext<LangContextType | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('es')

    const toggleLang = () => {
        setLang((prev) => (prev === 'es' ? 'en' : 'es'))
    }

    return (
        <LangContext.Provider value={{ lang, setLang, toggleLang }}>
            {children}
        </LangContext.Provider>
    )
}

export function useLang() {
    const context = useContext(LangContext)
    if (context === undefined) {
        throw new Error('useLang must be used within a LangProvider')
    }
    return context
}
