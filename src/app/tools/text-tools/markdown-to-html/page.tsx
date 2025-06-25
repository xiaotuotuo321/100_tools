import MarkdownToHtml from '@/components/tools/text-tools/MarkdownToHtml'

export default function MarkdownToHtmlPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Markdown 转 HTML</h1>
          <p className="text-muted-foreground">
            将 Markdown 格式文本转换为 HTML 代码，支持实时预览和语法高亮
          </p>
        </div>
        
        <MarkdownToHtml />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Markdown转HTML - 在线格式转换工具',
  description: '在线Markdown转HTML工具，支持实时预览、语法高亮，快速将MD格式文档转换为HTML代码，适合开发者和内容创作者使用。',
} 