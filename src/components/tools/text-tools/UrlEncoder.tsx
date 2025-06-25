'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Upload, Download, Link, ArrowRightLeft } from 'lucide-react'

export default function UrlEncoder() {
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
      
      const encoded = encodeURIComponent(originalText)
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

      const decoded = decodeURIComponent(encodedText)
      setDecodedText(decoded)
    } catch (error) {
      setDecodeError('解码失败：输入不是有效的URL编码')
      setDecodedText('')
    }
  }

  const handleEncodeComponent = () => {
    try {
      setEncodeError('')
      if (!originalText.trim()) {
        setEncodedText('')
        return
      }
      
      // 只编码特殊字符，保留URL结构
      const encoded = originalText.replace(/[^A-Za-z0-9\-_.~:/?#[\]@!$&'()*+,;=]/g, (char) => {
        return encodeURIComponent(char)
      })
      setEncodedText(encoded)
    } catch (error) {
      setEncodeError('编码失败：输入包含无效字符')
      setEncodedText('')
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'text' | 'encoded') => {
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

  const exampleUrls = [
    { 
      name: '中文URL', 
      original: 'https://example.com/搜索?q=测试&type=全部',
      encoded: 'https://example.com/%E6%90%9C%E7%B4%A2?q=%E6%B5%8B%E8%AF%95&type=%E5%85%A8%E9%83%A8'
    },
    {
      name: '特殊字符',
      original: 'Hello World! #$%^&*()',
      encoded: 'Hello%20World!%20%23%24%25%5E%26*()' 
    },
    {
      name: '空格和符号',
      original: 'user name@domain.com',
      encoded: 'user%20name%40domain.com'
    }
  ]

  const loadExample = (example: typeof exampleUrls[0]) => {
    setOriginalText(example.original)
    setEncodedText('')
    setDecodedText('')
    setEncodeError('')
    setDecodeError('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <Button onClick={handleEncode} disabled={!originalText.trim()}>
            <Link className="h-4 w-4 mr-1" />
            完整编码
          </Button>
          <Button variant="outline" onClick={handleEncodeComponent} disabled={!originalText.trim()}>
            <Link className="h-4 w-4 mr-1" />
            组件编码
          </Button>
          <Button onClick={handleDecode} disabled={!encodedText.trim()}>
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
          <TabsTrigger value="encode">URL 编码</TabsTrigger>
          <TabsTrigger value="decode">URL 解码</TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>原始文本/URL</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt,.url"
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
                  输入需要编码的文本或URL
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入需要编码的文本或URL..."
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
                <CardTitle>URL 编码结果</CardTitle>
                <CardDescription>
                  编码后的URL安全字符串
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
                      onClick={() => downloadText(encodedText, 'encoded-url.txt')}
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
                  <span>URL 编码文本</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      accept=".txt,.url"
                      onChange={(e) => handleFileUpload(e, 'encoded')}
                      className="hidden"
                      id="encoded-upload"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('encoded-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-1" />
                      上传
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  输入需要解码的URL编码字符串
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请输入URL编码的文本..."
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
                  解码后的原始文本/URL
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
                      onClick={() => downloadText(decodedText, 'decoded-url.txt')}
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
          <CardTitle>示例和说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">编码模式说明</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium">完整编码</div>
                  <p className="text-muted-foreground">
                    编码所有非ASCII字符和特殊字符，适用于查询参数和表单数据
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium">组件编码</div>
                  <p className="text-muted-foreground">
                    保留URL结构字符（:/?#[]@），只编码其他特殊字符
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">常用示例</h4>
              <div className="space-y-3">
                {exampleUrls.map((example, index) => (
                  <div key={index} className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{example.name}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadExample(example)}
                      >
                        使用示例
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm font-mono">
                      <div>
                        <span className="text-muted-foreground">原始:</span>{' '}
                        <span className="break-all">{example.original}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">编码:</span>{' '}
                        <span className="break-all">{example.encoded}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                  {encodedText.length - originalText.length}
                </div>
                <div className="text-sm text-muted-foreground">增加字符数</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {originalText.length > 0 ? Math.round((encodedText.length / originalText.length) * 100) : 0}%
                </div>
                <div className="text-sm text-muted-foreground">大小比例</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 