"use client"

import Link from 'next/link'
import * as Icons from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ToolCard } from '@/components/tools/ToolCard'
import { SearchBox } from '@/components/common/SearchBox'
import { useSearch } from '@/hooks/useSearch'
import { toolsData, featuredTools } from '@/data/tools'
import { ArrowRight, Star, TrendingUp } from 'lucide-react'

export default function HomePage() {
  const { searchQuery, searchResults, updateSearchQuery, clearSearch } = useSearch()

  return (
    <div className="container mx-auto py-8">
      {/* Hero 区域 */}
      <section className="text-center py-12 md:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-center">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              100+ 实用工具集合
            </span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            一个现代化的在线工具平台，包含文本处理、开发工具、图片编辑、数学计算等100+个实用工具，
            全部免费使用，无需注册。
          </p>
          <div className="mt-10 max-w-md mx-auto">
            <SearchBox
              value={searchQuery}
              onChange={updateSearchQuery}
              onClear={clearSearch}
              placeholder="搜索你需要的工具..."
              className="w-full"
            />
          </div>
        </div>
      </section>

      {/* 搜索结果 */}
      {searchQuery && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">
              搜索结果 <span className="text-muted-foreground">({searchResults.length})</span>
            </h2>
            <Button variant="outline" onClick={clearSearch}>
              清除搜索
            </Button>
          </div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">未找到相关工具，请尝试其他关键词</p>
            </div>
          )}
        </section>
      )}

      {!searchQuery && (
        <>
          {/* 特色工具 */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <h2 className="text-2xl font-bold">特色工具</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredTools.map((tool) => (
                <ToolCard key={tool.id} tool={tool} />
              ))}
            </div>
          </section>

          {/* 工具分类 */}
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">工具分类</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {toolsData.map((category) => {
                const icon = (Icons as any)[category.icon]
                const IconComponent = icon && typeof icon === 'function' ? icon : Icons.HelpCircle

                return (
                  <Link key={category.id} href={`/tools/${category.id}`}>
                    <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${category.color} text-white`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <div>
                            <CardTitle className="text-lg group-hover:text-primary transition-colors">
                              {category.name}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                              {category.tools.length} 个工具
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="line-clamp-2">
                          {category.description}
                        </CardDescription>
                        <div className="mt-4 flex items-center text-sm text-primary group-hover:text-primary/80">
                          查看工具 <ArrowRight className="ml-1 h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* 统计信息 */}
          <section className="py-12 border-t">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">100+</div>
                <div className="text-muted-foreground">实用工具</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">8</div>
                <div className="text-muted-foreground">工具分类</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">100%</div>
                <div className="text-muted-foreground">免费使用</div>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
} 