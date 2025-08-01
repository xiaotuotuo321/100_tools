"use client"

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Tool } from '@/lib/types'
import { LucideIcon } from './LucideIcon'

interface SearchResultsProps {
    results: Tool[]
    isVisible: boolean
    onClose: () => void
    isLoading?: boolean
}

export function SearchResults({
    results,
    isVisible,
    onClose,
    isLoading = false
}: SearchResultsProps) {
    const resultsRef = useRef<HTMLDivElement>(null)

    // 点击外部关闭搜索结果
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
                onClose()
            }
        }

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isVisible, onClose])

    // ESC键关闭搜索结果
    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose()
            }
        }

        if (isVisible) {
            document.addEventListener('keydown', handleEscKey)
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey)
        }
    }, [isVisible, onClose])

    if (!isVisible) return null

    return (
        <div
            ref={resultsRef}
            className="absolute top-full left-0 right-0 mt-1 max-h-[70vh] overflow-y-auto rounded-md border bg-background shadow-md z-50"
        >
            {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">
                    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                    正在搜索...
                </div>
            ) : results.length > 0 ? (
                <div className="py-2">
                    {results.map((tool) => (
                        <Link
                            key={tool.id}
                            href={tool.path}
                            onClick={onClose}
                            className="flex items-center px-4 py-2 hover:bg-muted transition-colors"
                        >
                            <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md border">
                                <LucideIcon name={tool.icon} className="h-4 w-4" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium">{tool.name}</div>
                                <div className="text-xs text-muted-foreground truncate">
                                    {tool.description}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="p-4 text-center text-muted-foreground">
                    没有找到匹配的工具
                </div>
            )}
        </div>
    )
}