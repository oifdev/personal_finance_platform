'use client'

import * as React from 'react'
import { Eye, EyeOff, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ValidationRule {
    label: string
    test: (val: string) => boolean
}

const PASSWORD_RULES: ValidationRule[] = [
    { label: 'Mínimo 8 caracteres', test: (val) => val.length >= 8 },
    { label: 'Al menos una mayúscula', test: (val) => /[A-Z]/.test(val) },
    { label: 'Al menos una minúscula', test: (val) => /[a-z]/.test(val) },
    { label: 'Un carácter especial (!@#$%^&*)', test: (val) => /[!@#$%^&*(),.?":{}|<>]/.test(val) },
]

interface PasswordFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string
    showValidation?: boolean
    confirmValue?: string
}

export function PasswordField({
    label,
    showValidation = false,
    confirmValue,
    className,
    ...props
}: PasswordFieldProps) {
    const [showPassword, setShowPassword] = React.useState(false)
    const [value, setValue] = React.useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        if (props.onChange) props.onChange(e)
    }

    const isMatching = confirmValue !== undefined ? value === confirmValue && value !== '' : true

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium" htmlFor={props.id || props.name}>
                    {label}
                </label>
            </div>
            <div className="relative">
                <input
                    {...props}
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    onChange={handleChange}
                    className={cn(
                        "w-full px-3 py-2 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all pr-10",
                        className
                    )}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
            </div>

            {showValidation && value.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 p-3 rounded-lg bg-secondary/30 border border-border/50">
                    {PASSWORD_RULES.map((rule, idx) => {
                        const passed = rule.test(value)
                        return (
                            <div key={idx} className="flex items-center gap-2 text-xs">
                                {passed ? (
                                    <Check className="h-3 w-3 text-emerald-500" />
                                ) : (
                                    <X className="h-3 w-3 text-destructive" />
                                )}
                                <span className={passed ? "text-emerald-500" : "text-muted-foreground"}>
                                    {rule.label}
                                </span>
                            </div>
                        )
                    })}
                    {confirmValue !== undefined && value.length > 0 && (
                        <div className="flex items-center gap-2 text-xs sm:col-span-2 border-t border-border/30 pt-2 mt-1">
                            {isMatching ? (
                                <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                                <X className="h-3 w-3 text-destructive" />
                            )}
                            <span className={isMatching ? "text-emerald-500" : "text-muted-foreground"}>
                                Las contraseñas coinciden
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
