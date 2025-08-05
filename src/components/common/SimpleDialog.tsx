"use client"

import React, { useEffect } from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SimpleDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
    className?: string
}

export function SimpleDialog({ open, onOpenChange, children, className }: SimpleDialogProps) {
    // 处理ESC键关闭
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                onOpenChange(false)
            }
        }

        if (open) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [open, onOpenChange])

    if (!open) return null

    return (
        <div className="relative inset-0 z-50">
            {/* 背景遮罩 */}
            <div
                className="relative inset-0 bg-black/80"
                onClick={() => onOpenChange(false)}
            />

            {/* 对话框内容 */}
            <div
                className={cn(
                    "relative w-full max-w-lg mx-auto mt-10 gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
                    className
                )}
            >
                {children}
                <button
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">关闭</span>
                </button>
            </div>
        </div>
    )
}