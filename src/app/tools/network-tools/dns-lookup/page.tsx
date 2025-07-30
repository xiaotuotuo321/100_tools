'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
    Search,
    Server,
    Globe,
    Clock,
    RefreshCw,
    Copy,
    CheckCircle2,
    AlertTriangle,
    Loader2
} from 'lucide-react'

// DNS记录类型
type DNSRecordType = 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SOA' | 'SRV' | 'CAA' | 'PTR'

// DNS查询结果
interface DNSRecord {
    type: DNSRecordType
    name: string
    value: string
    ttl?: number
    priority?: number
}

// DNS查询历史
interface DNSQueryHistory {
    domain: string
    type: DNSRecordType
    timestamp: number
    recordCount: number
}

// 常见DNS服务器
const dnsServers = [
    { id: 'google', name: 'Google DNS', address: '8.8.8.8, 8.8.4.4' },
    { id: 'cloudflare', name: 'Cloudflare DNS', address: '1.1.1.1, 1.0.0.1' },
    { id: 'opendns', name: 'OpenDNS', address: '208.67.222.222, 208.67.220.220' },
    { id: 'quad9', name: 'Quad9', address: '9.9.9.9, 149.112.112.112' },
    { id: 'aliyun', name: '阿里云公共DNS', address: '223.5.5.5, 223.6.6.6' },
    { id: 'dnspod', name: 'DNSPod Public DNS', address: '119.29.29.29, 182.254.116.116' },
    { id: 'baidu', name: '百度公共DNS', address: '180.76.76.76' },
    { id: '114dns', name: '114 DNS', address: '114.114.114.114, 114.114.115.115' },
]

// 模拟DNS查询结果
const mockDNSResults: Record<DNSRecordType, (domain: string) => DNSRecord[]> = {
    'A': (domain) => [
        { type: 'A', name: domain, value: '192.0.2.' + Math.floor(Math.random() * 255), ttl: 3600 },
        { type: 'A', name: domain, value: '192.0.2.' + Math.floor(Math.random() * 255), ttl: 3600 }
    ],
    'AAAA': (domain) => [
        { type: 'AAAA', name: domain, value: '2001:db8::' + Math.floor(Math.random() * 9999).toString(16), ttl: 3600 }
    ],
    'CNAME': (domain) => [
        { type: 'CNAME', name: domain, value: `cdn.${domain.split('.').slice(-2).join('.')}`, ttl: 3600 }
    ],
    'MX': (domain) => [
        { type: 'MX', name: domain, value: `mail1.${domain}`, priority: 10, ttl: 3600 },
        { type: 'MX', name: domain, value: `mail2.${domain}`, priority: 20, ttl: 3600 }
    ],
    'TXT': (domain) => [
        { type: 'TXT', name: domain, value: `v=spf1 include:_spf.${domain} ~all`, ttl: 3600 },
        { type: 'TXT', name: `_dmarc.${domain}`, value: `v=DMARC1; p=none; rua=mailto:dmarc@${domain}`, ttl: 3600 }
    ],
    'NS': (domain) => [
        { type: 'NS', name: domain, value: `ns1.${domain.split('.').slice(-2).join('.')}`, ttl: 86400 },
        { type: 'NS', name: domain, value: `ns2.${domain.split('.').slice(-2).join('.')}`, ttl: 86400 }
    ],
    'SOA': (domain) => [
        {
            type: 'SOA',
            name: domain,
            value: `ns1.${domain.split('.').slice(-2).join('.')} hostmaster.${domain} ${Math.floor(Date.now() / 1000)} 10800 3600 604800 86400`,
            ttl: 86400
        }
    ],
    'SRV': (domain) => [
        { type: 'SRV', name: `_sip._tcp.${domain}`, value: `0 5 5060 sip.${domain}`, ttl: 3600 },
        { type: 'SRV', name: `_xmpp._tcp.${domain}`, value: `0 5 5222 xmpp.${domain}`, ttl: 3600 }
    ],
    'CAA': (domain) => [
        { type: 'CAA', name: domain, value: '0 issue "letsencrypt.org"', ttl: 3600 },
        { type: 'CAA', name: domain, value: '0 issuewild ";"', ttl: 3600 }
    ],
    'PTR': (domain) => [
        { type: 'PTR', name: domain, value: `host.${domain.split('.').reverse().join('.')}.in-addr.arpa`, ttl: 3600 }
    ]
}

export default function DNSLookupPage() {
    // 状态
    const [domain, setDomain] = useState('')
    const [recordType, setRecordType] = useState<DNSRecordType>('A')
    const [dnsServer, setDnsServer] = useState(dnsServers[0].id)
    const [results, setResults] = useState<DNSRecord[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [queryHistory, setQueryHistory] = useState<DNSQueryHistory[]>([])
    const [copiedValue, setCopiedValue] = useState<string | null>(null)

    const { toast } = useToast()

    // 验证域名
    const isValidDomain = (domain: string): boolean => {
        // 简单的域名验证
        return /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]+)?[a-zA-Z0-9](\.[a-zA-Z]{2,})+$/.test(domain)
    }

    // 验证IP地址（用于PTR查询）
    const isValidIP = (ip: string): boolean => {
        // IPv4验证
        return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip)
    }

    // 执行DNS查询
    const performDNSLookup = () => {
        if (!domain) {
            toast({
                title: '请输入域名',
                variant: 'destructive'
            })
            return
        }

        if (recordType === 'PTR') {
            if (!isValidIP(domain)) {
                toast({
                    title: '无效的IP地址',
                    description: 'PTR记录查询需要有效的IP地址',
                    variant: 'destructive'
                })
                return
            }
        } else {
            if (!isValidDomain(domain)) {
                toast({
                    title: '无效的域名',
                    description: '请输入有效的域名',
                    variant: 'destructive'
                })
                return
            }
        }

        setIsLoading(true)
        setResults([])

        // 模拟DNS查询延迟
        setTimeout(() => {
            // 获取模拟结果
            const mockResults = mockDNSResults[recordType](domain)

            setResults(mockResults)

            // 添加到查询历史
            setQueryHistory(prev => [
                {
                    domain,
                    type: recordType,
                    timestamp: Date.now(),
                    recordCount: mockResults.length
                },
                ...prev.slice(0, 9)
            ])

            setIsLoading(false)

            toast({
                title: 'DNS查询完成',
                description: `找到 ${mockResults.length} 条 ${recordType} 记录`
            })
        }, 1000)
    }

    // 清除历史记录
    const clearHistory = () => {
        setQueryHistory([])
        toast({
            title: '历史记录已清除'
        })
    }

    // 复制到剪贴板
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopiedValue(text)
            toast({
                title: '已复制到剪贴板',
                description: text
            })

            // 3秒后重置复制状态
            setTimeout(() => {
                setCopiedValue(null)
            }, 3000)
        })
    }

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // 格式化SOA记录
    const formatSOARecord = (value: string) => {
        const parts = value.split(' ')
        if (parts.length >= 7) {
            return (
                <div className="space-y-1">
                    <div>主域名服务器: {parts[0]}</div>
                    <div>管理员邮箱: {parts[1]}</div>
                    <div>序列号: {parts[2]}</div>
                    <div>刷新间隔: {parts[3]}秒</div>
                    <div>重试间隔: {parts[4]}秒</div>
                    <div>过期时间: {parts[5]}秒</div>
                    <div>最小TTL: {parts[6]}秒</div>
                </div>
            )
        }
        return value
    }

    // 格式化SRV记录
    const formatSRVRecord = (value: string) => {
        const parts = value.split(' ')
        if (parts.length >= 4) {
            return (
                <div className="space-y-1">
                    <div>优先级: {parts[0]}</div>
                    <div>权重: {parts[1]}</div>
                    <div>端口: {parts[2]}</div>
                    <div>目标: {parts[3]}</div>
                </div>
            )
        }
        return value
    }

    // 格式化CAA记录
    const formatCAARecord = (value: string) => {
        const parts = value.split(' ')
        if (parts.length >= 3) {
            return (
                <div className="space-y-1">
                    <div>标志: {parts[0]}</div>
                    <div>标签: {parts[1].replace(/"/g, '')}</div>
                    <div>值: {parts.slice(2).join(' ').replace(/"/g, '')}</div>
                </div>
            )
        }
        return value
    }

    // 根据记录类型格式化值
    const formatRecordValue = (record: DNSRecord) => {
        switch (record.type) {
            case 'SOA':
                return formatSOARecord(record.value)
            case 'SRV':
                return formatSRVRecord(record.value)
            case 'CAA':
                return formatCAARecord(record.value)
            default:
                return record.value
        }
    }

    // 获取记录类型描述
    const getRecordTypeDescription = (type: DNSRecordType) => {
        switch (type) {
            case 'A':
                return '将域名映射到IPv4地址'
            case 'AAAA':
                return '将域名映射到IPv6地址'
            case 'CNAME':
                return '域名别名'
            case 'MX':
                return '邮件交换记录'
            case 'TXT':
                return '文本记录，用于SPF、DKIM等'
            case 'NS':
                return '域名服务器记录'
            case 'SOA':
                return '权威记录的起始点'
            case 'SRV':
                return '服务定位记录'
            case 'CAA':
                return '证书颁发机构授权'
            case 'PTR':
                return '反向DNS查询（IP到域名）'
            default:
                return '未知记录类型'
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">DNS查询工具</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="md:col-span-2 space-y-2">
                                        <Label htmlFor="domain">域名或IP地址</Label>
                                        <Input
                                            id="domain"
                                            placeholder={recordType === 'PTR' ? '192.168.1.1' : 'example.com'}
                                            value={domain}
                                            onChange={(e) => setDomain(e.target.value)}
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="record-type">记录类型</Label>
                                        <Select
                                            value={recordType}
                                            onValueChange={(value) => setRecordType(value as DNSRecordType)}
                                            disabled={isLoading}
                                        >
                                            <SelectTrigger id="record-type">
                                                <SelectValue placeholder="选择记录类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="A">A</SelectItem>
                                                <SelectItem value="AAAA">AAAA</SelectItem>
                                                <SelectItem value="CNAME">CNAME</SelectItem>
                                                <SelectItem value="MX">MX</SelectItem>
                                                <SelectItem value="TXT">TXT</SelectItem>
                                                <SelectItem value="NS">NS</SelectItem>
                                                <SelectItem value="SOA">SOA</SelectItem>
                                                <SelectItem value="SRV">SRV</SelectItem>
                                                <SelectItem value="CAA">CAA</SelectItem>
                                                <SelectItem value="PTR">PTR</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="dns-server">DNS服务器</Label>
                                    <Select
                                        value={dnsServer}
                                        onValueChange={setDnsServer}
                                        disabled={isLoading}
                                    >
                                        <SelectTrigger id="dns-server">
                                            <SelectValue placeholder="选择DNS服务器" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {dnsServers.map((server) => (
                                                <SelectItem key={server.id} value={server.id}>
                                                    {server.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        当前服务器: {dnsServers.find(s => s.id === dnsServer)?.address}
                                    </p>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Button
                                        onClick={performDNSLookup}
                                        disabled={isLoading || !domain}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                查询中...
                                            </>
                                        ) : (
                                            <>
                                                <Search className="h-4 w-4 mr-2" />
                                                执行DNS查询
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-sm text-muted-foreground">
                                        {getRecordTypeDescription(recordType)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">查询结果</h2>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                    <p>正在查询DNS记录...</p>
                                </div>
                            ) : results.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Server className="h-8 w-8 mb-2" />
                                    <p>暂无查询结果</p>
                                    <p className="text-sm">输入域名并选择记录类型开始查询</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Badge variant="outline" className="mr-2">
                                                {domain}
                                            </Badge>
                                            <Badge variant="outline">
                                                {recordType} 记录
                                            </Badge>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            找到 {results.length} 条记录
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        {results.map((record, index) => (
                                            <div key={index} className="border rounded-md p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <Badge>{record.type}</Badge>
                                                        <span className="ml-2 font-medium">{record.name}</span>
                                                    </div>

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(record.value)}
                                                    >
                                                        {copiedValue === record.value ? (
                                                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                </div>

                                                <div className="bg-muted p-3 rounded-md text-sm font-mono break-all">
                                                    {formatRecordValue(record)}
                                                </div>

                                                <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                                                    <div className="flex items-center">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        TTL: {record.ttl} 秒
                                                    </div>

                                                    {record.priority !== undefined && (
                                                        <div>
                                                            优先级: {record.priority}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                                        注意：这是一个模拟的DNS查询工具，结果仅供演示。在实际应用中，应使用真实的DNS查询服务。
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">查询历史</h2>

                                {queryHistory.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearHistory}
                                    >
                                        <RefreshCw className="h-4 w-4 mr-2" />
                                        清除
                                    </Button>
                                )}
                            </div>

                            {queryHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    暂无查询历史
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {queryHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className="p-3 border rounded-md hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                setDomain(item.domain)
                                                setRecordType(item.type)
                                            }}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <div className="font-medium truncate">{item.domain}</div>
                                                <Badge variant="outline">{item.type}</Badge>
                                            </div>

                                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                <div>{formatTimestamp(item.timestamp)}</div>
                                                <div>{item.recordCount} 条记录</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">DNS记录类型</h2>

                            <Tabs defaultValue="common">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="common">常用记录</TabsTrigger>
                                    <TabsTrigger value="advanced">高级记录</TabsTrigger>
                                </TabsList>

                                <TabsContent value="common" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                        <div className="border-l-4 border-blue-500 pl-3">
                                            <div className="font-medium">A记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                将域名映射到IPv4地址，是最基本的DNS记录类型。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-blue-500 pl-3">
                                            <div className="font-medium">AAAA记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                将域名映射到IPv6地址，随着IPv6的普及而越来越重要。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-green-500 pl-3">
                                            <div className="font-medium">CNAME记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                创建域名别名，将一个域名指向另一个域名。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-purple-500 pl-3">
                                            <div className="font-medium">MX记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                邮件交换记录，指定负责接收特定域名邮件的服务器。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-yellow-500 pl-3">
                                            <div className="font-medium">TXT记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                文本记录，用于存储SPF、DKIM等验证信息或其他文本数据。
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-4 mt-4">
                                    <div className="space-y-3">
                                        <div className="border-l-4 border-orange-500 pl-3">
                                            <div className="font-medium">NS记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                域名服务器记录，指定域名由哪些DNS服务器进行解析。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-red-500 pl-3">
                                            <div className="font-medium">SOA记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                权威记录的起始点，包含域名的管理信息和DNS区域的参数。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-indigo-500 pl-3">
                                            <div className="font-medium">SRV记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                服务定位记录，用于指定特定服务的位置（主机名和端口）。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-pink-500 pl-3">
                                            <div className="font-medium">CAA记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                证书颁发机构授权记录，指定哪些CA可以为域名颁发SSL证书。
                                            </div>
                                        </div>

                                        <div className="border-l-4 border-teal-500 pl-3">
                                            <div className="font-medium">PTR记录</div>
                                            <div className="text-sm text-muted-foreground">
                                                反向DNS查询记录，将IP地址映射到域名。
                                            </div>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <h3 className="font-medium">DNS查询说明</h3>

                                <p className="text-sm text-muted-foreground">
                                    DNS（域名系统）是互联网的电话簿，将人类可读的域名（如example.com）转换为机器可读的IP地址。不同类型的DNS记录用于不同的目的，从基本的A记录到专门的SRV和CAA记录。
                                </p>

                                <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                    <Globe className="h-3 w-3 mr-1" />
                                    <span>DNS查询通常在几毫秒到几百毫秒内完成，并由全球分布的DNS服务器网络处理。</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}