"use client"

import Link from 'next/link'
import { Search, Menu, Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchBox } from '@/components/common/SearchBox'
import { SearchResults } from '@/components/common/SearchResults'
import { ThemeToggle } from '@/components/common/ThemeToggle'
import { useSearch } from '@/hooks/useSearch'
import { useState, useEffect, useRef } from 'react'
import { SimpleDialog } from '@/components/common/SimpleDialog'
import { cn } from '@/lib/utils'

export function Header() {
  const { searchQuery, searchResults, updateSearchQuery, clearSearch, isSearching } = useSearch()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState(false)
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // 当搜索对话框打开时，聚焦到搜索输入框
  useEffect(() => {
    if (isSearchDialogOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }, [isSearchDialogOpen])

  // 处理搜索对话框的打开和关闭
  const handleOpenSearchDialog = () => {
    setIsSearchDialogOpen(true)
  }

  const handleCloseSearchDialog = () => {
    setIsSearchDialogOpen(false)
    clearSearch()
    setIsSearchResultsVisible(false)
  }

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 按下 Ctrl+K 或 Command+K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        handleOpenSearchDialog()
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [])

  return (
    <header className="relative w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">100</span>
          </div>
          <span className="hidden font-bold sm:inline-block">工具集合</span>
        </Link>

        {/* 空白占位，保持布局平衡 */}
        <div className="hidden md:block flex-1 max-w-md mx-6"></div>

        {/* 右侧按钮 */}
        <div className="flex items-center space-x-2">

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

      {/* 搜索对话框 */}
      <SimpleDialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen} className="sm:max-w-[550px] p-0 gap-0">
        <div className="p-4 pb-2">
          <div className="flex items-center">
            <div className="flex-shrink-0 mr-2">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="flex-grow">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜索工具..."
                value={searchQuery}
                onChange={(e) => {
                  updateSearchQuery(e.target.value)
                  setIsSearchResultsVisible(!!e.target.value)
                }}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2",
                  "text-sm ring-offset-background file:border-0 file:bg-transparent",
                  "file:text-sm file:font-medium placeholder:text-muted-foreground",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  "focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </div>
            {searchQuery && (
              <div className="flex-shrink-0 ml-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    clearSearch()
                    searchInputRef.current?.focus()
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
              正在搜索...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              {searchResults.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.path}
                  onClick={handleCloseSearchDialog}
                  className="flex items-center px-4 py-2 hover:bg-muted transition-colors"
                >
                  <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-md border">
                    <Search className="h-4 w-4" />
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
          ) : searchQuery ? (
            <div className="p-4 text-center text-muted-foreground">
              没有找到匹配的工具
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              输入关键词开始搜索
            </div>
          )}
        </div>

        <div className="p-4 pt-2 text-xs text-muted-foreground border-t">
          <div className="flex justify-between items-center">
            <div>
              提示: 使用 <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium">↑</kbd>
              <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium">↓</kbd>
              导航, <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium">Enter</kbd> 选择
            </div>
            <div>
              <kbd className="rounded border bg-muted px-1 py-0.5 text-[10px] font-medium">Esc</kbd> 关闭
            </div>
          </div>
        </div>
      </SimpleDialog>
    </header>
  )
} 
