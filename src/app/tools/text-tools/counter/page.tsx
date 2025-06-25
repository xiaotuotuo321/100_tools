import TextCounter from '@/components/tools/text-tools/TextCounter'

export default function TextCounterPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">文本统计器</h1>
          <p className="text-muted-foreground">
            统计文本的字数、字符数、段落数、句子数等详细信息，支持中英文文本分析
          </p>
        </div>
        
        <TextCounter />
      </div>
    </div>
  )
}

export const metadata = {
  title: '文本统计器 - 字数统计工具',
  description: '在线文本统计器，快速统计字数、字符数、段落数、句子数等信息，支持中英文文本分析，提供详细的文本统计数据。',
} 