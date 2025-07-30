'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Play, Pause, RotateCcw, Coffee, Timer, Settings } from 'lucide-react'

// 番茄钟状态类型
type PomodoroState = 'work' | 'shortBreak' | 'longBreak' | 'idle'

export default function PomodoroPage() {
    // 时间设置（分钟）
    const [workTime, setWorkTime] = useState(25)
    const [shortBreakTime, setShortBreakTime] = useState(5)
    const [longBreakTime, setLongBreakTime] = useState(15)
    const [longBreakInterval, setLongBreakInterval] = useState(4)

    // 运行状态
    const [isRunning, setIsRunning] = useState(false)
    const [currentState, setCurrentState] = useState<PomodoroState>('idle')
    const [timeLeft, setTimeLeft] = useState(workTime * 60)
    const [completedSessions, setCompletedSessions] = useState(0)
    const [autoStartBreaks, setAutoStartBreaks] = useState(true)
    const [autoStartWork, setAutoStartWork] = useState(true)
    const [notifyEnabled, setNotifyEnabled] = useState(true)

    // 引用
    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const { toast } = useToast()

    // 初始化音频
    useEffect(() => {
        audioRef.current = new Audio('/notification.mp3')

        // 请求通知权限
        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
            Notification.requestPermission()
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    // 计时器逻辑
    useEffect(() => {
        if (isRunning) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prevTime => {
                    if (prevTime <= 1) {
                        clearInterval(timerRef.current!)
                        handleSessionComplete()
                        return 0
                    }
                    return prevTime - 1
                })
            }, 1000)
        } else if (timerRef.current) {
            clearInterval(timerRef.current)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [isRunning])

    // 处理会话完成
    const handleSessionComplete = () => {
        // 播放通知
        if (notifyEnabled && audioRef.current) {
            audioRef.current.play().catch(e => console.error('无法播放通知音频:', e))
        }

        // 发送桌面通知
        if (notifyEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            const title = currentState === 'work'
                ? '工作时间结束'
                : '休息时间结束'

            const body = currentState === 'work'
                ? '该休息一下了！'
                : '该开始工作了！'

            new Notification(title, {
                body: body,
                icon: '/favicon.ico'
            })
        }

        // 更新状态
        if (currentState === 'work') {
            const newCompletedSessions = completedSessions + 1
            setCompletedSessions(newCompletedSessions)

            // 决定是短休息还是长休息
            const isLongBreak = newCompletedSessions % longBreakInterval === 0
            const nextState = isLongBreak ? 'longBreak' : 'shortBreak'
            const nextTime = isLongBreak ? longBreakTime : shortBreakTime

            setCurrentState(nextState)
            setTimeLeft(nextTime * 60)

            toast({
                title: '工作时间结束',
                description: isLongBreak ? '该长休息一下了！' : '该短休息一下了！'
            })

            // 自动开始休息
            if (autoStartBreaks) {
                setIsRunning(true)
            } else {
                setIsRunning(false)
            }
        } else {
            // 从休息状态回到工作状态
            setCurrentState('work')
            setTimeLeft(workTime * 60)

            toast({
                title: '休息时间结束',
                description: '该开始工作了！'
            })

            // 自动开始工作
            if (autoStartWork) {
                setIsRunning(true)
            } else {
                setIsRunning(false)
            }
        }
    }

    // 开始番茄钟
    const startTimer = () => {
        if (currentState === 'idle') {
            setCurrentState('work')
            setTimeLeft(workTime * 60)
        }

        setIsRunning(true)

        const stateText = {
            work: '工作',
            shortBreak: '短休息',
            longBreak: '长休息',
            idle: '工作'
        }

        toast({
            title: `${stateText[currentState]}时间开始`,
            description: `专注于当前任务`
        })
    }

    // 暂停番茄钟
    const pauseTimer = () => {
        setIsRunning(false)

        toast({
            title: '计时器已暂停',
            description: `剩余时间: ${formatTime(timeLeft)}`
        })
    }

    // 重置番茄钟
    const resetTimer = () => {
        setIsRunning(false)

        if (currentState === 'work' || currentState === 'idle') {
            setTimeLeft(workTime * 60)
        } else if (currentState === 'shortBreak') {
            setTimeLeft(shortBreakTime * 60)
        } else {
            setTimeLeft(longBreakTime * 60)
        }
    }

    // 切换到工作状态
    const switchToWork = () => {
        setIsRunning(false)
        setCurrentState('work')
        setTimeLeft(workTime * 60)
    }

    // 切换到短休息状态
    const switchToShortBreak = () => {
        setIsRunning(false)
        setCurrentState('shortBreak')
        setTimeLeft(shortBreakTime * 60)
    }

    // 切换到长休息状态
    const switchToLongBreak = () => {
        setIsRunning(false)
        setCurrentState('longBreak')
        setTimeLeft(longBreakTime * 60)
    }

    // 格式化时间显示
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 计算进度百分比
    const calculateProgress = () => {
        let totalTime = 0

        switch (currentState) {
            case 'work':
                totalTime = workTime * 60
                break
            case 'shortBreak':
                totalTime = shortBreakTime * 60
                break
            case 'longBreak':
                totalTime = longBreakTime * 60
                break
            case 'idle':
                totalTime = workTime * 60
                break
        }

        if (totalTime === 0) return 0
        return (timeLeft / totalTime) * 100
    }

    // 获取当前状态的颜色
    const getStateColor = () => {
        switch (currentState) {
            case 'work':
                return 'bg-red-500'
            case 'shortBreak':
                return 'bg-green-500'
            case 'longBreak':
                return 'bg-blue-500'
            default:
                return 'bg-gray-500'
        }
    }

    // 获取当前状态的文本
    const getStateText = () => {
        switch (currentState) {
            case 'work':
                return '工作'
            case 'shortBreak':
                return '短休息'
            case 'longBreak':
                return '长休息'
            default:
                return '准备'
        }
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">番茄工作法计时器</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <div className={`text-white px-3 py-1 rounded-full mb-4 ${getStateColor()}`}>
                                    {getStateText()}
                                </div>

                                <div className="text-7xl font-mono font-bold mb-8 tracking-wider">
                                    {formatTime(timeLeft)}
                                </div>

                                <div className="w-full h-2 bg-muted rounded-full mb-8">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${getStateColor()}`}
                                        style={{ width: `${calculateProgress()}%` }}
                                    />
                                </div>

                                <div className="flex space-x-4 mb-6">
                                    {!isRunning ? (
                                        <Button onClick={startTimer} size="lg">
                                            <Play className="mr-2 h-4 w-4" />
                                            开始
                                        </Button>
                                    ) : (
                                        <Button onClick={pauseTimer} variant="outline" size="lg">
                                            <Pause className="mr-2 h-4 w-4" />
                                            暂停
                                        </Button>
                                    )}

                                    <Button onClick={resetTimer} variant="outline" size="lg">
                                        <RotateCcw className="mr-2 h-4 w-4" />
                                        重置
                                    </Button>
                                </div>

                                <div className="flex space-x-2 w-full">
                                    <Button
                                        variant={currentState === 'work' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={switchToWork}
                                    >
                                        <Timer className="mr-2 h-4 w-4" />
                                        工作
                                    </Button>

                                    <Button
                                        variant={currentState === 'shortBreak' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={switchToShortBreak}
                                    >
                                        <Coffee className="mr-2 h-4 w-4" />
                                        短休息
                                    </Button>

                                    <Button
                                        variant={currentState === 'longBreak' ? 'default' : 'outline'}
                                        className="flex-1"
                                        onClick={switchToLongBreak}
                                    >
                                        <Coffee className="mr-2 h-4 w-4" />
                                        长休息
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">统计</h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCompletedSessions(0)}
                                >
                                    重置
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold">{completedSessions}</div>
                                    <div className="text-sm text-muted-foreground">已完成工作</div>
                                </div>

                                <div className="bg-muted p-4 rounded-lg text-center">
                                    <div className="text-3xl font-bold">{Math.floor(completedSessions / longBreakInterval)}</div>
                                    <div className="text-sm text-muted-foreground">已完成周期</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <Tabs defaultValue="times">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="times">
                                        <Timer className="mr-2 h-4 w-4" />
                                        时间设置
                                    </TabsTrigger>
                                    <TabsTrigger value="preferences">
                                        <Settings className="mr-2 h-4 w-4" />
                                        偏好设置
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="times">
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="work-time">工作时间 (分钟)</Label>
                                                <span>{workTime}</span>
                                            </div>
                                            <Slider
                                                id="work-time"
                                                value={[workTime]}
                                                min={1}
                                                max={60}
                                                step={1}
                                                onValueChange={(value) => setWorkTime(value[0])}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="short-break">短休息时间 (分钟)</Label>
                                                <span>{shortBreakTime}</span>
                                            </div>
                                            <Slider
                                                id="short-break"
                                                value={[shortBreakTime]}
                                                min={1}
                                                max={30}
                                                step={1}
                                                onValueChange={(value) => setShortBreakTime(value[0])}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="long-break">长休息时间 (分钟)</Label>
                                                <span>{longBreakTime}</span>
                                            </div>
                                            <Slider
                                                id="long-break"
                                                value={[longBreakTime]}
                                                min={1}
                                                max={60}
                                                step={1}
                                                onValueChange={(value) => setLongBreakTime(value[0])}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label htmlFor="long-break-interval">长休息间隔 (工作次数)</Label>
                                                <span>{longBreakInterval}</span>
                                            </div>
                                            <Slider
                                                id="long-break-interval"
                                                value={[longBreakInterval]}
                                                min={1}
                                                max={10}
                                                step={1}
                                                onValueChange={(value) => setLongBreakInterval(value[0])}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="preferences">
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="auto-breaks" className="text-base">自动开始休息</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    工作结束后自动开始休息时间
                                                </p>
                                            </div>
                                            <Switch
                                                id="auto-breaks"
                                                checked={autoStartBreaks}
                                                onCheckedChange={setAutoStartBreaks}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="auto-work" className="text-base">自动开始工作</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    休息结束后自动开始工作时间
                                                </p>
                                            </div>
                                            <Switch
                                                id="auto-work"
                                                checked={autoStartWork}
                                                onCheckedChange={setAutoStartWork}
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <Label htmlFor="notifications" className="text-base">通知提醒</Label>
                                                <p className="text-sm text-muted-foreground">
                                                    时间结束时播放声音和显示通知
                                                </p>
                                            </div>
                                            <Switch
                                                id="notifications"
                                                checked={notifyEnabled}
                                                onCheckedChange={setNotifyEnabled}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">番茄工作法说明</h2>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>设置25分钟的工作时间（一个番茄）专注于单一任务</li>
                                <li>工作时间结束后，休息5分钟</li>
                                <li>每完成4个番茄，休息15-30分钟</li>
                                <li>记录完成的番茄数量，回顾工作效率</li>
                                <li>工作时间内避免分心和打断</li>
                            </ul>

                            <div className="mt-4 p-4 bg-muted rounded-lg">
                                <p className="text-sm text-muted-foreground">
                                    番茄工作法是一种时间管理方法，由Francesco Cirillo在1980年代后期创建。该技术使用计时器来分解工作，传统上为25分钟的专注工作时间，中间穿插短暂的休息时间。这些间隔被称为"番茄"，源自Cirillo学生时代使用的番茄形状厨房计时器。
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}