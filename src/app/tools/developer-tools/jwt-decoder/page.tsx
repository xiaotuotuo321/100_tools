"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface JwtParts {
    header: any
    payload: any
    signature: string
    isValid: boolean
    error?: string
}

export default function JwtDecoder() {
    const [jwt, setJwt] = useState('')
    const [decodedJwt, setDecodedJwt] = useState<JwtParts | null>(null)
    const [activeTab, setActiveTab] = useState('payload')
    const [copied, setCopied] = useState(false)
    const [isExpired, setIsExpired] = useState(false)

    // 当JWT变化时解码
    useEffect(() => {
        if (jwt.trim()) {
            decodeJwt(jwt)
        } else {
            setDecodedJwt(null)
        }
    }, [jwt])

    // 解码JWT
    const decodeJwt = (token: string) => {
        try {
            // 分割JWT
            const parts = token.split('.')
            if (parts.length !== 3) {
                throw new Error('JWT格式无效，应包含三个由点分隔的部分')
            }

            // 解码头部和载荷
            const header = JSON.parse(atob(parts[0]))
            const payload = JSON.parse(atob(parts[1]))

            // 检查是否过期
            const isTokenExpired = payload.exp && payload.exp * 1000 < Date.now()
            setIsExpired(isTokenExpired)

            setDecodedJwt({
                header,
                payload,
                signature: parts[2],
                isValid: true
            })
        } catch (error) {
            setDecodedJwt({
                header: {},
                payload: {},
                signature: '',
                isValid: false,
                error: error instanceof Error ? error.message : '解码失败'
            })
        }
    }

    // 复制到剪贴板
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // 格式化JSON
    const formatJson = (json: any) => {
        return JSON.stringify(json, null, 2)
    }

    // 计算过期时间
    const getExpirationInfo = () => {
        if (!decodedJwt?.payload?.exp) {
            return '无过期时间'
        }

        const expDate = new Date(decodedJwt.payload.exp * 1000)
        const now = new Date()
        const diffMs = expDate.getTime() - now.getTime()

        if (diffMs < 0) {
            return `已过期 (${expDate.toLocaleString()})`
        }

        // 计算剩余时间
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

        let timeString = ''
        if (diffDays > 0) timeString += `${diffDays}天 `
        if (diffHours > 0) timeString += `${diffHours}小时 `
        timeString += `${diffMinutes}分钟`

        return `${expDate.toLocaleString()} (剩余 ${timeString})`
    }

    // 获取颜色样式
    const getExpirationColor = () => {
        if (!decodedJwt?.payload?.exp) return 'text-muted-foreground'
        return isExpired ? 'text-destructive' : 'text-green-500'
    }

    // 示例JWT
    const sampleJwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IuW8oOS4iSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjoxNzE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">JWT 解码器</h1>

            <div className="grid grid-cols-1 gap-8">
                <Card>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    输入 JWT
                                </label>
                                <div className="flex gap-2">
                                    <Textarea
                                        placeholder="在此粘贴您的JWT令牌..."
                                        value={jwt}
                                        onChange={(e) => setJwt(e.target.value)}
                                        className="font-mono text-sm h-24"
                                    />
                                </div>
                                <div className="mt-2 flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setJwt(sampleJwt)}
                                    >
                                        使用示例
                                    </Button>
                                </div>
                            </div>

                            {decodedJwt && !decodedJwt.isValid && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>解码错误</AlertTitle>
                                    <AlertDescription>
                                        {decodedJwt.error}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {decodedJwt && decodedJwt.isValid && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">算法</h3>
                                            <div className="bg-muted p-2 rounded text-sm">
                                                {decodedJwt.header.alg || '未指定'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">类型</h3>
                                            <div className="bg-muted p-2 rounded text-sm">
                                                {decodedJwt.header.typ || '未指定'}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-sm font-medium">过期时间</h3>
                                            <div className={`bg-muted p-2 rounded text-sm ${getExpirationColor()}`}>
                                                {getExpirationInfo()}
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                                            <TabsList className="grid grid-cols-3">
                                                <TabsTrigger value="payload">载荷 (Payload)</TabsTrigger>
                                                <TabsTrigger value="header">头部 (Header)</TabsTrigger>
                                                <TabsTrigger value="signature">签名 (Signature)</TabsTrigger>
                                            </TabsList>

                                            <TabsContent value="payload" className="mt-4">
                                                <div className="relative">
                                                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono">
                                                        {formatJson(decodedJwt.payload)}
                                                    </pre>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="absolute top-2 right-2 flex items-center gap-1"
                                                        onClick={() => copyToClipboard(formatJson(decodedJwt.payload))}
                                                    >
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        {copied ? '已复制' : '复制'}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="header" className="mt-4">
                                                <div className="relative">
                                                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono">
                                                        {formatJson(decodedJwt.header)}
                                                    </pre>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="absolute top-2 right-2 flex items-center gap-1"
                                                        onClick={() => copyToClipboard(formatJson(decodedJwt.header))}
                                                    >
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        {copied ? '已复制' : '复制'}
                                                    </Button>
                                                </div>
                                            </TabsContent>

                                            <TabsContent value="signature" className="mt-4">
                                                <div className="relative">
                                                    <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm font-mono break-all">
                                                        {decodedJwt.signature}
                                                    </pre>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="absolute top-2 right-2 flex items-center gap-1"
                                                        onClick={() => copyToClipboard(decodedJwt.signature)}
                                                    >
                                                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                                        {copied ? '已复制' : '复制'}
                                                    </Button>
                                                </div>
                                            </TabsContent>
                                        </Tabs>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <h2 className="text-xl font-bold mb-4">什么是 JWT?</h2>
                        <p className="mb-4">
                            JSON Web Token (JWT) 是一种开放标准 (RFC 7519)，它定义了一种紧凑且自包含的方式，用于在各方之间以JSON对象安全地传输信息。
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                            <div>
                                <h3 className="text-lg font-medium mb-2">头部 (Header)</h3>
                                <p className="text-sm text-muted-foreground">
                                    头部通常由两部分组成：令牌的类型（即JWT）和所使用的签名算法，如HMAC SHA256或RSA。
                                </p>
                                <pre className="bg-muted p-3 rounded-md mt-2 text-xs font-mono">
                                    {`{
  "alg": "HS256",
  "typ": "JWT"
}`}
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">载荷 (Payload)</h3>
                                <p className="text-sm text-muted-foreground">
                                    载荷包含声明（claims）。声明是关于实体（通常是用户）和其他数据的声明。
                                </p>
                                <pre className="bg-muted p-3 rounded-md mt-2 text-xs font-mono">
                                    {`{
  "sub": "1234567890",
  "name": "张三",
  "iat": 1516239022,
  "exp": 1716239022
}`}
                                </pre>
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2">签名 (Signature)</h3>
                                <p className="text-sm text-muted-foreground">
                                    签名用于验证消息在传输过程中没有被更改，并且对于使用私钥进行签名的令牌，它还可以验证JWT的发送方是否为它所声称的发送方。
                                </p>
                                <pre className="bg-muted p-3 rounded-md mt-2 text-xs font-mono break-all">
                                    SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
                                </pre>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">常见声明</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="font-medium">iss (Issuer)</p>
                                    <p className="text-sm text-muted-foreground">令牌的发行者</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">sub (Subject)</p>
                                    <p className="text-sm text-muted-foreground">令牌的主题</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">aud (Audience)</p>
                                    <p className="text-sm text-muted-foreground">令牌的接收者</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">exp (Expiration Time)</p>
                                    <p className="text-sm text-muted-foreground">令牌的过期时间</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">nbf (Not Before)</p>
                                    <p className="text-sm text-muted-foreground">令牌生效的时间</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">iat (Issued At)</p>
                                    <p className="text-sm text-muted-foreground">令牌的发行时间</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="font-medium">jti (JWT ID)</p>
                                    <p className="text-sm text-muted-foreground">令牌的唯一标识符</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">使用场景</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>授权：这是使用JWT的最常见场景。一旦用户登录，每个后续请求将包括JWT，允许用户访问该令牌允许的路由、服务和资源。</li>
                                <li>信息交换：JWT是在各方之间安全传输信息的好方法，因为JWT可以被签名，所以你可以确定发送者是他们所说的人。</li>
                            </ul>
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-medium mb-2">安全注意事项</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>不要在JWT的载荷中存储敏感信息，因为它可以被解码。</li>
                                <li>使用HTTPS来防止中间人攻击。</li>
                                <li>设置合理的过期时间。</li>
                                <li>使用强密钥来签名你的JWT。</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}