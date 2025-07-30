'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
    Plus,
    Trash2,
    Save,
    Calculator,
    BarChart3,
    FileText,
    Settings,
    HelpCircle,
    AlertCircle,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    Download
} from 'lucide-react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"

// 课程类型
interface Course {
    id: string
    name: string
    credits: number
    grade: string | null
    score: number | null
    category: string
    semester: string
}

// 成绩配置类型
interface GradeConfig {
    system: 'letter' | 'percentage' | 'custom'
    scale: {
        [key: string]: number
    }
    passingGrade: string
}

// 本地存储键
const STORAGE_KEY = 'grade-calculator-data'

// 默认成绩配置
const defaultGradeConfig: GradeConfig = {
    system: 'letter',
    scale: {
        'A+': 4.0,
        'A': 4.0,
        'A-': 3.7,
        'B+': 3.3,
        'B': 3.0,
        'B-': 2.7,
        'C+': 2.3,
        'C': 2.0,
        'C-': 1.7,
        'D+': 1.3,
        'D': 1.0,
        'F': 0.0
    },
    passingGrade: 'D'
}

// 默认课程类别
const defaultCategories = [
    '必修课',
    '选修课',
    '通识课',
    '专业课',
    '实验课'
]

// 默认学期
const defaultSemesters = [
    '大一上学期',
    '大一下学期',
    '大二上学期',
    '大二下学期',
    '大三上学期',
    '大三下学期',
    '大四上学期',
    '大四下学期'
]

export default function GradeCalculatorPage() {
    // 状态
    const [courses, setCourses] = useState<Course[]>([])
    const [gradeConfig, setGradeConfig] = useState<GradeConfig>(defaultGradeConfig)
    const [categories, setCategories] = useState<string[]>(defaultCategories)
    const [semesters, setSemesters] = useState<string[]>(defaultSemesters)
    const [activeTab, setActiveTab] = useState<'courses' | 'stats' | 'settings'>('courses')
    const [newCourseName, setNewCourseName] = useState('')
    const [newCourseCredits, setNewCourseCredits] = useState(3)
    const [newCourseGrade, setNewCourseGrade] = useState<string>('')
    const [newCourseScore, setNewCourseScore] = useState<number | null>(null)
    const [newCourseCategory, setNewCourseCategory] = useState(defaultCategories[0])
    const [newCourseSemester, setNewCourseSemester] = useState(defaultSemesters[0])
    const [isAddingCourse, setIsAddingCourse] = useState(false)
    const [newCategory, setNewCategory] = useState('')
    const [newSemester, setNewSemester] = useState('')
    const [newGradeKey, setNewGradeKey] = useState('')
    const [newGradeValue, setNewGradeValue] = useState<number>(0)
    const [filterSemester, setFilterSemester] = useState<string>('all')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [sortBy, setSortBy] = useState<'name' | 'credits' | 'grade' | 'semester'>('semester')
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

    const { toast } = useToast()

    // 从本地存储加载数据
    useEffect(() => {
        const savedData = localStorage.getItem(STORAGE_KEY)
        if (savedData) {
            try {
                const data = JSON.parse(savedData)
                setCourses(data.courses || [])
                setGradeConfig(data.gradeConfig || defaultGradeConfig)
                setCategories(data.categories || defaultCategories)
                setSemesters(data.semesters || defaultSemesters)
            } catch (error) {
                console.error('Failed to parse saved data:', error)
            }
        }
    }, [])

    // 保存数据到本地存储
    useEffect(() => {
        const dataToSave = {
            courses,
            gradeConfig,
            categories,
            semesters
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave))
    }, [courses, gradeConfig, categories, semesters])

    // 生成唯一ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }

    // 添加新课程
    const addCourse = () => {
        if (!newCourseName.trim()) {
            toast({
                title: '请输入课程名称',
                variant: 'destructive'
            })
            return
        }

        if (gradeConfig.system === 'letter' && !newCourseGrade) {
            toast({
                title: '请选择成绩',
                variant: 'destructive'
            })
            return
        }

        if (gradeConfig.system === 'percentage' && (newCourseScore === null || isNaN(newCourseScore))) {
            toast({
                title: '请输入有效的分数',
                variant: 'destructive'
            })
            return
        }

        const newCourse: Course = {
            id: generateId(),
            name: newCourseName,
            credits: newCourseCredits,
            grade: gradeConfig.system === 'letter' ? newCourseGrade : null,
            score: gradeConfig.system === 'percentage' ? newCourseScore : null,
            category: newCourseCategory,
            semester: newCourseSemester
        }

        setCourses([...courses, newCourse])
        resetNewCourseForm()

        toast({
            title: '课程已添加',
            description: `${newCourseName} 已添加到你的课程列表`
        })
    }

    // 重置新课程表单
    const resetNewCourseForm = () => {
        setNewCourseName('')
        setNewCourseCredits(3)
        setNewCourseGrade('')
        setNewCourseScore(null)
        setIsAddingCourse(false)
    }

    // 删除课程
    const deleteCourse = (id: string) => {
        setCourses(courses.filter(course => course.id !== id))

        toast({
            title: '课程已删除'
        })
    }

    // 添加新类别
    const addCategory = () => {
        if (!newCategory.trim()) return
        if (categories.includes(newCategory)) {
            toast({
                title: '类别已存在',
                variant: 'destructive'
            })
            return
        }

        setCategories([...categories, newCategory])
        setNewCategory('')

        toast({
            title: '类别已添加',
            description: `${newCategory} 已添加到类别列表`
        })
    }

    // 删除类别
    const deleteCategory = (category: string) => {
        if (courses.some(course => course.category === category)) {
            toast({
                title: '无法删除',
                description: '有课程使用此类别，请先更改这些课程的类别',
                variant: 'destructive'
            })
            return
        }

        setCategories(categories.filter(c => c !== category))

        toast({
            title: '类别已删除'
        })
    }

    // 添加新学期
    const addSemester = () => {
        if (!newSemester.trim()) return
        if (semesters.includes(newSemester)) {
            toast({
                title: '学期已存在',
                variant: 'destructive'
            })
            return
        }

        setSemesters([...semesters, newSemester])
        setNewSemester('')

        toast({
            title: '学期已添加',
            description: `${newSemester} 已添加到学期列表`
        })
    }

    // 删除学期
    const deleteSemester = (semester: string) => {
        if (courses.some(course => course.semester === semester)) {
            toast({
                title: '无法删除',
                description: '有课程使用此学期，请先更改这些课程的学期',
                variant: 'destructive'
            })
            return
        }

        setSemesters(semesters.filter(s => s !== semester))

        toast({
            title: '学期已删除'
        })
    }

    // 添加新成绩等级
    const addGradeScale = () => {
        if (!newGradeKey.trim() || isNaN(newGradeValue)) return
        if (gradeConfig.scale[newGradeKey] !== undefined) {
            toast({
                title: '成绩等级已存在',
                variant: 'destructive'
            })
            return
        }

        setGradeConfig({
            ...gradeConfig,
            scale: {
                ...gradeConfig.scale,
                [newGradeKey]: newGradeValue
            }
        })

        setNewGradeKey('')
        setNewGradeValue(0)

        toast({
            title: '成绩等级已添加'
        })
    }

    // 删除成绩等级
    const deleteGradeScale = (key: string) => {
        if (courses.some(course => course.grade === key)) {
            toast({
                title: '无法删除',
                description: '有课程使用此成绩等级，请先更改这些课程的成绩',
                variant: 'destructive'
            })
            return
        }

        const newScale = { ...gradeConfig.scale }
        delete newScale[key]

        setGradeConfig({
            ...gradeConfig,
            scale: newScale
        })

        toast({
            title: '成绩等级已删除'
        })
    }

    // 更改成绩系统
    const changeGradeSystem = (system: 'letter' | 'percentage' | 'custom') => {
        // 如果有课程，提示用户确认
        if (courses.length > 0) {
            if (!confirm('更改成绩系统将清除所有课程的成绩信息。确定要继续吗？')) {
                return
            }

            // 清除所有课程的成绩
            setCourses(courses.map(course => ({
                ...course,
                grade: null,
                score: null
            })))
        }

        setGradeConfig({
            ...gradeConfig,
            system
        })

        toast({
            title: '成绩系统已更改',
            description: `成绩系统已更改为${system === 'letter' ? '字母等级' : system === 'percentage' ? '百分比' : '自定义'}`
        })
    }

    // 计算GPA
    const calculateGPA = () => {
        const validCourses = courses.filter(course => {
            if (gradeConfig.system === 'letter') {
                return course.grade !== null && gradeConfig.scale[course.grade] !== undefined
            } else if (gradeConfig.system === 'percentage') {
                return course.score !== null
            }
            return false
        })

        if (validCourses.length === 0) return 0

        const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
        const totalPoints = validCourses.reduce((sum, course) => {
            if (gradeConfig.system === 'letter' && course.grade) {
                return sum + (gradeConfig.scale[course.grade] * course.credits)
            } else if (gradeConfig.system === 'percentage' && course.score !== null) {
                // 将百分比转换为GPA点数
                const percentage = course.score
                // 简单的线性转换，可以根据需要调整
                const gpaPoint = (percentage / 100) * 4
                return sum + (gpaPoint * course.credits)
            }
            return sum
        }, 0)

        return totalCredits > 0 ? totalPoints / totalCredits : 0
    }

    // 计算特定学期的GPA
    const calculateSemesterGPA = (semester: string) => {
        const semesterCourses = courses.filter(course => course.semester === semester)
        const validCourses = semesterCourses.filter(course => {
            if (gradeConfig.system === 'letter') {
                return course.grade !== null && gradeConfig.scale[course.grade] !== undefined
            } else if (gradeConfig.system === 'percentage') {
                return course.score !== null
            }
            return false
        })

        if (validCourses.length === 0) return 0

        const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
        const totalPoints = validCourses.reduce((sum, course) => {
            if (gradeConfig.system === 'letter' && course.grade) {
                return sum + (gradeConfig.scale[course.grade] * course.credits)
            } else if (gradeConfig.system === 'percentage' && course.score !== null) {
                const percentage = course.score
                const gpaPoint = (percentage / 100) * 4
                return sum + (gpaPoint * course.credits)
            }
            return sum
        }, 0)

        return totalCredits > 0 ? totalPoints / totalCredits : 0
    }

    // 计算特定类别的GPA
    const calculateCategoryGPA = (category: string) => {
        const categoryCourses = courses.filter(course => course.category === category)
        const validCourses = categoryCourses.filter(course => {
            if (gradeConfig.system === 'letter') {
                return course.grade !== null && gradeConfig.scale[course.grade] !== undefined
            } else if (gradeConfig.system === 'percentage') {
                return course.score !== null
            }
            return false
        })

        if (validCourses.length === 0) return 0

        const totalCredits = validCourses.reduce((sum, course) => sum + course.credits, 0)
        const totalPoints = validCourses.reduce((sum, course) => {
            if (gradeConfig.system === 'letter' && course.grade) {
                return sum + (gradeConfig.scale[course.grade] * course.credits)
            } else if (gradeConfig.system === 'percentage' && course.score !== null) {
                const percentage = course.score
                const gpaPoint = (percentage / 100) * 4
                return sum + (gpaPoint * course.credits)
            }
            return sum
        }, 0)

        return totalCredits > 0 ? totalPoints / totalCredits : 0
    }

    // 计算总学分
    const calculateTotalCredits = () => {
        return courses.reduce((sum, course) => sum + course.credits, 0)
    }

    // 计算已通过学分
    const calculatePassedCredits = () => {
        return courses.reduce((sum, course) => {
            if (gradeConfig.system === 'letter' && course.grade) {
                // 检查是否达到通过等级
                const passingGradeValue = gradeConfig.scale[gradeConfig.passingGrade]
                const courseGradeValue = gradeConfig.scale[course.grade]

                if (courseGradeValue >= passingGradeValue) {
                    return sum + course.credits
                }
            } else if (gradeConfig.system === 'percentage' && course.score !== null) {
                // 假设60%为通过线
                if (course.score >= 60) {
                    return sum + course.credits
                }
            }
            return sum
        }, 0)
    }

    // 格式化GPA
    const formatGPA = (gpa: number) => {
        return gpa.toFixed(2)
    }

    // 获取成绩点数
    const getGradePoint = (course: Course) => {
        if (gradeConfig.system === 'letter' && course.grade) {
            return gradeConfig.scale[course.grade]
        } else if (gradeConfig.system === 'percentage' && course.score !== null) {
            return (course.score / 100) * 4
        }
        return 0
    }

    // 获取成绩显示文本
    const getGradeDisplay = (course: Course) => {
        if (gradeConfig.system === 'letter' && course.grade) {
            return `${course.grade} (${gradeConfig.scale[course.grade].toFixed(1)})`
        } else if (gradeConfig.system === 'percentage' && course.score !== null) {
            return `${course.score}%`
        }
        return '未评分'
    }

    // 导出成绩单
    const exportTranscript = () => {
        let content = '成绩单\n\n'
        content += `总GPA: ${formatGPA(calculateGPA())}\n`
        content += `总学分: ${calculateTotalCredits()}\n`
        content += `已通过学分: ${calculatePassedCredits()}\n\n`

        // 按学期分组
        const semesterGroups: { [key: string]: Course[] } = {}

        courses.forEach(course => {
            if (!semesterGroups[course.semester]) {
                semesterGroups[course.semester] = []
            }
            semesterGroups[course.semester].push(course)
        })

        // 按学期输出课程
        Object.keys(semesterGroups).forEach(semester => {
            content += `${semester} (GPA: ${formatGPA(calculateSemesterGPA(semester))})\n`
            content += '课程名称\t学分\t成绩\n'

            semesterGroups[semester].forEach(course => {
                content += `${course.name}\t${course.credits}\t${getGradeDisplay(course)}\n`
            })

            content += '\n'
        })

        // 创建下载链接
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = '成绩单.txt'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)

        toast({
            title: '成绩单已导出',
            description: '成绩单已保存为文本文件'
        })
    }

    // 过滤和排序课程
    const getFilteredAndSortedCourses = () => {
        let filteredCourses = [...courses]

        // 应用过滤器
        if (filterSemester !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.semester === filterSemester)
        }

        if (filterCategory !== 'all') {
            filteredCourses = filteredCourses.filter(course => course.category === filterCategory)
        }

        // 应用排序
        filteredCourses.sort((a, b) => {
            if (sortBy === 'name') {
                return sortDirection === 'asc'
                    ? a.name.localeCompare(b.name)
                    : b.name.localeCompare(a.name)
            } else if (sortBy === 'credits') {
                return sortDirection === 'asc'
                    ? a.credits - b.credits
                    : b.credits - a.credits
            } else if (sortBy === 'grade') {
                const gradeA = getGradePoint(a)
                const gradeB = getGradePoint(b)
                return sortDirection === 'asc'
                    ? gradeA - gradeB
                    : gradeB - gradeA
            } else if (sortBy === 'semester') {
                // 按学期排序（假设学期是按时间顺序排列的）
                const semesterIndexA = semesters.indexOf(a.semester)
                const semesterIndexB = semesters.indexOf(b.semester)
                return sortDirection === 'asc'
                    ? semesterIndexA - semesterIndexB
                    : semesterIndexB - semesterIndexA
            }
            return 0
        })

        return filteredCourses
    }

    // 切换排序方向
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    }

    // 设置排序字段
    const setSortField = (field: 'name' | 'credits' | 'grade' | 'semester') => {
        if (sortBy === field) {
            toggleSortDirection()
        } else {
            setSortBy(field)
            setSortDirection('desc') // 默认降序
        }
    }

    // 渲染课程列表
    const renderCourseList = () => {
        const filteredCourses = getFilteredAndSortedCourses()

        if (filteredCourses.length === 0) {
            return (
                <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">暂无课程</h3>
                    <p className="text-muted-foreground mb-4">添加一些课程来开始计算你的GPA</p>
                    <Button onClick={() => setIsAddingCourse(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加课程
                    </Button>
                </div>
            )
        }

        return (
            <div>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2">
                        <Select value={filterSemester} onValueChange={setFilterSemester}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="选择学期" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">所有学期</SelectItem>
                                {semesters.map(semester => (
                                    <SelectItem key={semester} value={semester}>
                                        {semester}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filterCategory} onValueChange={setFilterCategory}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="选择类别" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">所有类别</SelectItem>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button onClick={() => setIsAddingCourse(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加课程
                    </Button>
                </div>

                <div className="border rounded-md overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => setSortField('name')}
                                >
                                    课程名称
                                    {sortBy === 'name' && (
                                        sortDirection === 'asc' ?
                                            <ChevronUp className="inline h-4 w-4 ml-1" /> :
                                            <ChevronDown className="inline h-4 w-4 ml-1" />
                                    )}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => setSortField('credits')}
                                >
                                    学分
                                    {sortBy === 'credits' && (
                                        sortDirection === 'asc' ?
                                            <ChevronUp className="inline h-4 w-4 ml-1" /> :
                                            <ChevronDown className="inline h-4 w-4 ml-1" />
                                    )}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => setSortField('grade')}
                                >
                                    成绩
                                    {sortBy === 'grade' && (
                                        sortDirection === 'asc' ?
                                            <ChevronUp className="inline h-4 w-4 ml-1" /> :
                                            <ChevronDown className="inline h-4 w-4 ml-1" />
                                    )}
                                </TableHead>
                                <TableHead
                                    className="cursor-pointer"
                                    onClick={() => setSortField('semester')}
                                >
                                    学期
                                    {sortBy === 'semester' && (
                                        sortDirection === 'asc' ?
                                            <ChevronUp className="inline h-4 w-4 ml-1" /> :
                                            <ChevronDown className="inline h-4 w-4 ml-1" />
                                    )}
                                </TableHead>
                                <TableHead>类别</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCourses.map(course => (
                                <TableRow key={course.id}>
                                    <TableCell>{course.name}</TableCell>
                                    <TableCell>{course.credits}</TableCell>
                                    <TableCell>{getGradeDisplay(course)}</TableCell>
                                    <TableCell>{course.semester}</TableCell>
                                    <TableCell>{course.category}</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteCourse(course.id)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        )
    }

    // 渲染统计界面
    const renderStatsInterface = () => {
        const overallGPA = calculateGPA()
        const totalCredits = calculateTotalCredits()
        const passedCredits = calculatePassedCredits()

        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div className="text-sm text-muted-foreground mb-1">总GPA</div>
                            <div className="text-4xl font-bold">{formatGPA(overallGPA)}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div className="text-sm text-muted-foreground mb-1">总学分</div>
                            <div className="text-4xl font-bold">{totalCredits}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6 text-center">
                            <div className="text-sm text-muted-foreground mb-1">已通过学分</div>
                            <div className="text-4xl font-bold">{passedCredits}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {totalCredits > 0 ? `(${Math.round((passedCredits / totalCredits) * 100)}%)` : ''}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">按学期统计</h3>

                    {semesters.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            暂无学期数据
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {semesters.map(semester => {
                                const semesterGPA = calculateSemesterGPA(semester)
                                const semesterCourses = courses.filter(course => course.semester === semester)
                                const semesterCredits = semesterCourses.reduce((sum, course) => sum + course.credits, 0)

                                return (
                                    <div key={semester} className="border rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium">{semester}</h4>
                                            <Badge variant="outline">
                                                GPA: {formatGPA(semesterGPA)}
                                            </Badge>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {semesterCourses.length} 门课程 / {semesterCredits} 学分
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">按类别统计</h3>

                    {categories.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            暂无类别数据
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {categories.map(category => {
                                const categoryGPA = calculateCategoryGPA(category)
                                const categoryCourses = courses.filter(course => course.category === category)
                                const categoryCredits = categoryCourses.reduce((sum, course) => sum + course.credits, 0)

                                return (
                                    <div key={category} className="border rounded-md p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-medium">{category}</h4>
                                            <Badge variant="outline">
                                                GPA: {formatGPA(categoryGPA)}
                                            </Badge>
                                        </div>

                                        <div className="text-sm text-muted-foreground">
                                            {categoryCourses.length} 门课程 / {categoryCredits} 学分
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end mt-6">
                    <Button onClick={exportTranscript} disabled={courses.length === 0}>
                        <Download className="mr-2 h-4 w-4" />
                        导出成绩单
                    </Button>
                </div>
            </div>
        )
    }

    // 渲染设置界面
    const renderSettingsInterface = () => {
        return (
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-medium mb-4">成绩系统</h3>

                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <Button
                            variant={gradeConfig.system === 'letter' ? 'default' : 'outline'}
                            onClick={() => changeGradeSystem('letter')}
                        >
                            字母等级 (A, B, C...)
                        </Button>

                        <Button
                            variant={gradeConfig.system === 'percentage' ? 'default' : 'outline'}
                            onClick={() => changeGradeSystem('percentage')}
                        >
                            百分比 (0-100%)
                        </Button>

                        <Button
                            variant={gradeConfig.system === 'custom' ? 'default' : 'outline'}
                            onClick={() => changeGradeSystem('custom')}
                        >
                            自定义
                        </Button>
                    </div>

                    {gradeConfig.system === 'letter' && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">字母等级配置</h4>
                                <div className="text-sm text-muted-foreground">
                                    通过等级: {gradeConfig.passingGrade}
                                </div>
                            </div>

                            <div className="border rounded-md overflow-hidden mb-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>等级</TableHead>
                                            <TableHead>GPA点数</TableHead>
                                            <TableHead>通过等级</TableHead>
                                            <TableHead className="text-right">操作</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {Object.entries(gradeConfig.scale)
                                            .sort(([, a], [, b]) => b - a)
                                            .map(([grade, point]) => (
                                                <TableRow key={grade}>
                                                    <TableCell>{grade}</TableCell>
                                                    <TableCell>{point.toFixed(1)}</TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => setGradeConfig({
                                                                ...gradeConfig,
                                                                passingGrade: grade
                                                            })}
                                                            disabled={gradeConfig.passingGrade === grade}
                                                        >
                                                            {gradeConfig.passingGrade === grade ? (
                                                                <Check className="h-4 w-4 text-green-500" />
                                                            ) : (
                                                                '设为通过等级'
                                                            )}
                                                        </Button>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => deleteGradeScale(grade)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </div>

                            <div className="flex space-x-2 items-end">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="new-grade">新等级</Label>
                                    <Input
                                        id="new-grade"
                                        value={newGradeKey}
                                        onChange={(e) => setNewGradeKey(e.target.value)}
                                        placeholder="例如: A+, B-, F"
                                    />
                                </div>

                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="new-point">GPA点数</Label>
                                    <Input
                                        id="new-point"
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        max="4"
                                        value={newGradeValue}
                                        onChange={(e) => setNewGradeValue(parseFloat(e.target.value) || 0)}
                                        placeholder="例如: 4.0, 3.7, 0.0"
                                    />
                                </div>

                                <Button onClick={addGradeScale}>
                                    添加
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">课程类别管理</h3>

                    <div className="border rounded-md p-4 mb-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {categories.map(category => (
                                <Badge key={category} variant="outline" className="py-2 px-3">
                                    {category}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1"
                                        onClick={() => deleteCategory(category)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex space-x-2">
                            <Input
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="新类别名称"
                                className="flex-1"
                            />
                            <Button onClick={addCategory}>
                                添加类别
                            </Button>
                        </div>
                    </div>
                </div>

                <Separator />

                <div>
                    <h3 className="text-lg font-medium mb-4">学期管理</h3>

                    <div className="border rounded-md p-4">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {semesters.map(semester => (
                                <Badge key={semester} variant="outline" className="py-2 px-3">
                                    {semester}
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-4 w-4 ml-1"
                                        onClick={() => deleteSemester(semester)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </Badge>
                            ))}
                        </div>

                        <div className="flex space-x-2">
                            <Input
                                value={newSemester}
                                onChange={(e) => setNewSemester(e.target.value)}
                                placeholder="新学期名称"
                                className="flex-1"
                            />
                            <Button onClick={addSemester}>
                                添加学期
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // 渲染新课程表单
    const renderNewCourseForm = () => {
        return (
            <div className="space-y-4 border rounded-md p-4">
                <h3 className="text-lg font-medium">添加新课程</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="course-name">课程名称</Label>
                        <Input
                            id="course-name"
                            value={newCourseName}
                            onChange={(e) => setNewCourseName(e.target.value)}
                            placeholder="例如：高等数学、计算机网络..."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course-credits">学分</Label>
                        <Input
                            id="course-credits"
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={newCourseCredits}
                            onChange={(e) => setNewCourseCredits(parseFloat(e.target.value) || 0)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course-semester">学期</Label>
                        <Select value={newCourseSemester} onValueChange={setNewCourseSemester}>
                            <SelectTrigger id="course-semester">
                                <SelectValue placeholder="选择学期" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map(semester => (
                                    <SelectItem key={semester} value={semester}>
                                        {semester}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="course-category">类别</Label>
                        <Select value={newCourseCategory} onValueChange={setNewCourseCategory}>
                            <SelectTrigger id="course-category">
                                <SelectValue placeholder="选择类别" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(category => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {gradeConfig.system === 'letter' ? (
                        <div className="space-y-2">
                            <Label htmlFor="course-grade">成绩</Label>
                            <Select value={newCourseGrade} onValueChange={setNewCourseGrade}>
                                <SelectTrigger id="course-grade">
                                    <SelectValue placeholder="选择成绩" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(gradeConfig.scale)
                                        .sort(([, a], [, b]) => b - a)
                                        .map(([grade]) => (
                                            <SelectItem key={grade} value={grade}>
                                                {grade} ({gradeConfig.scale[grade].toFixed(1)})
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <Label htmlFor="course-score">分数 (0-100)</Label>
                            <Input
                                id="course-score"
                                type="number"
                                min="0"
                                max="100"
                                value={newCourseScore === null ? '' : newCourseScore}
                                onChange={(e) => setNewCourseScore(e.target.value === '' ? null : parseFloat(e.target.value))}
                            />
                        </div>
                    )}
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsAddingCourse(false)}
                    >
                        取消
                    </Button>
                    <Button onClick={addCourse}>
                        添加课程
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">成绩计算器</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-semibold">成绩管理</h2>

                                    <TabsList>
                                        <TabsTrigger value="courses">
                                            <FileText className="h-4 w-4 mr-2" />
                                            课程
                                        </TabsTrigger>
                                        <TabsTrigger value="stats">
                                            <BarChart3 className="h-4 w-4 mr-2" />
                                            统计
                                        </TabsTrigger>
                                        <TabsTrigger value="settings">
                                            <Settings className="h-4 w-4 mr-2" />
                                            设置
                                        </TabsTrigger>
                                    </TabsList>
                                </div>

                                <TabsContent value="courses" className="mt-0">
                                    {isAddingCourse ? (
                                        renderNewCourseForm()
                                    ) : (
                                        renderCourseList()
                                    )}
                                </TabsContent>

                                <TabsContent value="stats" className="mt-0">
                                    {renderStatsInterface()}
                                </TabsContent>

                                <TabsContent value="settings" className="mt-0">
                                    {renderSettingsInterface()}
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">GPA概览</h2>

                            <div className="text-center py-6">
                                <div className="text-6xl font-bold mb-2">
                                    {formatGPA(calculateGPA())}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    总GPA (满分4.0)
                                </div>
                            </div>

                            <Separator className="my-4" />

                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>总学分</span>
                                    <span className="font-medium">{calculateTotalCredits()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>已通过学分</span>
                                    <span className="font-medium">{calculatePassedCredits()}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>课程数量</span>
                                    <span className="font-medium">{courses.length}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">帮助</h2>

                            <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="item-1">
                                    <AccordionTrigger>如何计算GPA?</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground">
                                            GPA (Grade Point Average) 是按学分加权平均计算的。每门课程的学分乘以对应的成绩点数，然后除以总学分。
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            例如：一门3学分的A (4.0)和一门2学分的B (3.0)，GPA计算为：(3×4.0 + 2×3.0) ÷ (3+2) = 3.6
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-2">
                                    <AccordionTrigger>如何添加课程?</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground">
                                            在"课程"标签页中，点击"添加课程"按钮，填写课程信息后保存即可。
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-3">
                                    <AccordionTrigger>如何更改成绩系统?</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground">
                                            在"设置"标签页中，选择你想使用的成绩系统（字母等级、百分比或自定义）。注意：更改成绩系统会清除所有课程的成绩信息。
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>

                                <AccordionItem value="item-4">
                                    <AccordionTrigger>如何导出成绩单?</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-sm text-muted-foreground">
                                            在"统计"标签页底部，点击"导出成绩单"按钮，将生成一个包含所有课程信息的文本文件。
                                        </p>
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>

                            <div className="mt-4 p-3 bg-muted rounded-md">
                                <div className="flex items-start">
                                    <HelpCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">
                                        所有数据都保存在你的浏览器本地存储中，不会上传到任何服务器。清除浏览器数据可能会导致数据丢失。
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
