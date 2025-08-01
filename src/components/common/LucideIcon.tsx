"use client"

import * as LucideIcons from 'lucide-react'

interface LucideIconProps {
    name: string
    className?: string
}

export function LucideIcon({ name, className }: LucideIconProps) {
    const Icon = LucideIcons[name as keyof typeof LucideIcons] || LucideIcons.HelpCircle

    return <Icon className={className} />
}