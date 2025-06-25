'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, Upload, Filter, Trash2 } from 'lucide-react'

export default function TextDeduplicator() {
  const [inputText, setInputText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [duplicateCount, setDuplicateCount] = useState(0)
  const [mode, setMode] = useState<'lines' | 'words' | 'characters'>('lines')

  const deduplicateLines = (text: string, caseSensitive: boolean = true) => {
    const lines = text.split('\n')
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    const result: string[] = []

    lines.forEach(line => {
      const processedLine = caseSensitive ? line : line.toLowerCase()
      if (seen.has(processedLine)) {
        duplicates.add(line)
      } else {
        seen.add(processedLine)
        result.push(line)
      }
    })

    return { result: result.join('\n'), duplicates: duplicates.size }
  }

  const deduplicateWords = (text: string, caseSensitive: boolean = true) => {
    const words = text.split(/\s+/).filter(word => word.length > 0)
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    const result: string[] = []

    words.forEach(word => {
      const processedWord = caseSensitive ? word : word.toLowerCase()
      if (seen.has(processedWord)) {
        duplicates.add(word)
      } else {
        seen.add(processedWord)
        result.push(word)
      }
    })

    return { result: result.join(' '), duplicates: duplicates.size }
  }

  const deduplicateCharacters = (text: string, caseSensitive: boolean = true) => {
    const chars = text.split('')
    const seen = new Set<string>()
    const duplicates = new Set<string>()
    const result: string[] = []

    chars.forEach(char => {
      const processedChar = caseSensitive ? char : char.toLowerCase()
      if (seen.has(processedChar)) {
        duplicates.add(char)
      } else {
        seen.add(processedChar)
        result.push(char)
      }
    })

    return { result: result.join(''), duplicates: duplicates.size }
  }

  const handleDeduplicate = (caseSensitive: boolean = true) => {
    if (!inputText.trim()) {
      return
    }

    let result: { result: string; duplicates: number }

    switch (mode) {
      case 'lines':
        result = deduplicateLines(inputText, caseSensitive)
        break
      case 'words':
        result = deduplicateWords(inputText, caseSensitive)
        break
      case 'characters':
        result = deduplicateCharacters(inputText, caseSensitive)
        break
      default:
        result = deduplicateLines(inputText, caseSensitive)
    }

    setOutputText(result.result)
    setDuplicateCount(result.duplicates)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadText = (text: string, filename: string) => {
    const blob = new Blob([text], { type: 'text/plain' })
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
    if (file && file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setInputText(text)
      }
      reader.readAsText(file)
    }
  }

  const getStats = (text: string) => {
    if (!text) return { lines: 0, words: 0, characters: 0 }
    
    return {
      lines: text.split('\n').length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      characters: text.length
    }
  }

  const inputStats = getStats(inputText)
  const outputStats = getStats(outputText)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            去重设置
          </CardTitle>
          <CardDescription>
            选择去重模式和参数设置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as typeof mode)} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lines">按行去重</TabsTrigger>
              <TabsTrigger value="words">按单词去重</TabsTrigger>
              <TabsTrigger value="characters">按字符去重</TabsTrigger>
            </TabsList>

            <TabsContent value="lines" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handleDeduplicate(true)}>
                  区分大小写去重
                </Button>
                <Button variant="outline" onClick={() => handleDeduplicate(false)}>
                  忽略大小写去重
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                按行去重：删除重复的行，保留第一次出现的行
              </p>
            </TabsContent>

            <TabsContent value="words" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handleDeduplicate(true)}>
                  区分大小写去重
                </Button>
                <Button variant="outline" onClick={() => handleDeduplicate(false)}>
                  忽略大小写去重
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                按单词去重：删除重复的单词，保留第一次出现的单词
              </p>
            </TabsContent>

            <TabsContent value="characters" className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={() => handleDeduplicate(true)}>
                  区分大小写去重
                </Button>
                <Button variant="outline" onClick={() => handleDeduplicate(false)}>
                  忽略大小写去重
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                按字符去重：删除重复的字符，保留第一次出现的字符
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>原始文本</span>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  上传
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              输入需要去重的文本内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="请输入或粘贴需要去重的文本..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{inputStats.lines} 行</Badge>
                <Badge variant="outline">{inputStats.words} 词</Badge>
                <Badge variant="outline">{inputStats.characters} 字符</Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText('')}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                清空
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>去重结果</span>
              {duplicateCount > 0 && (
                <Badge variant="destructive">
                  删除了 {duplicateCount} 个重复项
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              去重后的文本内容
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={outputText}
              readOnly
              placeholder="去重结果将显示在这里..."
              className="min-h-[300px] font-mono text-sm"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">{outputStats.lines} 行</Badge>
                <Badge variant="outline">{outputStats.words} 词</Badge>
                <Badge variant="outline">{outputStats.characters} 字符</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(outputText)}
                  disabled={!outputText}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadText(outputText, 'deduplicated-text.txt')}
                  disabled={!outputText}
                >
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {outputText && (
        <Card>
          <CardHeader>
            <CardTitle>处理总结</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{inputStats.lines}</div>
                <div className="text-sm text-muted-foreground">原始行数</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{outputStats.lines}</div>
                <div className="text-sm text-muted-foreground">去重后行数</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{duplicateCount}</div>
                <div className="text-sm text-muted-foreground">删除重复项</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {inputStats.lines > 0 ? Math.round((duplicateCount / inputStats.lines) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">重复率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 