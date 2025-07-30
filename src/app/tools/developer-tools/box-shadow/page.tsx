"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, Check, RotateCw } from 'lucide-react'

interface ShadowSettings {
    horizontalOffset: number
    verticalOffset: number
    blur: number
    spread: number
    color: string
    opacity: number
    inset: boolean
}

export default function BoxShadow() {
    const [activeTab, setActiveTab] = useState<'box-shadow' | 'text-shadow'>('box-shadow')
    const [boxShadow, setBoxShadow] = useState<ShadowSettings>({
        horizontalOffset: 5,
        verticalOffset: 5,
        blur: 10,
        spread: 0,
        color: '#000000',
        opacity: 20,
        inset: false
    })

    const [textShadow, setTextShadow] = useState<Omit<ShadowSettings, 'spread' | 'inset'>>({
        horizontalOffset: 2,
        verticalOffset: 2,
        blur: 3,
        color: '#000000',
        opacity: 50
    })

    const [cssCode, setCssCode] = useState('')
    const [copied, setCopied] = useState(false)
    const [presetName, setPresetName] = useState('自定义')

    // 生成CSS代码
    useEffect(() => {
        if (activeTab === 'box-shadow') {
            const { horizontalOffset, verticalOffset, blur, spread, color, opacity, inset } = boxShadow
            const hexColor = convertHexOpacity(color, opacity)
            const shadowValue = `${inset ? 'inset ' : ''}${horizontalOffset}px ${verticalOffset}px ${blur}px ${spread}px ${hexColor}`
            setCssCode(`box-shadow: ${shadowValue};`)
        } else {
            const { horizontalOffset, verticalOffset, blur, color, opacity } = textShadow
            const hexColor = convertHexOpacity(color, opacity)
            const shadowValue = `${horizontalOffset}px ${verticalOffset}px ${blur}px ${hexColor}`
            setCssCode(`text-shadow: ${shadowValue};`)
        }
    }, [activeTab, boxShadow, textShadow])

    // 转换颜色和透明度为rgba
    const convertHexOpacity = (hex: string, opacity: number): string => {
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
    }

    // 复制CSS代码
    const copyToClipboard = () => {
        navigator.clipboard.writeText(cssCode)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // 更新阴影设置
    const updateBoxShadow = (field: keyof ShadowSettings, value: number | string | boolean) => {
        setBoxShadow(prev => ({ ...prev, [field]: value }))
        setPresetName('自定义')
    }

    // 更新文字阴影设置
    const updateTextShadow = (field: keyof Omit<ShadowSettings, 'spread' | 'inset'>, value: number | string) => {
        setTextShadow(prev => ({ ...prev, [field]: value }))
        setPresetName('自定义')
    }

    // 应用预设
    const applyPreset = (preset: ShadowSettings) => {
        setBoxShadow(preset)
    }

    // 应用文字阴影预设
    const applyTextPreset = (preset: Omit<ShadowSettings, 'spread' | 'inset'>) => {
        setTextShadow(preset)
    }

    // 随机生成阴影
    const generateRandomShadow = () => {
        if (activeTab === 'box-shadow') {
            const randomBoxShadow: ShadowSettings = {
                horizontalOffset: Math.floor(Math.random() * 20) - 10,
                verticalOffset: Math.floor(Math.random() * 20) - 10,
                blur: Math.floor(Math.random() * 30),
                spread: Math.floor(Math.random() * 20) - 10,
                color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                opacity: Math.floor(Math.random() * 100),
                inset: Math.random() > 0.7
            }
            setBoxShadow(randomBoxShadow)
        } else {
            const randomTextShadow = {
                horizontalOffset: Math.floor(Math.random() * 10) - 5,
                verticalOffset: Math.floor(Math.random() * 10) - 5,
                blur: Math.floor(Math.random() * 10),
                color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
                opacity: Math.floor(Math.random() * 100)
            }
            setTextShadow(randomTextShadow)
        }
        setPresetName('随机')
    }

    // 盒子阴影预设
    const boxShadowPresets = [
        {
            name: '轻微阴影',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 2,
                blur: 4,
                spread: 0,
                color: '#000000',
                opacity: 10,
                inset: false
            }
        },
        {
            name: '中等阴影',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 4,
                blur: 8,
                spread: 0,
                color: '#000000',
                opacity: 20,
                inset: false
            }
        },
        {
            name: '强烈阴影',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 8,
                blur: 16,
                spread: 0,
                color: '#000000',
                opacity: 30,
                inset: false
            }
        },
        {
            name: '内阴影',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 5,
                blur: 10,
                spread: -5,
                color: '#000000',
                opacity: 30,
                inset: true
            }
        },
        {
            name: '浮动效果',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 10,
                blur: 20,
                spread: -5,
                color: '#000000',
                opacity: 20,
                inset: false
            }
        }
    ]

    // 文字阴影预设
    const textShadowPresets = [
        {
            name: '轻微阴影',
            settings: {
                horizontalOffset: 1,
                verticalOffset: 1,
                blur: 2,
                color: '#000000',
                opacity: 30
            }
        },
        {
            name: '中等阴影',
            settings: {
                horizontalOffset: 2,
                verticalOffset: 2,
                blur: 3,
                color: '#000000',
                opacity: 50
            }
        },
        {
            name: '强烈阴影',
            settings: {
                horizontalOffset: 3,
                verticalOffset: 3,
                blur: 5,
                color: '#000000',
                opacity: 70
            }
        },
        {
            name: '霓虹效果',
            settings: {
                horizontalOffset: 0,
                verticalOffset: 0,
                blur: 10,
                color: '#ff00ff',
                opacity: 80
            }
        },
        {
            name: '3D效果',
            settings: {
                horizontalOffset: 2,
                verticalOffset: 2,
                blur: 0,
                color: '#000000',
                opacity: 50
            }
        }
    ]

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">阴影生成器</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="mb-6 overflow-hidden">
                        <div className="p-10 flex items-center justify-center bg-muted/30">
                            {activeTab === 'box-shadow' ? (
                                <div
                                    className="w-48 h-48 bg-white rounded-md flex items-center justify-center"
                                    style={{ boxShadow: cssCode.replace('box-shadow: ', '') }}
                                >
                                    <span className="text-gray-500">预览效果</span>
                                </div>
                            ) : (
                                <div
                                    className="text-5xl font-bold"
                                    style={{ textShadow: cssCode.replace('text-shadow: ', '') }}
                                >
                                    文字阴影
                                </div>
                            )}
                        </div>
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
                                    <Label className="text-base">阴影类型</Label>
                                    <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'box-shadow' | 'text-shadow')} className="mt-2">
                                        <TabsList className="grid grid-cols-2">
                                            <TabsTrigger value="box-shadow">盒子阴影</TabsTrigger>
                                            <TabsTrigger value="text-shadow">文字阴影</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="text-base font-medium">当前预设: {presetName}</div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={generateRandomShadow}
                                        className="flex items-center gap-1"
                                    >
                                        <RotateCw className="h-4 w-4" />
                                        随机生成
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {activeTab === 'box-shadow' ? (
                                        boxShadowPresets.map((preset) => (
                                            <Button
                                                key={preset.name}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    applyPreset(preset.settings)
                                                    setPresetName(preset.name)
                                                }}
                                            >
                                                {preset.name}
                                            </Button>
                                        ))
                                    ) : (
                                        textShadowPresets.map((preset) => (
                                            <Button
                                                key={preset.name}
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    applyTextPreset(preset.settings)
                                                    setPresetName(preset.name)
                                                }}
                                            >
                                                {preset.name}
                                            </Button>
                                        ))
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label htmlFor="horizontal-offset">水平偏移</Label>
                                            <span>{activeTab === 'box-shadow' ? boxShadow.horizontalOffset : textShadow.horizontalOffset}px</span>
                                        </div>
                                        <Slider
                                            id="horizontal-offset"
                                            min={-50}
                                            max={50}
                                            step={1}
                                            value={[activeTab === 'box-shadow' ? boxShadow.horizontalOffset : textShadow.horizontalOffset]}
                                            onValueChange={(value) => {
                                                if (activeTab === 'box-shadow') {
                                                    updateBoxShadow('horizontalOffset', value[0])
                                                } else {
                                                    updateTextShadow('horizontalOffset', value[0])
                                                }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label htmlFor="vertical-offset">垂直偏移</Label>
                                            <span>{activeTab === 'box-shadow' ? boxShadow.verticalOffset : textShadow.verticalOffset}px</span>
                                        </div>
                                        <Slider
                                            id="vertical-offset"
                                            min={-50}
                                            max={50}
                                            step={1}
                                            value={[activeTab === 'box-shadow' ? boxShadow.verticalOffset : textShadow.verticalOffset]}
                                            onValueChange={(value) => {
                                                if (activeTab === 'box-shadow') {
                                                    updateBoxShadow('verticalOffset', value[0])
                                                } else {
                                                    updateTextShadow('verticalOffset', value[0])
                                                }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label htmlFor="blur">模糊半径</Label>
                                            <span>{activeTab === 'box-shadow' ? boxShadow.blur : textShadow.blur}px</span>
                                        </div>
                                        <Slider
                                            id="blur"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={[activeTab === 'box-shadow' ? boxShadow.blur : textShadow.blur]}
                                            onValueChange={(value) => {
                                                if (activeTab === 'box-shadow') {
                                                    updateBoxShadow('blur', value[0])
                                                } else {
                                                    updateTextShadow('blur', value[0])
                                                }
                                            }}
                                        />
                                    </div>

                                    {activeTab === 'box-shadow' && (
                                        <div>
                                            <div className="flex justify-between text-sm mb-1">
                                                <Label htmlFor="spread">扩散半径</Label>
                                                <span>{boxShadow.spread}px</span>
                                            </div>
                                            <Slider
                                                id="spread"
                                                min={-50}
                                                max={50}
                                                step={1}
                                                value={[boxShadow.spread]}
                                                onValueChange={(value) => updateBoxShadow('spread', value[0])}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex justify-between text-sm mb-1">
                                            <Label htmlFor="opacity">不透明度</Label>
                                            <span>{activeTab === 'box-shadow' ? boxShadow.opacity : textShadow.opacity}%</span>
                                        </div>
                                        <Slider
                                            id="opacity"
                                            min={0}
                                            max={100}
                                            step={1}
                                            value={[activeTab === 'box-shadow' ? boxShadow.opacity : textShadow.opacity]}
                                            onValueChange={(value) => {
                                                if (activeTab === 'box-shadow') {
                                                    updateBoxShadow('opacity', value[0])
                                                } else {
                                                    updateTextShadow('opacity', value[0])
                                                }
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="color">颜色</Label>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div
                                                className="w-8 h-8 rounded-full border"
                                                style={{ backgroundColor: activeTab === 'box-shadow' ? boxShadow.color : textShadow.color }}
                                            />
                                            <Input
                                                id="color"
                                                type="color"
                                                value={activeTab === 'box-shadow' ? boxShadow.color : textShadow.color}
                                                onChange={(e) => {
                                                    if (activeTab === 'box-shadow') {
                                                        updateBoxShadow('color', e.target.value)
                                                    } else {
                                                        updateTextShadow('color', e.target.value)
                                                    }
                                                }}
                                                className="w-24 p-1 h-8"
                                            />
                                            <Input
                                                type="text"
                                                value={activeTab === 'box-shadow' ? boxShadow.color : textShadow.color}
                                                onChange={(e) => {
                                                    if (activeTab === 'box-shadow') {
                                                        updateBoxShadow('color', e.target.value)
                                                    } else {
                                                        updateTextShadow('color', e.target.value)
                                                    }
                                                }}
                                                className="flex-1"
                                            />
                                        </div>
                                    </div>

                                    {activeTab === 'box-shadow' && (
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="inset"
                                                checked={boxShadow.inset}
                                                onCheckedChange={(checked) => updateBoxShadow('inset', checked)}
                                            />
                                            <Label htmlFor="inset">内阴影</Label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">阴影属性说明</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">盒子阴影 (box-shadow)</h3>
                            <p className="mb-4 text-muted-foreground">
                                盒子阴影属性用于在元素的框架周围添加阴影效果。
                            </p>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">水平偏移</span>
                                    <p className="text-sm text-muted-foreground">阴影的水平位置。正值将阴影置于元素右侧，负值将阴影置于元素左侧。</p>
                                </div>
                                <div>
                                    <span className="font-medium">垂直偏移</span>
                                    <p className="text-sm text-muted-foreground">阴影的垂直位置。正值将阴影置于元素下方，负值将阴影置于元素上方。</p>
                                </div>
                                <div>
                                    <span className="font-medium">模糊半径</span>
                                    <p className="text-sm text-muted-foreground">阴影的模糊程度。值越大，阴影越模糊。</p>
                                </div>
                                <div>
                                    <span className="font-medium">扩散半径</span>
                                    <p className="text-sm text-muted-foreground">阴影的大小。正值使阴影扩大，负值使阴影缩小。</p>
                                </div>
                                <div>
                                    <span className="font-medium">内阴影</span>
                                    <p className="text-sm text-muted-foreground">将阴影设置为内部阴影。默认情况下，阴影是外部阴影（outset）。</p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">文字阴影 (text-shadow)</h3>
                            <p className="mb-4 text-muted-foreground">
                                文字阴影属性用于为文本添加阴影效果。
                            </p>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">水平偏移</span>
                                    <p className="text-sm text-muted-foreground">阴影的水平位置。正值将阴影置于文本右侧，负值将阴影置于文本左侧。</p>
                                </div>
                                <div>
                                    <span className="font-medium">垂直偏移</span>
                                    <p className="text-sm text-muted-foreground">阴影的垂直位置。正值将阴影置于文本下方，负值将阴影置于文本上方。</p>
                                </div>
                                <div>
                                    <span className="font-medium">模糊半径</span>
                                    <p className="text-sm text-muted-foreground">阴影的模糊程度。值越大，阴影越模糊。</p>
                                </div>
                                <div>
                                    <span className="font-medium">多重阴影</span>
                                    <p className="text-sm text-muted-foreground">可以通过逗号分隔多个阴影值来创建多重阴影效果。</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">使用提示</h3>
                        <ul className="list-disc pl-6 space-y-1">
                            <li>使用预设可以快速应用常见的阴影效果</li>
                            <li>调整不透明度可以创建更柔和的阴影效果</li>
                            <li>内阴影（inset）可以创建凹陷或压印效果</li>
                            <li>负的扩散半径可以创建更精细的阴影边缘</li>
                            <li>文字阴影可以提高文本在不同背景上的可读性</li>
                            <li>尝试使用彩色阴影来创建更有趣的视觉效果</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}