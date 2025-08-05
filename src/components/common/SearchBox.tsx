"use client"

import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBoxProps {
  value: string
  onChange: (value: string) => void
  onClear: () => void
  placeholder?: string
  className?: string
}

export function SearchBox({
  value,
  onChange,
  onClear,
  placeholder = "搜索工具...",
  className
}: SearchBoxProps) {
  return (
    <div className={`relative ${className}`}>
      <Input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pr-16"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
        {value && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 mr-1"
            onClick={onClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <Search className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  )
}
