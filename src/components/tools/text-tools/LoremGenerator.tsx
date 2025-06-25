'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Download, Shuffle, FileText } from 'lucide-react'

export default function LoremGenerator() {
  const [generatedText, setGeneratedText] = useState('')
  const [wordCount, setWordCount] = useState(50)
  const [paragraphCount, setParagraphCount] = useState(3)
  const [sentenceCount, setSentenceCount] = useState(5)
  const [listCount, setListCount] = useState(5)

  const loremWords = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos',
    'accusamus', 'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis',
    'praesentium', 'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'dolores',
    'quas', 'molestias', 'excepturi', 'occaecati', 'cupiditate', 'similique',
    'eleifend', 'tellus', 'integer', 'sagittis', 'vitae', 'tortor', 'condimentum',
    'lacinia', 'quis', 'vel', 'turpis', 'cursus', 'eget', 'nunc', 'scelerisque'
  ]

  const chineseWords = [
    '天', '地', '人', '和', '中', '国', '山', '水', '风', '雨', '春', '夏', '秋', '冬',
    '东', '南', '西', '北', '上', '下', '左', '右', '前', '后', '内', '外', '大', '小',
    '高', '低', '长', '短', '新', '旧', '好', '坏', '多', '少', '快', '慢', '红', '黄',
    '蓝', '绿', '白', '黑', '明', '暗', '光', '影', '花', '草', '树', '叶', '鸟', '虫',
    '鱼', '石', '土', '火', '木', '金', '水', '日', '月', '星', '云', '雪', '霜', '露',
    '学', '习', '工', '作', '生', '活', '家', '庭', '朋', '友', '爱', '情', '希', '望',
    '梦', '想', '未', '来', '过', '去', '现', '在', '时', '间', '空', '间', '世', '界'
  ]

  const generateWords = (count: number, useEnglish: boolean = true) => {
    const words = useEnglish ? loremWords : chineseWords
    const result: string[] = []
    
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * words.length)
      result.push(words[randomIndex])
    }
    
    return result
  }

  const generateSentence = (minWords: number = 5, maxWords: number = 15, useEnglish: boolean = true) => {
    const wordCount = Math.floor(Math.random() * (maxWords - minWords + 1)) + minWords
    const words = generateWords(wordCount, useEnglish)
    
    if (useEnglish) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
      return words.join(' ') + '.'
    } else {
      return words.join('') + '。'
    }
  }

  const generateParagraph = (sentenceCount: number, useEnglish: boolean = true) => {
    const sentences: string[] = []
    for (let i = 0; i < sentenceCount; i++) {
      sentences.push(generateSentence(5, 15, useEnglish))
    }
    return sentences.join(useEnglish ? ' ' : '')
  }

  const generateByWords = (count: number, useEnglish: boolean = true) => {
    const words = generateWords(count, useEnglish)
    if (useEnglish) {
      words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1)
      return words.join(' ') + '.'
    } else {
      return words.join('') + '。'
    }
  }

  const generateByParagraphs = (count: number, sentencesPerParagraph: number = 5, useEnglish: boolean = true) => {
    const paragraphs: string[] = []
    for (let i = 0; i < count; i++) {
      paragraphs.push(generateParagraph(sentencesPerParagraph, useEnglish))
    }
    return paragraphs.join('\n\n')
  }

  const generateBySentences = (count: number, useEnglish: boolean = true) => {
    const sentences: string[] = []
    for (let i = 0; i < count; i++) {
      sentences.push(generateSentence(5, 15, useEnglish))
    }
    return sentences.join(useEnglish ? ' ' : '')
  }

  const generateList = (count: number, useEnglish: boolean = true) => {
    const items: string[] = []
    for (let i = 0; i < count; i++) {
      const sentence = generateSentence(3, 8, useEnglish).replace(/\.$|。$/, '')
      items.push(`${i + 1}. ${sentence}`)
    }
    return items.join('\n')
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

  const handleGenerate = (type: 'words' | 'paragraphs' | 'sentences' | 'list', useEnglish: boolean = true) => {
    let result = ''
    
    switch (type) {
      case 'words':
        result = generateByWords(wordCount, useEnglish)
        break
      case 'paragraphs':
        result = generateByParagraphs(paragraphCount, 5, useEnglish)
        break
      case 'sentences':
        result = generateBySentences(sentenceCount, useEnglish)
        break
      case 'list':
        result = generateList(listCount, useEnglish)
        break
    }
    
    setGeneratedText(result)
  }

  const getTextStats = (text: string) => {
    if (!text) return { words: 0, sentences: 0, paragraphs: 0, characters: 0 }
    
    const words = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const sentences = text.split(/[.!?。！？]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const characters = text.length
    
    return { words, sentences, paragraphs, characters }
  }

  const stats = getTextStats(generatedText)

  const presetTemplates = [
    {
      name: '短文段',
      action: () => handleGenerate('words', true),
      description: '50个单词的短文段'
    },
    {
      name: '标准段落',
      action: () => handleGenerate('paragraphs', true),
      description: '3个标准段落'
    },
    {
      name: '长文章',
      action: () => {
        setParagraphCount(8)
        setTimeout(() => handleGenerate('paragraphs', true), 0)
      },
      description: '8个段落的长文章'
    },
    {
      name: '项目列表',
      action: () => handleGenerate('list', true),
      description: '5个项目的列表'
    },
    {
      name: '中文示例',
      action: () => handleGenerate('paragraphs', false),
      description: '中文占位文本'
    }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            快速生成
          </CardTitle>
          <CardDescription>
            选择预设模板快速生成占位文本
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {presetTemplates.map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex-col items-start p-4 text-left"
                onClick={template.action}
              >
                <div className="font-medium">{template.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="words" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="words">按单词数</TabsTrigger>
          <TabsTrigger value="paragraphs">按段落数</TabsTrigger>
          <TabsTrigger value="sentences">按句子数</TabsTrigger>
          <TabsTrigger value="list">生成列表</TabsTrigger>
        </TabsList>

        <TabsContent value="words" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>按单词数生成</CardTitle>
              <CardDescription>指定单词数量生成连续文本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="word-count">单词数量:</Label>
                  <Input
                    id="word-count"
                    type="number"
                    min="1"
                    max="1000"
                    value={wordCount}
                    onChange={(e) => setWordCount(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={() => handleGenerate('words', true)}>
                  生成英文
                </Button>
                <Button variant="outline" onClick={() => handleGenerate('words', false)}>
                  生成中文
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="paragraphs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>按段落数生成</CardTitle>
              <CardDescription>指定段落数量生成多段文本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="paragraph-count">段落数量:</Label>
                  <Input
                    id="paragraph-count"
                    type="number"
                    min="1"
                    max="20"
                    value={paragraphCount}
                    onChange={(e) => setParagraphCount(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={() => handleGenerate('paragraphs', true)}>
                  生成英文
                </Button>
                <Button variant="outline" onClick={() => handleGenerate('paragraphs', false)}>
                  生成中文
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>按句子数生成</CardTitle>
              <CardDescription>指定句子数量生成连续文本</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="sentence-count">句子数量:</Label>
                  <Input
                    id="sentence-count"
                    type="number"
                    min="1"
                    max="50"
                    value={sentenceCount}
                    onChange={(e) => setSentenceCount(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={() => handleGenerate('sentences', true)}>
                  生成英文
                </Button>
                <Button variant="outline" onClick={() => handleGenerate('sentences', false)}>
                  生成中文
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>生成列表</CardTitle>
              <CardDescription>生成带编号的项目列表</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Label htmlFor="list-count">列表项目:</Label>
                  <Input
                    id="list-count"
                    type="number"
                    min="1"
                    max="20"
                    value={listCount}
                    onChange={(e) => setListCount(Number(e.target.value))}
                    className="w-20"
                  />
                </div>
                <Button onClick={() => handleGenerate('list', true)}>
                  生成英文列表
                </Button>
                <Button variant="outline" onClick={() => handleGenerate('list', false)}>
                  生成中文列表
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>生成结果</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generatedText)}
                disabled={!generatedText}
              >
                <Copy className="h-4 w-4 mr-1" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => downloadText(generatedText, 'lorem-ipsum.txt')}
                disabled={!generatedText}
              >
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGeneratedText('')}
                disabled={!generatedText}
              >
                清空
              </Button>
            </div>
          </CardTitle>
          <CardDescription>
            生成的占位文本内容
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={generatedText}
            readOnly
            placeholder="生成的文本将显示在这里..."
            className="min-h-[400px] text-sm"
          />
          
          {generatedText && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Badge variant="outline">{stats.characters} 字符</Badge>
              <Badge variant="outline">{stats.words} 单词</Badge>
              <Badge variant="outline">{stats.sentences} 句子</Badge>
              <Badge variant="outline">{stats.paragraphs} 段落</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lorem Ipsum 说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">什么是 Lorem Ipsum？</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Lorem Ipsum 是印刷和排版行业的标准虚拟文本</li>
                <li>• 自16世纪以来一直被使用作为占位文本</li>
                <li>• 内容无意义，但保持了正常的字母分布</li>
                <li>• 不会因为文字内容分散读者注意力</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">使用场景</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 网页设计和UI原型制作</li>
                <li>• 印刷品版面设计</li>
                <li>• 软件界面测试</li>
                <li>• 演示文稿和模板制作</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 