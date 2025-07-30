'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
    Download,
    Upload,
    Wifi,
    WifiOff,
    BarChart3,
    Clock,
    RefreshCw,
    AlertTriangle,
    Server,
    Loader2
} from 'lucide-react'

// 测速结果接口
interface SpeedTestResult {
    downloadSpeed: number // Mbps
    uploadSpeed: number // Mbps
    ping: number // ms
    jitter: number // ms
    timestamp: number
    server?: string
}

// 模拟测速服务器
const testServers = [
    { id: 'server1', name: '北京服务器', location: '中国, 北京', distance: '本地' },
    { id: 'server2', name: '上海服务器', location: '中国, 上海', distance: '1000km' },
    { id: 'server3', name: '广州服务器', location: '中国, 广州', distance: '1800km' },
    { id: 'server4', name: '香港服务器', location: '中国, 香港', distance: '2200km' },
    { id: 'server5', name: '东京服务器', location: '日本, 东京', distance: '2600km' },
    { id: 'server6', name: '新加坡服务器', location: '新加坡', distance: '4300km' },
    { id: 'server7', name: '洛杉矶服务器', location: '美国, 洛杉矶', distance: '10000km' },
]

export default function SpeedTestPage() {
    // 状态
    const [isTesting, setIsTesting] = useState(false)
    const [currentTest, setCurrentTest] = useState<'download' | 'upload' | 'ping' | null>(null)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState<SpeedTestResult | null>(null)
    const [testHistory, setTestHistory] = useState<SpeedTestResult[]>([])
    const [selectedServer, setSelectedServer] = useState(testServers[0])
    const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'checking'>('checking')

    const { toast } = useToast()
    const testIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // 检查网络连接状态
    useEffect(() => {
        const checkConnection = () => {
            setConnectionStatus(navigator.onLine ? 'online' : 'offline')
        }

        checkConnection()

        window.addEventListener('online', checkConnection)
        window.addEventListener('offline', checkConnection)

        return () => {
            window.removeEventListener('online', checkConnection)
            window.removeEventListener('offline', checkConnection)
        }
    }, [])

    // 模拟下载测速
    const simulateDownloadTest = () => {
        setCurrentTest('download')
        setProgress(0)

        let progressValue = 0
        const duration = 5000 // 5秒测试
        const interval = 100 // 每100毫秒更新一次
        const steps = duration / interval

        testIntervalRef.current = setInterval(() => {
            progressValue += (100 / steps)
            setProgress(Math.min(Math.round(progressValue), 100))

            if (progressValue >= 100) {
                clearInterval(testIntervalRef.current as NodeJS.Timeout)
                // 模拟下载速度 (5-200 Mbps)
                const downloadSpeed = Math.round((5 + Math.random() * 195) * 10) / 10

                setResult(prev => ({
                    ...(prev || {
                        downloadSpeed: 0,
                        uploadSpeed: 0,
                        ping: 0,
                        jitter: 0,
                        timestamp: Date.now(),
                        server: selectedServer.name
                    }),
                    downloadSpeed,
                    timestamp: Date.now(),
                    server: selectedServer.name
                }))

                // 开始上传测试
                simulateUploadTest()
            }
        }, interval)
    }

    // 模拟上传测速
    const simulateUploadTest = () => {
        setCurrentTest('upload')
        setProgress(0)

        let progressValue = 0
        const duration = 5000 // 5秒测试
        const interval = 100 // 每100毫秒更新一次
        const steps = duration / interval

        testIntervalRef.current = setInterval(() => {
            progressValue += (100 / steps)
            setProgress(Math.min(Math.round(progressValue), 100))

            if (progressValue >= 100) {
                clearInterval(testIntervalRef.current as NodeJS.Timeout)
                // 模拟上传速度 (通常比下载慢一些, 1-100 Mbps)
                const uploadSpeed = Math.round((1 + Math.random() * 99) * 10) / 10

                setResult(prev => ({
                    ...(prev as SpeedTestResult),
                    uploadSpeed,
                }))

                // 开始延迟测试
                simulatePingTest()
            }
        }, interval)
    }

    // 模拟延迟测试
    const simulatePingTest = () => {
        setCurrentTest('ping')
        setProgress(0)

        let progressValue = 0
        const duration = 3000 // 3秒测试
        const interval = 100 // 每100毫秒更新一次
        const steps = duration / interval

        testIntervalRef.current = setInterval(() => {
            progressValue += (100 / steps)
            setProgress(Math.min(Math.round(progressValue), 100))

            if (progressValue >= 100) {
                clearInterval(testIntervalRef.current as NodeJS.Timeout)
                // 模拟延迟 (10-200ms)
                const ping = Math.round(10 + Math.random() * 190)
                // 模拟抖动 (1-20ms)
                const jitter = Math.round(1 + Math.random() * 19)

                const finalResult = {
                    ...(result as SpeedTestResult),
                    ping,
                    jitter,
                }

                setResult(finalResult)
                setTestHistory(prev => [finalResult, ...prev.slice(0, 9)])
                setIsTesting(false)
                setCurrentTest(null)

                toast({
                    title: '测速完成',
                    description: `下载: ${finalResult.downloadSpeed} Mbps, 上传: ${finalResult.uploadSpeed} Mbps, 延迟: ${finalResult.ping} ms`
                })
            }
        }, interval)
    }

    // 开始测速
    const startTest = () => {
        if (connectionStatus === 'offline') {
            toast({
                title: '网络连接错误',
                description: '请检查您的网络连接后重试',
                variant: 'destructive'
            })
            return
        }

        setIsTesting(true)
        setResult(null)

        toast({
            title: '开始测速',
            description: `正在连接到${selectedServer.name}...`
        })

        // 延迟一下，模拟连接到服务器
        setTimeout(() => {
            simulateDownloadTest()
        }, 1000)
    }

    // 停止测速
    const stopTest = () => {
        if (testIntervalRef.current) {
            clearInterval(testIntervalRef.current)
        }

        setIsTesting(false)
        setCurrentTest(null)
        setProgress(0)

        toast({
            title: '测速已取消',
            description: '您已取消网络测速'
        })
    }

    // 清除历史记录
    const clearHistory = () => {
        setTestHistory([])
        toast({
            title: '历史记录已清除'
        })
    }

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // 获取速度等级
    const getSpeedRating = (speed: number, type: 'download' | 'upload') => {
        if (type === 'download') {
            if (speed >= 100) return { label: '极快', color: 'bg-green-500' }
            if (speed >= 50) return { label: '很快', color: 'bg-green-400' }
            if (speed >= 25) return { label: '快速', color: 'bg-green-300' }
            if (speed >= 10) return { label: '良好', color: 'bg-yellow-400' }
            if (speed >= 5) return { label: '一般', color: 'bg-yellow-500' }
            return { label: '较慢', color: 'bg-red-500' }
        } else {
            if (speed >= 50) return { label: '极快', color: 'bg-green-500' }
            if (speed >= 25) return { label: '很快', color: 'bg-green-400' }
            if (speed >= 10) return { label: '快速', color: 'bg-green-300' }
            if (speed >= 5) return { label: '良好', color: 'bg-yellow-400' }
            if (speed >= 2) return { label: '一般', color: 'bg-yellow-500' }
            return { label: '较慢', color: 'bg-red-500' }
        }
    }

    // 获取延迟等级
    const getPingRating = (ping: number) => {
        if (ping < 20) return { label: '极佳', color: 'bg-green-500' }
        if (ping < 50) return { label: '很好', color: 'bg-green-400' }
        if (ping < 100) return { label: '良好', color: 'bg-yellow-400' }
        if (ping < 150) return { label: '一般', color: 'bg-yellow-500' }
        return { label: '较高', color: 'bg-red-500' }
    }

    // 获取当前测试状态文本
    const getTestStatusText = () => {
        switch (currentTest) {
            case 'download':
                return '测试下载速度...'
            case 'upload':
                return '测试上传速度...'
            case 'ping':
                return '测试网络延迟...'
            default:
                return '准备测速...'
        }
    }

    // 获取连接状态图标
    const getConnectionIcon = () => {
        switch (connectionStatus) {
            case 'online':
                return <Wifi className="h-4 w-4 text-green-500" />
            case 'offline':
                return <WifiOff className="h-4 w-4 text-red-500" />
            case 'checking':
                return <Loader2 className="h-4 w-4 animate-spin" />
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">网络测速</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center space-x-2">
                                    {getConnectionIcon()}
                                    <span>
                                        {connectionStatus === 'online' ? '网络已连接' :
                                            connectionStatus === 'offline' ? '网络已断开' : '检查网络中...'}
                                    </span>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Server className="h-4 w-4" />
                                    <span>服务器: {selectedServer.name}</span>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center py-8">
                                {!isTesting && !result ? (
                                    <div className="text-center space-y-6">
                                        <div className="inline-flex h-32 w-32 items-center justify-center rounded-full border-4 border-muted">
                                            <Wifi className="h-16 w-16 text-muted-foreground" />
                                        </div>

                                        <div>
                                            <Button
                                                size="lg"
                                                onClick={startTest}
                                                disabled={connectionStatus === 'offline'}
                                            >
                                                开始测速
                                            </Button>
                                        </div>

                                        <p className="text-sm text-muted-foreground">
                                            点击按钮开始测试您的网络速度和延迟
                                        </p>
                                    </div>
                                ) : isTesting ? (
                                    <div className="text-center space-y-6 w-full max-w-md">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{getTestStatusText()}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <Progress value={progress} className="h-2" />
                                        </div>

                                        <div className="flex items-center justify-center">
                                            {currentTest === 'download' && (
                                                <Download className="h-16 w-16 animate-pulse text-blue-500" />
                                            )}
                                            {currentTest === 'upload' && (
                                                <Upload className="h-16 w-16 animate-pulse text-green-500" />
                                            )}
                                            {currentTest === 'ping' && (
                                                <Clock className="h-16 w-16 animate-pulse text-yellow-500" />
                                            )}
                                        </div>

                                        <Button
                                            variant="destructive"
                                            onClick={stopTest}
                                        >
                                            取消测速
                                        </Button>
                                    </div>
                                ) : result ? (
                                    <div className="w-full max-w-md">
                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div className="flex flex-col items-center p-4 border rounded-lg">
                                                <Download className="h-8 w-8 text-blue-500 mb-2" />
                                                <div className="text-2xl font-bold">{result.downloadSpeed}</div>
                                                <div className="text-xs text-muted-foreground">Mbps 下载</div>
                                                <div className={`mt-2 px-2 py-1 text-xs text-white rounded-full ${getSpeedRating(result.downloadSpeed, 'download').color}`}>
                                                    {getSpeedRating(result.downloadSpeed, 'download').label}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center p-4 border rounded-lg">
                                                <Upload className="h-8 w-8 text-green-500 mb-2" />
                                                <div className="text-2xl font-bold">{result.uploadSpeed}</div>
                                                <div className="text-xs text-muted-foreground">Mbps 上传</div>
                                                <div className={`mt-2 px-2 py-1 text-xs text-white rounded-full ${getSpeedRating(result.uploadSpeed, 'upload').color}`}>
                                                    {getSpeedRating(result.uploadSpeed, 'upload').label}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center p-4 border rounded-lg">
                                                <Clock className="h-8 w-8 text-yellow-500 mb-2" />
                                                <div className="text-2xl font-bold">{result.ping}</div>
                                                <div className="text-xs text-muted-foreground">ms 延迟</div>
                                                <div className={`mt-2 px-2 py-1 text-xs text-white rounded-full ${getPingRating(result.ping).color}`}>
                                                    {getPingRating(result.ping).label}
                                                </div>
                                            </div>

                                            <div className="flex flex-col items-center p-4 border rounded-lg">
                                                <BarChart3 className="h-8 w-8 text-purple-500 mb-2" />
                                                <div className="text-2xl font-bold">{result.jitter}</div>
                                                <div className="text-xs text-muted-foreground">ms 抖动</div>
                                            </div>
                                        </div>

                                        <div className="flex justify-center">
                                            <Button onClick={startTest}>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                重新测速
                                            </Button>
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">测速服务器</h2>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {testServers.map((server) => (
                                    <div
                                        key={server.id}
                                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedServer.id === server.id ? 'border-primary bg-muted' : 'hover:bg-muted'
                                            }`}
                                        onClick={() => setSelectedServer(server)}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="font-medium">{server.name}</div>
                                                <div className="text-xs text-muted-foreground">{server.location}</div>
                                            </div>
                                            <Badge variant="outline">{server.distance}</Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 text-xs text-muted-foreground">
                                <AlertTriangle className="h-3 w-3 inline-block mr-1" />
                                注意：这是一个模拟的网络测速工具，结果仅供演示。在实际应用中，应使用真实的测速服务器。
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">测速历史</h2>

                                {testHistory.length > 0 && (
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

                            {testHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    暂无测速历史
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {testHistory.map((item, index) => (
                                        <div key={index} className="p-3 border rounded-lg">
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="font-medium">{item.server}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {formatTimestamp(item.timestamp)}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 text-sm">
                                                <div className="flex items-center">
                                                    <Download className="h-3 w-3 mr-1 text-blue-500" />
                                                    <span>{item.downloadSpeed} Mbps</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Upload className="h-3 w-3 mr-1 text-green-500" />
                                                    <span>{item.uploadSpeed} Mbps</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                                                    <span>{item.ping} ms</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">网速参考</h2>

                            <Tabs defaultValue="download">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="download">下载速度</TabsTrigger>
                                    <TabsTrigger value="ping">网络延迟</TabsTrigger>
                                </TabsList>

                                <TabsContent value="download" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span>100+ Mbps</span>
                                            </div>
                                            <span className="text-sm">极快 (4K视频, 大型下载)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                                                <span>50-100 Mbps</span>
                                            </div>
                                            <span className="text-sm">很快 (多设备HD流媒体)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-300 mr-2"></div>
                                                <span>25-50 Mbps</span>
                                            </div>
                                            <span className="text-sm">快速 (HD流媒体)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                                                <span>10-25 Mbps</span>
                                            </div>
                                            <span className="text-sm">良好 (SD流媒体)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span>5-10 Mbps</span>
                                            </div>
                                            <span className="text-sm">一般 (基本网页浏览)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <span>&lt; 5 Mbps</span>
                                            </div>
                                            <span className="text-sm">较慢 (基本使用)</span>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="ping" className="space-y-4 mt-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                                                <span>&lt; 20 ms</span>
                                            </div>
                                            <span className="text-sm">极佳 (专业游戏)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
                                                <span>20-50 ms</span>
                                            </div>
                                            <span className="text-sm">很好 (在线游戏)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                                                <span>50-100 ms</span>
                                            </div>
                                            <span className="text-sm">良好 (视频通话)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                                                <span>100-150 ms</span>
                                            </div>
                                            <span className="text-sm">一般 (网页浏览)</span>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center">
                                                <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                                                <span>&gt; 150 ms</span>
                                            </div>
                                            <span className="text-sm">较高 (可能有延迟)</span>
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <h3 className="font-medium">网络测速说明</h3>

                                <p className="text-sm text-muted-foreground">
                                    网络测速通过测量数据传输速率和响应时间来评估您的互联网连接质量。下载速度影响您接收数据的速率，上传速度影响您发送数据的速率，而延迟则影响您的连接响应速度。
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}