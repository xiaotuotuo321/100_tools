import LoremGenerator from '@/components/tools/text-tools/LoremGenerator'

export default function LoremGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Lorem Ipsum 生成器</h1>
          <p className="text-muted-foreground">
            生成标准的 Lorem Ipsum 占位文本，支持按单词数、段落数、句子数生成，同时支持中英文模式
          </p>
        </div>
        
        <LoremGenerator />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Lorem Ipsum生成器 - 占位文本工具',
  description: '在线Lorem Ipsum生成器，快速生成标准占位文本，支持按单词、段落、句子生成，适合设计师和开发者使用。',
} 