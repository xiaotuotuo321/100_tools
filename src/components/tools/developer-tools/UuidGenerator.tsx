'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Hash, Download, Shuffle } from 'lucide-react'

export default function UuidGenerator() {
  const [generatedUuids, setGeneratedUuids] = useState<string[]>([])
  const [batchCount, setBatchCount] = useState(10)
  const [uuidVersion, setUuidVersion] = useState<'v4' | 'v1' | 'v6'>('v4')

  // 生成UUID v4 (随机)
  const generateUuidV4 = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  // 生成UUID v1 (基于时间戳)
  const generateUuidV1 = (): string => {
    const timestamp = Date.now()
    const timeHex = timestamp.toString(16).padStart(12, '0')
    const randomHex = Math.random().toString(16).slice(2, 14).padStart(12, '0')
    
    return [
      timeHex.slice(4, 12),
      timeHex.slice(0, 4),
      '1' + timeHex.slice(1, 4),
      '8' + randomHex.slice(0, 3),
      randomHex.slice(3, 15)
    ].join('-')
  }

  // 生成UUID v6 (基于时间戳，重新排序)
  const generateUuidV6 = (): string => {
    const timestamp = Date.now()
    const timeHex = timestamp.toString(16).padStart(12, '0')
    const randomHex = Math.random().toString(16).slice(2, 14).padStart(12, '0')
    
    return [
      timeHex.slice(0, 8),
      timeHex.slice(8, 12),
      '6' + randomHex.slice(0, 3),
      '8' + randomHex.slice(3, 6),
      randomHex.slice(6, 18)
    ].join('-')
  }

  const generateUuid = (version: 'v4' | 'v1' | 'v6' = 'v4'): string => {
    switch (version) {
      case 'v1':
        return generateUuidV1()
      case 'v6':
        return generateUuidV6()
      case 'v4':
      default:
        return generateUuidV4()
    }
  }

  const generateSingle = () => {
    const uuid = generateUuid(uuidVersion)
    setGeneratedUuids([uuid])
  }

  const generateBatch = () => {
    const uuids: string[] = []
    for (let i = 0; i < batchCount; i++) {
      uuids.push(generateUuid(uuidVersion))
    }
    setGeneratedUuids(uuids)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllUuids = () => {
    const allUuids = generatedUuids.join('\n')
    navigator.clipboard.writeText(allUuids)
  }

  const downloadUuids = () => {
    const content = generatedUuids.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids-${uuidVersion}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const formatOptions = [
    { name: '标准格式', formatter: (uuid: string) => uuid },
    { name: '无连字符', formatter: (uuid: string) => uuid.replace(/-/g, '') },
    { name: '大写', formatter: (uuid: string) => uuid.toUpperCase() },
    { name: '大括号', formatter: (uuid: string) => `{${uuid}}` },
    { name: 'C#格式', formatter: (uuid: string) => `new Guid("${uuid}")` },
    { name: 'JavaScript', formatter: (uuid: string) => `"${uuid}"` },
    { name: 'Python', formatter: (uuid: string) => `UUID("${uuid}")` },
    { name: 'Java', formatter: (uuid: string) => `UUID.fromString("${uuid}")` }
  ]

  const exportAsFormat = (formatter: (uuid: string) => string, formatName: string) => {
    const formattedUuids = generatedUuids.map(formatter).join('\n')
    const blob = new Blob([formattedUuids], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids-${formatName.toLowerCase()}-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const validateUuid = (uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-6][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(uuid)
  }

  const analyzeUuid = (uuid: string) => {
    if (!validateUuid(uuid)) return null

    const parts = uuid.split('-')
    const version = parseInt(parts[2][0], 16)
    const variant = parseInt(parts[3][0], 16)

    let versionName = 'Unknown'
    switch (version) {
      case 1: versionName = 'Time-based'; break
      case 2: versionName = 'DCE Security'; break
      case 3: versionName = 'MD5 hash'; break
      case 4: versionName = 'Random'; break
      case 5: versionName = 'SHA-1 hash'; break
      case 6: versionName = 'Time-ordered'; break
    }

    return {
      version,
      versionName,
      variant: variant >= 8 ? 'RFC 4122' : 'Reserved',
      timeLow: parts[0],
      timeMid: parts[1],
      timeHiAndVersion: parts[2],
      clockSeqHiAndReserved: parts[3],
      node: parts[4]
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="h-5 w-5" />
            UUID 生成设置
          </CardTitle>
          <CardDescription>
            选择 UUID 版本和生成数量
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Label>UUID 版本:</Label>
              <div className="flex gap-2">
                <Button
                  variant={uuidVersion === 'v4' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUuidVersion('v4')}
                >
                  v4 (随机)
                </Button>
                <Button
                  variant={uuidVersion === 'v1' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUuidVersion('v1')}
                >
                  v1 (时间戳)
                </Button>
                <Button
                  variant={uuidVersion === 'v6' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUuidVersion('v6')}
                >
                  v6 (时间排序)
                </Button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={generateSingle}>
              <Shuffle className="h-4 w-4 mr-1" />
              生成单个 UUID
            </Button>
            <div className="flex items-center gap-2">
              <Label htmlFor="batch-count">批量生成:</Label>
              <select
                id="batch-count"
                value={batchCount}
                onChange={(e) => setBatchCount(Number(e.target.value))}
                className="px-3 py-1 border rounded text-sm"
              >
                <option value={1}>1个</option>
                <option value={5}>5个</option>
                <option value={10}>10个</option>
                <option value={25}>25个</option>
                <option value={50}>50个</option>
                <option value={100}>100个</option>
              </select>
              <Button onClick={generateBatch} variant="outline">
                批量生成
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedUuids.length > 0 && (
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">UUID 列表</TabsTrigger>
            <TabsTrigger value="formats">格式转换</TabsTrigger>
          </TabsList>

          <TabsContent value="list">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>生成的 UUID</span>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {generatedUuids.length} 个 UUID
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllUuids}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      复制全部
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadUuids}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      下载
                    </Button>
                  </div>
                </CardTitle>
                <CardDescription>
                  点击任意 UUID 可复制到剪贴板
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {generatedUuids.map((uuid, index) => {
                    const analysis = analyzeUuid(uuid)
                    return (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-6">
                            {index + 1}
                          </span>
                          <code
                            className="font-mono text-sm cursor-pointer select-all"
                            onClick={() => copyToClipboard(uuid)}
                          >
                            {uuid}
                          </code>
                          {analysis && (
                            <Badge variant="outline" className="text-xs">
                              {analysis.versionName}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(uuid)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="formats">
            <Card>
              <CardHeader>
                <CardTitle>格式转换</CardTitle>
                <CardDescription>
                  将 UUID 转换为不同的编程语言格式
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formatOptions.map((option, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="font-medium">{option.name}</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(generatedUuids.map(option.formatter).join('\n'))}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => exportAsFormat(option.formatter, option.name)}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Textarea
                        value={generatedUuids.slice(0, 3).map(option.formatter).join('\n') + 
                               (generatedUuids.length > 3 ? '\n...' : '')}
                        readOnly
                        className="font-mono text-xs h-20 resize-none"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Card>
        <CardHeader>
          <CardTitle>UUID 版本说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold text-blue-600">UUID v4 (推荐)</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 基于随机数生成</li>
                <li>• 最常用的 UUID 版本</li>
                <li>• 无需额外信息</li>
                <li>• 适用于大多数场景</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-green-600">UUID v1</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 基于时间戳和 MAC 地址</li>
                <li>• 包含时间信息</li>
                <li>• 可能泄露主机信息</li>
                <li>• 适用于需要时间排序的场景</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-purple-600">UUID v6</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• v1 的改进版本</li>
                <li>• 时间戳重新排序</li>
                <li>• 更好的数据库索引性能</li>
                <li>• 保持时间排序特性</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {generatedUuids.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>使用示例</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-medium">JavaScript</Label>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`// 生成 UUID v4
const uuid = "${generatedUuids[0] || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'}";

// 验证 UUID
const isValid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-6][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);`}
                </pre>
              </div>
              <div className="space-y-2">
                <Label className="font-medium">Python</Label>
                <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import uuid

# 使用生成的 UUID
my_uuid = uuid.UUID("${generatedUuids[0] || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'}")

# 转换为字符串
uuid_str = str(my_uuid)`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 