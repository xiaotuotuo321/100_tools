'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Copy, FileText, Hash, Type, AlignLeft } from 'lucide-react'

export default function TextCounter() {
  const [text, setText] = useState('')

  const stats = useMemo(() => {
    if (!text) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        averageWordsPerSentence: 0,
        averageCharsPerWord: 0,
        readingTime: 0
      }
    }

    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const lines = text.split('\n').length
    const averageWordsPerSentence = sentences > 0 ? Math.round((words / sentences) * 10) / 10 : 0
    const averageCharsPerWord = words > 0 ? Math.round((charactersNoSpaces / words) * 10) / 10 : 0
    const readingTime = Math.ceil(words / 200) // 假设每分钟200字

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      averageWordsPerSentence,
      averageCharsPerWord,
      readingTime
    }
  }, [text])

  const copyToClipboard = (value: string) => {
    navigator.clipboard.writeText(value)
  }

  const statCards = [
    { icon: Type, label: '字符数', value: stats.characters.toLocaleString(), color: 'text-blue-600' },
    { icon: Type, label: '字符数(无空格)', value: stats.charactersNoSpaces.toLocaleString(), color: 'text-green-600' },
    { icon: Hash, label: '单词数', value: stats.words.toLocaleString(), color: 'text-purple-600' },
    { icon: FileText, label: '句子数', value: stats.sentences.toLocaleString(), color: 'text-orange-600' },
    { icon: AlignLeft, label: '段落数', value: stats.paragraphs.toLocaleString(), color: 'text-pink-600' },
    { icon: AlignLeft, label: '行数', value: stats.lines.toLocaleString(), color: 'text-indigo-600' },
  ]

  const advancedStats = [
    { label: '平均每句单词数', value: stats.averageWordsPerSentence.toString() },
    { label: '平均每词字符数', value: stats.averageCharsPerWord.toString() },
    { label: '预计阅读时间', value: `${stats.readingTime} 分钟` },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            文本输入
          </CardTitle>
          <CardDescription>
            在下方输入或粘贴文本，系统将自动计算各项统计信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="text-input">文本内容</Label>
            <Textarea
              id="text-input"
              placeholder="请输入或粘贴要统计的文本..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[200px] resize-none"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setText('')}
            >
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(stat.value)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>高级统计</CardTitle>
          <CardDescription>
            更详细的文本分析数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advancedStats.map((stat, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{stat.value}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(stat.value)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {text && (
        <Card>
          <CardHeader>
            <CardTitle>文本预览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-muted/50 rounded-lg max-h-[200px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm">{text}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 