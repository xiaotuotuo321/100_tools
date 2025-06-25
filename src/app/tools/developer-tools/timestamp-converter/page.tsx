import TimestampConverter from '@/components/tools/developer-tools/TimestampConverter'

export default function TimestampConverterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">时间戳转换器</h1>
          <p className="text-muted-foreground">
            时间戳和日期时间互相转换，支持多种时间格式，实时显示当前时间和详细时间信息
          </p>
        </div>
        
        <TimestampConverter />
      </div>
    </div>
  )
}

export const metadata = {
  title: '时间戳转换器 - 时间格式工具',
  description: '在线时间戳转换工具，支持Unix时间戳与日期时间相互转换，提供多种时间格式，适合开发者使用。',
} 