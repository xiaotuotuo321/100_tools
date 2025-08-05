"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'

interface FavoriteButtonProps {
  toolId: string
  variant?: "default" | "ghost" | "outline"
  size?: "default" | "sm" | "lg" | "icon"
}

export function FavoriteButton({
  toolId,
  variant = "ghost",
  size = "icon"
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 在挂载前，始终显示未收藏状态，避免水合错误
  const favorited = mounted ? isFavorite(toolId) : false

  return (
    <Button
      variant={variant}
      size={size}
      onClick={() => toggleFavorite(toolId)}
      className="relative"
    >
      <Heart
        className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`}
      />
      <span className="sr-only">
        {favorited ? '取消收藏' : '添加收藏'}
      </span>
    </Button>
  )
}
