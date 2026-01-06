import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'

export function getIcon(iconName: string): LucideIcon {
    // 1. Try exact match (e.g. "Wallet")
    if ((Icons as any)[iconName]) {
        return (Icons as any)[iconName]
    }

    // 2. Try PascalCase conversion (e.g. "shopping-cart" -> "ShoppingCart")
    const pascalName = iconName
        .split('-')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')

    if ((Icons as any)[pascalName]) {
        return (Icons as any)[pascalName]
    }

    // 3. Try to capitalize first letter (e.g. "wallet" -> "Wallet")
    const capitalized = iconName.charAt(0).toUpperCase() + iconName.slice(1)
    if ((Icons as any)[capitalized]) {
        return (Icons as any)[capitalized]
    }

    // 4. Return fallback
    return Icons.HelpCircle
}
