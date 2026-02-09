'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Sparkles, Bot, User, Trash2, MessageSquarePlus, History, Plus, ChevronLeft, ChevronRight, MessageCircle, Menu, X } from 'lucide-react'
import { AIMarkdown } from './ai-markdown'
import { sendChatMessage, getAIInsights } from '@/app/dashboard/budget/actions'
import type { ChatMessage } from '@/lib/ai'

interface AIChatProps {
    className?: string
}

interface Conversation {
    id: string
    title: string
    messages: ChatMessage[]
    createdAt: Date
}

const QUICK_SUGGESTIONS = [
    "¿Cuánto he gastado este mes?",
    "¿En qué categoría gasto más?",
    "Dame consejos para ahorrar",
    "¿Cómo está mi presupuesto?",
    "Analiza mis finanzas",
]

function generateId() {
    return Math.random().toString(36).substring(2, 9)
}

function getConversationTitle(messages: ChatMessage[]): string {
    if (messages.length === 0) return 'Nueva conversación'
    const firstUserMessage = messages.find(m => m.role === 'user')
    if (!firstUserMessage) return 'Nueva conversación'
    const title = firstUserMessage.content.slice(0, 35)
    return title.length < firstUserMessage.content.length ? title + '...' : title
}

export function AIChat({ className = '' }: AIChatProps) {
    const [conversations, setConversations] = useState<Conversation[]>([])
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [showDesktopSidebar, setShowDesktopSidebar] = useState(true)
    const [showMobileSidebar, setShowMobileSidebar] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Get current conversation
    const activeConversation = conversations.find(c => c.id === activeConversationId)
    const messages = activeConversation?.messages || []

    // Load conversations from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ogfinance-conversations')
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setConversations(parsed.map((c: any) => ({
                    ...c,
                    createdAt: new Date(c.createdAt)
                })))
                if (parsed.length > 0) {
                    setActiveConversationId(parsed[0].id)
                }
            } catch (e) {
                console.error('Error loading conversations:', e)
            }
        }
    }, [])

    // Save conversations to localStorage when they change
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('ogfinance-conversations', JSON.stringify(conversations))
        }
    }, [conversations])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    function startNewConversation() {
        const newConversation: Conversation = {
            id: generateId(),
            title: 'Nueva conversación',
            messages: [],
            createdAt: new Date()
        }
        setConversations(prev => [newConversation, ...prev])
        setActiveConversationId(newConversation.id)
        setShowMobileSidebar(false)
        inputRef.current?.focus()
    }

    function updateConversationMessages(conversationId: string, newMessages: ChatMessage[]) {
        setConversations(prev => prev.map(c => {
            if (c.id === conversationId) {
                return {
                    ...c,
                    messages: newMessages,
                    title: getConversationTitle(newMessages)
                }
            }
            return c
        }))
    }

    function deleteConversation(id: string) {
        setConversations(prev => prev.filter(c => c.id !== id))
        if (activeConversationId === id) {
            const remaining = conversations.filter(c => c.id !== id)
            setActiveConversationId(remaining.length > 0 ? remaining[0].id : null)
        }
    }

    async function handleSend(messageText?: string) {
        const text = messageText || input.trim()
        if (!text || isLoading) return

        // Create conversation if none exists
        let conversationId = activeConversationId
        if (!conversationId) {
            const newConversation: Conversation = {
                id: generateId(),
                title: text.slice(0, 35),
                messages: [],
                createdAt: new Date()
            }
            setConversations(prev => [newConversation, ...prev])
            conversationId = newConversation.id
            setActiveConversationId(conversationId)
        }

        // Add user message
        const userMessage: ChatMessage = { role: 'user', content: text }
        const currentMessages = [...messages, userMessage]
        updateConversationMessages(conversationId, currentMessages)
        setInput('')
        setIsLoading(true)

        try {
            const result = await sendChatMessage(text, currentMessages)

            if (result.response) {
                const assistantMessage: ChatMessage = { role: 'assistant', content: result.response }
                updateConversationMessages(conversationId, [...currentMessages, assistantMessage])
            } else if (result.error) {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: `Lo siento, hubo un error: ${result.error}`
                }
                updateConversationMessages(conversationId, [...currentMessages, errorMessage])
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Lo siento, no pude conectar con el servidor. Por favor, intenta de nuevo.'
            }
            updateConversationMessages(conversationId, [...currentMessages, errorMessage])
        }

        setIsLoading(false)
        inputRef.current?.focus()
    }

    async function handleQuickAnalysis() {
        // Create conversation if none exists
        let conversationId = activeConversationId
        if (!conversationId) {
            const newConversation: Conversation = {
                id: generateId(),
                title: '🔍 Análisis completo',
                messages: [],
                createdAt: new Date()
            }
            setConversations(prev => [newConversation, ...prev])
            conversationId = newConversation.id
            setActiveConversationId(conversationId)
        }

        setIsLoading(true)
        setShowMobileSidebar(false)

        const userMessage: ChatMessage = {
            role: 'user',
            content: '🔍 Solicitar análisis completo de finanzas'
        }
        const currentMessages = [...messages, userMessage]
        updateConversationMessages(conversationId, currentMessages)

        try {
            const result = await getAIInsights()

            if (result.insights) {
                const assistantMessage: ChatMessage = {
                    role: 'assistant',
                    content: result.insights
                }
                updateConversationMessages(conversationId, [...currentMessages, assistantMessage])
            } else if (result.error) {
                const errorMessage: ChatMessage = {
                    role: 'assistant',
                    content: `No pude realizar el análisis: ${result.error}`
                }
                updateConversationMessages(conversationId, [...currentMessages, errorMessage])
            }
        } catch (error) {
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Error al realizar el análisis. Por favor, intenta de nuevo.'
            }
            updateConversationMessages(conversationId, [...currentMessages, errorMessage])
        }

        setIsLoading(false)
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className={`flex flex-col md:flex-row h-[600px] glass-card rounded-2xl border border-border/50 overflow-hidden relative ${className}`}>

            {/* Mobile Sidebar Overlay */}
            {showMobileSidebar && (
                <div className="absolute inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden flex flex-col animate-in slide-in-from-left duration-200">
                    <div className="p-4 border-b border-border/50 flex justify-between items-center">
                        <span className="font-semibold">Historial</span>
                        <button onClick={() => setShowMobileSidebar(false)} className="p-2 hover:bg-muted rounded-full">
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="p-4">
                        <button
                            onClick={startNewConversation}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold mb-4"
                        >
                            <Plus className="h-4 w-4" />
                            Nueva conversación
                        </button>
                        <div className="space-y-1 overflow-y-auto max-h-[400px]">
                            {conversations.map((conv) => (
                                <div
                                    key={conv.id}
                                    className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${conv.id === activeConversationId
                                            ? 'bg-primary/20 text-primary'
                                            : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                    onClick={() => {
                                        setActiveConversationId(conv.id)
                                        setShowMobileSidebar(false)
                                    }}
                                >
                                    <MessageCircle className="h-4 w-4 shrink-0" />
                                    <span className="text-xs font-medium truncate flex-1">
                                        {conv.title}
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteConversation(conv.id)
                                        }}
                                        className="p-1 hover:text-red-400 transition-all"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Sidebar - Conversation History */}
            <div className={`hidden md:flex flex-col border-r border-border/50 bg-muted/30 transition-all duration-300 overflow-hidden ${showDesktopSidebar ? 'w-64' : 'w-0'}`}>
                {/* Sidebar Header */}
                <div className="p-3 border-b border-border/50">
                    <button
                        onClick={startNewConversation}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm font-semibold whitespace-nowrap overflow-hidden"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        {showDesktopSidebar && "Nueva conversación"}
                    </button>
                </div>

                {/* Conversations List */}
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {conversations.length === 0 ? (
                        <div className="text-center py-8 px-3 opacity-70">
                            <History className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">
                                No hay conversaciones aún
                            </p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv.id}
                                className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${conv.id === activeConversationId
                                        ? 'bg-primary/20 text-primary'
                                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setActiveConversationId(conv.id)}
                            >
                                <MessageCircle className="h-4 w-4 shrink-0" />
                                <span className="text-xs font-medium truncate flex-1">
                                    {conv.title}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        deleteConversation(conv.id)
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all"
                                    title="Eliminar"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            </div>
                        ))
                    )}
                </div>

                {/* Clear All Button */}
                {conversations.length > 0 && (
                    <div className="p-2 border-t border-border/50">
                        <button
                            onClick={() => {
                                setConversations([])
                                setActiveConversationId(null)
                                localStorage.removeItem('ogfinance-conversations')
                            }}
                            className="w-full text-xs text-muted-foreground hover:text-red-400 py-2 transition-colors"
                        >
                            Limpiar historial
                        </button>
                    </div>
                )}
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-3">
                        {/* Mobile Menu Button */}
                        <button
                            className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground"
                            onClick={() => setShowMobileSidebar(true)}
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        {/* Desktop Toggle Button */}
                        <button
                            onClick={() => setShowDesktopSidebar(!showDesktopSidebar)}
                            className="hidden md:block p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                            title={showDesktopSidebar ? 'Ocultar historial' : 'Mostrar historial'}
                        >
                            {showDesktopSidebar ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </button>

                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-bold text-base">OGFINANCE</h3>
                            <p className="text-xs text-muted-foreground">Tu asistente financiero</p>
                        </div>
                    </div>
                    <button
                        onClick={handleQuickAnalysis}
                        disabled={isLoading}
                        className="px-3 py-1.5 text-xs font-semibold bg-primary/20 text-primary rounded-lg hover:bg-primary/30 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                        <Sparkles className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Análisis Rápido</span>
                    </button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-8">
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <MessageSquarePlus className="h-8 w-8 text-primary/60" />
                            </div>
                            <h4 className="font-semibold text-foreground mb-2">¡Hola! Soy OGFINANCE</h4>
                            <p className="text-sm text-muted-foreground max-w-sm mb-6">
                                Pregúntame cualquier cosa sobre tus finanzas. Puedo analizar tus gastos,
                                darte consejos para ahorrar, y mucho más.
                            </p>

                            {/* Quick Suggestions */}
                            <div className="flex flex-wrap justify-center gap-2">
                                {QUICK_SUGGESTIONS.map((suggestion, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSend(suggestion)}
                                        disabled={isLoading}
                                        className="px-3 py-1.5 text-xs bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full transition-colors border border-border/50 disabled:opacity-50"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'assistant' && (
                                        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                            <Bot className="h-4 w-4 text-primary" />
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[85%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-md'
                                            : 'bg-muted border border-border/50 rounded-bl-md'
                                            }`}
                                    >
                                        {msg.role === 'assistant' ? (
                                            <AIMarkdown content={msg.content} />
                                        ) : (
                                            <p className="text-sm">{msg.content}</p>
                                        )}
                                    </div>
                                    {msg.role === 'user' && (
                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                            <User className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    )}
                                </div>
                            ))}

                            {isLoading && (
                                <div className="flex gap-3 justify-start">
                                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="bg-muted border border-border/50 rounded-2xl rounded-bl-md px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="flex gap-1">
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                            </div>
                                            <span className="text-xs text-muted-foreground">Pensando...</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border/50 bg-background/80 backdrop-blur-sm z-10">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Escribe tu pregunta..."
                            disabled={isLoading}
                            className="flex-1 bg-muted border border-border/50 rounded-xl px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 text-foreground"
                        />
                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isLoading}
                            className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
