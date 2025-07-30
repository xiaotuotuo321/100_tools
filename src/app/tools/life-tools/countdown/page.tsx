'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'
import { Clock, Bell, Play, Pause, RotateCcw } from 'lucide-react'

export default function CountdownTimerPage() {
    // 倒计时状态
    const [hours, setHours] = useState(0)
    const [minutes, setMinutes] = useState(0)
    const [seconds, setSeconds] = useState(0)
    const [isRunning, setIsRunning] = useState(false)
    const [timeLeft, setTimeLeft] = useState(0)
    const [notifyEnabled, setNotifyEnabled] = useState(true)
    const [quickPreset, setQuickPreset] = useState(5)

    // 计时器引用
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
                        setIsRunning(false)
                        handleTimerComplete()
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

    // 格式化时间显示
    const formatTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600)
        const m = Math.floor((totalSeconds % 3600) / 60)
        const s = totalSeconds % 60

        return {
            hours: h,
            minutes: m,
            seconds: s,
            display: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
        }
    }

    // 开始倒计时
    const startTimer = () => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds

        if (totalSeconds <= 0) {
            toast({
                title: '请设置时间',
                description: '倒计时时间必须大于0',
                variant: 'destructive'
            })
            return
        }

        setTimeLeft(totalSeconds)
        setIsRunning(true)

        toast({
            title: '倒计时开始',
            description: `倒计时${formatTime(totalSeconds).display}已开始`
        })
    }

    // 暂停倒计时
    const pauseTimer = () => {
        setIsRunning(false)
        toast({
            title: '倒计时已暂停',
            description: `剩余时间: ${formatTime(timeLeft).display}`
        })
    }

    // 重置倒计时
    const resetTimer = () => {
        setIsRunning(false)
        setTimeLeft(0)
        setHours(0)
        setMinutes(0)
        setSeconds(0)
    }

    // 设置快速预设
    const setQuickTimer = (mins: number) => {
        setQuickPreset(mins)
        setHours(0)
        setMinutes(mins)
        setSeconds(0)
    }

    // 倒计时完成处理
    const handleTimerComplete = () => {
        // 播放音频通知
        if (notifyEnabled && audioRef.current) {
            audioRef.current.play().catch(e => console.error('无法播放通知音频:', e))
        }

        // 发送桌面通知
        if (notifyEnabled && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
            new Notification('倒计时完成', {
                body: '您设置的倒计时已结束',
                icon: '/favicon.ico'
            })
        }

        toast({
            title: '倒计时结束',
            description: '您设置的倒计时已完成',
            variant: 'default'
        })
    }

    // 时间输入处理
    const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setHours(Math.min(Math.max(value, 0), 23))
    }

    const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setMinutes(Math.min(Math.max(value, 0), 59))
    }

    const handleSecondsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value) || 0
        setSeconds(Math.min(Math.max(value, 0), 59))
    }

    // 计算进度百分比
    const calculateProgress = () => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds
        if (totalSeconds === 0 || timeLeft === 0) return 0
        return (timeLeft / totalSeconds) * 100
    }

    // 格式化显示时间
    const displayTime = isRunning ? formatTime(timeLeft).display : `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">倒计时器</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex flex-col items-center">
                                <div className="text-6xl font-mono font-bold mb-8 tracking-wider">
                                    {displayTime}
                                </div>

                                {isRunning && (
                                    <div className="w-full h-2 bg-muted rounded-full mb-8">
                                        <div
                                            className="h-full bg-primary rounded-full transition-all duration-1000"
                                            style={{ width: `${calculateProgress()}%` }}
                                        />
                                    </div>
                                )}

                                <div className="flex space-x-4">
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
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <Tabs defaultValue="manual">
                                <TabsList className="grid w-full grid-cols-2 mb-6">
                                    <TabsTrigger value="manual">
                                        <Clock className="mr-2 h-4 w-4" />
                                        手动设置
                                    </TabsTrigger>
                                    <TabsTrigger value="quick">
                                        <Play className="mr-2 h-4 w-4" />
                                        快速预设
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="manual">
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <Label htmlFor="hours">小时</Label>
                                            <Input
                                                id="hours"
                                                type="number"
                                                min="0"
                                                max="23"
                                                value={hours}
                                                onChange={handleHoursChange}
                                                disabled={isRunning}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="minutes">分钟</Label>
                                            <Input
                                                id="minutes"
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={minutes}
                                                onChange={handleMinutesChange}
                                                disabled={isRunning}
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="seconds">秒钟</Label>
                                            <Input
                                                id="seconds"
                                                type="number"
                                                min="0"
                                                max="59"
                                                value={seconds}
                                                onChange={handleSecondsChange}
                                                disabled={isRunning}
                                            />
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="quick">
                                    <div className="space-y-6">
                                        <div>
                                            <Label className="mb-2 block">
                                                {quickPreset} 分钟
                                            </Label>
                                            <Slider
                                                value={[quickPreset]}
                                                min={1}
                                                max={60}
                                                step={1}
                                                onValueChange={(value) => setQuickTimer(value[0])}
                                                disabled={isRunning}
                                            />
                                        </div>

                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 3, 5, 10, 15, 20, 30, 60].map(mins => (
                                                <Button
                                                    key={mins}
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setQuickTimer(mins)}
                                                    disabled={isRunning}
                                                    className={quickPreset === mins ? 'border-primary' : ''}
                                                >
                                                    {mins}分钟
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">设置</h2>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="notifications" className="text-base">通知提醒</Label>
                                        <p className="text-sm text-muted-foreground">
                                            倒计时结束时播放声音和显示通知
                                        </p>
                                    </div>
                                    <Switch
                                        id="notifications"
                                        checked={notifyEnabled}
                                        onCheckedChange={setNotifyEnabled}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">使用说明</h2>

                            <ul className="list-disc pl-5 space-y-2">
                                <li>手动设置：设置具体的小时、分钟和秒数</li>
                                <li>快速预设：使用滑块或预设按钮快速设置分钟数</li>
                                <li>开始后可以暂停或重置倒计时</li>
                                <li>倒计时结束时会发出声音和桌面通知提醒（如果已启用）</li>
                                <li>页面关闭后倒计时将停止</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}