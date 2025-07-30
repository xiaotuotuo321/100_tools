'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Server, Network, AlertTriangle, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react'

// 端口状态类型
type PortStatus = 'open' | 'closed' | 'timeout' | 'error'

// 端口扫描结果
interface PortResult {
    port: number
    status: PortStatus
    service?: string
    responseTime?: number
}

// 常见端口服务映射
const commonPorts: Record<number, string> = {
    20: 'FTP Data',
    21: 'FTP Control',
    22: 'SSH',
    23: 'Telnet',
    25: 'SMTP',
    53: 'DNS',
    80: 'HTTP',
    110: 'POP3',
    143: 'IMAP',
    443: 'HTTPS',
    465: 'SMTPS',
    587: 'SMTP (MSA)',
    993: 'IMAPS',
    995: 'POP3S',
    1433: 'MSSQL',
    1521: 'Oracle DB',
    3306: 'MySQL',
    3389: 'RDP',
    5432: 'PostgreSQL',
    5900: 'VNC',
    6379: 'Redis',
    8080: 'HTTP Proxy',
    8443: 'HTTPS Alt',
    27017: 'MongoDB'
}

// 预设端口组
const portPresets = {
    common: [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 3389, 8080],
    web: [80, 443, 8080, 8443, 8000, 8888],
    mail: [25, 110, 143, 465, 587, 993, 995],
    database: [1433, 1521, 3306, 5432, 6379, 27017],
    custom: [] as number[]
}

export default function PortScannerPage() {
    // 状态
    const [host, setHost] = useState('')
    const [portRange, setPortRange] = useState('1-1000')
    const [scanResults, setScanResults] = useState<PortResult[]>([])
    const [isScanning, setIsScanning] = useState(false)
    const [progress, setProgress] = useState(0)
    const [activePreset, setActivePreset] = useState<keyof typeof portPresets>('common')
    const [customPorts, setCustomPorts] = useState('')
    const [scanTimeout, setScanTimeout] = useState(2000)
    const [showOnlyOpen, setShowOnlyOpen] = useState(false)
    const [scanHistory, setScanHistory] = useState<{ host: string, timestamp: number, openPorts: number }[]>([])

    const { toast } = useToast()

    // 解析端口范围
    const parsePortRange = (range: string): number[] => {
        if (activePreset !== 'custom') {
            return portPresets[activePreset]
        }

        const ports: number[] = []

        // 处理自定义端口列表
        if (customPorts) {
            const customPortList = customPorts.split(',').map(p => p.trim())

            for (const portItem of customPortList) {
                if (portItem.includes('-')) {
                    // 处理范围 (例如 "80-100")
                    const [start, end] = portItem.split('-').map(Number)
                    if (!isNaN(start) && !isNaN(end) && start <= end) {
                        for (let i = start; i <= end; i++) {
                            if (i > 0 && i <= 65535 && !ports.includes(i)) {
                                ports.push(i)
                            }
                        }
                    }
                } else {
                    // 处理单个端口
                    const port = Number(portItem)
                    if (!isNaN(port) && port > 0 && port <= 65535 && !ports.includes(port)) {
                        ports.push(port)
                    }
                }
            }

            return ports
        }

        // 处理默认范围
        const parts = range.split('-')
        if (parts.length === 2) {
            const start = parseInt(parts[0], 10)
            const end = parseInt(parts[1], 10)

            if (!isNaN(start) && !isNaN(end) && start <= end) {
                for (let i = start; i <= end; i++) {
                    if (i > 0 && i <= 65535) {
                        ports.push(i)
                    }
                }
            }
        } else if (parts.length === 1) {
            const port = parseInt(parts[0], 10)
            if (!isNaN(port) && port > 0 && port <= 65535) {
                ports.push(port)
            }
        }

        return ports
    }

    // 验证主机名/IP
    const isValidHost = (host: string): boolean => {
        // 简单的主机名/IP验证
        return /^[a-zA-Z0-9]([a-zA-Z0-9\-\.]+)?[a-zA-Z0-9](\.[a-zA-Z]{2,})+$|^(\d{1,3}\.){3}\d{1,3}$/.test(host)
    }

    // 扫描单个端口
    const scanPort = async (host: string, port: number): Promise<PortResult> => {
        const startTime = Date.now()

        try {
            // 注意：这里我们使用一个模拟的端口扫描，因为浏览器环境中无法直接进行端口扫描
            // 在实际应用中，这应该通过后端API来实现

            // 模拟扫描延迟
            await new Promise(resolve => setTimeout(resolve, Math.random() * 500))

            // 模拟结果 (随机生成开放/关闭状态)
            // 在真实应用中，这里应该是实际的扫描结果
            const isOpen = Math.random() > 0.8 || commonPorts[port] !== undefined
            const responseTime = Date.now() - startTime

            if (isOpen) {
                return {
                    port,
                    status: 'open',
                    service: commonPorts[port] || '未知服务',
                    responseTime
                }
            } else {
                return {
                    port,
                    status: 'closed'
                }
            }
        } catch (error) {
            // 超时处理
            if (Date.now() - startTime >= scanTimeout) {
                return {
                    port,
                    status: 'timeout'
                }
            }

            return {
                port,
                status: 'error'
            }
        }
    }

    // 开始扫描
    const startScan = async () => {
        if (!host) {
            toast({
                title: '请输入主机名或IP地址',
                variant: 'destructive'
            })
            return
        }

        if (!isValidHost(host)) {
            toast({
                title: '无效的主机名或IP地址',
                description: '请输入有效的域名或IP地址',
                variant: 'destructive'
            })
            return
        }

        const ports = parsePortRange(portRange)

        if (ports.length === 0) {
            toast({
                title: '无效的端口范围',
                description: '请输入有效的端口或端口范围',
                variant: 'destructive'
            })
            return
        }

        if (ports.length > 1000) {
            toast({
                title: '端口范围过大',
                description: '为了避免过度负载，请将扫描限制在1000个端口以内',
                variant: 'destructive'
            })
            return
        }

        setIsScanning(true)
        setScanResults([])
        setProgress(0)

        toast({
            title: '开始扫描',
            description: `正在扫描 ${host} 的 ${ports.length} 个端口...`
        })

        const results: PortResult[] = []
        let completedScans = 0

        // 并发扫描端口 (限制并发数)
        const concurrencyLimit = 10
        const chunks = []

        for (let i = 0; i < ports.length; i += concurrencyLimit) {
            chunks.push(ports.slice(i, i + concurrencyLimit))
        }

        for (const chunk of chunks) {
            const chunkPromises = chunk.map(port => {
                return scanPort(host, port).then(result => {
                    results.push(result)
                    completedScans++
                    setProgress(Math.floor((completedScans / ports.length) * 100))
                    return result
                })
            })

            await Promise.all(chunkPromises)
        }

        // 按端口号排序
        results.sort((a, b) => a.port - b.port)
        setScanResults(results)

        // 添加到历史记录
        const openPortsCount = results.filter(r => r.status === 'open').length
        setScanHistory(prev => [
            { host, timestamp: Date.now(), openPorts: openPortsCount },
            ...prev.slice(0, 9)
        ])

        setIsScanning(false)

        toast({
            title: '扫描完成',
            description: `发现 ${openPortsCount} 个开放端口`
        })
    }

    // 停止扫描
    const stopScan = () => {
        setIsScanning(false)
        toast({
            title: '扫描已停止',
            description: '端口扫描已被用户中断'
        })
    }

    // 清除历史记录
    const clearHistory = () => {
        setScanHistory([])
        toast({
            title: '历史记录已清除'
        })
    }

    // 处理预设选择
    const handlePresetChange = (value: string) => {
        setActivePreset(value as keyof typeof portPresets)

        if (value === 'custom') {
            setCustomPorts(portRange)
        } else {
            setPortRange(`${portPresets[value as keyof typeof portPresets].join(', ')}`)
        }
    }

    // 获取端口状态图标
    const getStatusIcon = (status: PortStatus) => {
        switch (status) {
            case 'open':
                return <CheckCircle className="h-4 w-4 text-green-500" />
            case 'closed':
                return <XCircle className="h-4 w-4 text-gray-400" />
            case 'timeout':
                return <Clock className="h-4 w-4 text-yellow-500" />
            case 'error':
                return <AlertTriangle className="h-4 w-4 text-red-500" />
        }
    }

    // 获取端口状态文本
    const getStatusText = (status: PortStatus) => {
        switch (status) {
            case 'open':
                return '开放'
            case 'closed':
                return '关闭'
            case 'timeout':
                return '超时'
            case 'error':
                return '错误'
        }
    }

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // 过滤结果
    const filteredResults = showOnlyOpen
        ? scanResults.filter(result => result.status === 'open')
        : scanResults

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">端口扫描器</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="host">主机名或IP地址</Label>
                                    <Input
                                        id="host"
                                        placeholder="example.com 或 192.168.1.1"
                                        value={host}
                                        onChange={(e) => setHost(e.target.value)}
                                        disabled={isScanning}
                                    />
                                </div>

                                <Tabs value={activePreset} onValueChange={handlePresetChange}>
                                    <TabsList className="grid w-full grid-cols-5">
                                        <TabsTrigger value="common">常用端口</TabsTrigger>
                                        <TabsTrigger value="web">Web服务</TabsTrigger>
                                        <TabsTrigger value="mail">邮件服务</TabsTrigger>
                                        <TabsTrigger value="database">数据库</TabsTrigger>
                                        <TabsTrigger value="custom">自定义</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="custom" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="custom-ports">自定义端口</Label>
                                            <Input
                                                id="custom-ports"
                                                placeholder="80, 443, 8080, 1000-2000"
                                                value={customPorts}
                                                onChange={(e) => setCustomPorts(e.target.value)}
                                                disabled={isScanning}
                                            />
                                            <p className="text-xs text-muted-foreground">
                                                输入单个端口 (80)、多个端口 (80, 443) 或端口范围 (1000-2000)
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="common" className="mt-4">
                                        <div className="p-4 bg-muted rounded-md">
                                            <p className="text-sm">
                                                扫描常用服务端口: {portPresets.common.join(', ')}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="web" className="mt-4">
                                        <div className="p-4 bg-muted rounded-md">
                                            <p className="text-sm">
                                                扫描Web服务端口: {portPresets.web.join(', ')}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="mail" className="mt-4">
                                        <div className="p-4 bg-muted rounded-md">
                                            <p className="text-sm">
                                                扫描邮件服务端口: {portPresets.mail.join(', ')}
                                            </p>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="database" className="mt-4">
                                        <div className="p-4 bg-muted rounded-md">
                                            <p className="text-sm">
                                                扫描数据库端口: {portPresets.database.join(', ')}
                                            </p>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Label htmlFor="scan-timeout">扫描超时 (毫秒)</Label>
                                        <Input
                                            id="scan-timeout"
                                            type="number"
                                            min="500"
                                            max="10000"
                                            step="500"
                                            value={scanTimeout}
                                            onChange={(e) => setScanTimeout(Number(e.target.value))}
                                            disabled={isScanning}
                                            className="w-24"
                                        />
                                    </div>

                                    <Button
                                        onClick={isScanning ? stopScan : startScan}
                                        disabled={!host}
                                        variant={isScanning ? "destructive" : "default"}
                                    >
                                        {isScanning ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                停止扫描
                                            </>
                                        ) : (
                                            <>
                                                <Network className="h-4 w-4 mr-2" />
                                                开始扫描
                                            </>
                                        )}
                                    </Button>
                                </div>

                                {isScanning && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs">
                                            <span>扫描进度</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <Progress value={progress} className="h-2" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">扫描结果</h2>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show-open"
                                        checked={showOnlyOpen}
                                        onCheckedChange={setShowOnlyOpen}
                                    />
                                    <Label htmlFor="show-open">只显示开放端口</Label>
                                </div>
                            </div>

                            {filteredResults.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {isScanning ? (
                                        <div className="flex flex-col items-center">
                                            <Loader2 className="h-8 w-8 animate-spin mb-2" />
                                            <p>正在扫描端口...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <Server className="h-8 w-8 mb-2 text-muted-foreground" />
                                            <p>暂无扫描结果</p>
                                            <p className="text-sm">输入主机名或IP地址并开始扫描</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <Badge variant="outline" className="mr-2">
                                                主机: {host}
                                            </Badge>
                                            <Badge variant="outline">
                                                开放端口: {scanResults.filter(r => r.status === 'open').length}/{scanResults.length}
                                            </Badge>
                                        </div>

                                        <Button variant="ghost" size="sm" onClick={() => setScanResults([])}>
                                            清除结果
                                        </Button>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <table className="w-full">
                                            <thead className="bg-muted">
                                                <tr>
                                                    <th className="text-left p-2">端口</th>
                                                    <th className="text-left p-2">状态</th>
                                                    <th className="text-left p-2">服务</th>
                                                    <th className="text-left p-2">响应时间</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {filteredResults.map((result) => (
                                                    <tr key={result.port} className="border-t">
                                                        <td className="p-2 font-mono">{result.port}</td>
                                                        <td className="p-2">
                                                            <div className="flex items-center">
                                                                {getStatusIcon(result.status)}
                                                                <span className="ml-2">{getStatusText(result.status)}</span>
                                                            </div>
                                                        </td>
                                                        <td className="p-2">{result.service || '-'}</td>
                                                        <td className="p-2">{result.responseTime ? `${result.responseTime}ms` : '-'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="text-xs text-muted-foreground">
                                        <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                                        注意：这是一个模拟的端口扫描器，结果仅供演示。在实际应用中，应通过后端API进行真实的端口扫描。
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
                                <h2 className="text-xl font-semibold">扫描历史</h2>

                                {scanHistory.length > 0 && (
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

                            {scanHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    暂无扫描历史
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {scanHistory.map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                setHost(item.host)
                                                if (activePreset === 'custom') {
                                                    handlePresetChange('common')
                                                }
                                            }}
                                        >
                                            <div>
                                                <div className="font-medium">{item.host}</div>
                                                <div className="text-xs text-muted-foreground flex items-center">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {formatTimestamp(item.timestamp)}
                                                </div>
                                            </div>
                                            <Badge>
                                                {item.openPorts} 个开放端口
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">常见端口服务</h2>

                            <div className="space-y-4">
                                <div className="border rounded-md overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="text-left p-2">端口</th>
                                                <th className="text-left p-2">服务</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.entries(commonPorts).slice(0, 10).map(([port, service]) => (
                                                <tr key={port} className="border-t">
                                                    <td className="p-2 font-mono">{port}</td>
                                                    <td className="p-2">{service}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <Separator />

                                <div className="space-y-2">
                                    <h3 className="font-medium">端口扫描说明</h3>

                                    <p className="text-sm text-muted-foreground">
                                        端口扫描是一种网络安全技术，用于检查主机上开放的端口。开放的端口可能表示正在运行的服务，这些服务可能存在安全风险。
                                    </p>

                                    <div className="text-xs text-muted-foreground mt-2">
                                        <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                                        警告：未经授权对他人系统进行端口扫描可能违反法律法规。请仅在获得授权的系统上使用此工具。
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}