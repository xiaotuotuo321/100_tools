'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Check, RefreshCw, Trophy, Timer, Brain, BarChart4 } from 'lucide-react'

// 游戏难度
type Difficulty = 'easy' | 'medium' | 'hard' | 'custom'

// 游戏记录
interface GameRecord {
    difficulty: string
    targetNumber: number
    attempts: number
    time: number
    date: string
    won: boolean
}

export default function NumberGuessingPage() {
    // 游戏状态
    const [isPlaying, setIsPlaying] = useState(false)
    const [targetNumber, setTargetNumber] = useState(0)
    const [currentGuess, setCurrentGuess] = useState('')
    const [attempts, setAttempts] = useState(0)
    const [maxAttempts, setMaxAttempts] = useState(10)
    const [minNumber, setMinNumber] = useState(1)
    const [maxNumber, setMaxNumber] = useState(100)
    const [customMin, setCustomMin] = useState(1)
    const [customMax, setCustomMax] = useState(100)
    const [guessHistory, setGuessHistory] = useState<number[]>([])
    const [hint, setHint] = useState<'higher' | 'lower' | 'correct' | null>(null)
    const [gameResult, setGameResult] = useState<'won' | 'lost' | null>(null)
    const [difficulty, setDifficulty] = useState<Difficulty>('medium')
    const [gameRecords, setGameRecords] = useState<GameRecord[]>([])
    const [startTime, setStartTime] = useState(0)
    const [elapsedTime, setElapsedTime] = useState(0)
    const [bestScore, setBestScore] = useState<GameRecord | null>(null)

    const inputRef = useRef<HTMLInputElement>(null)
    const { toast } = useToast()

    // 初始化游戏
    const initializeGame = (diff: Difficulty = difficulty) => {
        let min = minNumber
        let max = maxNumber
        let attempts = maxAttempts

        switch (diff) {
            case 'easy':
                min = 1
                max = 50
                attempts = 10
                break
            case 'medium':
                min = 1
                max = 100
                attempts = 7
                break
            case 'hard':
                min = 1
                max = 200
                attempts = 8
                break
            case 'custom':
                min = customMin
                max = customMax
                attempts = maxAttempts
                break
        }

        setMinNumber(min)
        setMaxNumber(max)
        setMaxAttempts(attempts)

        // 生成目标数字
        const target = Math.floor(Math.random() * (max - min + 1)) + min
        setTargetNumber(target)

        // 重置游戏状态
        setIsPlaying(true)
        setCurrentGuess('')
        setAttempts(0)
        setGuessHistory([])
        setHint(null)
        setGameResult(null)
        setStartTime(Date.now())
        setElapsedTime(0)

        // 自动聚焦输入框
        setTimeout(() => {
            inputRef.current?.focus()
        }, 100)
    }

    // 提交猜测
    const submitGuess = () => {
        const guess = parseInt(currentGuess)

        // 验证输入
        if (isNaN(guess)) {
            toast({
                title: '请输入有效数字',
                variant: 'destructive'
            })
            return
        }

        if (guess < minNumber || guess > maxNumber) {
            toast({
                title: `请输入 ${minNumber} 到 ${maxNumber} 之间的数字`,
                variant: 'destructive'
            })
            return
        }

        // 更新尝试次数和历史
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setGuessHistory([...guessHistory, guess])

        // 判断结果
        if (guess === targetNumber) {
            // 计算用时
            const endTime = Date.now()
            const timeUsed = Math.floor((endTime - startTime) / 1000)
            setElapsedTime(timeUsed)

            // 游戏胜利
            setHint('correct')
            setGameResult('won')
            setIsPlaying(false)

            // 记录游戏结果
            const record: GameRecord = {
                difficulty: difficulty,
                targetNumber,
                attempts: newAttempts,
                time: timeUsed,
                date: new Date().toISOString(),
                won: true
            }

            const newRecords = [...gameRecords, record]
            setGameRecords(newRecords)

            // 更新最佳记录
            updateBestScore(record, newRecords)

            toast({
                title: '恭喜你猜对了!',
                description: `你用了 ${newAttempts} 次尝试和 ${timeUsed} 秒`,
                variant: 'default'
            })
        } else if (newAttempts >= maxAttempts) {
            // 游戏失败
            setHint(guess < targetNumber ? 'higher' : 'lower')
            setGameResult('lost')
            setIsPlaying(false)

            // 计算用时
            const endTime = Date.now()
            const timeUsed = Math.floor((endTime - startTime) / 1000)
            setElapsedTime(timeUsed)

            // 记录游戏结果
            const record: GameRecord = {
                difficulty,
                targetNumber,
                attempts: newAttempts,
                time: timeUsed,
                date: new Date().toISOString(),
                won: false
            }

            setGameRecords([...gameRecords, record])

            toast({
                title: '游戏结束',
                description: `正确答案是 ${targetNumber}`,
                variant: 'destructive'
            })
        } else {
            // 继续游戏
            setHint(guess < targetNumber ? 'higher' : 'lower')
            setCurrentGuess('')

            // 自动聚焦输入框
            inputRef.current?.focus()
        }
    }

    // 更新最佳记录
    const updateBestScore = (newRecord: GameRecord, allRecords: GameRecord[] = gameRecords) => {
        const winningRecords = allRecords.filter(r => r.won && r.difficulty === difficulty)

        if (winningRecords.length === 0) {
            setBestScore(newRecord)
            return
        }

        // 按尝试次数和时间排序
        winningRecords.sort((a, b) => {
            if (a.attempts !== b.attempts) {
                return a.attempts - b.attempts
            }
            return a.time - b.time
        })

        setBestScore(winningRecords[0])
    }

    // 计时器
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null

        if (isPlaying) {
            timer = setInterval(() => {
                const currentTime = Math.floor((Date.now() - startTime) / 1000)
                setElapsedTime(currentTime)
            }, 1000)
        }

        return () => {
            if (timer) clearInterval(timer)
        }
    }, [isPlaying, startTime])

    // 加载本地存储的游戏记录
    useEffect(() => {
        const savedRecords = localStorage.getItem('number-guessing-records')
        if (savedRecords) {
            try {
                const records = JSON.parse(savedRecords) as GameRecord[]
                setGameRecords(records)

                // 设置最佳记录
                const currentDiffRecords = records.filter(r => r.won && r.difficulty === difficulty)
                if (currentDiffRecords.length > 0) {
                    currentDiffRecords.sort((a, b) => {
                        if (a.attempts !== b.attempts) {
                            return a.attempts - b.attempts
                        }
                        return a.time - b.time
                    })
                    setBestScore(currentDiffRecords[0])
                }
            } catch (e) {
                console.error('无法解析保存的游戏记录', e)
            }
        }
    }, [])

    // 保存游戏记录到本地存储
    useEffect(() => {
        if (gameRecords.length > 0) {
            localStorage.setItem('number-guessing-records', JSON.stringify(gameRecords))
        }
    }, [gameRecords])

    // 当难度改变时更新最佳记录
    useEffect(() => {
        const currentDiffRecords = gameRecords.filter(r => r.won && r.difficulty === difficulty)
        if (currentDiffRecords.length > 0) {
            currentDiffRecords.sort((a, b) => {
                if (a.attempts !== b.attempts) {
                    return a.attempts - b.attempts
                }
                return a.time - b.time
            })
            setBestScore(currentDiffRecords[0])
        } else {
            setBestScore(null)
        }
    }, [difficulty, gameRecords])

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && isPlaying) {
            submitGuess()
        }
    }

    // 获取提示文本
    const getHintText = () => {
        if (!hint) return '等待你的猜测...'
        if (hint === 'higher') return '猜大一点!'
        if (hint === 'lower') return '猜小一点!'
        return '恭喜你猜对了!'
    }

    // 获取提示图标
    const getHintIcon = () => {
        if (!hint) return null
        if (hint === 'higher') return <ArrowUp className="h-6 w-6" />
        if (hint === 'lower') return <ArrowDown className="h-6 w-6" />
        return <Check className="h-6 w-6" />
    }

    // 获取难度文本
    const getDifficultyText = (diff: string) => {
        switch (diff) {
            case 'easy': return '简单 (1-50)'
            case 'medium': return '中等 (1-100)'
            case 'hard': return '困难 (1-200)'
            case 'custom': return `自定义 (${customMin}-${customMax})`
            default: return diff
        }
    }

    // 格式化时间
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">猜数字游戏</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            {!isPlaying && !gameResult ? (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-semibold">选择难度开始游戏</h2>

                                    <Tabs value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="easy">简单</TabsTrigger>
                                            <TabsTrigger value="medium">中等</TabsTrigger>
                                            <TabsTrigger value="hard">困难</TabsTrigger>
                                            <TabsTrigger value="custom">自定义</TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="custom" className="mt-4">
                                            <div className="space-y-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <Label htmlFor="min-number">最小值</Label>
                                                        <Input
                                                            id="min-number"
                                                            type="number"
                                                            value={customMin}
                                                            onChange={(e) => setCustomMin(parseInt(e.target.value) || 1)}
                                                            min="1"
                                                            max="999"
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor="max-number">最大值</Label>
                                                        <Input
                                                            id="max-number"
                                                            type="number"
                                                            value={customMax}
                                                            onChange={(e) => setCustomMax(parseInt(e.target.value) || 100)}
                                                            min="10"
                                                            max="1000"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="max-attempts">最大尝试次数</Label>
                                                    <div className="flex items-center space-x-4">
                                                        <Slider
                                                            id="max-attempts"
                                                            value={[maxAttempts]}
                                                            min={5}
                                                            max={20}
                                                            step={1}
                                                            onValueChange={(value) => setMaxAttempts(value[0])}
                                                            className="flex-1"
                                                        />
                                                        <span className="w-12 text-center">{maxAttempts}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </TabsContent>
                                    </Tabs>

                                    <div className="flex justify-center">
                                        <Button size="lg" onClick={() => initializeGame()}>
                                            开始游戏
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-semibold">
                                            猜一个 {minNumber} 到 {maxNumber} 之间的数字
                                        </h2>

                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline">
                                                <Timer className="h-4 w-4 mr-1" />
                                                {formatTime(elapsedTime)}
                                            </Badge>

                                            <Badge variant="outline">
                                                {attempts}/{maxAttempts} 次
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center space-y-4">
                                        <div className={`text-2xl font-bold flex items-center space-x-2 ${hint === 'higher' ? 'text-orange-500' :
                                                hint === 'lower' ? 'text-blue-500' :
                                                    hint === 'correct' ? 'text-green-500' : ''
                                            }`}>
                                            {getHintIcon()}
                                            <span>{getHintText()}</span>
                                        </div>

                                        {isPlaying ? (
                                            <div className="w-full max-w-md space-y-4">
                                                <div className="flex space-x-2">
                                                    <Input
                                                        ref={inputRef}
                                                        type="number"
                                                        placeholder={`输入 ${minNumber} 到 ${maxNumber} 之间的数字`}
                                                        value={currentGuess}
                                                        onChange={(e) => setCurrentGuess(e.target.value)}
                                                        onKeyDown={handleKeyDown}
                                                        min={minNumber}
                                                        max={maxNumber}
                                                        className="text-lg"
                                                    />
                                                    <Button onClick={submitGuess}>
                                                        猜测
                                                    </Button>
                                                </div>

                                                <Progress value={(attempts / maxAttempts) * 100} className="h-2" />
                                            </div>
                                        ) : (
                                            <div className="text-center space-y-4">
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    className={`text-4xl font-bold ${gameResult === 'won' ? 'text-green-500' : 'text-red-500'}`}
                                                >
                                                    {gameResult === 'won' ? (
                                                        <div className="flex items-center justify-center">
                                                            <Trophy className="h-8 w-8 mr-2" />
                                                            <span>你赢了!</span>
                                                        </div>
                                                    ) : (
                                                        <div>游戏结束! 正确答案是 {targetNumber}</div>
                                                    )}
                                                </motion.div>

                                                <Button onClick={() => initializeGame()}>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    再玩一次
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {guessHistory.length > 0 && (
                                        <div>
                                            <h3 className="font-medium mb-2">猜测历史</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {guessHistory.map((guess, index) => (
                                                    <Badge
                                                        key={index}
                                                        variant={
                                                            guess === targetNumber ? "default" :
                                                                guess < targetNumber ? "secondary" : "outline"
                                                        }
                                                        className={
                                                            guess === targetNumber ? "bg-green-500" :
                                                                guess < targetNumber ? "bg-blue-100 text-blue-800" : "bg-orange-100 text-orange-800"
                                                        }
                                                    >
                                                        {guess}
                                                        {guess < targetNumber && <ArrowUp className="h-3 w-3 ml-1" />}
                                                        {guess > targetNumber && <ArrowDown className="h-3 w-3 ml-1" />}
                                                        {guess === targetNumber && <Check className="h-3 w-3 ml-1" />}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">游戏规则</h2>

                            <div className="space-y-4">
                                <p>猜数字是一个简单而有趣的游戏：</p>

                                <ul className="list-disc pl-5 space-y-2">
                                    <li>系统会随机生成一个指定范围内的数字</li>
                                    <li>你需要在有限的尝试次数内猜出这个数字</li>
                                    <li>每次猜测后，系统会告诉你猜的数字是太大还是太小</li>
                                    <li>根据提示调整你的猜测，直到猜中正确的数字</li>
                                </ul>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="border rounded-md p-4 flex flex-col items-center">
                                        <div className="text-green-500 mb-2">
                                            <Brain className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-medium mb-1">策略</h3>
                                        <p className="text-sm text-center text-muted-foreground">
                                            使用二分法可以更快地找到目标数字
                                        </p>
                                    </div>

                                    <div className="border rounded-md p-4 flex flex-col items-center">
                                        <div className="text-blue-500 mb-2">
                                            <Timer className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-medium mb-1">速度</h3>
                                        <p className="text-sm text-center text-muted-foreground">
                                            尝试用最少的猜测次数和时间完成
                                        </p>
                                    </div>

                                    <div className="border rounded-md p-4 flex flex-col items-center">
                                        <div className="text-orange-500 mb-2">
                                            <BarChart4 className="h-8 w-8" />
                                        </div>
                                        <h3 className="font-medium mb-1">难度</h3>
                                        <p className="text-sm text-center text-muted-foreground">
                                            挑战不同难度级别，提高你的猜数字技巧
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">最佳记录</h2>

                            {bestScore ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <Badge>{getDifficultyText(bestScore.difficulty)}</Badge>
                                        <div className="text-sm text-muted-foreground">
                                            {new Date(bestScore.date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="border rounded-md p-2">
                                            <div className="text-2xl font-bold">{bestScore.attempts}</div>
                                            <div className="text-xs text-muted-foreground">尝试次数</div>
                                        </div>
                                        <div className="border rounded-md p-2">
                                            <div className="text-2xl font-bold">{bestScore.time}秒</div>
                                            <div className="text-xs text-muted-foreground">用时</div>
                                        </div>
                                        <div className="border rounded-md p-2">
                                            <div className="text-2xl font-bold">{bestScore.targetNumber}</div>
                                            <div className="text-xs text-muted-foreground">目标数字</div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    还没有记录，开始游戏吧!
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">游戏历史</h2>

                                {gameRecords.length > 0 && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setGameRecords([])
                                            setBestScore(null)
                                            localStorage.removeItem('number-guessing-records')
                                        }}
                                    >
                                        清除历史
                                    </Button>
                                )}
                            </div>

                            {gameRecords.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    还没有游戏记录
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                                    {gameRecords.slice().reverse().map((record, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-md border ${record.won ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <Badge variant="outline">
                                                    {getDifficultyText(record.difficulty)}
                                                </Badge>
                                                <div className="text-xs text-muted-foreground">
                                                    {new Date(record.date).toLocaleDateString()}
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="font-medium">目标: {record.targetNumber}</span>
                                                    <span className="text-sm text-muted-foreground ml-2">
                                                        {record.attempts}次尝试 / {record.time}秒
                                                    </span>
                                                </div>

                                                <Badge variant={record.won ? "default" : "destructive"}>
                                                    {record.won ? '胜利' : '失败'}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}