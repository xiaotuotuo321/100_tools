import HashGenerator from '@/components/tools/developer-tools/HashGenerator'

export default function HashGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">哈希生成器</h1>
          <p className="text-muted-foreground">
            生成多种哈希算法的摘要值，支持MD5、SHA-1、SHA-256、SHA-384、SHA-512、CRC32等算法
          </p>
        </div>
        
        <HashGenerator />
      </div>
    </div>
  )
}

export const metadata = {
  title: '哈希生成器 - 加密摘要工具',
  description: '在线哈希生成工具，支持MD5、SHA-1、SHA-256、SHA-384、SHA-512、CRC32等多种哈希算法，适合开发者和安全专家使用。',
} 