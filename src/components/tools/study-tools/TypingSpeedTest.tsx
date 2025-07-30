'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Play,
  RefreshCw,
  Clock,
  FileText,
  Settings,
  ChevronUp,
  ChevronDown,
  Keyboard,
  BarChart3,
  History,
  Trash2,
  Save,
  AlertCircle
} from 'lucide-react'

// 测试模式类型
type TestMode = 'time' | 'words' | 'custom'

// 难度级别类型
type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'code'

// 测试结果类型
interface TestResult {
  id: string
  date: number
  mode: TestMode
  difficulty: DifficultyLevel
  duration: number // 秒数或单词数
  wpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  totalChars: number
}

// 本地存储键
const STORAGE_KEY = 'typing-speed-test-results'

// 示例文本
const sampleTexts: Record<DifficultyLevel, string[]> = {
  easy: [
    '这是一个简单的打字测试，主要包含常用的汉字和标点符号。你需要尽可能快速准确地输入这些文字，系统会计算你的打字速度和准确率。',
    '打字速度是衡量一个人键盘操作熟练程度的重要指标。通过定期练习，你可以显著提高自己的打字速度和准确性，这对于日常工作和学习都非常有帮助。',
    '良好的打字习惯包括正确的手指位置、专注的态度以及持续的练习。当你熟悉键盘布局后，你的手指会自然地找到正确的按键，无需低头看键盘。',
    '在数字化时代，高效的打字技能变得越来越重要。无论是撰写邮件、编写文档还是在社交媒体上交流，快速准确的打字能力都能让你事半功倍。',
    '坚持每天练习打字是提高速度的关键。开始时可能会感到困难，但随着时间的推移，你的肌肉记忆会逐渐形成，打字速度和准确率都会有显著提升。'
  ],
  medium: [
    '打字技能在现代社会中变得日益重要，它不仅关系到工作效率，还影响着人们的沟通方式。熟练的打字者能够在短时间内完成大量文字输入工作，同时保持较高的准确率。这种能力在各种职业中都非常有价值，尤其是那些需要频繁处理文档和数据的岗位。',
    '键盘布局的设计有着悠久的历史，最常见的QWERTY布局最初是为了解决机械打字机卡键问题而设计的。尽管现在已经进入了电子时代，这种看似不合理的布局却因为人们的习惯而被保留下来。一些追求效率的人选择学习Dvorak或Colemak等替代布局，声称这些布局能提供更高的打字速度和舒适度。',
    '触摸打字法是一种不看键盘打字的技术，依靠肌肉记忆来定位按键。掌握这种技术需要时间和耐心，但长期来看非常值得。熟练的触摸打字者通常可以达到每分钟60-80个词的速度，而专业打字员甚至可以超过100个词。准确率同样重要，高速但错误百出的打字并不实用。',
    '打字速度测试通常使用"每分钟词数"(WPM)作为衡量标准，其中一个"词"通常定义为五个字符，包括空格和标点符号。另一个重要指标是准确率，它反映了打字过程中的错误率。理想情况下，打字者应该追求高速度和高准确率的平衡，而不是牺牲一方来提高另一方。',
    '定期进行打字练习可以显著提高打字技能。初学者应该从基本的指法开始，逐渐增加难度。使用专门的打字训练软件或网站可以提供结构化的学习路径和即时反馈。重要的是保持正确的姿势和手指位置，避免形成不良习惯。随着练习的积累，打字将变得越来越自然，最终成为一种几乎不需要思考的技能。'
  ],
  hard: [
    '在语言学的宏观视角下，文字系统的演变呈现出令人着迷的多样性与复杂性。从古埃及的象形文字到中国的汉字，从腓尼基字母到现代拉丁字母，每种文字系统都反映了特定文化背景下的认知模式与交流需求。这些系统不仅仅是简单的符号集合，更是人类智慧的结晶，承载着丰富的历史信息与文化内涵。在数字化时代，键盘作为文字输入的主要媒介，连接了古老的文字传统与现代信息技术，使得文字的生产与传播效率得到了前所未有的提升。',
    '量子计算领域的最新突破正在挑战我们对计算极限的传统认知。与经典计算机使用二进制位不同，量子计算机利用量子比特（qubit）的叠加态和纠缠特性，能够同时处理指数级增长的信息量。这种革命性的计算范式有望解决一些经典算法难以高效处理的问题，如大数分解、数据库搜索和复杂系统模拟等。然而，量子退相干、错误校正和可扩展性等技术挑战仍然存在，需要跨学科的协作努力才能克服。',
    '生物多样性的急剧减少已成为全球性的环境危机，其影响范围远超出单一物种的灭绝。生态系统作为相互依存的复杂网络，其稳定性和弹性很大程度上依赖于物种的多样性。当关键物种消失时，可能会触发连锁反应，导致整个生态系统功能的崩溃。人类活动如栖息地破坏、过度开发、污染和气候变化是导致当前生物多样性危机的主要因素。保护生物多样性不仅关乎自然界的平衡，也直接关系到人类社会的可持续发展和福祉。',
    '认知神经科学研究表明，人类大脑的可塑性远超过我们之前的理解。即使在成年后，神经元之间仍能形成新的连接，重组现有的神经网络。这种神经可塑性为学习新技能、恢复脑损伤后的功能以及改变根深蒂固的行为模式提供了生物学基础。环境刺激、持续学习和有针对性的训练可以促进神经可塑性，而压力、睡眠不足和缺乏刺激则可能抑制这一过程。了解并利用大脑的这一特性，有助于我们在整个生命周期中优化认知功能和适应能力。',
    '现代密码学已经远远超出了简单的信息加密范畴，发展成为保障数字世界安全的核心技术。非对称加密算法如RSA和椭圆曲线密码学使得在不安全的通信渠道上建立安全连接成为可能。零知识证明允许一方证明某个陈述的真实性，而无需透露任何额外信息。同态加密则提供了在加密数据上直接进行计算的能力，无需先解密。这些先进的密码学工具不仅保护了个人隐私和敏感数据，还为区块链、安全多方计算等创新技术奠定了理论基础。'
  ],
  code: [
    `function quickSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

// 测试快速排序算法
const unsortedArray = [3, 6, 8, 10, 1, 2, 1];
const sortedArray = quickSort(unsortedArray);
console.log(sortedArray); // 输出: [1, 1, 2, 3, 6, 8, 10]`,

    `import React, { useState, useEffect } from 'react';

function DataFetchingComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('https://api.example.com/data');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h1>Data Fetched Successfully</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}`,

    `class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

class BinarySearchTree {
  constructor() {
    this.root = null;
  }
  
  insert(value) {
    const newNode = new Node(value);
    
    if (this.root === null) {
      this.root = newNode;
      return this;
    }
    
    let current = this.root;
    
    while (true) {
      if (value === current.value) return undefined;
      
      if (value < current.value) {
        if (current.left === null) {
          current.left = newNode;
          return this;
        }
        current = current.left;
      } else {
        if (current.right === null) {
          current.right = newNode;
          return this;
        }
        current = current.right;
      }
    }
  }
  
  find(value) {
    if (this.root === null) return false;
    
    let current = this.root;
    let found = false;
    
    while (current && !found) {
      if (value < current.value) {
        current = current.left;
      } else if (value > current.value) {
        current = current.right;
      } else {
        found = true;
      }
    }
    
    if (!found) return false;
    return current;
  }
}`,

    `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
        
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    
    while i < len(left) and j < len(right):
        if left[i] < right[j]:
            result.append(left[i])
            i += 1
        else:
            result.append(right[j])
            j += 1
    
    result.extend(left[i:])
    result.extend(right[j:])
    return result

# 测试归并排序
unsorted_list = [38, 27, 43, 3, 9, 82, 10]
sorted_list = merge_sort(unsorted_list)
print(sorted_list)  # 输出: [3, 9, 10, 27, 38, 43, 82]`,

    `#include <iostream>
#include <vector>
#include <algorithm>

template <typename T>
class MaxHeap {
private:
    std::vector<T> heap;
    
    void heapifyUp(int index) {
        int parent = (index - 1) / 2;
        if (index > 0 && heap[index] > heap[parent]) {
            std::swap(heap[index], heap[parent]);
            heapifyUp(parent);
        }
    }
    
    void heapifyDown(int index) {
        int largest = index;
        int left = 2 * index + 1;
        int right = 2 * index + 2;
        
        if (left < heap.size() && heap[left] > heap[largest]) {
            largest = left;
        }
        
        if (right < heap.size() && heap[right] > heap[largest]) {
            largest = right;
        }
        
        if (largest != index) {
            std::swap(heap[index], heap[largest]);
            heapifyDown(largest);
        }
    }
    
public:
    void insert(T value) {
        heap.push_back(value);
        heapifyUp(heap.size() - 1);
    }
    
    T extractMax() {
        if (heap.empty()) {
            throw std::out_of_range("Heap is empty");
        }
        
        T max = heap[0];
        heap[0] = heap.back();
        heap.pop_back();
        
        if (!heap.empty()) {
            heapifyDown(0);
        }
        
        return max;
    }
    
    bool isEmpty() const {
        return heap.empty();
    }
    
    size_t size() const {
        return heap.size();
    }
};`
  ]
}

export default function TypingSpeedTest() {
  // 状态
  const [testMode, setTestMode] = useState<TestMode>('time')
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium')
  const [timeLimit, setTimeLimit] = useState(60) // 默认60秒
  const [wordCount, setWordCount] = useState(50) // 默认50个词
  const [customText, setCustomText] = useState('')
  const [isTestActive, setIsTestActive] = useState(false)
  const [isTestComplete, setIsTestComplete] = useState(false)
  const [currentText, setCurrentText] = useState('')
  const [typedText, setTypedText] = useState('')
  const [timer, setTimer] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [results, setResults] = useState<TestResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [highlightErrors, setHighlightErrors] = useState(true)

  const inputRef = useRef<HTMLTextAreaElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const keyPressAudioRef = useRef<HTMLAudioElement | null>(null)
  const errorAudioRef = useRef<HTMLAudioElement | null>(null)
  const completeAudioRef = useRef<HTMLAudioElement | null>(null)

  // 从本地存储加载结果
  useEffect(() => {
    const savedResults = localStorage.getItem(STORAGE_KEY)
    if (savedResults) {
      try {
        setResults(JSON.parse(savedResults))
      } catch (error) {
        console.error('Failed to parse saved results:', error)
      }
    }

    // 创建音频元素
    keyPressAudioRef.current = new Audio('/sounds/keypress.mp3')
    errorAudioRef.current = new Audio('/sounds/error.mp3')
    completeAudioRef.current = new Audio('/sounds/complete.mp3')

    // 预加载音频
    keyPressAudioRef.current.preload = 'auto'
    errorAudioRef.current.preload = 'auto'
    completeAudioRef.current.preload = 'auto'

    // 设置音量
    if (keyPressAudioRef.current) keyPressAudioRef.current.volume = 0.3
    if (errorAudioRef.current) errorAudioRef.current.volume = 0.3
    if (completeAudioRef.current) completeAudioRef.current.volume = 0.5

    return () => {
      // 清理定时器
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // 保存结果到本地存储
  useEffect(() => {
    if (results.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(results))
    }
  }, [results])

  // 获取随机文本
  const getRandomText = useCallback(() => {
    const texts = sampleTexts[difficulty]
    return texts[Math.floor(Math.random() * texts.length)]
  }, [difficulty])

  // 开始测试
  const startTest = useCallback(() => {
    // 清理之前的定时器
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    let text = ''

    if (testMode === 'custom') {
      if (!customText.trim()) {
        alert('请输入自定义文本')
        return
      }
      text = customText
    } else {
      text = getRandomText()

      // 如果是单词数模式，可能需要截断文本
      if (testMode === 'words') {
        // 简单估算：假设平均每个词5个字符
        const estimatedChars = wordCount * 5
        if (text.length > estimatedChars) {
          // 找到最接近目标字符数的完整词结束位置
          let endPos = estimatedChars
          while (endPos < text.length && text[endPos] !== ' ' && text[endPos] !== '\n') {
            endPos++
          }
          text = text.substring(0, endPos)
        }
      }
    }

    setCurrentText(text)
    setTypedText('')
    setTimer(testMode === 'time' ? timeLimit : 0)
    setStartTime(Date.now())
    setIsTestActive(true)
    setIsTestComplete(false)

    // 设置定时器
    if (testMode === 'time') {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            completeTest()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }

    // 聚焦输入框
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus()
      }
    }, 100)
  }, [testMode, difficulty, timeLimit, wordCount, customText, getRandomText])

  // 完成测试
  const completeTest = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsTestActive(false)
    setIsTestComplete(true)

    // 播放完成音效
    if (soundEnabled && completeAudioRef.current) {
      completeAudioRef.current.play().catch(e => console.error('Error playing audio:', e))
    }

    // 计算结果
    const endTime = Date.now()
    const elapsedTimeInMinutes = (endTime - startTime) / 60000 // 转换为分钟

    // 计算正确和错误的字符数
    let correctChars = 0
    let incorrectChars = 0

    for (let i = 0; i < Math.min(typedText.length, currentText.length); i++) {
      if (typedText[i] === currentText[i]) {
        correctChars++
      } else {
        incorrectChars++
      }
    }

    // 如果输入的文本比原文短，剩余的字符算作错误
    if (typedText.length < currentText.length) {
      incorrectChars += currentText.length - typedText.length
    }

    // 如果输入的文本比原文长，多余的字符算作错误
    if (typedText.length > currentText.length) {
      incorrectChars += typedText.length - currentText.length
    }

    const totalChars = correctChars + incorrectChars
    const accuracy = totalChars > 0 ? (correctChars / totalChars) * 100 : 0

    // 计算WPM (Words Per Minute)
    // 一个"词"通常定义为5个字符
    const wpm = Math.round(correctChars / 5 / elapsedTimeInMinutes)

    // 保存结果
    const newResult: TestResult = {
      id: Date.now().toString(),
      date: Date.now(),
      mode: testMode,
      difficulty,
      duration: testMode === 'time' ? timeLimit : wordCount,
      wpm,
      accuracy,
      correctChars,
      incorrectChars,
      totalChars
    }

    setResults(prev => [newResult, ...prev])
    setShowResults(true)
  }, [currentText, typedText, startTime, testMode, timeLimit, wordCount, difficulty, soundEnabled])

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newTypedText = e.target.value
    setTypedText(newTypedText)

    // 播放按键音效
    if (soundEnabled && keyPressAudioRef.current) {
      // 克隆音频节点以允许重叠播放
      const audioClone = keyPressAudioRef.current.cloneNode() as HTMLAudioElement
      audioClone.volume = 0.1
      audioClone.play().catch(e => console.error('Error playing audio:', e))
    }

    // 检查是否有错误
    const lastCharIndex = newTypedText.length - 1
    if (lastCharIndex >= 0 &&
      lastCharIndex < currentText.length &&
      newTypedText[lastCharIndex] !== currentText[lastCharIndex]) {
      // 播放错误音效
      if (soundEnabled && errorAudioRef.current) {
        errorAudioRef.current.currentTime = 0
        errorAudioRef.current.play().catch(e => console.error('Error playing audio:', e))
      }
    }

    // 如果是单词数模式，检查是否完成
    if (testMode === 'words' || testMode === 'custom') {
      // 如果输入的文本长度等于或超过原文，完成测试
      if (newTypedText.length >= currentText.length) {
        completeTest()
      }
    }
  }

  // 重置测试
  const resetTest = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setIsTestActive(false)
    setIsTestComplete(false)
    setTypedText('')
    setTimer(testMode === 'time' ? timeLimit : 0)
    setShowResults(false)
  }

  // 清除历史记录
  const clearHistory = () => {
    if (confirm('确定要清除所有历史记录吗？此操作不可撤销。')) {
      setResults([])
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 格式化日期
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  // 渲染设置
  const renderSettings = () => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium">设置</h3>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
            返回
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="sound-enabled">按键音效</Label>
            <Switch
              id="sound-enabled"
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="highlight-errors">高亮显示错误</Label>
            <Switch
              id="highlight-errors"
              checked={highlightErrors}
              onCheckedChange={setHighlightErrors}
            />
          </div>

          <div className="pt-4">
            <Button variant="destructive" size="sm" onClick={clearHistory}>
              <Trash2 className="mr-2 h-4 w-4" />
              清除历史记录
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // 渲染打字区域
  const renderTypingArea = () => {
    if (!isTestActive && !isTestComplete) {
      return (
        <div className="text-center py-12">
          <Keyboard className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-medium mb-2">准备好开始测试了吗？</h3>
          <p className="text-muted-foreground mb-6">选择测试模式和难度，然后点击开始按钮</p>
          <Button onClick={startTest} size="lg">
            <Play className="mr-2 h-4 w-4" />
            开始测试
          </Button>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">
            {testMode === 'time' ? (
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                剩余时间: {formatTime(timer)}
              </div>
            ) : (
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                已用时间: {formatTime(timer)}
              </div>
            )}
          </div>

          <Button variant="outline" size="sm" onClick={resetTest}>
            <RefreshCw className="mr-1 h-4 w-4" />
            重新开始
          </Button>
        </div>

        <div className={`p-4 rounded-md bg-muted relative ${isTestComplete ? 'opacity-50' : ''}`}>
          <div className="text-lg leading-relaxed whitespace-pre-wrap">
            {currentText.split('').map((char, index) => {
              let className = ''

              if (index < typedText.length) {
                if (typedText[index] === char) {
                  className = 'text-green-600 dark:text-green-400'
                } else if (highlightErrors) {
                  className = 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                }
              }

              return (
                <span key={index} className={className}>
                  {char}
                </span>
              )
            })}
          </div>

          {isTestComplete && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
              <Button onClick={() => setShowResults(true)} size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                查看结果
              </Button>
            </div>
          )}
        </div>

        <Textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          placeholder="开始输入..."
          className="min-h-[120px]"
          disabled={isTestComplete}
        />
      </div>
    )
  }

  // 渲染测试结果
  const renderTestResults = () => {
    if (!isTestComplete || !showResults || results.length === 0) return null

    const latestResult = results[0]

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-medium">测试结果</h3>
          <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
            返回
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">打字速度</div>
              <div className="text-4xl font-bold">{latestResult.wpm}</div>
              <div className="text-xs text-muted-foreground mt-1">WPM (每分钟词数)</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">准确率</div>
              <div className="text-4xl font-bold">{latestResult.accuracy.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                正确: {latestResult.correctChars} / 错误: {latestResult.incorrectChars}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-sm text-muted-foreground mb-1">测试模式</div>
              <div className="text-xl font-bold">
                {latestResult.mode === 'time' ? `限时 ${latestResult.duration} 秒` :
                  latestResult.mode === 'words' ? `${latestResult.duration} 个词` : '自定义文本'}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                难度: {
                  latestResult.difficulty === 'easy' ? '简单' :
                    latestResult.difficulty === 'medium' ? '中等' :
                      latestResult.difficulty === 'hard' ? '困难' : '代码'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="border rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-2">日期</th>
                <th className="text-left p-2">模式</th>
                <th className="text-left p-2">难度</th>
                <th className="text-left p-2">WPM</th>
                <th className="text-left p-2">准确率</th>
              </tr>
            </thead>
            <tbody>
              {results.slice(0, 10).map((result) => (
                <tr key={result.id} className="border-t">
                  <td className="p-2">{formatDate(result.date)}</td>
                  <td className="p-2">
                    {result.mode === 'time' ? `限时 ${result.duration} 秒` :
                      result.mode === 'words' ? `${result.duration} 个词` : '自定义文本'}
                  </td>
                  <td className="p-2">
                    {result.difficulty === 'easy' ? '简单' :
                      result.difficulty === 'medium' ? '中等' :
                        result.difficulty === 'hard' ? '困难' : '代码'}
                  </td>
                  <td className="p-2 font-medium">{result.wpm}</td>
                  <td className="p-2">{result.accuracy.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">打字速度测试</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardContent className="pt-6">
              <Tabs defaultValue="time" value={testMode} onValueChange={(value) => setTestMode(value as TestMode)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="time" disabled={isTestActive}>限时模式</TabsTrigger>
                  <TabsTrigger value="words" disabled={isTestActive}>单词数模式</TabsTrigger>
                  <TabsTrigger value="custom" disabled={isTestActive}>自定义文本</TabsTrigger>
                </TabsList>
                <TabsContent value="time" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>测试时间 ({timeLimit} 秒)</Label>
                      <span className="text-sm text-muted-foreground">{timeLimit} 秒</span>
                    </div>
                    <Slider
                      value={[timeLimit]}
                      min={15}
                      max={300}
                      step={15}
                      onValueChange={(value) => setTimeLimit(value[0])}
                      disabled={isTestActive}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="words" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>单词数量 ({wordCount} 词)</Label>
                      <span className="text-sm text-muted-foreground">{wordCount} 词</span>
                    </div>
                    <Slider
                      value={[wordCount]}
                      min={10}
                      max={200}
                      step={10}
                      onValueChange={(value) => setWordCount(value[0])}
                      disabled={isTestActive}
                    />
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-text">自定义文本</Label>
                    <Textarea
                      id="custom-text"
                      placeholder="输入你想要练习的文本..."
                      value={customText}
                      onChange={(e) => setCustomText(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isTestActive}
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Label htmlFor="difficulty">难度级别:</Label>
                    <Select
                      value={difficulty}
                      onValueChange={(value) => setDifficulty(value as DifficultyLevel)}
                      disabled={isTestActive || testMode === 'custom'}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="选择难度" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">简单</SelectItem>
                        <SelectItem value="medium">中等</SelectItem>
                        <SelectItem value="hard">困难</SelectItem>
                        <SelectItem value="code">代码</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSettings(!showSettings)}
                      disabled={isTestActive}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              {showSettings ? renderSettings() :
                showResults ? renderTestResults() :
                  renderTypingArea()}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-medium">历史记录</h3>
                {results.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    清除
                  </Button>
                )}
              </div>

              {results.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="mx-auto h-8 w-8 mb-2" />
                  <p>暂无历史记录</p>
                  <p className="text-sm">完成测试后将显示在这里</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {results.slice(0, 5).map((result) => (
                    <div key={result.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline">
                          {result.difficulty === 'easy' ? '简单' :
                            result.difficulty === 'medium' ? '中等' :
                              result.difficulty === 'hard' ? '困难' : '代码'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(result.date)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">{result.wpm} WPM</div>
                          <div className="text-xs text-muted-foreground">
                            准确率: {result.accuracy.toFixed(1)}%
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {result.mode === 'time' ? (result.duration + '秒') :
                              result.mode === 'words' ? (result.duration + '词') : '自定义'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.correctChars}/{result.totalChars} 字符
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {results.length > 5 && (
                    <div className="text-center text-sm text-muted-foreground pt-2">
                      显示最近 5 条记录 (共 {results.length} 条)
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="pt-6">
              <h3 className="text-xl font-medium mb-4">打字技巧</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">正确的手指位置</h4>
                  <p className="text-sm text-muted-foreground">
                    将手指放在键盘的"家庭行"上 (ASDF JKL;)，这是提高打字速度的基础。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">不要看键盘</h4>
                  <p className="text-sm text-muted-foreground">
                    尝试不看键盘打字，这会帮助你建立肌肉记忆，提高打字速度。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">定期练习</h4>
                  <p className="text-sm text-muted-foreground">
                    每天练习10-15分钟比一周练习一次几小时更有效。
                  </p>
                </div>

                <div>
                  <h4 className="font-medium">关注准确性</h4>
                  <p className="text-sm text-muted-foreground">
                    先追求准确，再追求速度。错误会降低你的整体效率。
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
