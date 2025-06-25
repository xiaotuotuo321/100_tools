'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, QrCode, Smartphone, Wifi, CreditCard } from 'lucide-react'

export default function QrGenerator() {
  const [qrText, setQrText] = useState('')
  const [qrSize, setQrSize] = useState(256)
  const [qrColor, setQrColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorLevel, setErrorLevel] = useState('M')
  const [generatedQR, setGeneratedQR] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // 简单的二维码生成逻辑（实际项目中应该使用专业的QR码库）
  const generateQR = () => {
    if (!qrText.trim()) return

    // 这里使用一个简单的二维码API服务
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(qrText)}&color=${qrColor.slice(1)}&bgcolor=${bgColor.slice(1)}&ecc=${errorLevel}`
    setGeneratedQR(apiUrl)
  }

  const downloadQR = () => {
    if (!generatedQR) return

    const link = document.createElement('a')
    link.href = generatedQR
    link.download = `qrcode-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const presetTemplates = [
    {
      name: 'WiFi连接',
      icon: Wifi,
      template: 'WIFI:T:WPA;S:网络名称;P:密码;H:false;;',
      description: '生成WiFi连接二维码'
    },
    {
      name: '联系人信息',
      icon: Smartphone,
      template: 'BEGIN:VCARD\nVERSION:3.0\nFN:姓名\nORG:公司\nTEL:+86123456789\nEMAIL:email@example.com\nEND:VCARD',
      description: '生成联系人vCard'
    },
    {
      name: '短信',
      icon: Smartphone,
      template: 'SMSTO:+86123456789:短信内容',
      description: '生成短信二维码'
    },
    {
      name: '网址',
      icon: QrCode,
      template: 'https://www.example.com',
      description: '生成网址链接'
    },
    {
      name: '电子邮件',
      icon: Smartphone,
      template: 'mailto:example@email.com?subject=主题&body=邮件内容',
      description: '生成邮件二维码'
    },
    {
      name: '电话号码',
      icon: Smartphone,
      template: 'tel:+86123456789',
      description: '生成拨号二维码'
    }
  ]

  const applyTemplate = (template: string) => {
    setQrText(template)
  }

  const sizePresets = [
    { name: '小', size: 128 },
    { name: '中', size: 256 },
    { name: '大', size: 512 },
    { name: '超大', size: 1024 }
  ]

  const errorLevels = [
    { value: 'L', name: '低 (7%)', description: '适合清晰环境' },
    { value: 'M', name: '中 (15%)', description: '标准使用' },
    { value: 'Q', name: '高 (25%)', description: '轻微损坏环境' },
    { value: 'H', name: '最高 (30%)', description: '严重损坏环境' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            二维码生成设置
          </CardTitle>
          <CardDescription>
            输入内容并调整参数生成二维码
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="custom" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="custom">自定义内容</TabsTrigger>
              <TabsTrigger value="templates">预设模板</TabsTrigger>
            </TabsList>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="qr-text">二维码内容</Label>
                <Textarea
                  id="qr-text"
                  placeholder="输入要生成二维码的内容..."
                  value={qrText}
                  onChange={(e) => setQrText(e.target.value)}
                  className="min-h-[120px]"
                />
                <div className="text-xs text-muted-foreground">
                  当前字符数: {qrText.length} / 建议不超过2000字符
                </div>
              </div>
            </TabsContent>

            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presetTemplates.map((template, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => applyTemplate(template.template)}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <template.icon className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {qrText && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <Label className="text-sm font-medium">当前内容预览:</Label>
                  <pre className="text-xs mt-2 whitespace-pre-wrap break-all">
                    {qrText}
                  </pre>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>尺寸设置</Label>
                <div className="flex gap-2">
                  {sizePresets.map((preset) => (
                    <Button
                      key={preset.size}
                      variant={qrSize === preset.size ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setQrSize(preset.size)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="custom-size" className="text-sm">自定义:</Label>
                  <Input
                    id="custom-size"
                    type="number"
                    min="64"
                    max="2048"
                    value={qrSize}
                    onChange={(e) => setQrSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">px</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>容错级别</Label>
                <div className="grid grid-cols-2 gap-2">
                  {errorLevels.map((level) => (
                    <Button
                      key={level.value}
                      variant={errorLevel === level.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setErrorLevel(level.value)}
                      className="text-left justify-start h-auto p-2"
                    >
                      <div>
                        <div className="font-medium">{level.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {level.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="qr-color">前景色</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="qr-color"
                      type="color"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={qrColor}
                      onChange={(e) => setQrColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bg-color">背景色</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="bg-color"
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-12 h-10 p-1 border rounded"
                    />
                    <Input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="flex-1"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={generateQR} 
                disabled={!qrText.trim()}
                className="w-full"
              >
                <QrCode className="h-4 w-4 mr-2" />
                生成二维码
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedQR && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>生成的二维码</span>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {qrSize}x{qrSize}px
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(generatedQR)}
                >
                  <Copy className="h-4 w-4 mr-1" />
                  复制链接
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={downloadQR}
                >
                  <Download className="h-4 w-4 mr-1" />
                  下载
                </Button>
              </div>
            </CardTitle>
            <CardDescription>
              右键图片可保存到本地
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <img
                  src={generatedQR}
                  alt="Generated QR Code"
                  className="block"
                  style={{ width: `${Math.min(qrSize, 400)}px`, height: `${Math.min(qrSize, 400)}px` }}
                />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <Label className="font-medium">二维码内容:</Label>
              <div className="mt-2 text-sm font-mono break-all bg-white dark:bg-gray-900 p-3 rounded border">
                {qrText}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">支持的内容类型</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 纯文本内容</li>
                <li>• 网址链接 (http/https)</li>
                <li>• WiFi连接信息</li>
                <li>• 联系人名片 (vCard)</li>
                <li>• 短信/邮件链接</li>
                <li>• 电话号码</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">最佳实践建议</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 内容越少，二维码越简单</li>
                <li>• 选择合适的容错级别</li>
                <li>• 确保前景色和背景色对比度足够</li>
                <li>• 测试不同设备的扫描效果</li>
                <li>• 打印时保持足够的分辨率</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 