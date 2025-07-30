"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, Image as ImageIcon, X, Sparkles, Undo } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

// 滤镜类型定义
interface Filter {
    name: string
    label: string
    cssFilter?: string
    canvasFilter?: (ctx: CanvasRenderingContext2D, imageData: ImageData, value: number) => ImageData
    defaultValue: number
    minValue: number
    maxValue: number
    step: number
}

export default function ImageFilters() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [filteredUrl, setFilteredUrl] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [fileName, setFileName] = useState<string>("")
    const [imageWidth, setImageWidth] = useState<number>(0)
    const [imageHeight, setImageHeight] = useState<number>(0)
    const [isProcessing, setIsProcessing] = useState<boolean>(false)

    // 滤镜相关状态
    const [activePreset, setActivePreset] = useState<string | null>(null)
    const [filterValues, setFilterValues] = useState<Record<string, number>>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        grayscale: 0,
        sepia: 0,
        hueRotate: 0,
        blur: 0,
        invert: 0
    })

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 滤镜定义
    const filters: Filter[] = [
        {
            name: 'brightness',
            label: '亮度',
            cssFilter: 'brightness({value}%)',
            defaultValue: 100,
            minValue: 0,
            maxValue: 200,
            step: 1
        },
        {
            name: 'contrast',
            label: '对比度',
            cssFilter: 'contrast({value}%)',
            defaultValue: 100,
            minValue: 0,
            maxValue: 200,
            step: 1
        },
        {
            name: 'saturation',
            label: '饱和度',
            cssFilter: 'saturate({value}%)',
            defaultValue: 100,
            minValue: 0,
            maxValue: 200,
            step: 1
        },
        {
            name: 'grayscale',
            label: '灰度',
            cssFilter: 'grayscale({value}%)',
            defaultValue: 0,
            minValue: 0,
            maxValue: 100,
            step: 1
        },
        {
            name: 'sepia',
            label: '复古',
            cssFilter: 'sepia({value}%)',
            defaultValue: 0,
            minValue: 0,
            maxValue: 100,
            step: 1
        },
        {
            name: 'hueRotate',
            label: '色相旋转',
            cssFilter: 'hue-rotate({value}deg)',
            defaultValue: 0,
            minValue: 0,
            maxValue: 360,
            step: 1
        },
        {
            name: 'blur',
            label: '模糊',
            cssFilter: 'blur({value}px)',
            defaultValue: 0,
            minValue: 0,
            maxValue: 20,
            step: 0.1
        },
        {
            name: 'invert',
            label: '反转',
            cssFilter: 'invert({value}%)',
            defaultValue: 0,
            minValue: 0,
            maxValue: 100,
            step: 1
        }
    ]

    // 预设滤镜
    const presets = [
        {
            name: 'normal', label: '原始', values: {
                brightness: 100, contrast: 100, saturation: 100, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0
            }
        },
        {
            name: 'warm', label: '暖色调', values: {
                brightness: 105, contrast: 110, saturation: 120, grayscale: 0, sepia: 30, hueRotate: 15, blur: 0, invert: 0
            }
        },
        {
            name: 'cool', label: '冷色调', values: {
                brightness: 100, contrast: 105, saturation: 90, grayscale: 0, sepia: 0, hueRotate: 180, blur: 0, invert: 0
            }
        },
        {
            name: 'vintage', label: '复古', values: {
                brightness: 95, contrast: 115, saturation: 80, grayscale: 0, sepia: 50, hueRotate: 0, blur: 0, invert: 0
            }
        },
        {
            name: 'bw', label: '黑白', values: {
                brightness: 100, contrast: 120, saturation: 0, grayscale: 100, sepia: 0, hueRotate: 0, blur: 0, invert: 0
            }
        },
        {
            name: 'dramatic', label: '戏剧化', values: {
                brightness: 90, contrast: 150, saturation: 120, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0
            }
        },
        {
            name: 'fade', label: '褪色', values: {
                brightness: 110, contrast: 90, saturation: 70, grayscale: 10, sepia: 10, hueRotate: 0, blur: 0, invert: 0
            }
        },
        {
            name: 'sharp', label: '锐化', values: {
                brightness: 105, contrast: 130, saturation: 110, grayscale: 0, sepia: 0, hueRotate: 0, blur: 0, invert: 0
            }
        }
    ]

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
        setFilteredUrl(null)
        setActivePreset(null)

        // 创建预览URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // 设置默认文件名（不带扩展名）
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        setFileName(baseName)

        // 重置滤镜
        resetFilters()

        // 加载图片后获取尺寸
        const img = new Image()
        img.onload = () => {
            setImageWidth(img.width)
            setImageHeight(img.height)
        }
        img.src = url
    }

    // 重置滤镜
    const resetFilters = () => {
        const defaultValues: Record<string, number> = {}
        filters.forEach(filter => {
            defaultValues[filter.name] = filter.defaultValue
        })
        setFilterValues(defaultValues)
        setActivePreset(null)
    }

    // 应用预设滤镜
    const applyPreset = (preset: typeof presets[0]) => {
        setFilterValues(preset.values)
        setActivePreset(preset.name)
    }

    // 更新滤镜值
    const updateFilterValue = (name: string, value: number) => {
        setFilterValues(prev => ({
            ...prev,
            [name]: value
        }))
        setActivePreset(null)
    }

    // 获取当前CSS滤镜字符串
    const getCurrentCssFilter = useCallback(() => {
        return filters
            .map(filter => {
                if (!filter.cssFilter) return ''
                const value = filterValues[filter.name]
                return filter.cssFilter.replace('{value}', value.toString())
            })
            .filter(Boolean)
            .join(' ')
    }, [filterValues, filters])

    // 应用滤镜并生成新图片
    const applyFilters = useCallback(() => {
        if (!previewUrl || !canvasRef.current) return

        setIsProcessing(true)

        try {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                throw new Error('无法获取canvas上下文')
            }

            const img = new Image()
            img.crossOrigin = 'anonymous'
            img.onload = () => {
                // 设置canvas尺寸
                canvas.width = img.width
                canvas.height = img.height

                // 清除canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                // 应用CSS滤镜
                ctx.filter = getCurrentCssFilter()

                // 绘制图片
                ctx.drawImage(img, 0, 0)

                // 获取处理后的图片URL
                const filteredImageUrl = canvas.toDataURL('image/png')
                setFilteredUrl(filteredImageUrl)
                setActiveTab("preview")
                setIsProcessing(false)
            }
            img.onerror = () => {
                setIsProcessing(false)
                alert('处理图片时出错，请重试')
            }
            img.src = previewUrl
        } catch (error) {
            console.error('应用滤镜时出错:', error)
            setIsProcessing(false)
            alert('应用滤镜时出错，请重试')
        }
    }, [previewUrl, getCurrentCssFilter])

    // 下载处理后的图片
    const downloadImage = () => {
        if (!filteredUrl || !fileName) return

        const link = document.createElement('a')
        link.href = filteredUrl
        link.download = `${fileName}-filtered.png`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // 清除选择的文件
    const clearSelection = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setFilteredUrl(null)
        setFileName("")
        resetFilters()
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">图片滤镜</h1>

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
                                    <TabsTrigger value="edit">编辑</TabsTrigger>
                                    <TabsTrigger value="preview" disabled={!filteredUrl}>预览</TabsTrigger>
                                </TabsList>

                                <TabsContent value="edit" className="mt-4">
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
                                                        ref={imageRef}
                                                        src={previewUrl}
                                                        alt="原始图片"
                                                        className="max-h-full object-contain"
                                                        style={{ filter: getCurrentCssFilter() }}
                                                    />
                                                )}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetFilters}
                                                >
                                                    <Undo className="mr-2 h-4 w-4" />
                                                    重置滤镜
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="preview" className="mt-4">
                                    {filteredUrl && (
                                        <div className="space-y-4">
                                            <div className="relative rounded-lg overflow-hidden bg-muted/30 flex justify-center" style={{ height: '400px' }}>
                                                <img
                                                    src={filteredUrl}
                                                    alt="处理后的图片"
                                                    className="max-h-full object-contain"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {selectedFile && (
                                <div className="mt-4 space-y-4">
                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={applyFilters}
                                            disabled={!selectedFile || isProcessing}
                                            className="flex-1"
                                        >
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            {isProcessing ? '处理中...' : '应用滤镜'}
                                        </Button>

                                        {filteredUrl && (
                                            <Button
                                                onClick={downloadImage}
                                                variant="outline"
                                                className="flex-1"
                                            >
                                                <Download className="mr-2 h-4 w-4" />
                                                下载图片
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* 隐藏的canvas用于图片处理 */}
                            <canvas ref={canvasRef} style={{ display: 'none' }} />
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">预设滤镜</h2>

                            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3">
                                {presets.map((preset) => (
                                    <div
                                        key={preset.name}
                                        className={`
                                            rounded-lg overflow-hidden cursor-pointer border-2 transition-all
                                            ${activePreset === preset.name ? 'border-primary' : 'border-transparent hover:border-primary/50'}
                                        `}
                                        onClick={() => applyPreset(preset)}
                                    >
                                        <div className="aspect-square bg-muted relative">
                                            {previewUrl && (
                                                <img
                                                    src={previewUrl}
                                                    alt={preset.label}
                                                    className="w-full h-full object-cover"
                                                    style={{
                                                        filter: filters
                                                            .map(filter => {
                                                                if (!filter.cssFilter) return ''
                                                                const value = preset.values[filter.name as keyof typeof preset.values]
                                                                return filter.cssFilter.replace('{value}', value.toString())
                                                            })
                                                            .filter(Boolean)
                                                            .join(' ')
                                                    }}
                                                />
                                            )}
                                        </div>
                                        <div className="p-2 text-center text-sm">
                                            {preset.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">滤镜调整</h2>

                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6">
                                    {filters.map((filter) => (
                                        <div key={filter.name} className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor={filter.name}>{filter.label}</Label>
                                                <span className="text-sm text-muted-foreground">
                                                    {filterValues[filter.name]}
                                                    {filter.name === 'hueRotate' ? '°' :
                                                        filter.name === 'blur' ? 'px' : '%'}
                                                </span>
                                            </div>
                                            <Slider
                                                id={filter.name}
                                                min={filter.minValue}
                                                max={filter.maxValue}
                                                step={filter.step}
                                                value={[filterValues[filter.name]]}
                                                onValueChange={(values) => updateFilterValue(filter.name, values[0])}
                                                disabled={!selectedFile}
                                            />
                                        </div>
                                    ))}

                                    <div className="space-y-2 pt-2">
                                        <Label htmlFor="file-name">文件名</Label>
                                        <Input
                                            id="file-name"
                                            value={fileName}
                                            onChange={(e) => setFileName(e.target.value)}
                                            placeholder="输入文件名（不含扩展名）"
                                            disabled={!selectedFile}
                                        />
                                    </div>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

