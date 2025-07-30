'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Globe, MapPin, Info, Server, Shield, RefreshCw } from 'lucide-react'

// IP信息接口
interface IpInfo {
    ip: string
    version: string
    city: string
    region: string
    country: string
    country_code: string
    continent: string
    continent_code: string
    latitude: number
    longitude: number
    timezone: string
    utc_offset: string
    asn: {
        asn: string
        name: string
        domain: string
        route: string
        type: string
    }
    isp: string
    security: {
        vpn: boolean
        proxy: boolean
        tor: boolean
        relay: boolean
    }
}

export default function IpLookupPage() {
    // 状态
    const [ipAddress, setIpAddress] = useState('')
    const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('basic')
    const [error, setError] = useState<string | null>(null)
    const [searchHistory, setSearchHistory] = useState<string[]>([])

    const { toast } = useToast()

    // 查询IP信息
    const lookupIp = async (ip: string = ipAddress) => {
        if (!ip && !ipAddress) {
            toast({
                title: '请输入IP地址',
                description: '请输入有效的IPv4或IPv6地址进行查询',
                variant: 'destructive'
            })
            return
        }

        const targetIp = ip || ipAddress

        try {
            setIsLoading(true)
            setError(null)

            // 使用ipapi.co API
            const response = await fetch(`https://ipapi.co/${targetIp}/json/`)
            const data = await response.json()

            if (data.error) {
                throw new Error(data.reason || '查询失败')
            }

            // 转换为我们的格式
            const formattedData: IpInfo = {
                ip: data.ip,
                version: data.version || 'IPv4',
                city: data.city || '未知',
                region: data.region || '未知',
                country: data.country_name || '未知',
                country_code: data.country_code || '',
                continent: data.continent_name || '未知',
                continent_code: data.continent_code || '',
                latitude: data.latitude || 0,
                longitude: data.longitude || 0,
                timezone: data.timezone || '未知',
                utc_offset: data.utc_offset || '未知',
                asn: {
                    asn: data.asn || '未知',
                    name: data.org || '未知',
                    domain: data.org || '未知',
                    route: data.network || '未知',
                    type: '未知'
                },
                isp: data.org || '未知',
                security: {
                    vpn: false,
                    proxy: false,
                    tor: false,
                    relay: false
                }
            }

            setIpInfo(formattedData)

            // 添加到历史记录
            if (!searchHistory.includes(targetIp)) {
                setSearchHistory(prev => [targetIp, ...prev].slice(0, 10))
            }

            toast({
                title: '查询成功',
                description: `已获取 ${targetIp} 的信息`,
            })
        } catch (err) {
            console.error('IP查询错误:', err)
            setError(err instanceof Error ? err.message : '查询失败，请检查IP地址是否正确')
            toast({
                title: '查询失败',
                description: err instanceof Error ? err.message : '请检查IP地址是否正确',
                variant: 'destructive'
            })
        } finally {
            setIsLoading(false)
        }
    }

    // 查询当前IP
    const lookupCurrentIp = async () => {
        try {
            setIsLoading(true)
            setError(null)

            // 获取当前IP
            const response = await fetch('https://api.ipify.org?format=json')
            const data = await response.json()

            if (data.ip) {
                setIpAddress(data.ip)
                lookupIp(data.ip)
            } else {
                throw new Error('无法获取当前IP地址')
            }
        } catch (err) {
            console.error('获取当前IP错误:', err)
            setError(err instanceof Error ? err.message : '无法获取当前IP地址')
            toast({
                title: '获取当前IP失败',
                description: err instanceof Error ? err.message : '请稍后再试',
                variant: 'destructive'
            })
            setIsLoading(false)
        }
    }

    // 验证IP地址格式
    const isValidIp = (ip: string): boolean => {
        // IPv4正则表达式
        const ipv4Pattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/
        // IPv6正则表达式 (简化版)
        const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,7}:|^([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}$|^([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}$|^([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}$|^([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}$|^([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}$|^[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})$|^:((:[0-9a-fA-F]{1,4}){1,7}|:)$/

        // 检查IPv4
        if (ipv4Pattern.test(ip)) {
            const parts = ip.split('.').map(part => parseInt(part, 10))
            return parts.every(part => part >= 0 && part <= 255)
        }

        // 检查IPv6
        return ipv6Pattern.test(ip)
    }

    // 处理表单提交
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        if (!ipAddress) {
            toast({
                title: '请输入IP地址',
                variant: 'destructive'
            })
            return
        }

        if (!isValidIp(ipAddress)) {
            toast({
                title: 'IP地址格式无效',
                description: '请输入有效的IPv4或IPv6地址',
                variant: 'destructive'
            })
            return
        }

        lookupIp()
    }

    // 清除历史记录
    const clearHistory = () => {
        setSearchHistory([])
        toast({
            title: '历史记录已清除'
        })
    }

    // 格式化坐标
    const formatCoordinate = (coord: number): string => {
        return coord.toFixed(6)
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">IP地址查询</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ip-address">IP地址</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="ip-address"
                                            placeholder="输入IPv4或IPv6地址"
                                            value={ipAddress}
                                            onChange={(e) => setIpAddress(e.target.value)}
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                            查询
                                        </Button>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={lookupCurrentIp}
                                        disabled={isLoading}
                                    >
                                        查询我的IP
                                    </Button>

                                    <div className="text-sm text-muted-foreground">
                                        支持IPv4和IPv6地址
                                    </div>
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    {error && (
                        <Card className="mb-6 border-red-200">
                            <CardContent className="pt-6">
                                <div className="flex items-center text-red-500">
                                    <Info className="h-5 w-5 mr-2" />
                                    <span>{error}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {ipInfo && (
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">IP信息</h2>
                                    <Badge variant="outline">{ipInfo.version}</Badge>
                                </div>

                                <Tabs value={activeTab} onValueChange={setActiveTab}>
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="basic">基本信息</TabsTrigger>
                                        <TabsTrigger value="location">位置信息</TabsTrigger>
                                        <TabsTrigger value="network">网络信息</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">IP地址</div>
                                                <div className="font-mono bg-muted p-2 rounded-md">{ipInfo.ip}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">ISP提供商</div>
                                                <div className="bg-muted p-2 rounded-md">{ipInfo.isp}</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">位置</div>
                                            <div className="bg-muted p-2 rounded-md flex items-center">
                                                <Globe className="h-4 w-4 mr-2" />
                                                <span>
                                                    {ipInfo.city}, {ipInfo.region}, {ipInfo.country} ({ipInfo.country_code})
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">时区</div>
                                            <div className="bg-muted p-2 rounded-md">
                                                {ipInfo.timezone} (UTC{ipInfo.utc_offset})
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="location" className="space-y-4 mt-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">城市</div>
                                                <div className="bg-muted p-2 rounded-md">{ipInfo.city}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">地区/省份</div>
                                                <div className="bg-muted p-2 rounded-md">{ipInfo.region}</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">国家</div>
                                                <div className="bg-muted p-2 rounded-md">{ipInfo.country} ({ipInfo.country_code})</div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="text-sm font-medium">大洲</div>
                                                <div className="bg-muted p-2 rounded-md">{ipInfo.continent} ({ipInfo.continent_code})</div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">坐标</div>
                                            <div className="bg-muted p-2 rounded-md flex items-center">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                <span>
                                                    纬度: {formatCoordinate(ipInfo.latitude)}, 经度: {formatCoordinate(ipInfo.longitude)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                                            <div className="text-center">
                                                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                                <p className="text-sm text-muted-foreground">地图预览</p>
                                                <a
                                                    href={`https://www.google.com/maps?q=${ipInfo.latitude},${ipInfo.longitude}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-500 hover:underline mt-2 inline-block"
                                                >
                                                    在Google地图中查看
                                                </a>
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="network" className="space-y-4 mt-4">
                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">ASN信息</div>
                                            <div className="bg-muted p-2 rounded-md">
                                                <div className="flex justify-between">
                                                    <span>ASN</span>
                                                    <span className="font-mono">{ipInfo.asn.asn}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>名称</span>
                                                    <span>{ipInfo.asn.name}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>路由</span>
                                                    <span className="font-mono">{ipInfo.asn.route}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">ISP/组织</div>
                                            <div className="bg-muted p-2 rounded-md flex items-center">
                                                <Server className="h-4 w-4 mr-2" />
                                                <span>{ipInfo.isp}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <div className="text-sm font-medium">安全检查</div>
                                            <div className="bg-muted p-2 rounded-md">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex items-center">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        <span>VPN:</span>
                                                        <Badge variant={ipInfo.security.vpn ? "destructive" : "outline"} className="ml-2">
                                                            {ipInfo.security.vpn ? '是' : '否'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        <span>代理:</span>
                                                        <Badge variant={ipInfo.security.proxy ? "destructive" : "outline"} className="ml-2">
                                                            {ipInfo.security.proxy ? '是' : '否'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        <span>Tor:</span>
                                                        <Badge variant={ipInfo.security.tor ? "destructive" : "outline"} className="ml-2">
                                                            {ipInfo.security.tor ? '是' : '否'}
                                                        </Badge>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <Shield className="h-4 w-4 mr-2" />
                                                        <span>中继:</span>
                                                        <Badge variant={ipInfo.security.relay ? "destructive" : "outline"} className="ml-2">
                                                            {ipInfo.security.relay ? '是' : '否'}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">查询历史</h2>

                                {searchHistory.length > 0 && (
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

                            {searchHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    暂无查询历史
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {searchHistory.map((ip, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                                            onClick={() => {
                                                setIpAddress(ip)
                                                lookupIp(ip)
                                            }}
                                        >
                                            <span className="font-mono">{ip}</span>
                                            <Button variant="ghost" size="sm">
                                                查询
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <Separator className="my-4" />

                            <div className="space-y-4">
                                <h3 className="font-medium">常用IP地址</h3>

                                <div className="space-y-2">
                                    <div
                                        className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                            setIpAddress('8.8.8.8')
                                            lookupIp('8.8.8.8')
                                        }}
                                    >
                                        <div>
                                            <div className="font-mono">8.8.8.8</div>
                                            <div className="text-xs text-muted-foreground">Google DNS</div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            查询
                                        </Button>
                                    </div>

                                    <div
                                        className="flex items-center justify-between p-2 rounded-md border hover:bg-muted cursor-pointer"
                                        onClick={() => {
                                            setIpAddress('1.1.1.1')
                                            lookupIp('1.1.1.1')
                                        }}
                                    >
                                        <div>
                                            <div className="font-mono">1.1.1.1</div>
                                            <div className="text-xs text-muted-foreground">Cloudflare DNS</div>
                                        </div>
                                        <Button variant="ghost" size="sm">
                                            查询
                                        </Button>
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