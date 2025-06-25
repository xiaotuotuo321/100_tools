import { Metadata } from 'next'
import ImageCompressor from '@/components/tools/image-tools/ImageCompressor'

export const metadata: Metadata = {
  title: '图片压缩器 - 在线图片压缩工具',
  description: '免费的在线图片压缩工具，支持JPEG、PNG、WebP格式，可调整压缩质量和尺寸，批量处理，保持高质量的同时减小文件大小。',
  keywords: ['图片压缩', '图片优化', 'JPEG', 'PNG', 'WebP', '批量压缩', '在线工具'],
}

export default function ImageCompressorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            图片压缩器
          </h1>
          <p className="text-lg text-muted-foreground">
            在线压缩图片文件大小，支持多种格式和批量处理
          </p>
        </div>
        
        <ImageCompressor />
      </div>
    </div>
  )
} 