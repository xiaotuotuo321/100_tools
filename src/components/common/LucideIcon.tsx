"use client"

import * as LucideIcons from 'lucide-react'
import { LucideProps } from 'lucide-react'
import React from 'react'

interface LucideIconProps {
    name: string
    className?: string
}

export function LucideIcon({ name, className }: LucideIconProps) {
    // 使用类型断言确保 Icon 是一个有效的 React 组件
    const Icon = (LucideIcons[name as keyof typeof LucideIcons] || LucideIcons.HelpCircle) as React.ComponentType<LucideProps>

    return <Icon className={className} />
}
