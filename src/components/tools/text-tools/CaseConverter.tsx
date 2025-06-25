 "use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, RotateCcw } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export function CaseConverter() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState({
    lowercase: '',
    uppercase: '',
    capitalize: '',
    camelCase: '',
    pascalCase: '',
    snakeCase: '',
    kebabCase: '',
    constantCase: '',
  })

  const convertText = (text: string) => {
    if (!text) {
      setResults({
        lowercase: '',
        uppercase: '',
        capitalize: '',
        camelCase: '',
        pascalCase: '',
        snakeCase: '',
        kebabCase: '',
        constantCase: '',
      })
      return
    }

    const words = text.split(/[\s\-_]+/).filter(Boolean)
    
    setResults({
      lowercase: text.toLowerCase(),
      uppercase: text.toUpperCase(),
      capitalize: text.replace(/\b\w/g, l => l.toUpperCase()),
      camelCase: words.map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(''),
      pascalCase: words.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(''),
      snakeCase: words.map(word => word.toLowerCase()).join('_'),
      kebabCase: words.map(word => word.toLowerCase()).join('-'),
      constantCase: words.map(word => word.toUpperCase()).join('_'),
    })
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    convertText(value)
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      // 这里可以添加成功提示
    }
  }

  const handleClear = () => {
    setInput('')
    convertText('')
  }

  const resultItems = [
    { label: '小写', key: 'lowercase', value: results.lowercase },
    { label: '大写', key: 'uppercase', value: results.uppercase },
    { label: '首字母大写', key: 'capitalize', value: results.capitalize },
    { label: '驼峰命名', key: 'camelCase', value: results.camelCase },
    { label: '帕斯卡命名', key: 'pascalCase', value: results.pascalCase },
    { label: '下划线命名', key: 'snakeCase', value: results.snakeCase },
    { label: '短横线命名', key: 'kebabCase', value: results.kebabCase },
    { label: '常量命名', key: 'constantCase', value: results.constantCase },
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>文本格式转换器</CardTitle>
          <CardDescription>
            转换文本为不同的命名格式和大小写样式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="input-text">输入文本</Label>
            <div className="flex space-x-2">
              <Textarea
                id="input-text"
                placeholder="输入要转换的文本..."
                value={input}
                onChange={(e) => handleInputChange(e.target.value)}
                className="min-h-[100px]"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleClear}
                disabled={!input}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {resultItems.map((item) => (
          <Card key={item.key}>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  value={item.value}
                  readOnly
                  className="font-mono text-sm"
                  placeholder="转换结果将显示在这里"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(item.value)}
                  disabled={!item.value}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 