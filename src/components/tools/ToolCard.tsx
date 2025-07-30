 "use client"

import React from 'react'
import Link from 'next/link'
import * as Icons from 'lucide-react'
import { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FavoriteButton } from '@/components/common/FavoriteButton'
import { Tool } from '@/lib/types'

interface ToolCardProps {
  tool: Tool
}

export function ToolCard({ tool }: ToolCardProps) {
  // 动态获取图标组件，确保图标存在
  const IconComponent = React.useMemo(() => {
    const icon = (Icons as unknown as Record<string, LucideIcon>)[tool.icon]
    return icon || Icons.HelpCircle
  }, [tool.icon])

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <Link href={tool.path} className="block">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors">
                  {tool.name}
                </CardTitle>
              </div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <FavoriteButton toolId={tool.id} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-sm text-muted-foreground line-clamp-2">
            {tool.description}
          </CardDescription>
          <div className="mt-3 flex flex-wrap gap-1">
            {tool.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground"
              >
                {tag}
              </span>
            ))}
            {tool.tags.length > 3 && (
              <span className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs text-secondary-foreground">
                +{tool.tags.length - 3}
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  )
} 