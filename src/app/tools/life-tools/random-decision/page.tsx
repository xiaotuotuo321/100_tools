'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { Shuffle, Plus, X, Dice1, Dice3, Dice5, ArrowRight, Trash2 } from 'lucide-react'

export default function RandomDecisionPage() {
    // 选项列表
    const [options, setOptions] = useState<string[]>(['选项1', '选项2'])
    const [newOption, setNewOption] = useState('')
    const [result, setResult] = useState<string | null>(null)
    const [isSpinning, setIsSpinning] = useState(false)
    const [spinDuration, setSpinDuration] = useState(2000)
    const [quickDecision, setQuickDecision] = useState<string | null>(null)

    const resultRef = useRef<HTMLDivElement>(null)
    const { toast } = useToast()

    // 添加选项
    const addOption = () => {
        if (!newOption.trim()) {
            toast({
                title: '请输入选项',
                description: '选项内容不能为空',
                variant: 'destructive'
            })
            return
        }

        if (options.includes(newOption.trim())) {
            toast({
                title: '选项已存在',
                description: '请输入不同的选项',
                variant: 'destructive'
            })
            return
        }

        setOptions([...options, newOption.trim()])
        setNewOption('')
    }

    // 删除选项
    const removeOption = (index: number) => {
        const newOptions = [...options]
        newOptions.splice(index, 1)
        setOptions(newOptions)
    }

    // 清空所有选项
    const clearOptions = () => {
        setOptions([])
        setResult(null)
    }

    // 随机选择
    const makeDecision = () => {
        if (options.length < 2) {
            toast({
                title: '选项不足',
                description: '请至少添加两个选项',
                variant: 'destructive'
            })
            return
        }

        setIsSpinning(true)
        setResult(null)

        // 随机滚动效果
        let counter = 0
        const totalIterations = 20
        const interval = spinDuration / totalIterations

        const spin = setInterval(() => {
            const randomIndex = Math.floor(Math.random() * options.length)
            setResult(options[randomIndex])
            counter++

            if (counter >= totalIterations) {
                clearInterval(spin)
                const finalIndex = Math.floor(Math.random() * options.length)
                setResult(options[finalIndex])
                setIsSpinning(false)

                // 滚动到结果
                setTimeout(() => {
                    resultRef.current?.scrollIntoView({ behavior: 'smooth' })
                }, 100)
            }
        }, interval)
    }

    // 是/否快速决策
    const makeYesNoDecision = () => {
        setQuickDecision(null)
        setIsSpinning(true)

        // 随机滚动效果
        let counter = 0
        const totalIterations = 10
        const interval = 1000 / totalIterations

        const spin = setInterval(() => {
            setQuickDecision(Math.random() > 0.5 ? '是' : '否')
            counter++

            if (counter >= totalIterations) {
                clearInterval(spin)
                setQuickDecision(Math.random() > 0.5 ? '是' : '否')
                setIsSpinning(false)
            }
        }, interval)
    }

    // 随机数字
    const getRandomNumber = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            addOption()
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">随机决策器</h1>

            <Tabs defaultValue="custom">
                <TabsList className="grid w-full max-w-md grid-cols-3 mb-6">
                    <TabsTrigger value="custom">
                        <Shuffle className="mr-2 h-4 w-4" />
                        自定义选项
                    </TabsTrigger>
                    <TabsTrigger value="yesno">
                        <ArrowRight className="mr-2 h-4 w-4" />
                        是/否决策
                    </TabsTrigger>
                    <TabsTrigger value="numbers">
                        <Dice3 className="mr-2 h-4 w-4" />
                        随机数字
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex items-end space-x-2">
                                        <div className="flex-1">
                                            <Label htmlFor="new-option" className="mb-2 block">添加选项</Label>
                                            <Input
                                                id="new-option"
                                                placeholder="输入新选项"
                                                value={newOption}
                                                onChange={(e) => setNewOption(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                            />
                                        </div>
                                        <Button onClick={addOption}>
                                            <Plus className="h-4 w-4" />
                                            添加
                                        </Button>
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>当前选项列表</Label>
                                            {options.length > 0 && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearOptions}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-1" />
                                                    清空
                                                </Button>
                                            )}
                                        </div>

                                        {options.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                暂无选项，请添加至少两个选项
                                            </div>
                                        ) : (
                                            <div className="border rounded-md">
                                                {options.map((option, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center justify-between p-3 border-b last:border-0"
                                                    >
                                                        <span>{option}</span>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => removeOption(index)}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={makeDecision}
                                        disabled={options.length < 2 || isSpinning}
                                    >
                                        <Shuffle className="mr-2 h-4 w-4" />
                                        {isSpinning ? '正在选择...' : '随机选择'}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold mb-6">决策结果</h2>

                                    {result ? (
                                        <div
                                            ref={resultRef}
                                            className={`
                        text-3xl font-bold p-8 rounded-lg border-2 border-primary
                        ${isSpinning ? 'animate-pulse' : 'animate-in fade-in-50 duration-500'}
                      `}
                                        >
                                            {result}
                                        </div>
                                    ) : (
                                        <div className="text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                            {options.length < 2
                                                ? '请添加至少两个选项'
                                                : '点击"随机选择"按钮开始'}
                                        </div>
                                    )}

                                    {result && !isSpinning && (
                                        <Button
                                            variant="outline"
                                            className="mt-6"
                                            onClick={makeDecision}
                                        >
                                            <Shuffle className="mr-2 h-4 w-4" />
                                            重新选择
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="yesno">
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center space-y-8">
                                <div className="text-center max-w-md">
                                    <h2 className="text-xl font-semibold mb-2">是/否决策</h2>
                                    <p className="text-muted-foreground">
                                        无法做出决定？让随机决策器帮你选择是或否
                                    </p>
                                </div>

                                <div className="w-full max-w-xs">
                                    <Button
                                        className="w-full"
                                        size="lg"
                                        onClick={makeYesNoDecision}
                                        disabled={isSpinning}
                                    >
                                        <Shuffle className="mr-2 h-4 w-4" />
                                        {isSpinning ? '正在选择...' : '随机决定'}
                                    </Button>
                                </div>

                                {quickDecision && (
                                    <div
                                        className={`
                      text-6xl font-bold p-8 rounded-lg border-2 border-primary
                      ${isSpinning ? 'animate-pulse' : 'animate-in fade-in-50 duration-500'}
                      w-40 h-40 flex items-center justify-center
                    `}
                                    >
                                        {quickDecision}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="numbers">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <Dice1 className="h-12 w-12 text-primary" />
                                    <h3 className="text-lg font-medium">掷骰子 (1-6)</h3>

                                    <div className="text-5xl font-bold h-20 w-20 flex items-center justify-center border-2 rounded-lg">
                                        {getRandomNumber(1, 6)}
                                    </div>

                                    <Button
                                        onClick={() => {
                                            const dice = document.querySelector('#dice-1')
                                            if (dice) {
                                                dice.textContent = getRandomNumber(1, 6).toString()
                                                dice.classList.add('animate-bounce')
                                                setTimeout(() => {
                                                    dice.classList.remove('animate-bounce')
                                                }, 500)
                                            }
                                        }}
                                    >
                                        重新掷骰
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <Dice3 className="h-12 w-12 text-primary" />
                                    <h3 className="text-lg font-medium">随机数 (1-100)</h3>

                                    <div className="text-5xl font-bold h-20 w-20 flex items-center justify-center border-2 rounded-lg">
                                        {getRandomNumber(1, 100)}
                                    </div>

                                    <Button
                                        onClick={() => {
                                            const number = document.querySelector('#number-100')
                                            if (number) {
                                                number.textContent = getRandomNumber(1, 100).toString()
                                                number.classList.add('animate-bounce')
                                                setTimeout(() => {
                                                    number.classList.remove('animate-bounce')
                                                }, 500)
                                            }
                                        }}
                                    >
                                        重新生成
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex flex-col items-center space-y-4">
                                    <Dice5 className="h-12 w-12 text-primary" />
                                    <h3 className="text-lg font-medium">随机数 (自定义范围)</h3>

                                    <div className="grid grid-cols-2 gap-2 w-full">
                                        <div>
                                            <Label htmlFor="min-number">最小值</Label>
                                            <Input
                                                id="min-number"
                                                type="number"
                                                defaultValue="1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="max-number">最大值</Label>
                                            <Input
                                                id="max-number"
                                                type="number"
                                                defaultValue="1000"
                                            />
                                        </div>
                                    </div>

                                    <div className="text-4xl font-bold h-20 w-full flex items-center justify-center border-2 rounded-lg">
                                        {getRandomNumber(1, 1000)}
                                    </div>

                                    <Button
                                        onClick={() => {
                                            const minInput = document.querySelector('#min-number') as HTMLInputElement
                                            const maxInput = document.querySelector('#max-number') as HTMLInputElement
                                            const customNumber = document.querySelector('#custom-number')

                                            if (minInput && maxInput && customNumber) {
                                                const min = parseInt(minInput.value) || 1
                                                const max = parseInt(maxInput.value) || 1000

                                                if (min >= max) {
                                                    toast({
                                                        title: '范围错误',
                                                        description: '最小值必须小于最大值',
                                                        variant: 'destructive'
                                                    })
                                                    return
                                                }

                                                customNumber.textContent = getRandomNumber(min, max).toString()
                                                customNumber.classList.add('animate-bounce')
                                                setTimeout(() => {
                                                    customNumber.classList.remove('animate-bounce')
                                                }, 500)
                                            }
                                        }}
                                    >
                                        生成随机数
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4">使用说明</h2>
                <ul className="list-disc pl-5 space-y-2">
                    <li><strong>自定义选项</strong>：添加多个选项，系统将随机选择其中一个</li>
                    <li><strong>是/否决策</strong>：快速做出二选一的决定</li>
                    <li><strong>随机数字</strong>：生成不同范围的随机数字</li>
                    <li>当你面临选择困难时，随机决策可以帮助你打破僵局</li>
                    <li>对于重要决策，建议仅将随机结果作为参考，结合自身判断做出最终决定</li>
                </ul>
            </div>
        </div>
    )
}