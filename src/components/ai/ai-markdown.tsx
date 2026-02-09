'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface AIMarkdownProps {
    content: string
    className?: string
}

export function AIMarkdown({ content, className = '' }: AIMarkdownProps) {
    return (
        <div className={`ai-markdown ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-foreground mb-4 mt-2 flex items-center gap-2">
                            <span className="h-1 w-6 bg-primary rounded-full" />
                            {children}
                        </h1>
                    ),
                    h2: ({ children }) => (
                        <h2 className="text-lg font-semibold text-foreground mb-3 mt-4 border-b border-border/30 pb-2">
                            {children}
                        </h2>
                    ),
                    h3: ({ children }) => (
                        <h3 className="text-base font-semibold text-foreground mb-2 mt-3">
                            {children}
                        </h3>
                    ),
                    h4: ({ children }) => (
                        <h4 className="text-sm font-semibold text-primary mb-2 mt-3 flex items-center gap-2">
                            <span className="h-2 w-2 bg-primary rounded-full" />
                            {children}
                        </h4>
                    ),
                    p: ({ children }) => (
                        <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                            {children}
                        </p>
                    ),
                    ul: ({ children }) => (
                        <ul className="space-y-2 mb-4 ml-1">
                            {children}
                        </ul>
                    ),
                    ol: ({ children }) => (
                        <ol className="space-y-2 mb-4 ml-1 list-none counter-reset-item">
                            {children}
                        </ol>
                    ),
                    li: ({ children, ...props }) => {
                        const isOrdered = props.node?.position?.start.offset !== undefined &&
                            props.node?.tagName === 'li'
                        return (
                            <li className="flex items-start gap-3 text-sm text-muted-foreground">
                                <span className="h-2 w-2 bg-primary/60 rounded-full mt-1.5 shrink-0" />
                                <span className="leading-relaxed">{children}</span>
                            </li>
                        )
                    },
                    strong: ({ children }) => (
                        <strong className="font-semibold text-foreground">
                            {children}
                        </strong>
                    ),
                    em: ({ children }) => (
                        <em className="italic text-primary/80">
                            {children}
                        </em>
                    ),
                    code: ({ children, className }) => {
                        const isInline = !className
                        if (isInline) {
                            return (
                                <code className="px-1.5 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                                    {children}
                                </code>
                            )
                        }
                        return (
                            <code className="block p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto border border-border/30">
                                {children}
                            </code>
                        )
                    },
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-2 border-primary/50 pl-4 py-1 my-3 bg-primary/5 rounded-r-lg">
                            {children}
                        </blockquote>
                    ),
                    hr: () => (
                        <hr className="border-border/30 my-4" />
                    ),
                    a: ({ children, href }) => (
                        <a
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            {children}
                        </a>
                    ),
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    )
}
