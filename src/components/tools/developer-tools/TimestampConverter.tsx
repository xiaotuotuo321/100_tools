'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Copy, Clock, Calendar, RefreshCw, ArrowRight } from 'lucide-react'

export default function TimestampConverter() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timestamp, setTimestamp] = useState('')
  const [datetime, setDatetime] = useState('')
  const [convertedResults, setConvertedResults] = useState<any>(null)

  // 实时更新当前时间
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const formatDate = (date: Date, format: string) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')

    switch (format) {
      case 'YYYY-MM-DD HH:mm:ss':
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      case 'YYYY/MM/DD HH:mm:ss':
        return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`
      case 'MM/DD/YYYY HH:mm:ss':
        return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`
      case 'DD/MM/YYYY HH:mm:ss':
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`
      case 'ISO 8601':
        return date.toISOString()
      case 'RFC 2822':
        return date.toString()
      case 'Unix':
        return Math.floor(date.getTime() / 1000).toString()
      case 'Unix (ms)':
        return date.getTime().toString()
      default:
        return date.toString()
    }
  }

  const convertTimestamp = () => {
    if (!timestamp.trim()) return

    try {
      let date: Date
      const num = parseFloat(timestamp)

      // 判断时间戳格式
      if (timestamp.length === 10) {
        // 10位数字，秒级时间戳
        date = new Date(num * 1000)
      } else if (timestamp.length === 13) {
        // 13位数字，毫秒级时间戳
        date = new Date(num)
      } else {
        // 尝试直接解析
        date = new Date(timestamp)
      }

      if (isNaN(date.getTime())) {
        throw new Error('Invalid timestamp')
      }

      const formats = [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        'MM/DD/YYYY HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss',
        'ISO 8601',
        'RFC 2822',
        'Unix',
        'Unix (ms)'
      ]

      const results = formats.map(format => ({
        format,
        value: formatDate(date, format)
      }))

      setConvertedResults({
        originalDate: date,
        formats: results,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' }),
        isLeapYear: new Date(date.getFullYear(), 1, 29).getDate() === 29,
        dayOfYear: Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
      })
    } catch (error) {
      setConvertedResults(null)
    }
  }

  const convertDatetime = () => {
    if (!datetime.trim()) return

    try {
      const date = new Date(datetime)
      
      if (isNaN(date.getTime())) {
        throw new Error('Invalid datetime')
      }

      const formats = [
        'YYYY-MM-DD HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        'MM/DD/YYYY HH:mm:ss',
        'DD/MM/YYYY HH:mm:ss',
        'ISO 8601',
        'RFC 2822',
        'Unix',
        'Unix (ms)'
      ]

      const results = formats.map(format => ({
        format,
        value: formatDate(date, format)
      }))

      setConvertedResults({
        originalDate: date,
        formats: results,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        weekday: date.toLocaleDateString('zh-CN', { weekday: 'long' }),
        isLeapYear: new Date(date.getFullYear(), 1, 29).getDate() === 29,
        dayOfYear: Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24)) + 1
      })
    } catch (error) {
      setConvertedResults(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const setCurrentTimestamp = () => {
    const now = new Date()
    setTimestamp(Math.floor(now.getTime() / 1000).toString())
  }

  const setCurrentDatetime = () => {
    const now = new Date()
    setDatetime(now.toISOString().slice(0, 19))
  }

  const timestampExamples = [
    { name: '当前时间', value: Math.floor(Date.now() / 1000).toString(), description: '10位秒级时间戳' },
    { name: '当前时间(毫秒)', value: Date.now().toString(), description: '13位毫秒级时间戳' },
    { name: '2024年1月1日', value: '1704067200', description: '新年第一天' },
    { name: '2000年1月1日', value: '946684800', description: '千禧年' },
    { name: 'Unix纪元', value: '0', description: '1970年1月1日' }
  ]

  const datetimeExamples = [
    { name: '当前时间', value: new Date().toISOString().slice(0, 19), description: 'ISO格式' },
    { name: '2024-01-01 00:00:00', value: '2024-01-01 00:00:00', description: '新年第一天' },
    { name: '2024-12-31 23:59:59', value: '2024-12-31 23:59:59', description: '年末最后一秒' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              当前时间
            </span>
            <Button variant="outline" size="sm" onClick={() => setCurrentTime(new Date())}>
              <RefreshCw className="h-4 w-4 mr-1" />
              刷新
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-sm text-muted-foreground">本地时间</div>
              <div className="text-lg font-mono mt-1">
                {formatDate(currentTime, 'YYYY-MM-DD HH:mm:ss')}
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Unix时间戳(秒)</div>
              <div className="text-lg font-mono mt-1">
                {Math.floor(currentTime.getTime() / 1000)}
              </div>
            </div>
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <div className="text-sm text-muted-foreground">Unix时间戳(毫秒)</div>
              <div className="text-lg font-mono mt-1">
                {currentTime.getTime()}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <div className="text-sm text-muted-foreground">ISO 8601</div>
              <div className="text-lg font-mono mt-1 break-all">
                {currentTime.toISOString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="timestamp" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timestamp">时间戳转日期</TabsTrigger>
          <TabsTrigger value="datetime">日期转时间戳</TabsTrigger>
        </TabsList>

        <TabsContent value="timestamp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>时间戳转换</CardTitle>
              <CardDescription>
                输入Unix时间戳，支持秒级(10位)和毫秒级(13位)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入时间戳，如: 1640995200"
                  value={timestamp}
                  onChange={(e) => setTimestamp(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={convertTimestamp} disabled={!timestamp.trim()}>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  转换
                </Button>
                <Button variant="outline" onClick={setCurrentTimestamp}>
                  当前时间
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">常用示例:</Label>
                <div className="flex flex-wrap gap-2">
                  {timestampExamples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setTimestamp(example.value)}
                      className="h-auto flex-col items-start p-2"
                    >
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-muted-foreground">{example.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datetime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>日期时间转换</CardTitle>
              <CardDescription>
                输入日期时间，支持多种格式
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="输入日期时间，如: 2024-01-01 12:00:00"
                  value={datetime}
                  onChange={(e) => setDatetime(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={convertDatetime} disabled={!datetime.trim()}>
                  <ArrowRight className="h-4 w-4 mr-1" />
                  转换
                </Button>
                <Button variant="outline" onClick={setCurrentDatetime}>
                  当前时间
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">常用示例:</Label>
                <div className="flex flex-wrap gap-2">
                  {datetimeExamples.map((example, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => setDatetime(example.value)}
                      className="h-auto flex-col items-start p-2"
                    >
                      <div className="font-medium">{example.name}</div>
                      <div className="text-xs text-muted-foreground">{example.description}</div>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {convertedResults && (
        <Card>
          <CardHeader>
            <CardTitle>转换结果</CardTitle>
            <CardDescription>
              点击任意格式可复制到剪贴板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">星期</div>
                  <div className="text-lg font-semibold mt-1">{convertedResults.weekday}</div>
                </div>
                <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">时区</div>
                  <div className="text-lg font-semibold mt-1">{convertedResults.timezone}</div>
                </div>
                <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">年中第几天</div>
                  <div className="text-lg font-semibold mt-1">{convertedResults.dayOfYear}</div>
                </div>
                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="text-sm text-muted-foreground">闰年</div>
                  <div className="text-lg font-semibold mt-1">
                    {convertedResults.isLeapYear ? '是' : '否'}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-lg font-semibold">各种格式:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {convertedResults.formats.map((item: any, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => copyToClipboard(item.value)}
                    >
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground">{item.format}</div>
                        <div className="font-mono text-sm mt-1 break-all">{item.value}</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          copyToClipboard(item.value)
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>时间戳说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">时间戳格式</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• <strong>10位数字</strong> - 秒级时间戳，如 1640995200</li>
                <li>• <strong>13位数字</strong> - 毫秒级时间戳，如 1640995200000</li>
                <li>• <strong>Unix纪元</strong> - 从1970年1月1日开始计算</li>
                <li>• <strong>时区影响</strong> - 显示本地时区时间</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">支持的日期格式</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• YYYY-MM-DD HH:mm:ss</li>
                <li>• YYYY/MM/DD HH:mm:ss</li>
                <li>• MM/DD/YYYY HH:mm:ss</li>
                <li>• ISO 8601 格式</li>
                <li>• 自然语言格式(如: Jan 1, 2024)</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 