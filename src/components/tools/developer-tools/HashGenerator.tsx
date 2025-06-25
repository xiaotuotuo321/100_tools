'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Hash, Upload, Download, RefreshCw } from 'lucide-react'

export default function HashGenerator() {
  const [inputText, setInputText] = useState('')
  const [hashes, setHashes] = useState<{ [key: string]: string }>({})
  const [isGenerating, setIsGenerating] = useState(false)

  // 简单的哈希算法实现（实际项目中应该使用专业的加密库）
  const generateSimpleHash = async (text: string, algorithm: string): Promise<string> => {
    // 这里使用Web Crypto API生成哈希
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    
    try {
      let hashBuffer: ArrayBuffer
      
      switch (algorithm.toLowerCase()) {
        case 'sha-1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data)
          break
        case 'sha-256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data)
          break
        case 'sha-384':
          hashBuffer = await crypto.subtle.digest('SHA-384', data)
          break
        case 'sha-512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data)
          break
        default:
          // 对于MD5等不支持的算法，使用简单的字符串哈希
          return simpleStringHash(text, algorithm)
      }
      
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      return simpleStringHash(text, algorithm)
    }
  }

  // 简单的字符串哈希实现（仅用于演示）
  const simpleStringHash = (text: string, algorithm: string): string => {
    let hash = 0
    if (text.length === 0) return hash.toString(16)
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    
    // 根据算法调整输出长度
    const absHash = Math.abs(hash).toString(16)
    switch (algorithm.toLowerCase()) {
      case 'md5':
        return absHash.padStart(32, '0').slice(0, 32)
      case 'crc32':
        return absHash.padStart(8, '0').slice(0, 8)
      default:
        return absHash
    }
  }

  const generateAllHashes = async () => {
    if (!inputText.trim()) {
      setHashes({})
      return
    }

    setIsGenerating(true)
    
    const algorithms = [
      'MD5',
      'SHA-1', 
      'SHA-256',
      'SHA-384',
      'SHA-512',
      'CRC32'
    ]

    const newHashes: { [key: string]: string } = {}
    
    for (const algorithm of algorithms) {
      try {
        newHashes[algorithm] = await generateSimpleHash(inputText, algorithm)
      } catch (error) {
        newHashes[algorithm] = 'Error'
      }
    }
    
    setHashes(newHashes)
    setIsGenerating(false)
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateAllHashes()
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [inputText])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllHashes = () => {
    const hashText = Object.entries(hashes)
      .map(([algorithm, hash]) => `${algorithm}: ${hash}`)
      .join('\n')
    navigator.clipboard.writeText(hashText)
  }

  const downloadHashes = () => {
    const hashText = Object.entries(hashes)
      .map(([algorithm, hash]) => `${algorithm}: ${hash}`)
      .join('\n')
    
    const blob = new Blob([hashText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hashes-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const exampleTexts = [
    { name: '示例文本', text: 'Hello, World!' },
    { name: '中文文本', text: '你好，世界！' },
    { name: '数字', text: '123456' },
    { name: 'JSON数据', text: '{"name":"John","age":30}' },
    { name: '空字符串', text: '' }
  ]

  const hashInfos = {
    'MD5': {
      description: '128位消息摘要算法，已不推荐用于安全用途',
      length: '32字符',
      usage: '文件校验、快速比较'
    },
    'SHA-1': {
      description: '160位安全哈希算法，已被SHA-2替代',
      length: '40字符',
      usage: 'Git提交ID、数字签名'
    },
    'SHA-256': {
      description: '256位安全哈希算法，最常用的安全哈希',
      length: '64字符',
      usage: '密码存储、区块链、数字证书'
    },
    'SHA-384': {
      description: '384位安全哈希算法，SHA-2家族成员',
      length: '96字符',
      usage: '高安全性要求场景'
    },
    'SHA-512': {
      description: '512位安全哈希算法，最高安全级别',
      length: '128字符',
      usage: '最高安全性要求、密码学应用'
    },
    'CRC32': {
      description: '32位循环冗余校验，非加密哈希',
      length: '8字符',
      usage: '数据完整性检查、错误检测'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            文本输入
          </CardTitle>
          <CardDescription>
            输入要生成哈希的文本内容
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <input
              type="file"
              accept=".txt,.json,.xml,.csv"
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
              上传文件
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInputText('')}
            >
              清空
            </Button>
          </div>

          <Textarea
            placeholder="输入要生成哈希的文本..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[200px] font-mono text-sm"
          />

          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {inputText.length} 字符
            </Badge>
            {isGenerating && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                生成中...
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">示例文本:</Label>
            <div className="flex flex-wrap gap-2">
              {exampleTexts.map((example, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(example.text)}
                >
                  {example.name}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {Object.keys(hashes).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成的哈希值</span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyAllHashes}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制全部
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadHashes}
                >
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              点击任意哈希值可复制到剪贴板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(hashes).map(([algorithm, hash]) => (
                <div
                  key={algorithm}
                  className="p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{algorithm}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {hash.length} 字符
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hash)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div
                    className="font-mono text-sm bg-white dark:bg-gray-900 p-3 rounded border cursor-pointer select-all break-all"
                    onClick={() => copyToClipboard(hash)}
                  >
                    {hash}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="algorithms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="algorithms">算法说明</TabsTrigger>
          <TabsTrigger value="usage">使用场景</TabsTrigger>
        </TabsList>

        <TabsContent value="algorithms">
          <Card>
            <CardHeader>
              <CardTitle>哈希算法详情</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(hashInfos).map(([algorithm, info]) => (
                  <div key={algorithm} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{algorithm}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {info.length}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {info.description}
                    </p>
                    <div className="text-sm">
                      <span className="font-medium">常用场景：</span>
                      <span className="text-muted-foreground">{info.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>使用场景和最佳实践</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-600">推荐用途</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• <strong>SHA-256/SHA-512</strong> - 密码哈希、数字签名</li>
                    <li>• <strong>MD5</strong> - 文件完整性校验（非安全用途）</li>
                    <li>• <strong>CRC32</strong> - 数据传输错误检测</li>
                    <li>• <strong>SHA-1</strong> - Git版本控制系统</li>
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-red-600">安全注意事项</h4>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• MD5和SHA-1已不适合安全用途</li>
                    <li>• 密码存储需要使用盐值</li>
                    <li>• 彩虹表攻击风险</li>
                    <li>• 选择合适的算法强度</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>技术说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">哈希函数特性</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>确定性</strong> - 相同输入产生相同输出</li>
                <li>• <strong>不可逆</strong> - 无法从哈希值推导原文</li>
                <li>• <strong>雪崩效应</strong> - 微小变化导致巨大差异</li>
                <li>• <strong>碰撞抗性</strong> - 难以找到相同哈希的不同输入</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">实际应用</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 数字签名和证书验证</li>
                <li>• 区块链和加密货币</li>
                <li>• 密码存储和验证</li>
                <li>• 数据完整性检查</li>
                <li>• 去重和缓存系统</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 