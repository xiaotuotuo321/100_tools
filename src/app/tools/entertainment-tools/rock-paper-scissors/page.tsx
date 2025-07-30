'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'

// 游戏选项类型
type Choice = '石头' | '剪刀' | '布'
type Result = '胜利' | '失败' | '平局' | null

export default function RockPaperScissorsPage() {
    // 游戏状态
    const [playerChoice, setPlayerChoice] = useState<Choice | null>(null)
    const [computerChoice, setComputerChoice] = useState<Choice | null>(null)
    const [result, setResult] = useState<Result>(null)
    const [countdown, setCountdown] = useState<number | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [score, setScore] = useState({ player: 0, computer: 0, ties: 0 })
    const [gameHistory, setGameHistory] = useState<Array<{ player: Choice, computer: Choice, result: Result }>>([])
    const [winStreak, setWinStreak] = useState(0)
    const [bestStreak, setBestStreak] = useState(0)
    const [gameMode, setGameMode] = useState<'normal' | 'hard'>('normal')

    // 选项配置
    const choices: Choice[] = ['石头', '剪刀', '布']

    // 选项图标
    const choiceIcons: Record<Choice, string> = {
        '石头': '✊',
        '剪刀': '✌️',
        '布': '✋'
    }

    // 开始游戏
    const startGame = (choice: Choice) => {
        setPlayerChoice(choice)
        setIsPlaying(true)
        setCountdown(3)
    }

    // 重置游戏
    const resetGame = () => {
        setPlayerChoice(null)
        setComputerChoice(null)
        setResult(null)
        setCountdown(null)
        setIsPlaying(false)
    }

    // 计算游戏结果
    const calculateResult = (player: Choice, computer: Choice): Result => {
        if (player === computer) return '平局'

        if (
            (player === '石头' && computer === '剪刀') ||
            (player === '剪刀' && computer === '布') ||
            (player === '布' && computer === '石头')
        ) {
            return '胜利'
        }

        return '失败'
    }

    // 电脑选择逻辑
    const getComputerChoice = (): Choice => {
        if (gameMode === 'normal') {
            // 普通模式：随机选择
            const randomIndex = Math.floor(Math.random() * choices.length)
            return choices[randomIndex]
        } else {
            // 困难模式：根据玩家历史选择进行预测
            if (gameHistory.length < 3) {
                // 历史记录不足时随机选择
                const randomIndex = Math.floor(Math.random() * choices.length)
                return choices[randomIndex]
            } else {
                // 分析玩家的选择模式
                const recentChoices = gameHistory.slice(-5).map(game => game.player)

                // 计算玩家选择的频率
                const choiceFrequency: Record<Choice, number> = {
                    '石头': 0,
                    '剪刀': 0,
                    '布': 0
                }

                recentChoices.forEach(choice => {
                    choiceFrequency[choice]++
                })

                // 预测玩家最可能的下一个选择（简单策略：选择最常用的）
                let predictedChoice: Choice = '石头'
                let maxFrequency = 0

                for (const [choice, frequency] of Object.entries(choiceFrequency) as [Choice, number][]) {
                    if (frequency > maxFrequency) {
                        maxFrequency = frequency
                        predictedChoice = choice
                    }
                }

                // 选择能击败预测选择的选项
                if (predictedChoice === '石头') return '布'
                if (predictedChoice === '剪刀') return '石头'
                return '剪刀'
            }
        }
    }

    // 倒计时效果
    useEffect(() => {
        if (countdown === null) return

        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1)
            }, 500)
            return () => clearTimeout(timer)
        } else {
            // 倒计时结束，显示结果
            const computerSelection = getComputerChoice()
            setComputerChoice(computerSelection)

            const gameResult = calculateResult(playerChoice!, computerSelection)
            setResult(gameResult)

            // 更新分数
            setScore(prevScore => {
                const newScore = { ...prevScore }
                if (gameResult === '胜利') {
                    newScore.player += 1
                } else if (gameResult === '失败') {
                    newScore.computer += 1
                } else {
                    newScore.ties += 1
                }
                return newScore
            })

            // 更新连胜记录
            if (gameResult === '胜利') {
                setWinStreak(prev => {
                    const newStreak = prev + 1
                    if (newStreak > bestStreak) {
                        setBestStreak(newStreak)
                    }
                    return newStreak
                })
            } else {
                setWinStreak(0)
            }

            // 添加到历史记录
            setGameHistory(prev => [
                ...prev,
                {
                    player: playerChoice!,
                    computer: computerSelection,
                    result: gameResult
                }
            ])
        }
    }, [countdown, playerChoice, gameMode])

    // 计算胜率
    const calculateWinRate = () => {
        const totalGames = score.player + score.computer + score.ties
        if (totalGames === 0) return 0
        return Math.round((score.player / totalGames) * 100)
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">石头剪刀布</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">游戏区域</h2>

                                <Tabs value={gameMode} onValueChange={(v) => setGameMode(v as 'normal' | 'hard')}>
                                    <TabsList>
                                        <TabsTrigger value="normal">普通模式</TabsTrigger>
                                        <TabsTrigger value="hard">困难模式</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <div className="flex flex-col items-center">
                                {!isPlaying ? (
                                    <div className="text-center mb-8">
                                        <p className="text-lg mb-6">选择你的手势开始游戏</p>
                                        <div className="flex justify-center gap-4">
                                            {choices.map((choice) => (
                                                <Button
                                                    key={choice}
                                                    onClick={() => startGame(choice)}
                                                    className="text-4xl h-24 w-24"
                                                    variant="outline"
                                                >
                                                    {choiceIcons[choice]}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md">
                                        <div className="flex justify-between items-center mb-8">
                                            <div className="text-center">
                                                <p className="text-sm mb-2">你的选择</p>
                                                <div className="text-5xl mb-2">{choiceIcons[playerChoice!]}</div>
                                                <p>{playerChoice}</p>
                                            </div>

                                            <div className="text-center">
                                                {countdown !== null && countdown > 0 ? (
                                                    <div className="text-4xl font-bold animate-pulse">
                                                        {countdown}
                                                    </div>
                                                ) : (
                                                    <div className="text-2xl font-bold">
                                                        {result === '胜利' && '你赢了! 🎉'}
                                                        {result === '失败' && '你输了! 😢'}
                                                        {result === '平局' && '平局! 🤝'}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center">
                                                <p className="text-sm mb-2">电脑选择</p>
                                                {computerChoice ? (
                                                    <>
                                                        <div className="text-5xl mb-2">{choiceIcons[computerChoice]}</div>
                                                        <p>{computerChoice}</p>
                                                    </>
                                                ) : (
                                                    <div className="text-5xl mb-2 animate-pulse">❓</div>
                                                )}
                                            </div>
                                        </div>

                                        {result !== null && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="text-center"
                                            >
                                                <Button onClick={resetGame} className="mt-4">
                                                    再来一局
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">游戏规则</h2>

                            <div className="space-y-4">
                                <p>石头剪刀布是一个简单的手势游戏：</p>

                                <ul className="list-disc pl-5 space-y-2">
                                    <li><strong>石头 (✊)</strong> 击败 <strong>剪刀 (✌️)</strong></li>
                                    <li><strong>剪刀 (✌️)</strong> 击败 <strong>布 (✋)</strong></li>
                                    <li><strong>布 (✋)</strong> 击败 <strong>石头 (✊)</strong></li>
                                    <li>相同的手势会导致平局</li>
                                </ul>

                                <Separator />

                                <div>
                                    <h3 className="font-medium mb-2">游戏模式</h3>
                                    <ul className="list-disc pl-5 space-y-1">
                                        <li><strong>普通模式</strong>：电脑随机选择手势</li>
                                        <li><strong>困难模式</strong>：电脑会分析你的选择模式，尝试预测你的下一步</li>
                                    </ul>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">游戏统计</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>总局数</span>
                                    <span className="font-medium">{score.player + score.computer + score.ties}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center">
                                    <div>
                                        <div className="text-2xl font-bold">{score.player}</div>
                                        <div className="text-xs text-muted-foreground">胜利</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{score.ties}</div>
                                        <div className="text-xs text-muted-foreground">平局</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold">{score.computer}</div>
                                        <div className="text-xs text-muted-foreground">失败</div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1">
                                        <span>胜率</span>
                                        <span>{calculateWinRate()}%</span>
                                    </div>
                                    <Progress value={calculateWinRate()} className="h-2" />
                                </div>

                                <div className="flex justify-between">
                                    <span>当前连胜</span>
                                    <Badge variant={winStreak > 0 ? "default" : "outline"}>
                                        {winStreak}
                                    </Badge>
                                </div>

                                <div className="flex justify-between">
                                    <span>最佳连胜</span>
                                    <Badge variant={bestStreak > 0 ? "default" : "outline"}>
                                        {bestStreak}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">游戏历史</h2>

                            {gameHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    还没有游戏记录
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                                    {gameHistory.slice().reverse().map((game, index) => (
                                        <div
                                            key={index}
                                            className={`flex items-center justify-between p-2 rounded-md border ${game.result === '胜利' ? 'border-green-200 bg-green-50' :
                                                game.result === '失败' ? 'border-red-200 bg-red-50' :
                                                    'border-gray-200 bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl">{choiceIcons[game.player]}</span>
                                                <span className="text-sm">vs</span>
                                                <span className="text-xl">{choiceIcons[game.computer]}</span>
                                            </div>

                                            <Badge variant={
                                                game.result === '胜利' ? "default" :
                                                    game.result === '失败' ? "destructive" :
                                                        "secondary"
                                            }>
                                                {game.result}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {gameHistory.length > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full mt-4"
                                    onClick={() => {
                                        setGameHistory([])
                                        setScore({ player: 0, computer: 0, ties: 0 })
                                        setWinStreak(0)
                                        setBestStreak(0)
                                    }}
                                >
                                    清除历史记录
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}