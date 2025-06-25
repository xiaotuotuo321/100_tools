'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Key, Shuffle, Download, CheckCircle, XCircle } from 'lucide-react'

export default function PasswordGenerator() {
  const [generatedPasswords, setGeneratedPasswords] = useState<string[]>([])
  const [length, setLength] = useState(12)
  const [count, setCount] = useState(1)
  const [includeUppercase, setIncludeUppercase] = useState(true)
  const [includeLowercase, setIncludeLowercase] = useState(true)
  const [includeNumbers, setIncludeNumbers] = useState(true)
  const [includeSymbols, setIncludeSymbols] = useState(true)
  const [excludeSimilar, setExcludeSimilar] = useState(false)
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(false)
  const [customChars, setCustomChars] = useState('')

  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz'
  const numberChars = '0123456789'
  const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'
  const similarChars = 'il1Lo0O'
  const ambiguousChars = '{}[]()/\\\'"`~,;.<>'

  const generatePassword = () => {
    let charset = ''
    
    if (customChars) {
      charset = customChars
    } else {
      if (includeUppercase) charset += uppercaseChars
      if (includeLowercase) charset += lowercaseChars
      if (includeNumbers) charset += numberChars
      if (includeSymbols) charset += symbolChars
    }

    if (excludeSimilar) {
      charset = charset.split('').filter(char => !similarChars.includes(char)).join('')
    }

    if (excludeAmbiguous) {
      charset = charset.split('').filter(char => !ambiguousChars.includes(char)).join('')
    }

    if (!charset) {
      return ''
    }

    const passwords: string[] = []
    
    for (let p = 0; p < count; p++) {
      let password = ''
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        password += charset[randomIndex]
      }
      passwords.push(password)
    }

    setGeneratedPasswords(passwords)
  }

  const analyzePassword = (password: string) => {
    const analysis = {
      length: password.length,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumbers: /[0-9]/.test(password),
      hasSymbols: /[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]/.test(password),
      uniqueChars: new Set(password).size,
      entropy: 0,
      strength: 'weak' as 'weak' | 'fair' | 'good' | 'strong'
    }

    // 计算熵值
    let charsetSize = 0
    if (analysis.hasLowercase) charsetSize += 26
    if (analysis.hasUppercase) charsetSize += 26
    if (analysis.hasNumbers) charsetSize += 10
    if (analysis.hasSymbols) charsetSize += 32

    analysis.entropy = Math.log2(Math.pow(charsetSize, analysis.length))

    // 确定强度
    if (analysis.entropy < 25) analysis.strength = 'weak'
    else if (analysis.entropy < 50) analysis.strength = 'fair'
    else if (analysis.entropy < 75) analysis.strength = 'good'
    else analysis.strength = 'strong'

    return analysis
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAllPasswords = () => {
    const allPasswords = generatedPasswords.join('\n')
    navigator.clipboard.writeText(allPasswords)
  }

  const downloadPasswords = () => {
    const content = generatedPasswords.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `passwords-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const presets = [
    {
      name: '简单密码',
      config: { length: 8, uppercase: true, lowercase: true, numbers: true, symbols: false }
    },
    {
      name: '标准密码',
      config: { length: 12, uppercase: true, lowercase: true, numbers: true, symbols: true }
    },
    {
      name: '强密码',
      config: { length: 16, uppercase: true, lowercase: true, numbers: true, symbols: true }
    },
    {
      name: '超强密码',
      config: { length: 24, uppercase: true, lowercase: true, numbers: true, symbols: true }
    },
    {
      name: '数字PIN',
      config: { length: 6, uppercase: false, lowercase: false, numbers: true, symbols: false }
    }
  ]

  const applyPreset = (preset: typeof presets[0]) => {
    setLength(preset.config.length)
    setIncludeUppercase(preset.config.uppercase)
    setIncludeLowercase(preset.config.lowercase)
    setIncludeNumbers(preset.config.numbers)
    setIncludeSymbols(preset.config.symbols)
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'weak': return 'text-red-600'
      case 'fair': return 'text-orange-600'
      case 'good': return 'text-blue-600'
      case 'strong': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStrengthBg = (strength: string) => {
    switch (strength) {
      case 'weak': return 'bg-red-50 dark:bg-red-950/20 border-red-200'
      case 'fair': return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200'
      case 'good': return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200'
      case 'strong': return 'bg-green-50 dark:bg-green-950/20 border-green-200'
      default: return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            密码生成设置
          </CardTitle>
          <CardDescription>
            配置密码生成参数和字符集
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => applyPreset(preset)}
              >
                {preset.name}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="length">密码长度</Label>
                  <Input
                    id="length"
                    type="number"
                    min="4"
                    max="128"
                    value={length}
                    onChange={(e) => setLength(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="count">生成数量</Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    value={count}
                    onChange={(e) => setCount(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>字符类型</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeUppercase}
                      onChange={(e) => setIncludeUppercase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">大写字母 (A-Z)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeLowercase}
                      onChange={(e) => setIncludeLowercase(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">小写字母 (a-z)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeNumbers}
                      onChange={(e) => setIncludeNumbers(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">数字 (0-9)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeSymbols}
                      onChange={(e) => setIncludeSymbols(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">特殊符号 (!@#$%...)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-3">
                <Label>高级选项</Label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeSimilar}
                      onChange={(e) => setExcludeSimilar(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">排除相似字符 (il1Lo0O)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={excludeAmbiguous}
                      onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">排除歧义字符 ({}[]()...)</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom-chars">自定义字符集</Label>
                <Input
                  id="custom-chars"
                  placeholder="输入自定义字符集（留空使用上述设置）"
                  value={customChars}
                  onChange={(e) => setCustomChars(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={generatePassword}>
              <Shuffle className="h-4 w-4 mr-1" />
              生成密码
            </Button>
            <Button
              variant="outline"
              onClick={copyAllPasswords}
              disabled={generatedPasswords.length === 0}
            >
              <Copy className="h-4 w-4 mr-1" />
              复制全部
            </Button>
            <Button
              variant="outline"
              onClick={downloadPasswords}
              disabled={generatedPasswords.length === 0}
            >
              <Download className="h-4 w-4 mr-1" />
              下载
            </Button>
          </div>
        </CardContent>
      </Card>

      {generatedPasswords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>生成的密码</CardTitle>
            <CardDescription>
              点击密码可复制到剪贴板
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {generatedPasswords.map((password, index) => {
                const analysis = analyzePassword(password)
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStrengthBg(analysis.strength)}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getStrengthColor(analysis.strength)}>
                          {analysis.strength === 'weak' && '弱'}
                          {analysis.strength === 'fair' && '一般'}
                          {analysis.strength === 'good' && '良好'}
                          {analysis.strength === 'strong' && '强'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          熵值: {analysis.entropy.toFixed(1)} bits
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(password)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div
                      className="font-mono text-lg bg-white dark:bg-gray-900 p-3 rounded border cursor-pointer select-all"
                      onClick={() => copyToClipboard(password)}
                    >
                      {password}
                    </div>

                    <div className="flex gap-4 mt-3 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        {analysis.hasUppercase ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>大写</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {analysis.hasLowercase ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>小写</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {analysis.hasNumbers ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>数字</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {analysis.hasSymbols ? <CheckCircle className="h-3 w-3 text-green-600" /> : <XCircle className="h-3 w-3 text-red-600" />}
                        <span>符号</span>
                      </div>
                      <span>长度: {analysis.length}</span>
                      <span>唯一字符: {analysis.uniqueChars}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>密码安全建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">强密码特征</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 长度至少12个字符</li>
                <li>• 包含大小写字母、数字和符号</li>
                <li>• 避免使用个人信息</li>
                <li>• 不要使用字典单词</li>
                <li>• 每个账户使用唯一密码</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">密码管理建议</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 使用密码管理器存储密码</li>
                <li>• 定期更换重要账户密码</li>
                <li>• 启用双因素认证</li>
                <li>• 不要在不安全的网络输入密码</li>
                <li>• 不要共享或写下密码</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 