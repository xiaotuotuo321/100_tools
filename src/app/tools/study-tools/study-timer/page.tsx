'use client'

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
    Play,
    Pause,
    RotateCcw,
    Clock,
    Save,
    Trash2,
    Edit,
    Check,
    X,
    BookOpen,
    History,
    BarChart3,
    Bell,
    BellOff
} from 'lucide-react'

// 学习会话类型
interface StudySession {
    id: string
    subject: string
    duration: number // 以秒为单位
    startTime: number
    endTime: number | null
    notes: string
}

// 本地存储键
const STORAGE_KEY = 'study-timer-sessions'

export default function StudyTimerPage() {
    // 状态
    const [activeTab, setActiveTab] = useState<'timer' | 'history' | 'stats'>('timer')
    const [subject, setSubject] = useState('')
    const [timerRunning, setTimerRunning] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [startTime, setStartTime] = useState<number | null>(null)
    const [sessions, setSessions] = useState<StudySession[]>([])
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
    const [editingNotes, setEditingNotes] = useState('')
    const [soundEnabled, setSoundEnabled] = useState(true)
    const [showNotification, setShowNotification] = useState(false)
    const [goalTime, setGoalTime] = useState(60 * 60) // 默认目标：1小时
    const [goalProgress, setGoalProgress] = useState(0)

    const timerRef = useRef<NodeJS.Timeout | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const { toast } = useToast()

    // 从本地存储加载会话
    useEffect(() => {
        const savedSessions = localStorage.getItem(STORAGE_KEY)
        if (savedSessions) {
            try {
                setSessions(JSON.parse(savedSessions))
            } catch (error) {
                console.error('Failed to parse saved sessions:', error)
            }
        }

        // 创建音频元素
        audioRef.current = new Audio('/notification.mp3')

        // 检查是否有未完成的会话
        const unfinishedSession = localStorage.getItem('current-session')
        if (unfinishedSession) {
            try {
                const session = JSON.parse(unfinishedSession)
                setSubject(session.subject)
                setStartTime(session.startTime)
                setCurrentTime(Math.floor((Date.now() - session.startTime) / 1000))
                setTimerRunning(true)
                startTimer()
            } catch (error) {
                console.error('Failed to restore session:', error)
            }
        }

        // 请求通知权限
        if (typeof window !== 'undefined' && 'Notification' in window) {
            Notification.requestPermission()
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [])

    // 保存会话到本地存储
    useEffect(() => {
        if (sessions.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
        }
    }, [sessions])

    // 更新目标进度
    useEffect(() => {
        if (activeTab === 'stats') {
            const today = new Date()
            today.setHours(0, 0, 0, 0)

            const todaySessions = sessions.filter(session => {
                const sessionDate = new Date(session.startTime)
                return sessionDate >= today && session.endTime !== null
            })

            const totalSeconds = todaySessions.reduce((total, session) => {
                return total + session.duration
            }, 0)

            setGoalProgress(Math.min(100, (totalSeconds / goalTime) * 100))
        }
    }, [activeTab, sessions, goalTime])

    // 生成唯一ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }

    // 开始计时器
    const startTimer = () => {
        if (!subject.trim()) {
            toast({
                title: '请输入学习主题',
                variant: 'destructive'
            })
            return
        }

        const now = Date.now()

        if (!startTime) {
            setStartTime(now)

            // 保存当前会话到本地存储
            localStorage.setItem('current-session', JSON.stringify({
                subject,
                startTime: now
            }))
        }

        setTimerRunning(true)

        timerRef.current = setInterval(() => {
            setCurrentTime(prev => prev + 1)
        }, 1000)
    }

    // 暂停计时器
    const pauseTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        setTimerRunning(false)
    }

    // 重置计时器
    const resetTimer = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }

        setTimerRunning(false)
        setCurrentTime(0)
        setStartTime(null)

        // 清除本地存储中的当前会话
        localStorage.removeItem('current-session')
    }

    // 完成学习会话
    const completeSession = () => {
        if (!startTime) return

        const now = Date.now()
        const duration = Math.floor((now - startTime) / 1000)

        if (duration < 60) {
            toast({
                title: '会话太短',
                description: '学习会话至少需要1分钟',
                variant: 'destructive'
            })
            return
        }

        const newSession: StudySession = {
            id: generateId(),
            subject,
            duration,
            startTime,
            endTime: now,
            notes: ''
        }

        setSessions([newSession, ...sessions])

        resetTimer()

        toast({
            title: '学习会话已保存',
            description: `${formatTime(duration)} 的学习已记录`
        })

        // 播放通知声音
        if (soundEnabled && audioRef.current) {
            audioRef.current.play().catch(e => console.error('Failed to play sound:', e))
        }

        // 显示系统通知
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('学习会话完成', {
                body: `你已完成 ${formatTime(duration)} 的 ${subject} 学习`,
                icon: '/favicon.ico'
            })
        } else {
            setShowNotification(true)
            setTimeout(() => setShowNotification(false), 5000)
        }
    }

    // 更新会话笔记
    const updateSessionNotes = () => {
        if (!editingSessionId) return

        setSessions(sessions.map(session => {
            if (session.id === editingSessionId) {
                return {
                    ...session,
                    notes: editingNotes
                }
            }
            return session
        }))

        setEditingSessionId(null)
        setEditingNotes('')

        toast({
            title: '笔记已更新'
        })
    }

    // 删除会话
    const deleteSession = (id: string) => {
        if (confirm('确定要删除这个学习记录吗？')) {
            setSessions(sessions.filter(session => session.id !== id))

            toast({
                title: '学习记录已删除'
            })
        }
    }

    // 格式化时间（秒 -> HH:MM:SS）
    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600)
        const m = Math.floor((seconds % 3600) / 60)
        const s = seconds % 60

        const hDisplay = h > 0 ? `${h.toString().padStart(2, '0')}:` : ''
        const mDisplay = `${m.toString().padStart(2, '0')}:`
        const sDisplay = s.toString().padStart(2, '0')

        return `${hDisplay}${mDisplay}${sDisplay}`
    }

    // 格式化日期
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // 获取今日学习时间
    const getTodayStudyTime = () => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const todaySessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= today && session.endTime !== null
        })

        return todaySessions.reduce((total, session) => {
            return total + session.duration
        }, 0)
    }

    // 获取本周学习时间
    const getWeekStudyTime = () => {
        const today = new Date()
        const firstDayOfWeek = new Date(today)
        const day = today.getDay() || 7
        firstDayOfWeek.setDate(today.getDate() - day + 1)
        firstDayOfWeek.setHours(0, 0, 0, 0)

        const weekSessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= firstDayOfWeek && session.endTime !== null
        })

        return weekSessions.reduce((total, session) => {
            return total + session.duration
        }, 0)
    }

    // 获取本月学习时间
    const getMonthStudyTime = () => {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

        const monthSessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime)
            return sessionDate >= firstDayOfMonth && session.endTime !== null
        })

        return monthSessions.reduce((total, session) => {
            return total + session.duration
        }, 0)
    }

    // 获取按主题分组的学习时间
    const getStudyTimeBySubject = () => {
        const subjectMap: Record<string, number> = {}

        sessions.forEach(session => {
            if (session.endTime === null) return

            if (subjectMap[session.subject]) {
                subjectMap[session.subject] += session.duration
            } else {
                subjectMap[session.subject] = session.duration
            }
        })

        return Object.entries(subjectMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
    }

    // 渲染计时器界面
    const renderTimerInterface = () => {
        return (
            <div className="flex flex-col items-center">
                <div className="mb-8 w-full max-w-md">
                    <Label htmlFor="subject" className="mb-2 block">学习主题</Label>
                    <Input
                        id="subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="例如：数学、编程、英语..."
                        disabled={timerRunning}
                        className="mb-4"
                    />

                    <div className="flex justify-between items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSoundEnabled(!soundEnabled)}
                        >
                            {soundEnabled ? (
                                <>
                                    <Bell className="mr-2 h-4 w-4" />
                                    声音开启
                                </>
                            ) : (
                                <>
                                    <BellOff className="mr-2 h-4 w-4" />
                                    声音关闭
                                </>
                            )}
                        </Button>

                        <div className="text-sm text-muted-foreground">
                            今日学习: {formatTime(getTodayStudyTime())}
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <div className="text-6xl font-mono mb-4">
                        {formatTime(currentTime)}
                    </div>

                    <div className="flex justify-center space-x-4">
                        {!timerRunning ? (
                            <Button onClick={startTimer} disabled={!subject.trim()}>
                                <Play className="mr-2 h-4 w-4" />
                                开始
                            </Button>
                        ) : (
                            <Button onClick={pauseTimer}>
                                <Pause className="mr-2 h-4 w-4" />
                                暂停
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={resetTimer}
                            disabled={currentTime === 0}
                        >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            重置
                        </Button>

                        <Button
                            variant="default"
                            onClick={completeSession}
                            disabled={currentTime < 60}
                        >
                            <Check className="mr-2 h-4 w-4" />
                            完成
                        </Button>
                    </div>
                </div>

                {showNotification && (
                    <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg">
                        <div className="font-medium mb-1">学习会话完成</div>
                        <div className="text-sm">你已完成 {formatTime(currentTime)} 的 {subject} 学习</div>
                    </div>
                )}
            </div>
        )
    }

    // 渲染历史记录界面
    const renderHistoryInterface = () => {
        if (sessions.length === 0) {
            return (
                <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无学习记录</h3>
                    <p className="text-muted-foreground mb-4">完成一些学习会话后将在这里显示</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {sessions.map(session => (
                    <Card key={session.id}>
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="font-medium">{session.subject}</h3>
                                        <Badge variant="outline" className="ml-2">
                                            {formatTime(session.duration)}
                                        </Badge>
                                    </div>

                                    <div className="text-xs text-muted-foreground mt-1">
                                        {formatDate(session.startTime)}
                                    </div>

                                    {editingSessionId === session.id ? (
                                        <div className="mt-2 space-y-2">
                                            <Input
                                                value={editingNotes}
                                                onChange={(e) => setEditingNotes(e.target.value)}
                                                placeholder="添加笔记..."
                                            />

                                            <div className="flex space-x-2">
                                                <Button
                                                    size="sm"
                                                    onClick={updateSessionNotes}
                                                >
                                                    保存
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        setEditingSessionId(null)
                                                        setEditingNotes('')
                                                    }}
                                                >
                                                    取消
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        session.notes && (
                                            <div className="mt-2 text-sm bg-muted p-2 rounded">
                                                {session.notes}
                                            </div>
                                        )
                                    )}
                                </div>

                                <div className="flex space-x-1">
                                    {editingSessionId !== session.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => {
                                                setEditingSessionId(session.id)
                                                setEditingNotes(session.notes)
                                            }}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteSession(session.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    // 渲染统计界面
    const renderStatsInterface = () => {
        const todayTime = getTodayStudyTime()
        const weekTime = getWeekStudyTime()
        const monthTime = getMonthStudyTime()
        const subjectStats = getStudyTimeBySubject()

        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">今日目标</h3>

                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span>目标时间</span>
                            <div className="flex items-center">
                                <Input
                                    type="number"
                                    min="15"
                                    max="480"
                                    value={Math.floor(goalTime / 60)}
                                    onChange={(e) => setGoalTime(parseInt(e.target.value) * 60 || 60 * 60)}
                                    className="w-20 h-8 mr-2"
                                />
                                <span>分钟</span>
                            </div>
                        </div>

                        <div className="flex justify-between text-sm">
                            <span>已完成</span>
                            <span>{formatTime(todayTime)} ({Math.floor(goalProgress)}%)</span>
                        </div>
                    </div>

                    <div className="w-full bg-muted rounded-full h-2.5">
                        <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{ width: `${goalProgress}%` }}
                        ></div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">学习统计</h3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-sm text-muted-foreground mb-1">今日</div>
                                <div className="text-2xl font-mono">{formatTime(todayTime)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-sm text-muted-foreground mb-1">本周</div>
                                <div className="text-2xl font-mono">{formatTime(weekTime)}</div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4 text-center">
                                <div className="text-sm text-muted-foreground mb-1">本月</div>
                                <div className="text-2xl font-mono">{formatTime(monthTime)}</div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">主题分布</h3>

                    {subjectStats.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            暂无数据
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {subjectStats.map(([subject, duration]) => (
                                <div key={subject}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>{subject}</span>
                                        <span>{formatTime(duration)}</span>
                                    </div>
                                    <div className="w-full bg-muted rounded-full h-2">
                                        <div
                                            className="bg-primary h-2 rounded-full"
                                            style={{
                                                width: `${Math.min(100, (duration / monthTime) * 100)}%`
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">学习计时器</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">学习助手</h2>

                                    <TabsList>
                                        <TabsTrigger value="timer">
                                            <Clock className="h-4 w-4 mr-2" />
                                            计时器
                                        </TabsTrigger>
                                        <TabsTrigger value="history">
                                            <History className="h-4 w-4 mr-2" />
                                            历史
                                        </TabsTrigger>
                                        <TabsTrigger value="stats">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            统计
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="timer" className="mt-0">
                                    {renderTimerInterface()}
                                </TabsContent>

                                <TabsContent value="history" className="mt-0">
                                    {renderHistoryInterface()}
                                </TabsContent>

                                <TabsContent value="stats" className="mt-0">
                                    {renderStatsInterface()}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">学习技巧</h2>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium mb-1">番茄工作法</h3>
                                    <p className="text-sm text-muted-foreground">
                                        每25分钟专注学习，然后休息5分钟。每完成4个循环，休息较长时间（15-30分钟）。
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-1">间隔重复</h3>
                                    <p className="text-sm text-muted-foreground">
                                        按照科学的间隔（如1天、7天、16天、35天）复习学习内容，提高记忆效果。
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-1">主动回忆</h3>
                                    <p className="text-sm text-muted-foreground">
                                        不要只是阅读材料，尝试在不看笔记的情况下回忆关键概念，这能强化记忆。
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-medium mb-1">费曼技巧</h3>
                                    <p className="text-sm text-muted-foreground">
                                        尝试用简单的语言向他人（或假想的听众）解释概念，找出自己理解不清的地方。
                                    </p>
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div>
                                <h3 className="font-medium mb-2">学习环境</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                                        <span>找一个安静、舒适但不过于舒适的环境</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                                        <span>减少干扰，关闭社交媒体通知</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                                        <span>准备好所需的学习材料和水</span>
                                    </li>
                                    <li className="flex items-start">
                                        <Check className="h-4 w-4 mr-2 mt-0.5 text-green-500" />
                                        <span>适当的光线和温度有助于保持注意力</span>
                                    </li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}