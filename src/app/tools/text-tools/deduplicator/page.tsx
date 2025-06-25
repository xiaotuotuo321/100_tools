import TextDeduplicator from '@/components/tools/text-tools/TextDeduplicator'

export default function TextDeduplicatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">文本去重器</h1>
          <p className="text-muted-foreground">
            快速删除文本中的重复内容，支持按行、按单词、按字符去重，可选择是否区分大小写
          </p>
        </div>
        
        <TextDeduplicator />
      </div>
    </div>
  )
}

export const metadata = {
  title: '文本去重器 - 删除重复内容工具',
  description: '在线文本去重工具，快速删除文本中的重复行、重复单词或重复字符，支持区分大小写选项，提高文本处理效率。',
} 