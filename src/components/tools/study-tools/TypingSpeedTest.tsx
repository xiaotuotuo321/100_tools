'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Keyboard, Clock, Target, RotateCcw, Play, Pause, Trophy, TrendingUp } from 'lucide-react'

interface TypingStats {
  wpm: number
  accuracy: number
  errors: number
  totalChars: number
  correctChars: number
  timeElapsed: number
}

interface TestResult {
  wpm: number
  accuracy: number
  errors: number
  duration: number
  textLength: number
  date: string
}

export default function TypingSpeedTest() {
  const [testText, setTestText] = useState('')
  const [userInput, setUserInput] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    accuracy: 100,
    errors: 0,
    totalChars: 0,
    correctChars: 0,
    timeElapsed: 0
  })
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium')
  const [testMode, setTestMode] = useState('timed') // timed, words, custom
  const [testDuration, setTestDuration] = useState(60) // seconds
  const [wordCount, setWordCount] = useState(50)
  const [isCompleted, setIsCompleted] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const intervalRef = useRef<NodeJS.Timeout>()

  // 预设文本库
  const textLibrary = {
    easy: [
      'The quick brown fox jumps over the lazy dog.',
      'A simple test with basic words and letters.',
      'Hello world this is an easy typing test for beginners.',
      'Type these words slowly and focus on accuracy first.'
    ],
    medium: [
      'Technology has revolutionized the way we communicate and work in modern society.',
      'The development of artificial intelligence brings both opportunities and challenges.',
      'Learning to type efficiently can significantly improve your productivity at work.',
      'Practice makes perfect when it comes to developing muscle memory for typing.'
    ],
    hard: [
      'The implementation of quantum computing algorithms requires sophisticated mathematical understanding.',
      'Cryptocurrency\'s decentralized architecture fundamentally challenges traditional financial systems.',
      'Neuroplasticity demonstrates the brain\'s remarkable capacity for adaptation throughout life.',
      'The interplay between socioeconomic factors and educational outcomes remains complex.'
    ],
    programming: [
      'function calculateTypingSpeed(characters, timeInMinutes) { return characters / 5 / timeInMinutes; }',
      'const handleKeyPress = (event) => { if (event.key === "Enter") { submitForm(); } };',
      'import React, { useState, useEffect } from "react"; export default function Component() { return null; }',
      'SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id WHERE orders.date > "2024-01-01";'
    ]
  }

  const generateRandomText = useCallback((difficulty: string, length: number) => {
    const texts = textLibrary[difficulty as keyof typeof textLibrary] || textLibrary.medium
    const words = []
    
    while (words.join(' ').length < length) {
      const randomText = texts[Math.floor(Math.random() * texts.length)]
      words.push(...randomText.split(' '))
    }
    
    return words.slice(0, length).join(' ')
  }, [])

  const generateTextByWords = useCallback((difficulty: string, wordCount: number) => {
    const texts = textLibrary[difficulty as keyof typeof textLibrary] || textLibrary.medium
    const allWords = texts.join(' ').split(' ')
    const selectedWords = []
    
    for (let i = 0; i < wordCount; i++) {
      selectedWords.push(allWords[Math.floor(Math.random() * allWords.length)])
    }
    
    return selectedWords.join(' ')
  }, [])

  const startTest = () => {
    let newText = ''
    
    if (testMode === 'timed') {
      newText = generateRandomText(selectedDifficulty, 500)
    } else if (testMode === 'words') {
      newText = generateTextByWords(selectedDifficulty, wordCount)
    } else {
      // Use first text from selected difficulty for now
      newText = textLibrary[selectedDifficulty as keyof typeof textLibrary][0]
    }
    
    setTestText(newText)
    setUserInput('')
    setCurrentIndex(0)
    setIsActive(true)
    setIsPaused(false)
    setTimeElapsed(0)
    setIsCompleted(false)
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalChars: 0,
      correctChars: 0,
      timeElapsed: 0
    })
    
    // Focus input
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }

  const pauseTest = () => {
    setIsPaused(!isPaused)
  }

  const resetTest = () => {
    setIsActive(false)
    setIsPaused(false)
    setTimeElapsed(0)
    setUserInput('')
    setCurrentIndex(0)
    setIsCompleted(false)
    setStats({
      wpm: 0,
      accuracy: 100,
      errors: 0,
      totalChars: 0,
      correctChars: 0,
      timeElapsed: 0
    })
  }

  const calculateStats = useCallback((input: string, targetText: string, time: number) => {
    const totalChars = input.length
    let correctChars = 0
    let errors = 0

    for (let i = 0; i < totalChars; i++) {
      if (i < targetText.length && input[i] === targetText[i]) {
        correctChars++
      } else {
        errors++
      }
    }

    const timeInMinutes = time / 60
    const wordsTyped = totalChars / 5 // Standard: 5 characters = 1 word
    const wpm = timeInMinutes > 0 ? Math.round(wordsTyped / timeInMinutes) : 0
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100

    return {
      wpm,
      accuracy,
      errors,
      totalChars,
      correctChars,
      timeElapsed: time
    }
  }, [])

  const completeTest = useCallback(() => {
    setIsActive(false)
    setIsCompleted(true)
    
    const result: TestResult = {
      wpm: stats.wpm,
      accuracy: stats.accuracy,
      errors: stats.errors,
      duration: timeElapsed,
      textLength: testText.length,
      date: new Date().toISOString()
    }
    
    setTestResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
  }, [stats, timeElapsed, testText])

  // Timer effect
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1
          
          // Check if time limit reached for timed test
          if (testMode === 'timed' && newTime >= testDuration) {
            completeTest()
            return newTime
          }
          
          return newTime
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isActive, isPaused, testMode, testDuration, completeTest])

  // Update stats when user input changes
  useEffect(() => {
    if (isActive && userInput.length > 0) {
      const newStats = calculateStats(userInput, testText, timeElapsed)
      setStats(newStats)
      
      // Check if test completed (all text typed correctly for words mode)
      if (testMode === 'words' && userInput.length >= testText.length) {
        completeTest()
      }
    }
  }, [userInput, testText, timeElapsed, isActive, calculateStats, testMode, completeTest])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isActive) return
    
    const value = e.target.value
    setUserInput(value)
    setCurrentIndex(value.length)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault()
    }
  }

  const getCharacterStatus = (index: number) => {
    if (index >= userInput.length) return 'pending'
    if (index >= testText.length) return 'extra'
    return userInput[index] === testText[index] ? 'correct' : 'incorrect'
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getWPMColor = (wpm: number) => {
    if (wpm >= 60) return 'text-green-600'
    if (wpm >= 40) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 95) return 'text-green-600'
    if (accuracy >= 85) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            打字速度测试设置
          </CardTitle>
          <CardDescription>
            选择测试模式和难度，开始提升您的打字技能
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs value={testMode} onValueChange={setTestMode} className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timed">限时测试</TabsTrigger>
              <TabsTrigger value="words">单词数测试</TabsTrigger>
              <TabsTrigger value="custom">自定义文本</TabsTrigger>
            </TabsList>

            <TabsContent value="timed" className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>测试时长:</Label>
                <div className="flex gap-2">
                  {[30, 60, 120, 300].map(duration => (
                    <Button
                      key={duration}
                      variant={testDuration === duration ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setTestDuration(duration)}
                    >
                      {duration < 60 ? `${duration}秒` : `${duration / 60}分钟`}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="words" className="space-y-4">
              <div className="flex items-center gap-4">
                <Label>单词数量:</Label>
                <div className="flex gap-2">
                  {[25, 50, 100, 200].map(count => (
                    <Button
                      key={count}
                      variant={wordCount === count ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setWordCount(count)}
                    >
                      {count}词
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="custom" className="space-y-4">
              <div className="space-y-2">
                <Label>自定义文本内容:</Label>
                <textarea
                  className="w-full h-32 p-3 border rounded-md resize-none"
                  placeholder="输入您想要练习的文本..."
                  value={testText}
                  onChange={(e) => setTestText(e.target.value)}
                />
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Label>难度等级:</Label>
              <div className="flex gap-2">
                {[
                  { key: 'easy', label: '简单', color: 'bg-green-100 text-green-700' },
                  { key: 'medium', label: '中等', color: 'bg-yellow-100 text-yellow-700' },
                  { key: 'hard', label: '困难', color: 'bg-red-100 text-red-700' },
                  { key: 'programming', label: '编程', color: 'bg-purple-100 text-purple-700' }
                ].map(difficulty => (
                  <Button
                    key={difficulty.key}
                    variant={selectedDifficulty === difficulty.key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDifficulty(difficulty.key)}
                    className={selectedDifficulty === difficulty.key ? '' : difficulty.color}
                  >
                    {difficulty.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={startTest} disabled={isActive && !isCompleted}>
                <Play className="h-4 w-4 mr-1" />
                开始测试
              </Button>
              
              {isActive && (
                <Button onClick={pauseTest} variant="outline">
                  <Pause className="h-4 w-4 mr-1" />
                  {isPaused ? '继续' : '暂停'}
                </Button>
              )}
              
              <Button onClick={resetTest} variant="outline">
                <RotateCcw className="h-4 w-4 mr-1" />
                重置
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time stats */}
      {(isActive || isCompleted) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>实时统计</span>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
                {testMode === 'timed' && (
                  <span className="text-muted-foreground">
                    / {formatTime(testDuration)}
                  </span>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="text-2xl font-bold">
                  <span className={getWPMColor(stats.wpm)}>{stats.wpm}</span>
                </div>
                <div className="text-sm text-muted-foreground">WPM</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="text-2xl font-bold">
                  <span className={getAccuracyColor(stats.accuracy)}>{stats.accuracy}%</span>
                </div>
                <div className="text-sm text-muted-foreground">准确率</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
                <div className="text-sm text-muted-foreground">错误</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="text-2xl font-bold">{stats.correctChars}</div>
                <div className="text-sm text-muted-foreground">正确字符</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Typing area */}
      {testText && (
        <Card>
          <CardHeader>
            <CardTitle>打字区域</CardTitle>
            <CardDescription>
              {isPaused ? '测试已暂停，点击继续按钮恢复' : '开始输入下面的文本'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Text display */}
            <div className="p-4 bg-muted/30 rounded-lg font-mono text-lg leading-relaxed">
              {testText.split('').map((char, index) => {
                const status = getCharacterStatus(index)
                let className = 'relative '
                
                if (status === 'correct') {
                  className += 'text-green-600 bg-green-100 dark:bg-green-900/30'
                } else if (status === 'incorrect') {
                  className += 'text-red-600 bg-red-100 dark:bg-red-900/30'
                } else if (index === currentIndex) {
                  className += 'bg-blue-200 dark:bg-blue-800/50 animate-pulse'
                } else {
                  className += 'text-muted-foreground'
                }
                
                return (
                  <span key={index} className={className}>
                    {char}
                  </span>
                )
              })}
            </div>

            {/* Input field */}
            <Input
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="在此输入..."
              disabled={!isActive || isPaused || isCompleted}
              className="font-mono text-lg"
            />

            <div className="text-sm text-muted-foreground">
              进度: {userInput.length} / {testText.length} 字符
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test results history */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              测试历史
            </CardTitle>
            <CardDescription>
              最近的测试结果
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div className="text-sm">
                      <div className="font-medium">
                        {result.wpm} WPM • {result.accuracy}% 准确率
                      </div>
                      <div className="text-muted-foreground">
                        {formatTime(result.duration)} • {result.errors} 错误
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(result.date).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>评分标准</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">打字速度等级 (WPM)</h4>
              <ul className="space-y-1 text-sm">
                <li className="flex justify-between">
                  <span>初学者:</span>
                  <Badge variant="outline">0-20 WPM</Badge>
                </li>
                <li className="flex justify-between">
                  <span>一般:</span>
                  <Badge variant="outline">20-40 WPM</Badge>
                </li>
                <li className="flex justify-between">
                  <span>良好:</span>
                  <Badge variant="outline">40-60 WPM</Badge>
                </li>
                <li className="flex justify-between">
                  <span>优秀:</span>
                  <Badge variant="outline">60-80 WPM</Badge>
                </li>
                <li className="flex justify-between">
                  <span>专业:</span>
                  <Badge variant="outline">80+ WPM</Badge>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">练习建议</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• 保持正确的手指位置</li>
                <li>• 先追求准确率，再提升速度</li>
                <li>• 定期练习，培养肌肉记忆</li>
                <li>• 使用所有手指进行盲打</li>
                <li>• 从简单文本开始练习</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 