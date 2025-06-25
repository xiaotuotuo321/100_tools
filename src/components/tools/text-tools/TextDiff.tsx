'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Upload, Download, GitCompareArrows, Eye } from 'lucide-react'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber1?: number
  lineNumber2?: number
}

export default function TextDiff() {
  const [text1, setText1] = useState('')
  const [text2, setText2] = useState('')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)

  const diffResult = useMemo(() => {
    if (!text1 && !text2) return []

    let lines1 = text1.split('\n')
    let lines2 = text2.split('\n')

    // 预处理选项
    if (ignoreWhitespace) {
      lines1 = lines1.map(line => line.trim())
      lines2 = lines2.map(line => line.trim())
    }

    if (ignoreCase) {
      lines1 = lines1.map(line => line.toLowerCase())
      lines2 = lines2.map(line => line.toLowerCase())
    }

    // 简单的LCS算法实现
    const lcs = (a: string[], b: string[]) => {
      const m = a.length
      const n = b.length
      const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (a[i - 1] === b[j - 1]) {
            dp[i][j] = dp[i - 1][j - 1] + 1
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
          }
        }
      }

      // 回溯构建差异
      const result: DiffLine[] = []
      let i = m, j = n

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
          result.unshift({
            type: 'unchanged',
            content: text1.split('\n')[i - 1] || '',
            lineNumber1: i,
            lineNumber2: j
          })
          i--
          j--
        } else if (i > 0 && (j === 0 || dp[i - 1][j] >= dp[i][j - 1])) {
          result.unshift({
            type: 'removed',
            content: text1.split('\n')[i - 1] || '',
            lineNumber1: i
          })
          i--
        } else {
          result.unshift({
            type: 'added',
            content: text2.split('\n')[j - 1] || '',
            lineNumber2: j
          })
          j--
        }
      }

      return result
    }

    return lcs(lines1, lines2)
  }, [text1, text2, ignoreWhitespace, ignoreCase])

  const stats = useMemo(() => {
    const added = diffResult.filter(line => line.type === 'added').length
    const removed = diffResult.filter(line => line.type === 'removed').length
    const unchanged = diffResult.filter(line => line.type === 'unchanged').length
    
    return { added, removed, unchanged, total: added + removed + unchanged }
  }, [diffResult])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, textSetter: (text: string) => void) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        textSetter(content)
      }
      reader.readAsText(file)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const exportDiff = (format: 'unified' | 'side-by-side') => {
    let output = ''
    
    if (format === 'unified') {
      output = '--- 文本1\n+++ 文本2\n'
      diffResult.forEach(line => {
        if (line.type === 'removed') {
          output += `- ${line.content}\n`
        } else if (line.type === 'added') {
          output += `+ ${line.content}\n`
        } else {
          output += `  ${line.content}\n`
        }
      })
    } else {
      output = 'Side-by-side diff:\n\n'
      diffResult.forEach(line => {
        const leftLine = line.type === 'added' ? '' : line.content
        const rightLine = line.type === 'removed' ? '' : line.content
        output += `${leftLine.padEnd(50)} | ${rightLine}\n`
      })
    }

    const blob = new Blob([output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diff-${format}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const swapTexts = () => {
    const temp = text1
    setText1(text2)
    setText2(temp)
  }

  const clearAll = () => {
    setText1('')
    setText2('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={swapTexts}>
            <GitCompareArrows className="h-4 w-4 mr-1" />
            交换文本
          </Button>
          <Button variant="outline" onClick={clearAll}>
            清空全部
          </Button>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={ignoreWhitespace ? "default" : "outline"}
            size="sm"
            onClick={() => setIgnoreWhitespace(!ignoreWhitespace)}
          >
            忽略空白
          </Button>
          <Button
            variant={ignoreCase ? "default" : "outline"}
            size="sm"
            onClick={() => setIgnoreCase(!ignoreCase)}
          >
            忽略大小写
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>文本 1 (原始)</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileUpload(e, setText1)}
                  className="hidden"
                  id="file1-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file1-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  上传
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              输入第一个要比较的文本
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请输入第一个文本..."
              value={text1}
              onChange={(e) => setText1(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{text1.split('\n').length} 行</Badge>
                <Badge variant="outline">{text1.length} 字符</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setText1('')}
              >
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>文本 2 (对比)</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt"
                  onChange={(e) => handleFileUpload(e, setText2)}
                  className="hidden"
                  id="file2-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file2-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  上传
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              输入第二个要比较的文本
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请输入第二个文本..."
              value={text2}
              onChange={(e) => setText2(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{text2.split('\n').length} 行</Badge>
                <Badge variant="outline">{text2.length} 字符</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setText2('')}
              >
                清空
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {(text1 || text2) && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>差异统计</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportDiff('unified')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    导出统一格式
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => exportDiff('side-by-side')}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    导出对比格式
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.added}</div>
                  <div className="text-sm text-muted-foreground">新增行</div>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.removed}</div>
                  <div className="text-sm text-muted-foreground">删除行</div>
                </div>
                <div className="text-center p-4 bg-gray-50 dark:bg-gray-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{stats.unchanged}</div>
                  <div className="text-sm text-muted-foreground">未变更行</div>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                  <div className="text-sm text-muted-foreground">总行数</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                差异对比结果
              </CardTitle>
              <CardDescription>
                绿色表示新增，红色表示删除，灰色表示未改变
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg max-h-[600px] overflow-y-auto">
                {diffResult.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    请输入要比较的文本内容
                  </div>
                ) : (
                  <div className="font-mono text-sm">
                    {diffResult.map((line, index) => (
                      <div
                        key={index}
                        className={`px-4 py-1 border-b last:border-b-0 ${
                          line.type === 'added'
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200'
                            : line.type === 'removed'
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200'
                            : 'bg-gray-50/50 dark:bg-gray-950/10'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex gap-2 text-xs text-muted-foreground min-w-[80px]">
                            <span className="w-8 text-right">
                              {line.lineNumber1 || '-'}
                            </span>
                            <span className="w-8 text-right">
                              {line.lineNumber2 || '-'}
                            </span>
                          </div>
                          <div className="flex-1 flex items-start gap-2">
                            <span className={`text-xs font-bold min-w-[16px] ${
                              line.type === 'added' ? 'text-green-600' :
                              line.type === 'removed' ? 'text-red-600' : 'text-gray-400'
                            }`}>
                              {line.type === 'added' ? '+' : 
                               line.type === 'removed' ? '-' : ' '}
                            </span>
                            <span className="break-all">
                              {line.content || <span className="text-muted-foreground">(空行)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
} 