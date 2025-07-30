"use client"

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, Download, Image as ImageIcon, X, Crop, RotateCw, FlipHorizontal, FlipVertical, Maximize, Minimize } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'

export default function ImageCropper() {
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [croppedUrl, setCroppedUrl] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<string>("edit")
    const [fileName, setFileName] = useState<string>("")

    // 裁剪相关状态
    const [cropX, setCropX] = useState<number>(0)
    const [cropY, setCropY] = useState<number>(0)
    const [cropWidth, setCropWidth] = useState<number>(300)
    const [cropHeight, setCropHeight] = useState<number>(300)
    const [aspectRatio, setAspectRatio] = useState<number | null>(null)
    const [rotation, setRotation] = useState<number>(0)
    const [flipHorizontal, setFlipHorizontal] = useState<boolean>(false)
    const [flipVertical, setFlipVertical] = useState<boolean>(false)
    const [isDragging, setIsDragging] = useState<boolean>(false)
    const [dragStartX, setDragStartX] = useState<number>(0)
    const [dragStartY, setDragStartY] = useState<number>(0)
    const [dragStartCropX, setDragStartCropX] = useState<number>(0)
    const [dragStartCropY, setDragStartCropY] = useState<number>(0)
    const [resizing, setResizing] = useState<string | null>(null)
    const [imageWidth, setImageWidth] = useState<number>(0)
    const [imageHeight, setImageHeight] = useState<number>(0)

    const fileInputRef = useRef<HTMLInputElement>(null)
    const imageRef = useRef<HTMLImageElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const cropAreaRef = useRef<HTMLDivElement>(null)

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
        setCroppedUrl(null)

        // 创建预览URL
        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        // 设置默认文件名（不带扩展名）
        const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
        setFileName(baseName)

        // 重置裁剪状态
        setRotation(0)
        setFlipHorizontal(false)
        setFlipVertical(false)

        // 加载图片后设置初始裁剪区域
        const img = new Image()
        img.onload = () => {
            setImageWidth(img.width)
            setImageHeight(img.height)

            // 设置初始裁剪区域为图片中心的正方形
            const size = Math.min(img.width, img.height) * 0.8
            setCropWidth(size)
            setCropHeight(size)
            setCropX((img.width - size) / 2)
            setCropY((img.height - size) / 2)
        }
        img.src = url
    }

    // 设置裁剪区域的宽高比
    const setRatio = (ratio: number | null) => {
        setAspectRatio(ratio)

        if (ratio !== null) {
            // 保持当前宽度，调整高度
            const newHeight = cropWidth / ratio
            setCropHeight(newHeight)

            // 确保裁剪区域不超出图片边界
            const maxY = imageHeight - newHeight
            if (cropY > maxY) {
                setCropY(maxY < 0 ? 0 : maxY)
            }
        }
    }

    // 旋转图片
    const rotateImage = () => {
        setRotation((prev) => (prev + 90) % 360)
    }

    // 水平翻转
    const flipImageHorizontal = () => {
        setFlipHorizontal((prev) => !prev)
    }

    // 垂直翻转
    const flipImageVertical = () => {
        setFlipVertical((prev) => !prev)
    }

    // 鼠标按下开始拖动裁剪区域
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cropAreaRef.current) return

        const rect = cropAreaRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        // 检查是否在边缘（用于调整大小）
        const edgeSize = 10
        const isOnRightEdge = x >= cropWidth - edgeSize && x <= cropWidth
        const isOnBottomEdge = y >= cropHeight - edgeSize && y <= cropHeight
        const isOnLeftEdge = x >= 0 && x <= edgeSize
        const isOnTopEdge = y >= 0 && y <= edgeSize

        if (isOnRightEdge && isOnBottomEdge) {
            setResizing('bottom-right')
        } else if (isOnRightEdge) {
            setResizing('right')
        } else if (isOnBottomEdge) {
            setResizing('bottom')
        } else if (isOnLeftEdge && isOnTopEdge) {
            setResizing('top-left')
        } else if (isOnLeftEdge) {
            setResizing('left')
        } else if (isOnTopEdge) {
            setResizing('top')
        } else if (isOnLeftEdge && isOnBottomEdge) {
            setResizing('bottom-left')
        } else if (isOnRightEdge && isOnTopEdge) {
            setResizing('top-right')
        } else {
            // 移动整个裁剪区域
            setIsDragging(true)
        }

        setDragStartX(e.clientX)
        setDragStartY(e.clientY)
        setDragStartCropX(cropX)
        setDragStartCropY(cropY)
    }

    // 鼠标移动处理
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging && !resizing) return

        const deltaX = e.clientX - dragStartX
        const deltaY = e.clientY - dragStartY

        if (resizing) {
            let newWidth = cropWidth
            let newHeight = cropHeight
            let newX = cropX
            let newY = cropY

            // 根据不同的调整方向更新尺寸
            switch (resizing) {
                case 'right':
                    newWidth = cropWidth + deltaX
                    if (aspectRatio !== null) {
                        newHeight = newWidth / aspectRatio
                    }
                    break
                case 'bottom':
                    newHeight = cropHeight + deltaY
                    if (aspectRatio !== null) {
                        newWidth = newHeight * aspectRatio
                    }
                    break
                case 'bottom-right':
                    newWidth = cropWidth + deltaX
                    if (aspectRatio !== null) {
                        newHeight = newWidth / aspectRatio
                    } else {
                        newHeight = cropHeight + deltaY
                    }
                    break
                case 'left':
                    newWidth = cropWidth - deltaX
                    newX = cropX + deltaX
                    if (aspectRatio !== null) {
                        newHeight = newWidth / aspectRatio
                    }
                    break
                case 'top':
                    newHeight = cropHeight - deltaY
                    newY = cropY + deltaY
                    if (aspectRatio !== null) {
                        newWidth = newHeight * aspectRatio
                    }
                    break
                case 'top-left':
                    newWidth = cropWidth - deltaX
                    newHeight = cropHeight - deltaY
                    newX = cropX + deltaX
                    newY = cropY + deltaY
                    if (aspectRatio !== null) {
                        // 保持宽高比，以宽度为基准
                        newHeight = newWidth / aspectRatio
                        newY = cropY + (cropWidth - newWidth)
                    }
                    break
                case 'bottom-left':
                    newWidth = cropWidth - deltaX
                    newHeight = cropHeight + deltaY
                    newX = cropX + deltaX
                    if (aspectRatio !== null) {
                        newHeight = newWidth / aspectRatio
                    }
                    break
                case 'top-right':
                    newWidth = cropWidth + deltaX
                    newHeight = cropHeight - deltaY
                    newY = cropY + deltaY
                    if (aspectRatio !== null) {
                        newHeight = newWidth / aspectRatio
                        newY = cropY + (cropHeight - newHeight)
                    }
                    break
            }

            // 确保尺寸不小于最小值
            const minSize = 50
            if (newWidth >= minSize && newHeight >= minSize) {
                // 确保不超出图片边界
                if (newX >= 0 && newX + newWidth <= imageWidth &&
                    newY >= 0 && newY + newHeight <= imageHeight) {
                    setCropWidth(newWidth)
                    setCropHeight(newHeight)
                    setCropX(newX)
                    setCropY(newY)
                    setDragStartX(e.clientX)
                    setDragStartY(e.clientY)
                }
            }
        } else if (isDragging) {
            // 移动裁剪区域
            const newX = dragStartCropX + deltaX
            const newY = dragStartCropY + deltaY

            // 确保不超出图片边界
            if (newX >= 0 && newX + cropWidth <= imageWidth &&
                newY >= 0 && newY + cropHeight <= imageHeight) {
                setCropX(newX)
                setCropY(newY)
            }
        }
    }

    // 鼠标释放结束拖动
    const handleMouseUp = () => {
        setIsDragging(false)
        setResizing(null)
    }

    // 裁剪图片
    const cropImage = useCallback(() => {
        if (!previewUrl || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.onload = () => {
            // 设置canvas尺寸为裁剪区域大小
            canvas.width = cropWidth
            canvas.height = cropHeight

            // 保存当前状态
            ctx.save()

            // 清除canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // 设置变换原点为canvas中心
            ctx.translate(canvas.width / 2, canvas.height / 2)

            // 应用旋转
            ctx.rotate((rotation * Math.PI) / 180)

            // 应用翻转
            ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1)

            // 绘制裁剪后的图片
            ctx.drawImage(
                img,
                cropX, cropY, cropWidth, cropHeight,
                -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height
            )

            // 恢复状态
            ctx.restore()

            // 获取裁剪后的图片URL
            const croppedImageUrl = canvas.toDataURL('image/png')
            setCroppedUrl(croppedImageUrl)
            setActiveTab("preview")
        }
        img.src = previewUrl
    }, [previewUrl, cropX, cropY, cropWidth, cropHeight, rotation, flipHorizontal, flipVertical])

    // 下载裁剪后的图片
    const downloadImage = () => {
        if (!croppedUrl || !fileName) return

        const link = document.createElement('a')
        link.href = croppedUrl
        link.download = `${fileName}-cropped.png`

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // 清除选择的文件
    const clearSelection = () => {
        setSelectedFile(null)
        setPreviewUrl(null)
        setCroppedUrl(null)
        setFileName("")
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 重置裁剪区域为整个图片
    const resetCropToFull = () => {
        setCropX(0)
        setCropY(0)
        setCropWidth(imageWidth)
        setCropHeight(imageHeight)
    }

    // 重置裁剪区域为居中的正方形
    const resetCropToSquare = () => {
        const size = Math.min(imageWidth, imageHeight)
        setCropWidth(size)
        setCropHeight(size)
        setCropX((imageWidth - size) / 2)
        setCropY((imageHeight - size) / 2)
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">图片裁剪器</h1>

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
                                    <TabsTrigger value="preview" disabled={!croppedUrl}>预览</TabsTrigger>
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
                                            <div
                                                className="relative rounded-lg overflow-hidden bg-muted/30 flex justify-center"
                                                style={{ height: '400px' }}
                                            >
                                                <div className="relative">
                                                    {previewUrl && (
                                                        <img
                                                            ref={imageRef}
                                                            src={previewUrl}
                                                            alt="原始图片"
                                                            className="max-h-[400px] object-contain"
                                                            style={{
                                                                transform: `rotate(${rotation}deg) scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
                                                                maxWidth: '100%'
                                                            }}
                                                        />
                                                    )}

                                                    {/* 裁剪区域 */}
                                                    <div
                                                        ref={cropAreaRef}
                                                        className="absolute border-2 border-primary cursor-move"
                                                        style={{
                                                            left: `${cropX}px`,
                                                            top: `${cropY}px`,
                                                            width: `${cropWidth}px`,
                                                            height: `${cropHeight}px`,
                                                        }}
                                                        onMouseDown={handleMouseDown}
                                                        onMouseMove={handleMouseMove}
                                                        onMouseUp={handleMouseUp}
                                                        onMouseLeave={handleMouseUp}
                                                    >
                                                        {/* 调整大小的手柄 */}
                                                        <div className="absolute right-0 bottom-0 w-3 h-3 bg-primary cursor-se-resize" />
                                                        <div className="absolute right-0 top-0 w-3 h-3 bg-primary cursor-ne-resize" />
                                                        <div className="absolute left-0 bottom-0 w-3 h-3 bg-primary cursor-sw-resize" />
                                                        <div className="absolute left-0 top-0 w-3 h-3 bg-primary cursor-nw-resize" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={rotateImage}
                                                >
                                                    <RotateCw className="mr-2 h-4 w-4" />
                                                    旋转
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={flipImageHorizontal}
                                                >
                                                    <FlipHorizontal className="mr-2 h-4 w-4" />
                                                    水平翻转
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={flipImageVertical}
                                                >
                                                    <FlipVertical className="mr-2 h-4 w-4" />
                                                    垂直翻转
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetCropToFull}
                                                >
                                                    <Maximize className="mr-2 h-4 w-4" />
                                                    全图
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={resetCropToSquare}
                                                >
                                                    <Minimize className="mr-2 h-4 w-4" />
                                                    居中
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>

                                <TabsContent value="preview" className="mt-4">
                                    {croppedUrl && (
                                        <div className="space-y-4">
                                            <div className="relative rounded-lg overflow-hidden bg-muted/30 flex justify-center" style={{ height: '400px' }}>
                                                <img
                                                    src={croppedUrl}
                                                    alt="裁剪后的图片"
                                                    className="max-h-full object-contain"
                                                />
                                            </div>

                                            <div className="flex justify-between text-sm text-muted-foreground">
                                                <span>尺寸: {cropWidth} x {cropHeight} px</span>
                                            </div>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>

                            {selectedFile && (
                                <div className="mt-4 space-y-4">
                                    <div className="flex space-x-4">
                                        <Button
                                            onClick={cropImage}
                                            disabled={!selectedFile}
                                            className="flex-1"
                                        >
                                            <Crop className="mr-2 h-4 w-4" />
                                            裁剪图片
                                        </Button>

                                        {croppedUrl && (
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
                            <h2 className="text-xl font-medium mb-4">裁剪选项</h2>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label>宽高比</Label>
                                    <div className="flex flex-wrap gap-2">
                                        <Toggle
                                            pressed={aspectRatio === null}
                                            onPressedChange={() => setRatio(null)}
                                        >
                                            自由
                                        </Toggle>
                                        <Toggle
                                            pressed={aspectRatio === 1}
                                            onPressedChange={() => setRatio(1)}
                                        >
                                            1:1
                                        </Toggle>
                                        <Toggle
                                            pressed={aspectRatio === 4 / 3}
                                            onPressedChange={() => setRatio(4 / 3)}
                                        >
                                            4:3
                                        </Toggle>
                                        <Toggle
                                            pressed={aspectRatio === 16 / 9}
                                            onPressedChange={() => setRatio(16 / 9)}
                                        >
                                            16:9
                                        </Toggle>
                                        <Toggle
                                            pressed={aspectRatio === 3 / 4}
                                            onPressedChange={() => setRatio(3 / 4)}
                                        >
                                            3:4
                                        </Toggle>
                                        <Toggle
                                            pressed={aspectRatio === 9 / 16}
                                            onPressedChange={() => setRatio(9 / 16)}
                                        >
                                            9:16
                                        </Toggle>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="crop-width">裁剪宽度</Label>
                                    <div className="flex items-center space-x-2">
                                        <Slider
                                            id="crop-width"
                                            min={50}
                                            max={imageWidth}
                                            step={1}
                                            value={[cropWidth]}
                                            onValueChange={(values) => {
                                                const newWidth = values[0]
                                                setCropWidth(newWidth)

                                                // 如果设置了宽高比，同时调整高度
                                                if (aspectRatio !== null) {
                                                    setCropHeight(newWidth / aspectRatio)
                                                }

                                                // 确保不超出图片边界
                                                if (cropX + newWidth > imageWidth) {
                                                    setCropX(imageWidth - newWidth)
                                                }
                                            }}
                                            disabled={!selectedFile}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-right text-sm text-muted-foreground">{cropWidth}px</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="crop-height">裁剪高度</Label>
                                    <div className="flex items-center space-x-2">
                                        <Slider
                                            id="crop-height"
                                            min={50}
                                            max={imageHeight}
                                            step={1}
                                            value={[cropHeight]}
                                            onValueChange={(values) => {
                                                const newHeight = values[0]
                                                setCropHeight(newHeight)

                                                // 如果设置了宽高比，同时调整宽度
                                                if (aspectRatio !== null) {
                                                    setCropWidth(newHeight * aspectRatio)
                                                }

                                                // 确保不超出图片边界
                                                if (cropY + newHeight > imageHeight) {
                                                    setCropY(imageHeight - newHeight)
                                                }
                                            }}
                                            disabled={!selectedFile || aspectRatio !== null}
                                            className="flex-1"
                                        />
                                        <span className="w-12 text-right text-sm text-muted-foreground">{cropHeight}px</span>
                                    </div>
                                </div>

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
                            <h2 className="text-xl font-medium mb-4">使用提示</h2>

                            <div className="space-y-4 text-sm">
                                <p>
                                    1. 上传一张图片，然后调整裁剪区域
                                </p>
                                <p>
                                    2. 可以拖动裁剪框或使用右侧控制面板调整大小
                                </p>
                                <p>
                                    3. 使用旋转和翻转按钮调整图片方向
                                </p>
                                <p>
                                    4. 点击"裁剪图片"按钮生成裁剪后的图片
                                </p>
                                <p>
                                    5. 点击"下载图片"保存裁剪结果
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

