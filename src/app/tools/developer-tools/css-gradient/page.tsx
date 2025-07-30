"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Copy, Check, Plus, Minus, RotateCw } from 'lucide-react'

interface ColorStop {
    color: string
    position: number
}

export default function CSSGradient() {
    const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'conic'>('linear')
    const [direction, setDirection] = useState('to right')
    const [colorStops, setColorStops] = useState<ColorStop[]>([
        { color: '#3b82f6', position: 0 },
        { color: '#8b5cf6', position: 100 }
    ])
    const [copied, setCopied] = useState(false)
    const [cssCode, setCssCode] = useState('')
    const [radialShape, setRadialShape] = useState('circle')
    const [radialPosition, setRadialPosition] = useState('center')
    const [conicAngle, setConicAngle] = useState(0)
    const [conicPosition, setConicPosition] = useState('center')

    // 生成CSS代码
    useEffect(() => {
        let gradient = ''
        const colorStopsString = colorStops
            .map(stop => `${stop.color} ${stop.position}%`)
            .join(', ')

        if (gradientType === 'linear') {
            gradient = `linear-gradient(${direction}, ${colorStopsString})`
        } else if (gradientType === 'radial') {
            gradient = `radial-gradient(${radialShape} at ${radialPosition}, ${colorStopsString})`
        } else if (gradientType === 'conic') {
            gradient = `conic-gradient(from ${conicAngle}deg at ${conicPosition}, ${colorStopsString})`
        }

        setCssCode(`background: ${gradient};`)
    }, [gradientType, direction, colorStops, radialShape, radialPosition, conicAngle, conicPosition])

    // 添加颜色节点
    const addColorStop = () => {
        if (colorStops.length < 10) {
            const lastStop = colorStops[colorStops.length - 1]
            const newPosition = Math.min(lastStop.position + 10, 100)
            setColorStops([...colorStops, { color: '#10b981', position: newPosition }])
        }
    }

    // 删除颜色节点
    const removeColorStop = (index: number) => {
        if (colorStops.length > 2) {
            const newStops = [...colorStops]
            newStops.splice(index, 1)
            setColorStops(newStops)
        }
    }

    // 更新颜色节点
    const updateColorStop = (index: number, field: 'color' | 'position', value: string | number) => {
        const newStops = [...colorStops]
        newStops[index] = { ...newStops[index], [field]: value }
        setColorStops(newStops)
    }

    // 复制CSS代码
    const copyToClipboard = () => {
        navigator.clipboard.writeText(cssCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // 随机生成渐变
    const generateRandomGradient = () => {
        const randomColor = () => {
            const letters = '0123456789ABCDEF'
            let color = '#'
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * 16)]
            }
            return color
        }

        const stopCount = Math.floor(Math.random() * 3) + 2 // 2-4个颜色节点
        const newStops: ColorStop[] = []

        for (let i = 0; i < stopCount; i++) {
            newStops.push({
                color: randomColor(),
                position: Math.round((i / (stopCount - 1)) * 100)
            })
        }

        setColorStops(newStops)

        // 随机选择渐变类型
        const types: ('linear' | 'radial' | 'conic')[] = ['linear', 'radial', 'conic']
        const randomType = types[Math.floor(Math.random() * types.length)]
        setGradientType(randomType)

        // 随机选择方向/位置
        if (randomType === 'linear') {
            const directions = ['to right', 'to left', 'to bottom', 'to top', 'to bottom right', 'to bottom left', 'to top right', 'to top left']
            setDirection(directions[Math.floor(Math.random() * directions.length)])
        } else if (randomType === 'radial') {
            const shapes = ['circle', 'ellipse']
            const positions = ['center', 'top left', 'top right', 'bottom left', 'bottom right', 'center top', 'center bottom']
            setRadialShape(shapes[Math.floor(Math.random() * shapes.length)])
            setRadialPosition(positions[Math.floor(Math.random() * positions.length)])
        } else if (randomType === 'conic') {
            const angle = Math.floor(Math.random() * 360)
            const positions = ['center', 'top left', 'top right', 'bottom left', 'bottom right']
            setConicAngle(angle)
            setConicPosition(positions[Math.floor(Math.random() * positions.length)])
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">CSS 渐变生成器</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="mb-6 overflow-hidden">
                        <div
                            className="h-64 w-full"
                            style={{ background: cssCode.replace('background: ', '') }}
                        />
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-lg font-medium">CSS 代码</div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={copyToClipboard}
                                    className="flex items-center gap-1"
                                >
                                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                    {copied ? '已复制' : '复制'}
                                </Button>
                            </div>
                            <div className="bg-muted p-4 rounded-md font-mono text-sm">
                                {cssCode}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardContent className="pt-6">
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-base">渐变类型</Label>
                                    <Tabs value={gradientType} onValueChange={(value) => setGradientType(value as 'linear' | 'radial' | 'conic')} className="mt-2">
                                        <TabsList className="grid grid-cols-3">
                                            <TabsTrigger value="linear">线性</TabsTrigger>
                                            <TabsTrigger value="radial">径向</TabsTrigger>
                                            <TabsTrigger value="conic">锥形</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                {gradientType === 'linear' && (
                                    <div>
                                        <Label htmlFor="direction">方向</Label>
                                        <Select value={direction} onValueChange={setDirection}>
                                            <SelectTrigger id="direction">
                                                <SelectValue placeholder="选择方向" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="to right">从左到右</SelectItem>
                                                <SelectItem value="to left">从右到左</SelectItem>
                                                <SelectItem value="to bottom">从上到下</SelectItem>
                                                <SelectItem value="to top">从下到上</SelectItem>
                                                <SelectItem value="to bottom right">左上到右下</SelectItem>
                                                <SelectItem value="to bottom left">右上到左下</SelectItem>
                                                <SelectItem value="to top right">左下到右上</SelectItem>
                                                <SelectItem value="to top left">右下到左上</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                {gradientType === 'radial' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="radial-shape">形状</Label>
                                            <Select value={radialShape} onValueChange={setRadialShape}>
                                                <SelectTrigger id="radial-shape">
                                                    <SelectValue placeholder="选择形状" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="circle">圆形</SelectItem>
                                                    <SelectItem value="ellipse">椭圆形</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label htmlFor="radial-position">位置</Label>
                                            <Select value={radialPosition} onValueChange={setRadialPosition}>
                                                <SelectTrigger id="radial-position">
                                                    <SelectValue placeholder="选择位置" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="center">中心</SelectItem>
                                                    <SelectItem value="top left">左上</SelectItem>
                                                    <SelectItem value="top right">右上</SelectItem>
                                                    <SelectItem value="bottom left">左下</SelectItem>
                                                    <SelectItem value="bottom right">右下</SelectItem>
                                                    <SelectItem value="center top">顶部中心</SelectItem>
                                                    <SelectItem value="center bottom">底部中心</SelectItem>
                                                    <SelectItem value="left center">左侧中心</SelectItem>
                                                    <SelectItem value="right center">右侧中心</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                {gradientType === 'conic' && (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="conic-angle">角度 ({conicAngle}°)</Label>
                                            <Slider
                                                id="conic-angle"
                                                min={0}
                                                max={360}
                                                step={1}
                                                value={[conicAngle]}
                                                onValueChange={(value) => setConicAngle(value[0])}
                                                className="mt-2"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="conic-position">位置</Label>
                                            <Select value={conicPosition} onValueChange={setConicPosition}>
                                                <SelectTrigger id="conic-position">
                                                    <SelectValue placeholder="选择位置" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="center">中心</SelectItem>
                                                    <SelectItem value="top left">左上</SelectItem>
                                                    <SelectItem value="top right">右上</SelectItem>
                                                    <SelectItem value="bottom left">左下</SelectItem>
                                                    <SelectItem value="bottom right">右下</SelectItem>
                                                    <SelectItem value="center top">顶部中心</SelectItem>
                                                    <SelectItem value="center bottom">底部中心</SelectItem>
                                                    <SelectItem value="left center">左侧中心</SelectItem>
                                                    <SelectItem value="right center">右侧中心</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <Label className="text-base">颜色节点</Label>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={addColorStop}
                                                disabled={colorStops.length >= 10}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={generateRandomGradient}
                                            >
                                                <RotateCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="space-y-4 mt-4">
                                        {colorStops.map((stop, index) => (
                                            <div key={index} className="grid grid-cols-[1fr,auto] gap-4">
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <div
                                                            className="w-6 h-6 rounded-full border"
                                                            style={{ backgroundColor: stop.color }}
                                                        />
                                                        <Input
                                                            type="color"
                                                            value={stop.color}
                                                            onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                                                            className="w-24 p-1 h-8"
                                                        />
                                                        <Input
                                                            type="text"
                                                            value={stop.color}
                                                            onChange={(e) => updateColorStop(index, 'color', e.target.value)}
                                                            className="flex-1"
                                                        />
                                                    </div>
                                                    <div>
                                                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                                                            <span>位置: {stop.position}%</span>
                                                        </div>
                                                        <Slider
                                                            min={0}
                                                            max={100}
                                                            step={1}
                                                            value={[stop.position]}
                                                            onValueChange={(value) => updateColorStop(index, 'position', value[0])}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeColorStop(index)}
                                                    disabled={colorStops.length <= 2}
                                                    className="self-center"
                                                >
                                                    <Minus className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">CSS 渐变说明</h2>
                    <p className="mb-4">
                        CSS 渐变允许你在两个或多个指定颜色之间显示平滑过渡。浏览器支持三种类型的渐变：
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">线性渐变</h3>
                            <div className="h-24 rounded-md mb-2" style={{ background: 'linear-gradient(to right, #3b82f6, #8b5cf6)' }} />
                            <p className="text-sm text-muted-foreground">
                                沿着直线方向变化，可以指定不同的方向，如从左到右、从上到下等。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">径向渐变</h3>
                            <div className="h-24 rounded-md mb-2" style={{ background: 'radial-gradient(circle, #3b82f6, #8b5cf6)' }} />
                            <p className="text-sm text-muted-foreground">
                                从中心点向外扩散，可以是圆形或椭圆形，并且可以指定中心点位置。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">锥形渐变</h3>
                            <div className="h-24 rounded-md mb-2" style={{ background: 'conic-gradient(from 0deg at center, #3b82f6, #8b5cf6)' }} />
                            <p className="text-sm text-muted-foreground">
                                围绕中心点旋转，类似于色轮，可以指定起始角度和中心点位置。
                            </p>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">使用提示</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>可以添加多个颜色节点来创建更复杂的渐变效果</li>
                            <li>调整颜色节点的位置可以控制颜色过渡的速度和分布</li>
                            <li>使用随机生成按钮可以快速创建意想不到的渐变效果</li>
                            <li>复制生成的CSS代码可以直接应用到你的项目中</li>
                            <li>尝试不同的渐变类型和方向，以获得最适合你设计的效果</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}