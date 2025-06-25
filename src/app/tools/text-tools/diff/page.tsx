import TextDiff from '@/components/tools/text-tools/TextDiff'

export default function TextDiffPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">文本差异对比</h1>
          <p className="text-muted-foreground">
            在线文本差异对比工具，支持逐行对比、忽略空白和大小写选项，快速发现两个文本之间的差异
          </p>
        </div>
        
        <TextDiff />
      </div>
    </div>
  )
}

export const metadata = {
  title: '文本差异对比 - 在线比较工具',
  description: '在线文本差异对比工具，支持逐行对比、忽略空白和大小写，快速发现两个文本之间的差异，适合代码和文档比较。',
} 