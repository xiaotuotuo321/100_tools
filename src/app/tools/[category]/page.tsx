 import { notFound } from 'next/navigation'
import * as Icons from 'lucide-react'
import { ToolCard } from '@/components/tools/ToolCard'
import { getCategoryById } from '@/data/tools'
import { Metadata } from 'next'

interface CategoryPageProps {
  params: {
    category: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = getCategoryById(params.category)
  
  if (!category) {
    return {
      title: '分类不存在',
    }
  }

  return {
    title: category.name,
    description: `${category.description} - 包含${category.tools.length}个实用工具`,
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = getCategoryById(params.category)

  if (!category) {
    notFound()
  }

  const icon = (Icons as any)[category.icon]
  const IconComponent = icon && typeof icon === 'function' ? icon : Icons.HelpCircle

  return (
    <div className="container mx-auto py-8">
      {/* 分类头部 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-lg ${category.color} text-white`}>
            <IconComponent className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          共 {category.tools.length} 个工具
        </div>
      </div>

      {/* 工具网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  )
} 