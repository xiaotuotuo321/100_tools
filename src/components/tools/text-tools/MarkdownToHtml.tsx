'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Upload, Eye, Code, FileText } from 'lucide-react'

export default function MarkdownToHtml() {
  const [markdown, setMarkdown] = useState(`# 示例标题

这是一个 **Markdown** 示例文档。

## 功能特性

- 支持 *斜体* 和 **粗体**
- 支持 \`行内代码\`
- 支持链接：[GitHub](https://github.com)

### 代码块示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!');
}
\`\`\`

### 表格示例

| 功能 | 状态 |
|------|------|
| 标题 | ✅ |
| 列表 | ✅ |
| 代码 | ✅ |

> 这是一个引用文本

---

**注意：** 这只是一个简单的示例。`)

  const [htmlOutput, setHtmlOutput] = useState('')

  // 简单的 Markdown 转 HTML 函数
  const convertMarkdownToHtml = (md: string): string => {
    let html = md

    // 标题
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>')

    // 粗体和斜体
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // 行内代码
    html = html.replace(/`(.*?)`/g, '<code>$1</code>')

    // 代码块
    html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `<pre><code class="language-${lang || 'text'}">${code.trim()}</code></pre>`
    })

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')

    // 引用
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')

    // 水平线
    html = html.replace(/^---$/gm, '<hr>')

    // 无序列表
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>')
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')

    // 有序列表
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>')

    // 表格 (简单处理)
    const tableRegex = /(\|.*\|)\n(\|.*\|)\n((\|.*\|\n?)*)/g
    html = html.replace(tableRegex, (match) => {
      const lines = match.trim().split('\n')
      if (lines.length < 2) return match

      const headers = lines[0].split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      const separator = lines[1]
      const rows = lines.slice(2).map(line => 
        line.split('|').filter(cell => cell.trim()).map(cell => cell.trim())
      )

      let tableHtml = '<table class="border-collapse border border-gray-300">\n'
      
      // 表头
      tableHtml += '<thead><tr>\n'
      headers.forEach(header => {
        tableHtml += `<th class="border border-gray-300 px-4 py-2">${header}</th>\n`
      })
      tableHtml += '</tr></thead>\n'

      // 表体
      tableHtml += '<tbody>\n'
      rows.forEach(row => {
        if (row.length > 0) {
          tableHtml += '<tr>\n'
          row.forEach(cell => {
            tableHtml += `<td class="border border-gray-300 px-4 py-2">${cell}</td>\n`
          })
          tableHtml += '</tr>\n'
        }
      })
      tableHtml += '</tbody></table>\n'

      return tableHtml
    })

    // 段落 (处理换行)
    html = html.replace(/\n\n/g, '</p><p>')
    html = html.replace(/\n/g, '<br>')
    html = `<p>${html}</p>`
    
    // 清理空段落
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[1-6]>.*?<\/h[1-6]>)<\/p>/g, '$1')
    html = html.replace(/<p>(<ul>.*?<\/ul>)<\/p>/g, '$1')
    html = html.replace(/<p>(<blockquote>.*?<\/blockquote>)<\/p>/g, '$1')
    html = html.replace(/<p>(<hr>)<\/p>/g, '$1')
    html = html.replace(/<p>(<pre>.*?<\/pre>)<\/p>/g, '$1')
    html = html.replace(/<p>(<table.*?<\/table>)<\/p>/g, '$1')

    return html
  }

  const convertedHtml = useMemo(() => {
    return convertMarkdownToHtml(markdown)
  }, [markdown])

  const handleConvert = () => {
    setHtmlOutput(convertedHtml)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md') || file.type === 'text/plain')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setMarkdown(text)
      }
      reader.readAsText(file)
    }
  }

  const previewStyles = `
    h1, h2, h3, h4, h5, h6 { margin: 1em 0 0.5em 0; font-weight: bold; }
    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.17em; }
    p { margin: 1em 0; }
    ul, ol { margin: 1em 0; padding-left: 2em; }
    li { margin: 0.25em 0; }
    blockquote { 
      margin: 1em 0; 
      padding: 0.5em 1em; 
      border-left: 4px solid #ddd; 
      background: #f9f9f9; 
    }
    code { 
      background: #f1f1f1; 
      padding: 0.125em 0.25em; 
      border-radius: 3px; 
      font-family: monospace; 
    }
    pre { 
      background: #f4f4f4; 
      padding: 1em; 
      border-radius: 5px; 
      overflow-x: auto; 
      margin: 1em 0; 
    }
    pre code { background: none; padding: 0; }
    table { width: 100%; margin: 1em 0; }
    th, td { text-align: left; }
    hr { margin: 2em 0; border: 0; border-top: 1px solid #ddd; }
    a { color: #0066cc; text-decoration: underline; }
  `

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Markdown 输入
          </CardTitle>
          <CardDescription>
            输入 Markdown 文本或上传 .md 文件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="file"
              accept=".md,.markdown,.txt"
              onChange={handleFileUpload}
              className="hidden"
              id="md-file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('md-file-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-1" />
              上传文件
            </Button>
            <Button onClick={handleConvert}>
              <Code className="h-4 w-4 mr-1" />
              转换为 HTML
            </Button>
          </div>

          <Textarea
            placeholder="# 在这里输入 Markdown 文本..."
            value={markdown}
            onChange={(e) => setMarkdown(e.target.value)}
            className="min-h-[400px] font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {markdown.length} 字符
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMarkdown('')}
            >
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            预览
          </TabsTrigger>
          <TabsTrigger value="html" className="flex items-center gap-2">
            <Code className="h-4 w-4" />
            HTML 代码
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>HTML 预览</CardTitle>
              <CardDescription>
                Markdown 转换后的 HTML 效果预览
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white min-h-[400px]">
                <style dangerouslySetInnerHTML={{ __html: previewStyles }} />
                <div 
                  dangerouslySetInnerHTML={{ __html: convertedHtml }} 
                  className="prose max-w-none"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="html">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>HTML 代码</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(convertedHtml)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制 HTML
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadFile(convertedHtml, 'converted.html', 'text/html')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载 HTML
                  </Button>
                </div>
              </CardTitle>
              <CardDescription>
                转换生成的 HTML 代码
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={convertedHtml}
                readOnly
                className="min-h-[400px] font-mono text-sm"
                placeholder="转换后的 HTML 代码将显示在这里..."
              />
              <div className="mt-4">
                <Badge variant="outline">
                  {convertedHtml.length} 字符
                </Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Markdown 语法参考</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold">基础语法</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><code># 标题</code> - 一级标题</li>
                <li><code>## 标题</code> - 二级标题</li>
                <li><code>**粗体**</code> - 粗体文本</li>
                <li><code>*斜体*</code> - 斜体文本</li>
                <li><code>`代码`</code> - 行内代码</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">高级语法</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li><code>[链接](URL)</code> - 链接</li>
                <li><code>- 列表项</code> - 无序列表</li>
                <li><code>&gt; 引用</code> - 引用文本</li>
                <li><code>---</code> - 水平分割线</li>
                <li><code>```代码块```</code> - 代码块</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 