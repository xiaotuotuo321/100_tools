'use client'

import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Upload, 
  Download, 
  Image as ImageIcon, 
  Minimize2, 
  FileImage, 
  Settings,
  Trash2,
  Zap
} from 'lucide-react'

interface CompressedImage {
  original: File
  compressed: Blob
  originalSize: number
  compressedSize: number
  compressionRatio: number
  originalUrl: string
  compressedUrl: string
  fileName: string
}

export default function ImageCompressor() {
  const [images, setImages] = useState<CompressedImage[]>([])
  const [isCompressing, setIsCompressing] = useState(false)
  const [quality, setQuality] = useState(0.8)
  const [maxWidth, setMaxWidth] = useState(1920)
  const [maxHeight, setMaxHeight] = useState(1080)
  const [outputFormat, setOutputFormat] = useState<'jpeg' | 'png' | 'webp'>('jpeg')
  const [enableResize, setEnableResize] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const compressImage = useCallback(async (file: File): Promise<CompressedImage> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        reject(new Error('无法创建canvas上下文'))
        return
      }

      img.onload = () => {
        // 计算新的尺寸
        let { width, height } = img
        
        if (enableResize) {
          // 按比例缩放
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          if (ratio < 1) {
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }
        }

        canvas.width = width
        canvas.height = height

        // 绘制图像
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)

        // 压缩并转换格式
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('压缩失败'))
              return
            }

            const originalSize = file.size
            const compressedSize = blob.size
            const compressionRatio = ((originalSize - compressedSize) / originalSize) * 100

            const result: CompressedImage = {
              original: file,
              compressed: blob,
              originalSize,
              compressedSize,
              compressionRatio,
              originalUrl: URL.createObjectURL(file),
              compressedUrl: URL.createObjectURL(blob),
              fileName: file.name.replace(/\.[^/.]+$/, '') + `.${outputFormat}`
            }

            resolve(result)
          },
          `image/${outputFormat}`,
          quality
        )
      }

      img.onerror = () => {
        reject(new Error('图片加载失败'))
      }

      img.src = URL.createObjectURL(file)
    })
  }, [quality, maxWidth, maxHeight, outputFormat, enableResize])

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setIsCompressing(true)
    const newImages: CompressedImage[] = []

    try {
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressImage(file)
          newImages.push(compressed)
        }
      }
      setImages(prev => [...prev, ...newImages])
    } catch (error) {
      console.error('压缩失败:', error)
    } finally {
      setIsCompressing(false)
    }
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    const files = Array.from(event.dataTransfer.files)
    const input = fileInputRef.current
    if (input && files.length > 0) {
      const dataTransfer = new DataTransfer()
      files.forEach(file => dataTransfer.items.add(file))
      input.files = dataTransfer.files
      handleFileSelect({ target: input } as any)
    }
  }

  const downloadImage = (image: CompressedImage) => {
    const a = document.createElement('a')
    a.href = image.compressedUrl
    a.download = image.fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const downloadAll = () => {
    images.forEach(image => {
      setTimeout(() => downloadImage(image), 100)
    })
  }

  const clearAll = () => {
    // 清理URL对象
    images.forEach(image => {
      URL.revokeObjectURL(image.originalUrl)
      URL.revokeObjectURL(image.compressedUrl)
    })
    setImages([])
  }

  const removeImage = (index: number) => {
    const image = images[index]
    URL.revokeObjectURL(image.originalUrl)
    URL.revokeObjectURL(image.compressedUrl)
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const totalOriginalSize = images.reduce((sum, img) => sum + img.originalSize, 0)
  const totalCompressedSize = images.reduce((sum, img) => sum + img.compressedSize, 0)
  const totalCompressionRatio = totalOriginalSize > 0 
    ? ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100 
    : 0

  return (
    <div className="space-y-6">
      {/* 设置面板 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            压缩设置
          </CardTitle>
          <CardDescription>
            调整压缩参数以获得最佳效果
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quality">压缩质量: {Math.round(quality * 100)}%</Label>
              <input
                id="quality"
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={quality}
                onChange={(e) => setQuality(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">输出格式</Label>
              <select
                id="format"
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as any)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="jpeg">JPEG</option>
                <option value="png">PNG</option>
                <option value="webp">WebP</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableResize"
                  checked={enableResize}
                  onChange={(e) => setEnableResize(e.target.checked)}
                />
                <Label htmlFor="enableResize">调整尺寸</Label>
              </div>
              {enableResize && (
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="宽度"
                    value={maxWidth}
                    onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1920)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                  <span className="py-1">×</span>
                  <input
                    type="number"
                    placeholder="高度"
                    value={maxHeight}
                    onChange={(e) => setMaxHeight(parseInt(e.target.value) || 1080)}
                    className="w-full px-2 py-1 border rounded text-sm"
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>快速设置</Label>
              <div className="flex gap-1">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuality(0.9)}
                >
                  高质量
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuality(0.7)}
                >
                  平衡
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuality(0.5)}
                >
                  小文件
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 上传区域 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            上传图片
          </CardTitle>
          <CardDescription>
            支持 JPG、PNG、WebP 格式，单个文件最大 10MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isCompressing ? '正在压缩...' : '拖拽图片到这里或点击选择'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  支持批量上传多个图片文件
                </p>
              </div>
              <Button disabled={isCompressing}>
                <Upload className="h-4 w-4 mr-2" />
                选择图片
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* 统计信息 */}
      {images.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                压缩统计
              </span>
              <div className="flex gap-2">
                <Button variant="outline" onClick={downloadAll} size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  下载全部
                </Button>
                <Button variant="outline" onClick={clearAll} size="sm">
                  <Trash2 className="h-4 w-4 mr-1" />
                  清空
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                <div className="text-sm text-muted-foreground">已处理图片</div>
              </div>
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {formatFileSize(totalOriginalSize)}
                </div>
                <div className="text-sm text-muted-foreground">原始大小</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatFileSize(totalCompressedSize)}
                </div>
                <div className="text-sm text-muted-foreground">压缩后大小</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {totalCompressionRatio.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">压缩率</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 图片列表 */}
      {images.length > 0 && (
        <div className="space-y-4">
          {images.map((image, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* 预览图 */}
                  <div className="flex gap-4">
                    <div className="text-center">
                      <img 
                        src={image.originalUrl} 
                        alt="原图" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">原图</p>
                    </div>
                    <div className="text-center">
                      <img 
                        src={image.compressedUrl} 
                        alt="压缩后" 
                        className="w-20 h-20 object-cover rounded border"
                      />
                      <p className="text-xs text-muted-foreground mt-1">压缩后</p>
                    </div>
                  </div>

                  {/* 信息 */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <FileImage className="h-4 w-4" />
                      <span className="font-medium">{image.original.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>原始: {formatFileSize(image.originalSize)}</span>
                      <span>→</span>
                      <span>压缩: {formatFileSize(image.compressedSize)}</span>
                      <Badge variant={image.compressionRatio > 0 ? "default" : "secondary"}>
                        {image.compressionRatio > 0 ? '减少' : '增加'} {Math.abs(image.compressionRatio).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadImage(image)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 使用说明 */}
      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">功能特点</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 支持 JPEG、PNG、WebP 格式</li>
                <li>• 可调整压缩质量和输出格式</li>
                <li>• 支持批量处理多个图片</li>
                <li>• 实时预览压缩效果</li>
                <li>• 显示详细的压缩统计信息</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">使用技巧</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 网页用途建议质量设为 70-80%</li>
                <li>• WebP 格式通常有更好的压缩效果</li>
                <li>• 启用尺寸调整可大幅减小文件大小</li>
                <li>• 批量处理时建议统一设置参数</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 