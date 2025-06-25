"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Copy, RotateCcw, CheckCircle, XCircle, Download, Upload, Minimize2, Maximize2 } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

export function JsonFormatter() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')
  const [indent, setIndent] = useState(2)
  const [sortKeys, setSortKeys] = useState(false)

  const formatJson = () => {
    if (!input.trim()) {
      setOutput('')
      setIsValid(true)
      setError('')
      return
    }

    try {
      // 解析 JSON
      const parsed = JSON.parse(input)
      setIsValid(true)
      setError('')

      // 格式化 JSON
      let formatted: string
      if (sortKeys) {
        // 递归排序所有对象的键
        const sortObjectKeys = (obj: any): any => {
          if (Array.isArray(obj)) {
            return obj.map(sortObjectKeys)
          } else if (obj !== null && typeof obj === 'object') {
            const sorted: any = {}
            Object.keys(obj).sort().forEach(key => {
              sorted[key] = sortObjectKeys(obj[key])
            })
            return sorted
          }
          return obj
        }
        formatted = JSON.stringify(sortObjectKeys(parsed), null, indent)
      } else {
        formatted = JSON.stringify(parsed, null, indent)
      }

      setOutput(formatted)
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  const minifyJson = () => {
    if (!input.trim()) {
      setOutput('')
      setIsValid(true)
      setError('')
      return
    }

    try {
      const parsed = JSON.parse(input)
      setIsValid(true)
      setError('')
      setOutput(JSON.stringify(parsed))
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'JSON 格式错误')
      setOutput('')
    }
  }

  const validateJson = () => {
    if (!input.trim()) {
      setIsValid(true)
      setError('')
      return
    }

    try {
      JSON.parse(input)
      setIsValid(true)
      setError('')
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : 'JSON 格式错误')
    }
  }

  const handleInputChange = (value: string) => {
    setInput(value)
    // 实时验证
    if (value.trim()) {
      try {
        JSON.parse(value)
        setIsValid(true)
        setError('')
      } catch (err) {
        setIsValid(false)
        setError(err instanceof Error ? err.message : 'JSON 格式错误')
      }
    } else {
      setIsValid(true)
      setError('')
    }
  }

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      // 可以添加成功提示
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setIsValid(true)
    setError('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'application/json') {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInput(content)
        handleInputChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleDownload = () => {
    if (!output) return

    const blob = new Blob([output], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getJsonStats = (jsonString: string) => {
    if (!jsonString) return null
    
    try {
      const parsed = JSON.parse(jsonString)
      
      const countItems = (obj: any): { objects: number, arrays: number, primitives: number } => {
        let objects = 0
        let arrays = 0
        let primitives = 0

        if (Array.isArray(obj)) {
          arrays = 1
          obj.forEach(item => {
            const counts = countItems(item)
            objects += counts.objects
            arrays += counts.arrays
            primitives += counts.primitives
          })
        } else if (obj !== null && typeof obj === 'object') {
          objects = 1
          Object.values(obj).forEach(value => {
            const counts = countItems(value)
            objects += counts.objects
            arrays += counts.arrays
            primitives += counts.primitives
          })
        } else {
          primitives = 1
        }

        return { objects, arrays, primitives }
      }

      const stats = countItems(parsed)
      const size = new Blob([jsonString]).size

      return {
        ...stats,
        size,
        sizeFormatted: size < 1024 ? `${size} B` : size < 1024 * 1024 ? `${(size / 1024).toFixed(1)} KB` : `${(size / (1024 * 1024)).toFixed(1)} MB`
      }
    } catch {
      return null
    }
  }

  const inputStats = getJsonStats(input)
  const outputStats = getJsonStats(output)

  const exampleJson = `{
  "name": "示例数据",
  "version": "1.0.0",
  "description": "这是一个JSON格式化示例",
  "features": [
    "格式化",
    "压缩",
    "验证"
  ],
  "config": {
    "enabled": true,
    "timeout": 5000
  }
}`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            JSON 格式化器
            {input && (
              isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )
            )}
          </CardTitle>
          <CardDescription>
            格式化、压缩、验证 JSON 数据
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 控制选项 */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="indent">缩进空格:</Label>
              <select
                id="indent"
                value={indent}
                onChange={(e) => setIndent(Number(e.target.value))}
                className="border rounded px-2 py-1 text-sm"
              >
                <option value={2}>2</option>
                <option value={4}>4</option>
                <option value={8}>8</option>
              </select>
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={sortKeys}
                onChange={(e) => setSortKeys(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">排序键名</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".json"
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
                onClick={() => setInput(exampleJson)}
              >
                示例数据
              </Button>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={formatJson} disabled={!input.trim() || !isValid}>
              <Maximize2 className="h-4 w-4 mr-1" />
              格式化
            </Button>
            <Button variant="outline" onClick={minifyJson} disabled={!input.trim() || !isValid}>
              <Minimize2 className="h-4 w-4 mr-1" />
              压缩
            </Button>
            <Button variant="outline" onClick={validateJson}>
              <CheckCircle className="h-4 w-4 mr-1" />
              验证
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <RotateCcw className="h-4 w-4 mr-1" />
              清空
            </Button>
            {output && (
              <Button variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-1" />
                下载
              </Button>
            )}
          </div>

          {/* 错误信息 */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
              <p className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {error}
              </p>
            </div>
          )}

          {/* 输入区域 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="input-json">输入 JSON</Label>
              {inputStats && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    对象: {inputStats.objects}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    数组: {inputStats.arrays}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {inputStats.sizeFormatted}
                  </Badge>
                </div>
              )}
            </div>
            <Textarea
              id="input-json"
              value={input}
              onChange={(e) => handleInputChange(e.target.value)}
              placeholder="粘贴或输入 JSON 数据..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* 输出区域 */}
          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>格式化结果</Label>
                <div className="flex items-center gap-2">
                  {outputStats && (
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-xs">
                        对象: {outputStats.objects}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        数组: {outputStats.arrays}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {outputStats.sizeFormatted}
                      </Badge>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(output)}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    复制
                  </Button>
                </div>
              </div>
              <Textarea
                value={output}
                readOnly
                className="min-h-[200px] font-mono text-sm bg-muted/50"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">使用说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <h4 className="font-semibold mb-1">格式化</h4>
            <p className="text-muted-foreground">将压缩的JSON数据格式化为易读的形式，支持自定义缩进和键名排序。</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">压缩</h4>
            <p className="text-muted-foreground">移除所有不必要的空格和换行符，减小JSON文件大小。</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">验证</h4>
            <p className="text-muted-foreground">检查JSON语法是否正确，实时显示错误信息和位置。</p>
          </div>
          <div>
            <h4 className="font-semibold mb-1">统计信息</h4>
            <p className="text-muted-foreground">显示JSON中对象、数组的数量以及文件大小信息。</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 