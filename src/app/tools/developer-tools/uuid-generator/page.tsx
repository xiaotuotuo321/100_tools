import UuidGenerator from '@/components/tools/developer-tools/UuidGenerator'

export default function UuidGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">UUID 生成器</h1>
          <p className="text-muted-foreground">
            生成各种版本的 UUID（通用唯一识别码），支持 v1、v4、v6 版本，提供多种编程语言格式输出
          </p>
        </div>
        
        <UuidGenerator />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'UUID生成器 - 通用唯一识别码工具',
  description: '在线UUID生成器，支持v1、v4、v6版本UUID生成，提供多种编程语言格式输出，适合开发者使用。',
} 