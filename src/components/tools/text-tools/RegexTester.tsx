"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { Badge } from '@/components/ui/badge'
import { Copy, RotateCcw, CheckCircle, XCircle, Info } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface Match {
  text: string
  index: number
  groups: string[]
}

export function RegexTester() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [matches, setMatches] = useState<Match[]>([])
  const [isValid, setIsValid] = useState(true)
  const [error, setError] = useState('')

  const commonPatterns = [
    { name: '邮箱地址', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', description: '匹配邮箱地址' },
    { name: '手机号码', pattern: '1[3-9]\\d{9}', description: '匹配中国手机号码' },
    { name: 'URL地址', pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)', description: '匹配HTTP/HTTPS URL' },
    { name: 'IP地址', pattern: '(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)', description: '匹配IPv4地址' },
    { name: '身份证号', pattern: '[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]', description: '匹配18位身份证号码' },
    { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]', description: '匹配中文字符' },
    { name: '数字', pattern: '\\d+', description: '匹配一个或多个数字' },
    { name: '日期格式', pattern: '\\d{4}-\\d{2}-\\d{2}', description: '匹配YYYY-MM-DD格式日期' },
  ]

  const testRegex = useCallback(() => {
    if (!pattern) {
      setMatches([])
      setIsValid(true)
      setError('')
      return
    }

    try {
      const regex = new RegExp(pattern, flags)
      setIsValid(true)
      setError('')

      if (!testString) {
        setMatches([])
        return
      }

      const foundMatches: Match[] = []
      
      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          // 防止无限循环
          if (match.index === regex.lastIndex) {
            regex.lastIndex++
          }
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          foundMatches.push({
            text: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      setMatches(foundMatches)
    } catch (err) {
      setIsValid(false)
      setError(err instanceof Error ? err.message : '正则表达式语法错误')
      setMatches([])
    }
  }, [pattern, flags, testString])

  const highlightMatches = (text: string, matches: Match[]) => {
    if (matches.length === 0) return text

    let result = ''
    let lastIndex = 0

    matches.forEach((match, index) => {
      result += text.slice(lastIndex, match.index)
      result += `<mark class="bg-yellow-200 dark:bg-yellow-600 px-1 rounded" data-match="${index}">${match.text}</mark>`
      lastIndex = match.index + match.text.length
    })

    result += text.slice(lastIndex)
    return result
  }

  const handlePatternChange = (value: string) => {
    setPattern(value)
  }

  const handleFlagToggle = (flag: string) => {
    if (flags.includes(flag)) {
      setFlags(flags.replace(flag, ''))
    } else {
      setFlags(flags + flag)
    }
  }

  const handleClear = () => {
    setPattern('')
    setFlags('g')
    setTestString('')
    setMatches([])
    setIsValid(true)
    setError('')
  }

  const handleCopy = async (text: string) => {
    await copyToClipboard(text)
  }

  // 实时测试
  useEffect(() => {
    testRegex()
  }, [testRegex])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            正则表达式测试器
            {isValid ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
          </CardTitle>
          <CardDescription>
            测试和验证正则表达式，实时查看匹配结果
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 正则表达式输入 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">正则表达式</Label>
              <div className="flex space-x-2">
                <div className="flex-1 flex items-center">
                  <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0">/</span>
                  <Input
                    id="pattern"
                    value={pattern}
                    onChange={(e) => handlePatternChange(e.target.value)}
                    placeholder="输入正则表达式..."
                    className="rounded-none border-x-0"
                  />
                  <span className="px-3 py-2 bg-muted rounded-r-md border border-l-0">/{flags}</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleClear}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <XCircle className="h-4 w-4" />
                  {error}
                </p>
              )}
            </div>

            {/* 标志位 */}
            <div className="space-y-2">
              <Label>标志位 (Flags)</Label>
              <div className="flex flex-wrap gap-2">
                {[
                  { flag: 'g', name: '全局', desc: '查找所有匹配' },
                  { flag: 'i', name: '忽略大小写', desc: '不区分大小写' },
                  { flag: 'm', name: '多行', desc: '^和$匹配每行的开始和结束' },
                  { flag: 's', name: '单行', desc: '.匹配换行符' },
                ].map(({ flag, name, desc }) => (
                  <Button
                    key={flag}
                    variant={flags.includes(flag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleFlagToggle(flag)}
                    title={desc}
                  >
                    {flag} - {name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* 测试文本 */}
          <div className="space-y-2">
            <Label htmlFor="test-string">测试文本</Label>
            <Textarea
              id="test-string"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="输入要测试的文本..."
              className="min-h-[120px]"
            />
          </div>

          {/* 匹配结果 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>匹配结果</Label>
              <Badge variant={matches.length > 0 ? "default" : "secondary"}>
                {matches.length} 个匹配
              </Badge>
            </div>
            
            {testString && (
              <div className="border rounded-md p-4 bg-muted/20">
                <div 
                  className="whitespace-pre-wrap font-mono text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: highlightMatches(testString, matches) 
                  }}
                />
              </div>
            )}

            {matches.length > 0 && (
              <div className="space-y-2">
                <Label>匹配详情</Label>
                <div className="space-y-2">
                  {matches.map((match, index) => (
                    <div key={index} className="border rounded-md p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm">匹配 {index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopy(match.text)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">文本:</span>
                          <code className="ml-2 px-2 py-1 bg-muted rounded">{match.text}</code>
                        </div>
                        <div>
                          <span className="text-muted-foreground">位置:</span>
                          <span className="ml-2">{match.index}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">长度:</span>
                          <span className="ml-2">{match.text.length}</span>
                        </div>
                      </div>
                      {match.groups.length > 0 && (
                        <div>
                          <span className="text-muted-foreground text-sm">捕获组:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {match.groups.map((group, groupIndex) => (
                              <code key={groupIndex} className="px-2 py-1 bg-muted rounded text-xs">
                                ${groupIndex + 1}: {group || '(空)'}
                              </code>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 常用正则表达式 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            常用正则表达式
          </CardTitle>
          <CardDescription>
            点击使用常见的正则表达式模式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonPatterns.map((item, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => setPattern(item.pattern)}
              >
                <div className="font-semibold text-sm mb-1">{item.name}</div>
                <div className="text-xs text-muted-foreground mb-2">{item.description}</div>
                <code className="text-xs bg-muted px-2 py-1 rounded">{item.pattern}</code>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 