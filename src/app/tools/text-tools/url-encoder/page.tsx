import UrlEncoder from '@/components/tools/text-tools/UrlEncoder'

export default function UrlEncoderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">URL 编码/解码</h1>
          <p className="text-muted-foreground">
            在线 URL 编码解码工具，支持完整编码和组件编码模式，快速处理URL中的特殊字符和中文字符
          </p>
        </div>
        
        <UrlEncoder />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'URL编码解码 - 在线转换工具',
  description: '在线URL编码解码工具，支持完整编码和组件编码，快速处理URL中的特殊字符和中文字符，适合Web开发使用。',
} 