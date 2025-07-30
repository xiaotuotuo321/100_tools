"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Upload, Download, Image as ImageIcon, X, FileType } from 'lucide-react'

// 支持的图片格式
type ImageFormat = 'png' | 'jpeg' | 'webp' | 'bmp' | 'gif'

interface FormatOption {
    value: ImageFormat
    label: string
    mimeType: string
    extension: string
    qualitySupported: boolean
}

export default function ImageConverter() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [convertedUrl, setConvertedUrl] = useState<string | null>(null)
    const [targetFormat, setTargetFormat] = useState<ImageFormat>('png')
    const [quality, setQuality] = useState<number>(90)
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [fileName, setFileName] = useState<string>("")
    const [isConverting, setIsConverting] = useState<boolean>(false)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // 格式选项
    const formatOptions: FormatOption[] = [
        { value: 'png', label: 'PNG', mimeType: 'image/png', extension: 'png', qualitySupported: false },
        { value: 'jpeg', label: 'JPEG', mimeType: 'image/jpeg', extension: 'jpg', qualitySupported: true },
        { value: 'webp', label: 'WebP', mimeType: 'image/webp', extension: 'webp', qualitySupported: true },
        { value: 'bmp', label: 'BMP', mimeType: 'image/bmp', extension: 'bmp', qualitySupported: false },
        { value: 'gif', label: 'GIF', mimeType: 'image/gif', extension: 'gif', qualitySupported: false }
    ]

    // 获取当前选择的格式选项
    const getCurrentFormat = useCallback(() => {
        return formatOptions.find(format => format.value === targetFormat) || formatOptions[0]
    }, [targetFormat])

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
        setConvertedUrl(null)

        // 创建预览URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // 设置默认文件名（不带扩展名）
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        setFileName(baseName)
    }

    // 转换图片格式
    const convertImage = useCallback(async () => {
        if (!previewUrl || !canvasRef.current || !selectedFile) return

        setIsConverting(true)

        try {
            const canvas = canvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) {
                throw new Error('无法获取canvas上下文')
            }

            // 加载图片
            const img = new Image()
            img.crossOrigin = 'anonymous'

            await new Promise((resolve, reject) => {
                img.onload = resolve
                img.onerror = reject
                img.src = previewUrl
            })

            // 设置canvas尺寸
            canvas.width = img.width
            canvas.height = img.height

            // 绘制图片到canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(img, 0, 0)

            // 获取当前格式选项
            const format = getCurrentFormat()

            // 转换为目标格式
            let convertedImageUrl
            if (format.qualitySupported) {
                convertedImageUrl = canvas.toDataURL(format.mimeType, quality / 100)
            } else {
                convertedImageUrl = canvas.toDataURL(format.mimeType)
            }

            setConvertedUrl(convertedImageUrl)
            setActiveTab("preview")
        } catch (error) {
            console.error('转换图片时出错:', error)
            alert('转换图片时出错，请重试')
        } finally {
            setIsConverting(false)
        }
    }, [previewUrl, targetFormat, quality, getCurrentFormat, selectedFile])

    // 下载转换后的图片
    const downloadImage = () => {
        if (!convertedUrl || !fileName) return

        const format = getCurrentFormat()
        const link = document.createElement('a')
        link.href = convertedUrl
        link.download = `${fileName}.${format.extension}`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // 清除选择的文件
    const clearSelection = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setConvertedUrl(null)
        setFileName("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 获取文件大小显示
    const getFileSizeDisplay = (url: string | null) => {
        if (!url) return '0 KB'

        // 对于Data URL，计算其大小
        if (url.startsWith('data:')) {
            // 去掉MIME类型部分
            const base64 = url.split(',')[1]
            // Base64字符串长度 * 0.75 得到字节数
            const bytes = base64 ? Math.ceil(base64.length * 0.75) : 0

            if (bytes < 1024) {
                return `${bytes} B`
            } else if (bytes < 1024 * 1024) {
                return `${(bytes / 1024).toFixed(1)} KB`
            } else {
                return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
            }
        }

        // 对于Blob URL，无法直接获取大小
        return '未知'
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">图片格式转换器</h1>

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
                                    <TabsTrigger value="edit">原始图片</TabsTrigger>
                                    <TabsTrigger value="preview" disabled={!convertedUrl}>转换后</TabsTrigger>
                                </TabsList>

                                <TabsContent value="edit" className="mt-4">
                                    {!selectedFile ? (
                                        <div
                                            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                            <p className="text-muted-foreground mb-2">点击或拖放图片到此处</p>
                                            <p className="text-sm text-muted-foreground">支持 JPG, PNG, WebP, BMP, GIF 等格式</p>
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
                                                        alt="原始图片"
                                                        className="max-h-full object-contain"
                                                    />
                                                )}
                                            </div>

                                            {selectedFile && (
                                                <div className="flex justify-between text-sm text-muted-foreground">
                                                    <span>原始格式: {selectedFile.type.split('/')[1].toUpperCase()}</span>
                                                    <span>大小: {(selectedFile.size / 1024).toFixed(1)} KB</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="preview" className="mt-4">
                                    {convertedUrl && (
                                        <div className="space-y-4">
                                            <div className="relative rounded-lg overflow-hidden bg-muted/30 flex justify-center" style={{ height: '400px' }}>
                                                <img
                                                    src={convertedUrl}
                                                    alt="转换后的图片"
                                                    className="max-h-full object-contain"
                                                />
                                            </div>

                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>转换格式: {getCurrentFormat().label}</span>
                                                <span>大小: {getFileSizeDisplay(convertedUrl)}</span>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {selectedFile && (
                                <div className="mt-4 space-y-4">
                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={convertImage}
                                            disabled={!selectedFile || isConverting}
                                            className="flex-1"
                                        >
                                            <FileType className="mr-2 h-4 w-4" />
                                            {isConverting ? '转换中...' : '转换图片'}
                                        </Button>

                                        {convertedUrl && (
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
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">转换选项</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="target-format">目标格式</Label>
                                    <Select
                                        value={targetFormat}
                                        onValueChange={(value) => setTargetFormat(value as ImageFormat)}
                                    >
                                        <SelectTrigger id="target-format">
                                            <SelectValue placeholder="选择目标格式" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {formatOptions.map((format) => (
                                                <SelectItem key={format.value} value={format.value}>
                                                    {format.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <p className="text-xs text-muted-foreground">
                                        选择要转换的目标图片格式
                                    </p>
                                </div>

                                {getCurrentFormat().qualitySupported && (
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="quality">图片质量</Label>
                                            <span className="text-sm text-muted-foreground">{quality}%</span>
                                        </div>
                                        <Slider
                                            id="quality"
                                            min={1}
                                            max={100}
                                            step={1}
                                            value={[quality]}
                                            onValueChange={(values) => setQuality(values[0])}
                                            disabled={!selectedFile}
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            调整图片质量（仅适用于JPEG和WebP格式）
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-2">
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
                        </CardContent>
                    </Card>

                    <Card className="mt-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-medium mb-4">格式说明</h2>

                            <div className="space-y-4 text-sm">
                                <div>
                                    <h3 className="font-medium">PNG</h3>
                                    <p className="text-muted-foreground">支持透明度，适合图标、插图和需要透明背景的图片。文件较大但无损。</p>
                                </div>

                                <div>
                                    <h3 className="font-medium">JPEG</h3>
                                    <p className="text-muted-foreground">不支持透明度，适合照片和复杂图像。文件较小但有损压缩。</p>
                                </div>

                                <div>
                                    <h3 className="font-medium">WebP</h3>
                                    <p className="text-muted-foreground">现代格式，支持透明度和动画，比PNG和JPEG更小，但兼容性较差。</p>
                                </div>

                                <div>
                                    <h3 className="font-medium">BMP</h3>
                                    <p className="text-muted-foreground">无压缩位图格式，文件较大，但兼容性好。</p>
                                </div>

                                <div>
                                    <h3 className="font-medium">GIF</h3>
                                    <p className="text-muted-foreground">支持简单动画和透明度，色彩有限（256色），适合简单图像和动画。</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

