"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Copy, Check, Clock, Calendar, RefreshCw } from 'lucide-react'

interface CronExpression {
    minutes: string
    hours: string
    dayOfMonth: string
    month: string
    dayOfWeek: string
}

export default function CronGenerator() {
    const [cronExpression, setCronExpression] = useState<CronExpression>({
        minutes: '*',
        hours: '*',
        dayOfMonth: '*',
        month: '*',
        dayOfWeek: '*'
    })

    const [copied, setCopied] = useState(false)
    const [nextExecutions, setNextExecutions] = useState<string[]>([])
    const [activeTab, setActiveTab] = useState('simple')

    // 简易模式选项
    const [simpleMode, setSimpleMode] = useState('every-minute')
    const [customMinute, setCustomMinute] = useState('0')
    const [customHour, setCustomHour] = useState('0')
    const [customDay, setCustomDay] = useState('1')
    const [customMonth, setCustomMonth] = useState('1')
    const [customDayOfWeek, setCustomDayOfWeek] = useState('1')

    // 高级模式选项
    const [minuteType, setMinuteType] = useState('every')
    const [hourType, setHourType] = useState('every')
    const [dayType, setDayType] = useState('every')
    const [monthType, setMonthType] = useState('every')
    const [dayOfWeekType, setDayOfWeekType] = useState('every')

    const [minuteValue, setMinuteValue] = useState('0')
    const [hourValue, setHourValue] = useState('0')
    const [dayValue, setDayValue] = useState('1')
    const [monthValue, setMonthValue] = useState('1')
    const [dayOfWeekValue, setDayOfWeekValue] = useState('1')

    const [minuteIncrement, setMinuteIncrement] = useState('5')
    const [hourIncrement, setHourIncrement] = useState('2')

    const [minuteRange, setMinuteRange] = useState({ start: '0', end: '30' })
    const [hourRange, setHourRange] = useState({ start: '9', end: '17' })
    const [dayRange, setDayRange] = useState({ start: '1', end: '15' })
    const [monthRange, setMonthRange] = useState({ start: '1', end: '6' })
    const [dayOfWeekRange, setDayOfWeekRange] = useState({ start: '1', end: '5' })

    const [selectedMinutes, setSelectedMinutes] = useState<string[]>([])
    const [selectedHours, setSelectedHours] = useState<string[]>([])
    const [selectedDays, setSelectedDays] = useState<string[]>([])
    const [selectedMonths, setSelectedMonths] = useState<string[]>([])
    const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<string[]>([])

    // 当简易模式选项变化时更新CRON表达式
    useEffect(() => {
        updateCronFromSimpleMode()
    }, [simpleMode, customMinute, customHour, customDay, customMonth, customDayOfWeek])

    // 当高级模式选项变化时更新CRON表达式
    useEffect(() => {
        if (activeTab === 'advanced') {
            updateCronFromAdvancedMode()
        }
    }, [
        activeTab,
        minuteType, hourType, dayType, monthType, dayOfWeekType,
        minuteValue, hourValue, dayValue, monthValue, dayOfWeekValue,
        minuteIncrement, hourIncrement,
        minuteRange, hourRange, dayRange, monthRange, dayOfWeekRange,
        selectedMinutes, selectedHours, selectedDays, selectedMonths, selectedDaysOfWeek
    ])

    // 根据简易模式更新CRON表达式
    const updateCronFromSimpleMode = () => {
        let newCron = { ...cronExpression }

        switch (simpleMode) {
            case 'every-minute':
                newCron = { minutes: '*', hours: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
                break
            case 'every-hour':
                newCron = { minutes: '0', hours: '*', dayOfMonth: '*', month: '*', dayOfWeek: '*' }
                break
            case 'every-day':
                newCron = { minutes: customMinute, hours: customHour, dayOfMonth: '*', month: '*', dayOfWeek: '*' }
                break
            case 'every-week':
                newCron = { minutes: customMinute, hours: customHour, dayOfMonth: '*', month: '*', dayOfWeek: customDayOfWeek }
                break
            case 'every-month':
                newCron = { minutes: customMinute, hours: customHour, dayOfMonth: customDay, month: '*', dayOfWeek: '*' }
                break
            case 'every-year':
                newCron = { minutes: customMinute, hours: customHour, dayOfMonth: customDay, month: customMonth, dayOfWeek: '*' }
                break
        }

        setCronExpression(newCron)
        calculateNextExecutions(newCron)
    }

    // 根据高级模式更新CRON表达式
    const updateCronFromAdvancedMode = () => {
        const newCron = { ...cronExpression }

        // 分钟
        switch (minuteType) {
            case 'every':
                newCron.minutes = '*'
                break
            case 'specific':
                newCron.minutes = minuteValue
                break
            case 'increment':
                newCron.minutes = `0/${minuteIncrement}`
                break
            case 'range':
                newCron.minutes = `${minuteRange.start}-${minuteRange.end}`
                break
            case 'multiple':
                newCron.minutes = selectedMinutes.length > 0 ? selectedMinutes.join(',') : '*'
                break
        }

        // 小时
        switch (hourType) {
            case 'every':
                newCron.hours = '*'
                break
            case 'specific':
                newCron.hours = hourValue
                break
            case 'increment':
                newCron.hours = `0/${hourIncrement}`
                break
            case 'range':
                newCron.hours = `${hourRange.start}-${hourRange.end}`
                break
            case 'multiple':
                newCron.hours = selectedHours.length > 0 ? selectedHours.join(',') : '*'
                break
        }

        // 日期
        switch (dayType) {
            case 'every':
                newCron.dayOfMonth = '*'
                break
            case 'specific':
                newCron.dayOfMonth = dayValue
                break
            case 'range':
                newCron.dayOfMonth = `${dayRange.start}-${dayRange.end}`
                break
            case 'multiple':
                newCron.dayOfMonth = selectedDays.length > 0 ? selectedDays.join(',') : '*'
                break
            case 'last-day':
                newCron.dayOfMonth = 'L'
                break
        }

        // 月份
        switch (monthType) {
            case 'every':
                newCron.month = '*'
                break
            case 'specific':
                newCron.month = monthValue
                break
            case 'range':
                newCron.month = `${monthRange.start}-${monthRange.end}`
                break
            case 'multiple':
                newCron.month = selectedMonths.length > 0 ? selectedMonths.join(',') : '*'
                break
        }

        // 星期
        switch (dayOfWeekType) {
            case 'every':
                newCron.dayOfWeek = '*'
                break
            case 'specific':
                newCron.dayOfWeek = dayOfWeekValue
                break
            case 'range':
                newCron.dayOfWeek = `${dayOfWeekRange.start}-${dayOfWeekRange.end}`
                break
            case 'multiple':
                newCron.dayOfWeek = selectedDaysOfWeek.length > 0 ? selectedDaysOfWeek.join(',') : '*'
                break
        }

        setCronExpression(newCron)
        calculateNextExecutions(newCron)
    }

    // 计算下一次执行时间
    const calculateNextExecutions = (cron: CronExpression) => {
        // 这里是一个简化的计算，实际应用中可能需要更复杂的CRON解析库
        // 这里只是模拟几个执行时间
        const now = new Date()
        const nextDates: Date[] = []

        // 简单模拟下一次执行时间
        for (let i = 1; i <= 5; i++) {
            const nextDate = new Date(now.getTime() + i * 60 * 60 * 1000) // 每小时递增
            nextDates.push(nextDate)
        }

        setNextExecutions(nextDates.map(date => date.toLocaleString()))
    }

    // 获取完整的CRON表达式
    const getFullCronExpression = () => {
        const { minutes, hours, dayOfMonth, month, dayOfWeek } = cronExpression
        return `${minutes} ${hours} ${dayOfMonth} ${month} ${dayOfWeek}`
    }

    // 复制到剪贴板
    const copyToClipboard = () => {
        navigator.clipboard.writeText(getFullCronExpression())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // 重置为默认值
    const resetToDefault = () => {
        if (activeTab === 'simple') {
            setSimpleMode('every-minute')
            setCustomMinute('0')
            setCustomHour('0')
            setCustomDay('1')
            setCustomMonth('1')
            setCustomDayOfWeek('1')
        } else {
            setMinuteType('every')
            setHourType('every')
            setDayType('every')
            setMonthType('every')
            setDayOfWeekType('every')
        }
    }

    // 生成选择项
    const generateOptions = (start: number, end: number) => {
        const options = []
        for (let i = start; i <= end; i++) {
            options.push(i.toString())
        }
        return options
    }

    // 处理多选项的切换
    const handleMultipleSelect = (value: string, selected: string[], setSelected: (value: string[]) => void) => {
        if (selected.includes(value)) {
            setSelected(selected.filter(item => item !== value))
        } else {
            setSelected([...selected, value])
        }
    }

    // 月份名称
    const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

    // 星期名称
    const dayOfWeekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">CRON表达式生成器</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="text-lg font-medium">CRON表达式</div>
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

                            <div className="grid grid-cols-5 gap-2 mb-6">
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">分钟</div>
                                    <div className="bg-muted p-2 rounded-md font-mono">{cronExpression.minutes}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">小时</div>
                                    <div className="bg-muted p-2 rounded-md font-mono">{cronExpression.hours}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">日期</div>
                                    <div className="bg-muted p-2 rounded-md font-mono">{cronExpression.dayOfMonth}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">月份</div>
                                    <div className="bg-muted p-2 rounded-md font-mono">{cronExpression.month}</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-sm text-muted-foreground mb-1">星期</div>
                                    <div className="bg-muted p-2 rounded-md font-mono">{cronExpression.dayOfWeek}</div>
                                </div>
                            </div>

                            <div className="bg-muted p-3 rounded-md font-mono text-center text-lg mb-6">
                                {getFullCronExpression()}
                            </div>

                            <div>
                                <h3 className="text-lg font-medium mb-2 flex items-center">
                                    <Clock className="mr-2 h-5 w-5" />
                                    下一次执行时间
                                </h3>
                                <div className="space-y-2">
                                    {nextExecutions.map((time, index) => (
                                        <div key={index} className="bg-muted/50 p-2 rounded-md">
                                            {time}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid grid-cols-2 mb-4">
                                    <TabsTrigger value="simple">简易模式</TabsTrigger>
                                    <TabsTrigger value="advanced">高级模式</TabsTrigger>
                                </TabsList>

                                <TabsContent value="simple" className="space-y-4">
                                    <div className="space-y-4">
                                        <div>
                                            <Label className="text-base">选择执行频率</Label>
                                            <RadioGroup value={simpleMode} onValueChange={setSimpleMode} className="mt-2">
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-minute" id="every-minute" />
                                                    <Label htmlFor="every-minute">每分钟</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-hour" id="every-hour" />
                                                    <Label htmlFor="every-hour">每小时 (整点)</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-day" id="every-day" />
                                                    <Label htmlFor="every-day">每天</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-week" id="every-week" />
                                                    <Label htmlFor="every-week">每周</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-month" id="every-month" />
                                                    <Label htmlFor="every-month">每月</Label>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <RadioGroupItem value="every-year" id="every-year" />
                                                    <Label htmlFor="every-year">每年</Label>
                                                </div>
                                            </RadioGroup>
                                        </div>

                                        {(simpleMode === 'every-day' || simpleMode === 'every-week' || simpleMode === 'every-month' || simpleMode === 'every-year') && (
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <Label htmlFor="custom-hour">小时</Label>
                                                    <Select value={customHour} onValueChange={setCustomHour}>
                                                        <SelectTrigger id="custom-hour">
                                                            <SelectValue placeholder="选择小时" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(0, 23).map(hour => (
                                                                <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <Label htmlFor="custom-minute">分钟</Label>
                                                    <Select value={customMinute} onValueChange={setCustomMinute}>
                                                        <SelectTrigger id="custom-minute">
                                                            <SelectValue placeholder="选择分钟" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(0, 59).map(minute => (
                                                                <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        )}

                                        {simpleMode === 'every-week' && (
                                            <div>
                                                <Label htmlFor="custom-day-of-week">星期几</Label>
                                                <Select value={customDayOfWeek} onValueChange={setCustomDayOfWeek}>
                                                    <SelectTrigger id="custom-day-of-week">
                                                        <SelectValue placeholder="选择星期" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {generateOptions(0, 6).map(day => (
                                                            <SelectItem key={day} value={day}>{dayOfWeekNames[parseInt(day)]}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {(simpleMode === 'every-month' || simpleMode === 'every-year') && (
                                            <div>
                                                <Label htmlFor="custom-day">日期</Label>
                                                <Select value={customDay} onValueChange={setCustomDay}>
                                                    <SelectTrigger id="custom-day">
                                                        <SelectValue placeholder="选择日期" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {generateOptions(1, 31).map(day => (
                                                            <SelectItem key={day} value={day}>{day}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        {simpleMode === 'every-year' && (
                                            <div>
                                                <Label htmlFor="custom-month">月份</Label>
                                                <Select value={customMonth} onValueChange={setCustomMonth}>
                                                    <SelectTrigger id="custom-month">
                                                        <SelectValue placeholder="选择月份" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {generateOptions(1, 12).map(month => (
                                                            <SelectItem key={month} value={month}>{monthNames[parseInt(month) - 1]}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="advanced" className="space-y-6">
                                    {/* 分钟设置 */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <Label className="text-base">分钟</Label>
                                        <RadioGroup value={minuteType} onValueChange={setMinuteType} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="every" id="minute-every" />
                                                <Label htmlFor="minute-every">每分钟 (*)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="minute-specific" />
                                                <Label htmlFor="minute-specific">特定分钟</Label>
                                                {minuteType === 'specific' && (
                                                    <Select value={minuteValue} onValueChange={setMinuteValue} disabled={minuteType !== 'specific'}>
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue placeholder="分钟" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(0, 59).map(minute => (
                                                                <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="increment" id="minute-increment" />
                                                <Label htmlFor="minute-increment">每隔</Label>
                                                {minuteType === 'increment' && (
                                                    <div className="flex items-center">
                                                        <Select value={minuteIncrement} onValueChange={setMinuteIncrement} disabled={minuteType !== 'increment'}>
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="间隔" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {[5, 10, 15, 20, 30].map(inc => (
                                                                    <SelectItem key={inc} value={inc.toString()}>{inc}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <span className="ml-2">分钟</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="range" id="minute-range" />
                                                <Label htmlFor="minute-range">范围</Label>
                                                {minuteType === 'range' && (
                                                    <div className="flex items-center space-x-2">
                                                        <Select
                                                            value={minuteRange.start}
                                                            onValueChange={(value) => setMinuteRange({ ...minuteRange, start: value })}
                                                            disabled={minuteType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="开始" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 59).map(minute => (
                                                                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <span>-</span>
                                                        <Select
                                                            value={minuteRange.end}
                                                            onValueChange={(value) => setMinuteRange({ ...minuteRange, end: value })}
                                                            disabled={minuteType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="结束" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 59).map(minute => (
                                                                    <SelectItem key={minute} value={minute}>{minute}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* 小时设置 */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <Label className="text-base">小时</Label>
                                        <RadioGroup value={hourType} onValueChange={setHourType} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="every" id="hour-every" />
                                                <Label htmlFor="hour-every">每小时 (*)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="hour-specific" />
                                                <Label htmlFor="hour-specific">特定小时</Label>
                                                {hourType === 'specific' && (
                                                    <Select value={hourValue} onValueChange={setHourValue} disabled={hourType !== 'specific'}>
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue placeholder="小时" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(0, 23).map(hour => (
                                                                <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="range" id="hour-range" />
                                                <Label htmlFor="hour-range">范围</Label>
                                                {hourType === 'range' && (
                                                    <div className="flex items-center space-x-2">
                                                        <Select
                                                            value={hourRange.start}
                                                            onValueChange={(value) => setHourRange({ ...hourRange, start: value })}
                                                            disabled={hourType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="开始" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 23).map(hour => (
                                                                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <span>-</span>
                                                        <Select
                                                            value={hourRange.end}
                                                            onValueChange={(value) => setHourRange({ ...hourRange, end: value })}
                                                            disabled={hourType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="结束" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 23).map(hour => (
                                                                    <SelectItem key={hour} value={hour}>{hour}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* 日期设置 */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <Label className="text-base">日期</Label>
                                        <RadioGroup value={dayType} onValueChange={setDayType} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="every" id="day-every" />
                                                <Label htmlFor="day-every">每天 (*)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="day-specific" />
                                                <Label htmlFor="day-specific">特定日期</Label>
                                                {dayType === 'specific' && (
                                                    <Select value={dayValue} onValueChange={setDayValue} disabled={dayType !== 'specific'}>
                                                        <SelectTrigger className="w-20">
                                                            <SelectValue placeholder="日期" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(1, 31).map(day => (
                                                                <SelectItem key={day} value={day}>{day}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="last-day" id="day-last" />
                                                <Label htmlFor="day-last">每月最后一天 (L)</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* 月份设置 */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <Label className="text-base">月份</Label>
                                        <RadioGroup value={monthType} onValueChange={setMonthType} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="every" id="month-every" />
                                                <Label htmlFor="month-every">每月 (*)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="month-specific" />
                                                <Label htmlFor="month-specific">特定月份</Label>
                                                {monthType === 'specific' && (
                                                    <Select value={monthValue} onValueChange={setMonthValue} disabled={monthType !== 'specific'}>
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="月份" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(1, 12).map(month => (
                                                                <SelectItem key={month} value={month}>{monthNames[parseInt(month) - 1]}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* 星期设置 */}
                                    <div className="space-y-2 pb-4 border-b">
                                        <Label className="text-base">星期</Label>
                                        <RadioGroup value={dayOfWeekType} onValueChange={setDayOfWeekType} className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="every" id="dayOfWeek-every" />
                                                <Label htmlFor="dayOfWeek-every">每天 (*)</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="specific" id="dayOfWeek-specific" />
                                                <Label htmlFor="dayOfWeek-specific">特定星期</Label>
                                                {dayOfWeekType === 'specific' && (
                                                    <Select value={dayOfWeekValue} onValueChange={setDayOfWeekValue} disabled={dayOfWeekType !== 'specific'}>
                                                        <SelectTrigger className="w-24">
                                                            <SelectValue placeholder="星期" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {generateOptions(0, 6).map(day => (
                                                                <SelectItem key={day} value={day}>{dayOfWeekNames[parseInt(day)]}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="range" id="dayOfWeek-range" />
                                                <Label htmlFor="dayOfWeek-range">范围</Label>
                                                {dayOfWeekType === 'range' && (
                                                    <div className="flex items-center space-x-2">
                                                        <Select
                                                            value={dayOfWeekRange.start}
                                                            onValueChange={(value) => setDayOfWeekRange({ ...dayOfWeekRange, start: value })}
                                                            disabled={dayOfWeekType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="开始" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 6).map(day => (
                                                                    <SelectItem key={day} value={day}>{dayOfWeekNames[parseInt(day)]}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <span>-</span>
                                                        <Select
                                                            value={dayOfWeekRange.end}
                                                            onValueChange={(value) => setDayOfWeekRange({ ...dayOfWeekRange, end: value })}
                                                            disabled={dayOfWeekType !== 'range'}
                                                        >
                                                            <SelectTrigger className="w-20">
                                                                <SelectValue placeholder="结束" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {generateOptions(0, 6).map(day => (
                                                                    <SelectItem key={day} value={day}>{dayOfWeekNames[parseInt(day)]}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                )}
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={resetToDefault}
                                        className="w-full"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" />
                                        重置为默认值
                                    </Button>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Card className="mt-8">
                <CardContent className="pt-6">
                    <h2 className="text-xl font-bold mb-4">CRON表达式说明</h2>
                    <p className="mb-4">
                        CRON表达式是一种用于定义定时任务执行时间的字符串表达式，由五个字段组成，按顺序分别表示：分钟、小时、日期、月份、星期。
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <h3 className="text-lg font-medium mb-2">基本语法</h3>
                            <div className="bg-muted p-4 rounded-md font-mono mb-4">
                                * * * * *
                            </div>
                            <ul className="list-disc pl-6 space-y-1">
                                <li>第一位：分钟 (0-59)</li>
                                <li>第二位：小时 (0-23)</li>
                                <li>第三位：日期 (1-31)</li>
                                <li>第四位：月份 (1-12)</li>
                                <li>第五位：星期 (0-6，0表示周日)</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">特殊字符</h3>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>*</strong> - 表示所有可能的值</li>
                                <li><strong>,</strong> - 用于列举多个值，如 "1,3,5"</li>
                                <li><strong>-</strong> - 表示范围，如 "1-5"</li>
                                <li><strong>/</strong> - 表示增量，如 "0/15" 表示从0开始每15个单位</li>
                                <li><strong>L</strong> - 用在日期字段，表示月份的最后一天</li>
                                <li><strong>?</strong> - 用于日期和星期字段，表示不指定值</li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-6">
                        <h3 className="text-lg font-medium mb-2">常用示例</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">* * * * *</div>
                                <div className="text-sm text-muted-foreground">每分钟执行</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">0 * * * *</div>
                                <div className="text-sm text-muted-foreground">每小时整点执行</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">0 0 * * *</div>
                                <div className="text-sm text-muted-foreground">每天午夜执行</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">0 0 * * 0</div>
                                <div className="text-sm text-muted-foreground">每周日午夜执行</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">0 0 1 * *</div>
                                <div className="text-sm text-muted-foreground">每月1日午夜执行</div>
                            </div>
                            <div className="bg-muted p-3 rounded-md">
                                <div className="font-mono">0 0 1 1 *</div>
                                <div className="text-sm text-muted-foreground">每年1月1日午夜执行</div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
