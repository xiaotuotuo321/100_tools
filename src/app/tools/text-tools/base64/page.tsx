import Base64Encoder from '@/components/tools/text-tools/Base64Encoder'

export default function Base64EncoderPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Base64 编码/解码</h1>
          <p className="text-muted-foreground">
            在线 Base64 编码解码工具，支持中文字符，快速进行文本与 Base64 之间的转换
          </p>
        </div>
        
        <Base64Encoder />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Base64编码解码 - 在线转换工具',
  description: '在线Base64编码解码工具，支持中文字符，快速进行文本与Base64格式之间的相互转换，适合开发者和数据处理使用。',
} 