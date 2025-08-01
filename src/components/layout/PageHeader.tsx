"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface PageHeaderProps {
    title: string
    description?: string
    showBackButton?: boolean
}

export function PageHeader({ title, description, showBackButton = true }: PageHeaderProps) {
    return (
        <div className="border-b">
            <div className="container py-8 md:py-12">
                <div className="flex flex-col gap-4">
                    {showBackButton && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit gap-1 pl-0 text-muted-foreground"
                            asChild
                        >
                            <Link href="/">
                                <ArrowLeft className="h-4 w-4" />
                                返回首页
                            </Link>
                        </Button>
                    )}
                    <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                    {description && (
                        <p className="text-lg text-muted-foreground max-w-3xl">
                            {description}
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}