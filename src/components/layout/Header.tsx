"use client"

import Link from 'next/link'
import { Search, Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/common/SearchBox'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useSearch } from '@/hooks/useSearch'
import { useState } from 'react'

export function Header() {
  const { searchQuery, updateSearchQuery, clearSearch } = useSearch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">100</span>
          </div>
          <span className="hidden font-bold sm:inline-block">工具集合</span>
        </Link>

        {/* 搜索框 - 桌面版 */}
        <div className="hidden md:flex flex-1 max-w-md mx-6">
          <SearchBox
            value={searchQuery}
            onChange={updateSearchQuery}
            onClear={clearSearch}
            placeholder="搜索工具..."
            className="w-full"
          />
        </div>

        {/* 右侧按钮 */}
        <div className="flex items-center space-x-2">
          {/* 搜索按钮 - 移动版 */}
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
          </Button>

          {/* 收藏按钮 */}
          <Link href="/favorites">
            <Button variant="ghost" size="icon">
              <Heart className="h-5 w-5" />
            </Button>
          </Link>

          {/* 主题切换 */}
          <ThemeToggle />

          {/* 移动菜单按钮 */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* 移动搜索框 */}
      <div className="md:hidden border-t bg-background/95 backdrop-blur">
        <div className="container py-3">
          <SearchBox
            value={searchQuery}
            onChange={updateSearchQuery}
            onClear={clearSearch}
            placeholder="搜索工具..."
          />
        </div>
      </div>
    </header>
  )
} 