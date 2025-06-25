"use client"

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Copy, RotateCcw, Plus, Trash2, Palette, Eye } from 'lucide-react'
import { copyToClipboard } from '@/lib/utils'

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
}

export function ColorPicker() {
  const [currentColor, setCurrentColor] = useState<Color>({
    hex: '#3B82F6',
    rgb: { r: 59, g: 130, b: 246 },
    hsl: { h: 217, s: 91, l: 60 },
    hsv: { h: 217, s: 76, v: 96 }
  })
  
  const [savedColors, setSavedColors] = useState<string[]>([
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'
  ])
  
  const [colorHistory, setColorHistory] = useState<string[]>(['#3B82F6'])
  const [inputValue, setInputValue] = useState('#3B82F6')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPickingFromCanvas, setIsPickingFromCanvas] = useState(false)

  // 预设颜色
  const presetColors = [
    '#FF0000', '#FF8000', '#FFFF00', '#80FF00', '#00FF00', '#00FF80',
    '#00FFFF', '#0080FF', '#0000FF', '#8000FF', '#FF00FF', '#FF0080',
    '#800000', '#804000', '#808000', '#408000', '#008000', '#008040',
    '#008080', '#004080', '#000080', '#400080', '#800080', '#800040',
    '#400000', '#402000', '#404000', '#204000', '#004000', '#004020',
    '#004040', '#002040', '#000040', '#200040', '#400040', '#400020',
    '#000000', '#404040', '#808080', '#C0C0C0', '#FFFFFF'
  ]

  // 颜色转换函数
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + [r, g, b].map(x => {
      const hex = Math.round(x).toString(16)
      return hex.length === 1 ? "0" + hex : hex
    }).join("")
  }

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s, l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  const rgbToHsv = (r: number, g: number, b: number) => {
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0, s, v = max

    const d = max - min
    s = max === 0 ? 0 : d / max

    if (max === min) {
      h = 0
    } else {
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break
        case g: h = (b - r) / d + 2; break
        case b: h = (r - g) / d + 4; break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      v: Math.round(v * 100)
    }
  }

  const updateColor = (hex: string) => {
    const rgb = hexToRgb(hex)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
    
    const newColor: Color = { hex, rgb, hsl, hsv }
    setCurrentColor(newColor)
    setInputValue(hex)
    
    // 添加到历史记录
    if (!colorHistory.includes(hex)) {
      setColorHistory(prev => [hex, ...prev.slice(0, 9)]) // 保持最多10个历史记录
    }
  }

  const handleInputChange = (value: string) => {
    setInputValue(value)
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      updateColor(value)
    }
  }

  const handleCopy = async (text: string, format: string) => {
    const success = await copyToClipboard(text)
    if (success) {
      // 可以添加成功提示
    }
  }

  const saveCurrentColor = () => {
    if (!savedColors.includes(currentColor.hex)) {
      setSavedColors(prev => [...prev, currentColor.hex])
    }
  }

  const removeSavedColor = (colorToRemove: string) => {
    setSavedColors(prev => prev.filter(color => color !== colorToRemove))
  }

  const generateRandomColor = () => {
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')
    updateColor(randomColor)
  }

  // 获取对比色（黑色或白色）
  const getContrastColor = (hex: string) => {
    const rgb = hexToRgb(hex)
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#FFFFFF'
  }

  // 生成颜色方案
  const generateColorScheme = (baseColor: string, type: 'complementary' | 'triadic' | 'analogous') => {
    const hsl = currentColor.hsl
    const schemes: string[] = []
    
    switch (type) {
      case 'complementary':
        const compHue = (hsl.h + 180) % 360
        schemes.push(`hsl(${compHue}, ${hsl.s}%, ${hsl.l}%)`)
        break
      case 'triadic':
        const tri1 = (hsl.h + 120) % 360
        const tri2 = (hsl.h + 240) % 360
        schemes.push(`hsl(${tri1}, ${hsl.s}%, ${hsl.l}%)`)
        schemes.push(`hsl(${tri2}, ${hsl.s}%, ${hsl.l}%)`)
        break
      case 'analogous':
        for (let i = 1; i <= 4; i++) {
          const analogHue = (hsl.h + (i * 30)) % 360
          schemes.push(`hsl(${analogHue}, ${hsl.s}%, ${hsl.l}%)`)
        }
        break
    }
    
    return schemes
  }

  const formatColorValues = () => {
    const { hex, rgb, hsl, hsv } = currentColor
    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, 1)`,
      hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
      css: `color: ${hex.toUpperCase()};`,
      android: hex.toUpperCase(),
      ios: `UIColor(red: ${(rgb.r/255).toFixed(3)}, green: ${(rgb.g/255).toFixed(3)}, blue: ${(rgb.b/255).toFixed(3)}, alpha: 1.0)`
    }
  }

  const colorValues = formatColorValues()

  return (
    <div className="space-y-6">
      {/* 主要颜色选择器 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            颜色选择器
          </CardTitle>
          <CardDescription>
            选择、转换和管理颜色，支持多种颜色格式
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 颜色显示和输入 */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div 
                className="w-20 h-20 rounded-lg border-2 border-gray-200 shadow-sm cursor-pointer"
                style={{ backgroundColor: currentColor.hex }}
                onClick={() => document.getElementById('color-input')?.click()}
              >
                <input
                  id="color-input"
                  type="color"
                  value={currentColor.hex}
                  onChange={(e) => updateColor(e.target.value)}
                  className="w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div 
                className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: getContrastColor(currentColor.hex) }}
              />
            </div>
            
            <div className="flex-1 space-y-2">
              <Label htmlFor="hex-input">颜色值</Label>
              <div className="flex gap-2">
                <Input
                  id="hex-input"
                  value={inputValue}
                  onChange={(e) => handleInputChange(e.target.value)}
                  placeholder="#000000"
                  className="font-mono"
                />
                <Button variant="outline" onClick={generateRandomColor}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={saveCurrentColor}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* 颜色格式输出 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(colorValues).map(([format, value]) => (
              <div key={format} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                <div className="flex-1">
                  <div className="text-xs font-medium text-muted-foreground uppercase">{format}</div>
                  <code className="text-sm">{value}</code>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(value, format)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 预设颜色 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">预设颜色</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 gap-2">
            {presetColors.map((color, index) => (
              <button
                key={index}
                className="w-8 h-8 rounded border border-gray-200 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => updateColor(color)}
                title={color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 保存的颜色 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">保存的颜色</CardTitle>
          <CardDescription>
            点击应用颜色，右键删除
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-8 gap-3">
            {savedColors.map((color, index) => (
              <div key={index} className="relative group">
                <button
                  className="w-12 h-12 rounded-lg border border-gray-200 hover:scale-105 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => updateColor(color)}
                  title={color}
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute -top-1 -right-1 w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => removeSavedColor(color)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 颜色历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近使用</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {colorHistory.map((color, index) => (
              <button
                key={index}
                className="w-10 h-10 rounded border border-gray-200 hover:scale-105 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => updateColor(color)}
                title={color}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 颜色方案 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">颜色方案</CardTitle>
          <CardDescription>
            基于当前颜色生成的配色方案
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { name: '互补色', type: 'complementary' as const },
            { name: '三角色', type: 'triadic' as const },
            { name: '类似色', type: 'analogous' as const }
          ].map(({ name, type }) => (
            <div key={type} className="space-y-2">
              <Label>{name}</Label>
              <div className="flex gap-2">
                <div
                  className="w-12 h-12 rounded border border-gray-200"
                  style={{ backgroundColor: currentColor.hex }}
                  title="基础色"
                />
                {generateColorScheme(currentColor.hex, type).map((color, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded border border-gray-200 hover:scale-105 transition-transform"
                    style={{ backgroundColor: color }}
                    onClick={() => {
                      // 将HSL转换为HEX
                      const tempDiv = document.createElement('div')
                      tempDiv.style.color = color
                      document.body.appendChild(tempDiv)
                      const computedColor = window.getComputedStyle(tempDiv).color
                      document.body.removeChild(tempDiv)
                      
                      // 简单的RGB提取和转换
                      const rgb = computedColor.match(/\d+/g)
                      if (rgb) {
                        const hex = rgbToHex(parseInt(rgb[0]), parseInt(rgb[1]), parseInt(rgb[2]))
                        updateColor(hex)
                      }
                    }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 