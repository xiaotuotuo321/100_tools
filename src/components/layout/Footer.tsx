"use client"

import Link from 'next/link'
import { Github, Twitter, Heart } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        {/* 主要内容区 */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 品牌信息 */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <span className="text-sm font-bold text-primary-foreground">100</span>
              </div>
              <span className="font-bold">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              {SITE_CONFIG.description}
            </p>
            <div className="mt-4 flex space-x-4">
              <Link 
                href={SITE_CONFIG.author.url} 
                className="text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link 
                href="#" 
                className="text-muted-foreground hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div>
          </div>

          {/* 工具分类 */}
          <div>
            <h3 className="text-sm font-semibold">工具分类</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/tools/text-tools" className="text-muted-foreground hover:text-foreground">文本处理</Link></li>
              <li><Link href="/tools/developer-tools" className="text-muted-foreground hover:text-foreground">开发工具</Link></li>
              <li><Link href="/tools/image-tools" className="text-muted-foreground hover:text-foreground">图片处理</Link></li>
              <li><Link href="/tools/math-tools" className="text-muted-foreground hover:text-foreground">数学计算</Link></li>
            </ul>
          </div>

          {/* 更多链接 */}
          <div>
            <h3 className="text-sm font-semibold">更多</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">关于我们</Link></li>
              <li><Link href="/feedback" className="text-muted-foreground hover:text-foreground">意见反馈</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-foreground">隐私政策</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-foreground">使用条款</Link></li>
            </ul>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="mt-8 border-t pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © 2024 {SITE_CONFIG.name}. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0 flex items-center text-sm text-muted-foreground">
            Made with <Heart className="mx-1 h-4 w-4 text-red-500" /> by {SITE_CONFIG.author.name}
          </p>
        </div>
      </div>
    </footer>
  )
} 