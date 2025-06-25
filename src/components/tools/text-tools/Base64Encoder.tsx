'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Upload, Download, Lock, Unlock, ArrowRightLeft } from 'lucide-react'

export default function Base64Encoder() {
  const [originalText, setOriginalText] = useState('')
  const [encodedText, setEncodedText] = useState('')
  const [decodedText, setDecodedText] = useState('')
  const [encodeError, setEncodeError] = useState('')
  const [decodeError, setDecodeError] = useState('')

  const handleEncode = () => {
    try {
      setEncodeError('')
      if (!originalText.trim()) {
        setEncodedText('')
        return
      }
      
      // 处理中文字符，先转UTF-8
      const encoded = btoa(encodeURIComponent(originalText).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16))
      }))
      setEncodedText(encoded)
    } catch (error) {
      setEncodeError('编码失败：输入包含无效字符')
      setEncodedText('')
    }
  }

  const handleDecode = () => {
    try {
      setDecodeError('')
      if (!encodedText.trim()) {
        setDecodedText('')
        return
      }

      // 验证Base64格式
      const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
      if (!base64Regex.test(encodedText.replace(/\s/g, ''))) {
        throw new Error('不是有效的Base64格式')
      }

      const cleanBase64 = encodedText.replace(/\s/g, '')
      const decoded = atob(cleanBase64)
      // 处理UTF-8解码
      const decodedText = decodeURIComponent(decoded.split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      
      setDecodedText(decodedText)
    } catch (error) {
      setDecodeError('解码失败：' + (error instanceof Error ? error.message : '输入不是有效的Base64'))
      setDecodedText('')
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'text' | 'base64') => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (type === 'text') {
          setOriginalText(content)
        } else {
          setEncodedText(content)
        }
      }
      reader.readAsText(file)
    }
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

  const swapTexts = () => {
    setOriginalText(decodedText)
    setEncodedText('')
    setDecodedText('')
    setEncodeError('')
    setDecodeError('')
  }

  const clearAll = () => {
    setOriginalText('')
    setEncodedText('')
    setDecodedText('')
    setEncodeError('')
    setDecodeError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <Button onClick={handleEncode} disabled={!originalText.trim()}>
            <Lock className="h-4 w-4 mr-1" />
            编码
          </Button>
          <Button onClick={handleDecode} disabled={!encodedText.trim()}>
            <Unlock className="h-4 w-4 mr-1" />
            解码
          </Button>
          <Button variant="outline" onClick={swapTexts} disabled={!decodedText}>
            <ArrowRightLeft className="h-4 w-4 mr-1" />
            交换
          </Button>
        </div>
        <Button variant="outline" onClick={clearAll}>
          清空全部
        </Button>
      </div>

      <Tabs defaultValue="encode" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="encode">Base64 编码</TabsTrigger>
          <TabsTrigger value="decode">Base64 解码</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>原始文本</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => handleFileUpload(e, 'text')}
                      className="hidden"
                      id="text-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('text-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      上传
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  输入需要编码的原始文本
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入需要编码的文本..."
                  value={originalText}
                  onChange={(e) => setOriginalText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {originalText.length} 字符
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOriginalText('')}
                  >
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Base64 编码结果</CardTitle>
                <CardDescription>
                  编码后的Base64字符串
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {encodeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {encodeError}
                  </div>
                )}
                <Textarea
                  value={encodedText}
                  readOnly
                  placeholder="编码结果将显示在这里..."
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {encodedText.length} 字符
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(encodedText)}
                      disabled={!encodedText}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(encodedText, 'encoded.txt')}
                      disabled={!encodedText}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Base64 编码文本</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt"
                      onChange={(e) => handleFileUpload(e, 'base64')}
                      className="hidden"
                      id="base64-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('base64-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      上传
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  输入需要解码的Base64字符串
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入Base64编码的文本..."
                  value={encodedText}
                  onChange={(e) => setEncodedText(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {encodedText.length} 字符
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEncodedText('')}
                  >
                    清空
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>解码结果</CardTitle>
                <CardDescription>
                  解码后的原始文本
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {decodeError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {decodeError}
                  </div>
                )}
                <Textarea
                  value={decodedText}
                  readOnly
                  placeholder="解码结果将显示在这里..."
                  className="min-h-[200px] font-mono text-sm"
                />
                <div className="flex items-center justify-between">
                  <Badge variant="outline">
                    {decodedText.length} 字符
                  </Badge>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(decodedText)}
                      disabled={!decodedText}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadText(decodedText, 'decoded.txt')}
                      disabled={!decodedText}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Base64 编码说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">什么是 Base64？</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Base64 是一种用64个字符来表示任意二进制数据的方法</li>
                <li>• 常用于在文本协议中传输二进制数据</li>
                <li>• 编码后的数据比原始数据大约增加33%的体积</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">使用场景</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 电子邮件附件传输</li>
                <li>• 在HTML/CSS中嵌入图片</li>
                <li>• API数据传输</li>
                <li>• 配置文件中存储二进制数据</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {originalText && encodedText && (
        <Card>
          <CardHeader>
            <CardTitle>编码统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{originalText.length}</div>
                <div className="text-sm text-muted-foreground">原始字符数</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{encodedText.length}</div>
                <div className="text-sm text-muted-foreground">编码字符数</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {originalText.length > 0 ? Math.round((encodedText.length / originalText.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">大小比例</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  +{encodedText.length - originalText.length}
                </div>
                <div className="text-sm text-muted-foreground">增加字符数</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 