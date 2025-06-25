"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function SimpleTestPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto py-8 space-y-8">
        
        {/* 标题测试 */}
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">样式测试页面</h1>
          <p className="text-muted-foreground">测试shadcn/ui组件和Tailwind CSS样式</p>
        </div>

        {/* 按钮测试 */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button>默认按钮</Button>
          <Button variant="secondary">次要按钮</Button>
          <Button variant="outline">轮廓按钮</Button>
          <Button variant="ghost">幽灵按钮</Button>
          <Button variant="destructive">危险按钮</Button>
        </div>

        {/* 卡片测试 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>卡片标题 1</CardTitle>
              <CardDescription>这是卡片的描述文本</CardDescription>
            </CardHeader>
            <CardContent>
              <p>这是卡片的内容区域。</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>卡片标题 2</CardTitle>
              <CardDescription>另一个卡片的描述</CardDescription>
            </CardHeader>
            <CardContent>
              <Input placeholder="输入框测试" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>卡片标题 3</CardTitle>
              <CardDescription>第三个测试卡片</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">全宽按钮</Button>
            </CardContent>
          </Card>
        </div>

        {/* 颜色测试 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">颜色测试</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="h-20 bg-primary rounded-md flex items-center justify-center text-primary-foreground font-semibold">
              Primary
            </div>
            <div className="h-20 bg-secondary rounded-md flex items-center justify-center text-secondary-foreground font-semibold">
              Secondary
            </div>
            <div className="h-20 bg-muted rounded-md flex items-center justify-center text-muted-foreground font-semibold">
              Muted
            </div>
            <div className="h-20 bg-accent rounded-md flex items-center justify-center text-accent-foreground font-semibold">
              Accent
            </div>
          </div>
        </div>

        {/* 边框和阴影测试 */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">边框和阴影测试</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-md">
              <p>带边框的容器</p>
            </div>
            <div className="p-4 bg-card text-card-foreground shadow-sm rounded-lg border">
              <p>卡片样式容器</p>
            </div>
            <div className="p-4 bg-card text-card-foreground shadow-lg rounded-lg border">
              <p>阴影较大的容器</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 