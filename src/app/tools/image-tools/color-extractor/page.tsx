"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Image as ImageIcon, X, Pipette, Copy, Check } from 'lucide-react'

// 颜色类型定义
interface Color {
    hex: string
    rgb: string
    hsl: string
    count: number
    percentage: number
}

export default function ColorExtractor() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [colors, setColors] = useState<Color[]>([])
    const [maxColors, setMaxColors] = useState<number>(8)
    const [quality, setQuality] = useState<number>(10) // 1-30, 越小越精确但越慢
    const [activeTab, setActiveTab] = useState<string>("image")
    const [copied, setCopied] = useState<string | null>(null)
    const [hoveredColor, setHoveredColor] = useState<string | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 处理文件选择
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 检查是否为图片文件
        if (!file.type.startsWith('image/')) {
            alert('请选择有效的图片文件')
            return
        }

        setSelectedFile(file)
        setColors([])

        // 创建预览URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)
    }

    // 从图片中提取颜色
    const extractColors = useCallback(() => {
        if (!previewUrl || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            // 设置canvas尺寸
            canvas.width = img.width
            canvas.height = img.height

            // 绘制图片到canvas
            ctx.drawImage(img, 0, 0)

            // 获取图片数据
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
            const pixels = imageData.data

            // 颜色映射，用于统计颜色出现次数
            const colorMap: Record<string, { count: number, r: number, g: number, b: number }> = {}
            const totalPixels = canvas.width * canvas.height

            // 遍历像素，每隔quality个像素采样一次，减少计算量
            for (let i = 0; i < pixels.length; i += 4 * quality) {
                const r = pixels[i]
                const g = pixels[i + 1]
                const b = pixels[i + 2]
                const a = pixels[i + 3]

                // 忽略透明像素
                if (a < 128) continue

                // 将RGB值量化，减少颜色数量
                const quantizedR = Math.round(r / 24) * 24
                const quantizedG = Math.round(g / 24) * 24
                const quantizedB = Math.round(b / 24) * 24

                const colorKey = `${quantizedR},${quantizedG},${quantizedB}`

                if (colorMap[colorKey]) {
                    colorMap[colorKey].count++
                } else {
                    colorMap[colorKey] = {
                        count: 1,
                        r: quantizedR,
                        g: quantizedG,
                        b: quantizedB
                    }
                }
            }

            // 将颜色映射转换为数组并排序
            const colorArray = Object.values(colorMap)
                .sort((a, b) => b.count - a.count)
                .slice(0, maxColors)

            // 转换为颜色对象数组
            const extractedColors: Color[] = colorArray.map(color => {
                const { r, g, b, count } = color
                const hex = rgbToHex(r, g, b)
                const rgb = `rgb(${r}, ${g}, ${b})`
                const hsl = rgbToHsl(r, g, b)
                const percentage = (count / (totalPixels / quality)) * 100

                return {
                    hex,
                    rgb,
                    hsl,
                    count,
                    percentage
                }
            })

            setColors(extractedColors)
            setActiveTab("colors")
        }

        img.src = previewUrl
    }, [previewUrl, maxColors, quality])

    // RGB转HEX
    const rgbToHex = (r: number, g: number, b: number): string => {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16)
            return hex.length === 1 ? '0' + hex : hex
        }).join('')
    }

    // RGB转HSL
    const rgbToHsl = (r: number, g: number, b: number): string => {
        r /= 255
        g /= 255
        b /= 255

        const max = Math.max(r, g, b)
        const min = Math.min(r, g, b)
        let h = 0, s = 0, l = (max + min) / 2

        if (max !== min) {
            const d = max - min
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break
                case g: h = (b - r) / d + 2; break
                case b: h = (r - g) / d + 4; break
            }

            h /= 6
        }

        return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`
    }

    // 复制颜色值到剪贴板
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(text)
        setTimeout(() => setCopied(null), 2000)
    }

    // 清除选择的文件
    const clearSelection = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setColors([])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 判断颜色是否为浅色
    const isLightColor = (hex: string): boolean => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)

        // 计算亮度 (HSP色彩模型)
        const brightness = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
        )

        return brightness > 127.5
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">颜色提取器</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-medium">图片预览</h2>
                                {selectedFile && (
                                    <Button variant="outline" size="sm" onClick={clearSelection}>
                                        <X className="mr-2 h-4 w-4" />
                                        清除
                                    </Button>
                                )}
                            </div>

                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="image">图片</TabsTrigger>
                                    <TabsTrigger value="colors" disabled={colors.length === 0}>颜色</TabsTrigger>
                                </TabsList>

                                <TabsContent value="image" className="mt-4">
                                    {!selectedFile ? (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground mb-2">点击或拖放图片到此处</p>
                                            <p className="text-sm text-muted-foreground">支持 JPG, PNG, WebP 等格式</p>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="relative rounded-lg overflow-hidden bg-muted/30 flex justify-center" style={{ height: '400px' }}>
                                                {previewUrl && (
                                                    <img
                                                        src={previewUrl}
                                                        alt="上传的图片"
                                                        className="max-h-full object-contain"
                                                    />
                                                )}
                                            </div>

                                            <Button
                                                onClick={extractColors}
                                                disabled={!selectedFile}
                                                className="w-full"
                                            >
                                                <Pipette className="mr-2 h-4 w-4" />
                                                提取颜色
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="colors" className="mt-4">
                                    {colors.length > 0 && (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                                {colors.map((color, index) => (
                                                    <div
                                                        key={index}
                                                        className="rounded-lg overflow-hidden shadow-sm border"
                                                        onMouseEnter={() => setHoveredColor(color.hex)}
                                                        onMouseLeave={() => setHoveredColor(null)}
                                                    >
                                                        <div
                                                            className="h-24 relative cursor-pointer transition-all"
                                                            style={{ backgroundColor: color.hex }}
                                                            onClick={() => copyToClipboard(color.hex)}
                                                        >
                                                            {(hoveredColor === color.hex || copied === color.hex) && (
                                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                                                    {copied === color.hex ? (
                                                                        <Check className={`h-8 w-8 ${isLightColor(color.hex) ? 'text-black' : 'text-white'}`} />
                                                                    ) : (
                                                                        <Copy className={`h-6 w-6 ${isLightColor(color.hex) ? 'text-black' : 'text-white'}`} />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="p-3 space-y-1 bg-card">
                                                            <div className="flex justify-between items-center">
                                                                <span className="font-medium">{color.hex}</span>
                                                                <span className="text-xs text-muted-foreground">{color.percentage.toFixed(1)}%</span>
                                                            </div>
                                                            <div className="text-xs text-muted-foreground truncate" title={color.rgb}>
                                                                {color.rgb}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="text-sm text-muted-foreground text-center">
                                                点击颜色块可复制十六进制颜色值
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {/* 隐藏的canvas用于图片处理 */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">提取选项</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="max-colors">最大颜色数量</Label>
                                        <span className="text-sm text-muted-foreground">{maxColors}</span>
                                    </div>
                                    <Slider
                                        id="max-colors"
                                        min={1}
                                        max={20}
                                        step={1}
                                        value={[maxColors]}
                                        onValueChange={(values) => setMaxColors(values[0])}
                                        disabled={!selectedFile}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        设置要提取的主要颜色数量
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <Label htmlFor="quality">采样质量</Label>
                                        <span className="text-sm text-muted-foreground">{quality}</span>
                                    </div>
                                    <Slider
                                        id="quality"
                                        min={1}
                                        max={30}
                                        step={1}
                                        value={[quality]}
                                        onValueChange={(values) => setQuality(values[0])}
                                        disabled={!selectedFile}
                                    />
                                    <p className="text-xs text-muted-foreground">
                                        较低的值提供更精确的结果，但处理时间更长
                                    </p>
                                </div>

                                {colors.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium">颜色调色板</h3>
                                        <div
                                            className="h-12 rounded-md overflow-hidden flex"
                                            style={{
                                                background: `linear-gradient(to right, ${colors.map(c => c.hex).join(', ')})`
                                            }}
                                        />

                                        <div className="pt-2">
                                            <h3 className="font-medium mb-2">CSS 代码</h3>
                                            <div className="relative">
                                                <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto">
                                                    {`/* 调色板 */\n:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`}
                                                </pre>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="absolute top-2 right-2 h-6 w-6 p-0"
                                                    onClick={() => copyToClipboard(`/* 调色板 */\n:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}`)}
                                                >
                                                    {copied === `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n')}\n}` ? (
                                                        <Check className="h-3 w-3" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">使用提示</h2>

                            <div className="space-y-4 text-sm">
                                <p>
                                    1. 上传一张图片，然后点击"提取颜色"按钮
                                </p>
                                <p>
                                    2. 调整最大颜色数量和采样质量以获得更好的结果
                                </p>
                                <p>
                                    3. 点击颜色块可复制十六进制颜色值
                                </p>
                                <p>
                                    4. 提取的颜色会按照在图片中的出现频率排序
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

