'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import {
    Plus,
    Save,
    Trash2,
    Edit,
    RotateCcw,
    Check,
    X,
    Folder,
    FolderPlus,
    RefreshCw,
    Download,
    Upload,
    AlertCircle,
    BookOpen,
    Shuffle
} from 'lucide-react'

// 卡片类型
interface Flashcard {
    id: string
    front: string
    back: string
    lastReviewed: number | null
    reviewCount: number
    mastered: boolean
}

// 卡片集类型
interface FlashcardDeck {
    id: string
    name: string
    description: string
    cards: Flashcard[]
    createdAt: number
    lastModified: number
}

// 本地存储键
const STORAGE_KEY = 'flashcard-decks'

export default function FlashcardsPage() {
    // 状态
    const [decks, setDecks] = useState<FlashcardDeck[]>([])
    const [activeDeckId, setActiveDeckId] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState<'browse' | 'study' | 'edit'>('browse')
    const [newDeckName, setNewDeckName] = useState('')
    const [newDeckDescription, setNewDeckDescription] = useState('')
    const [isCreatingDeck, setIsCreatingDeck] = useState(false)
    const [isEditingDeck, setIsEditingDeck] = useState(false)
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null)
    const [newCardFront, setNewCardFront] = useState('')
    const [newCardBack, setNewCardBack] = useState('')
    const [isCreatingCard, setIsCreatingCard] = useState(false)
    const [isEditingCard, setIsEditingCard] = useState(false)
    const [editingCardId, setEditingCardId] = useState<string | null>(null)
    const [studyCards, setStudyCards] = useState<Flashcard[]>([])
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [isFlipped, setIsFlipped] = useState(false)
    const [studyMode, setStudyMode] = useState<'sequential' | 'random'>('sequential')

    const { toast } = useToast()

    // 获取当前选中的卡片集
    const activeDeck = decks.find(deck => deck.id === activeDeckId) || null

    // 获取当前学习的卡片
    const currentStudyCard = studyCards[currentCardIndex] || null

    // 从本地存储加载卡片集
    useEffect(() => {
        const savedDecks = localStorage.getItem(STORAGE_KEY)
        if (savedDecks) {
            try {
                const parsedDecks = JSON.parse(savedDecks)
                setDecks(parsedDecks)

                // 如果有卡片集，默认选中第一个
                if (parsedDecks.length > 0 && !activeDeckId) {
                    setActiveDeckId(parsedDecks[0].id)
                }
            } catch (error) {
                console.error('Failed to parse saved decks:', error)
            }
        }
    }, [])

    // 保存卡片集到本地存储
    useEffect(() => {
        if (decks.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(decks))
        }
    }, [decks])

    // 准备学习模式的卡片
    useEffect(() => {
        if (activeDeck && activeTab === 'study') {
            let cardsToStudy = [...activeDeck.cards]

            if (studyMode === 'random') {
                // 随机排序
                cardsToStudy = shuffleArray(cardsToStudy)
            } else {
                // 按最后复习时间排序，未复习的排在前面
                cardsToStudy.sort((a, b) => {
                    if (a.lastReviewed === null) return -1
                    if (b.lastReviewed === null) return 1
                    return a.lastReviewed - b.lastReviewed
                })
            }

            setStudyCards(cardsToStudy)
            setCurrentCardIndex(0)
            setIsFlipped(false)
        }
    }, [activeDeck, activeTab, studyMode])

    // 生成唯一ID
    const generateId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substring(2)
    }

    // 随机排序数组
    const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array]
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]]
        }
        return newArray
    }

    // 创建新卡片集
    const createDeck = () => {
        if (!newDeckName.trim()) {
            toast({
                title: '请输入卡片集名称',
                variant: 'destructive'
            })
            return
        }

        const newDeck: FlashcardDeck = {
            id: generateId(),
            name: newDeckName,
            description: newDeckDescription,
            cards: [],
            createdAt: Date.now(),
            lastModified: Date.now()
        }

        setDecks([...decks, newDeck])
        setActiveDeckId(newDeck.id)
        setActiveTab('edit')
        setIsCreatingDeck(false)
        setNewDeckName('')
        setNewDeckDescription('')

        toast({
            title: '卡片集创建成功',
            description: `"${newDeck.name}" 已创建`
        })
    }

    // 更新卡片集
    const updateDeck = () => {
        if (!editingDeckId || !newDeckName.trim()) return

        setDecks(decks.map(deck => {
            if (deck.id === editingDeckId) {
                return {
                    ...deck,
                    name: newDeckName,
                    description: newDeckDescription,
                    lastModified: Date.now()
                }
            }
            return deck
        }))

        setIsEditingDeck(false)
        setEditingDeckId(null)
        setNewDeckName('')
        setNewDeckDescription('')

        toast({
            title: '卡片集已更新'
        })
    }

    // 删除卡片集
    const deleteDeck = (deckId: string) => {
        if (confirm('确定要删除这个卡片集吗？此操作不可撤销。')) {
            const updatedDecks = decks.filter(deck => deck.id !== deckId)
            setDecks(updatedDecks)

            if (activeDeckId === deckId) {
                setActiveDeckId(updatedDecks.length > 0 ? updatedDecks[0].id : null)
            }

            toast({
                title: '卡片集已删除'
            })
        }
    }

    // 开始编辑卡片集
    const startEditingDeck = (deck: FlashcardDeck) => {
        setIsEditingDeck(true)
        setEditingDeckId(deck.id)
        setNewDeckName(deck.name)
        setNewDeckDescription(deck.description)
    }

    // 创建新卡片
    const createCard = () => {
        if (!activeDeckId) return

        if (!newCardFront.trim()) {
            toast({
                title: '请输入卡片正面内容',
                variant: 'destructive'
            })
            return
        }

        const newCard: Flashcard = {
            id: generateId(),
            front: newCardFront,
            back: newCardBack,
            lastReviewed: null,
            reviewCount: 0,
            mastered: false
        }

        setDecks(decks.map(deck => {
            if (deck.id === activeDeckId) {
                return {
                    ...deck,
                    cards: [...deck.cards, newCard],
                    lastModified: Date.now()
                }
            }
            return deck
        }))

        setIsCreatingCard(false)
        setNewCardFront('')
        setNewCardBack('')

        toast({
            title: '卡片已添加'
        })
    }

    // 更新卡片
    const updateCard = () => {
        if (!activeDeckId || !editingCardId) return

        if (!newCardFront.trim()) {
            toast({
                title: '请输入卡片正面内容',
                variant: 'destructive'
            })
            return
        }

        setDecks(decks.map(deck => {
            if (deck.id === activeDeckId) {
                return {
                    ...deck,
                    cards: deck.cards.map(card => {
                        if (card.id === editingCardId) {
                            return {
                                ...card,
                                front: newCardFront,
                                back: newCardBack
                            }
                        }
                        return card
                    }),
                    lastModified: Date.now()
                }
            }
            return deck
        }))

        setIsEditingCard(false)
        setEditingCardId(null)
        setNewCardFront('')
        setNewCardBack('')

        toast({
            title: '卡片已更新'
        })
    }

    // 删除卡片
    const deleteCard = (cardId: string) => {
        if (!activeDeckId) return

        setDecks(decks.map(deck => {
            if (deck.id === activeDeckId) {
                return {
                    ...deck,
                    cards: deck.cards.filter(card => card.id !== cardId),
                    lastModified: Date.now()
                }
            }
            return deck
        }))

        toast({
            title: '卡片已删除'
        })
    }

    // 开始编辑卡片
    const startEditingCard = (card: Flashcard) => {
        setIsEditingCard(true)
        setEditingCardId(card.id)
        setNewCardFront(card.front)
        setNewCardBack(card.back)
    }

    // 翻转卡片
    const flipCard = () => {
        setIsFlipped(!isFlipped)
    }

    // 下一张卡片
    const nextCard = (mastered: boolean = false) => {
        if (!activeDeckId || !currentStudyCard) return

        // 更新卡片学习状态
        setDecks(decks.map(deck => {
            if (deck.id === activeDeckId) {
                return {
                    ...deck,
                    cards: deck.cards.map(card => {
                        if (card.id === currentStudyCard.id) {
                            return {
                                ...card,
                                lastReviewed: Date.now(),
                                reviewCount: card.reviewCount + 1,
                                mastered: mastered || card.mastered
                            }
                        }
                        return card
                    }),
                    lastModified: Date.now()
                }
            }
            return deck
        }))

        // 如果是最后一张卡片
        if (currentCardIndex >= studyCards.length - 1) {
            toast({
                title: '学习完成',
                description: '你已完成本轮学习'
            })

            // 重新开始或返回浏览模式
            if (confirm('学习完成！是否再复习一遍？')) {
                // 重新准备学习卡片
                let cardsToStudy = [...activeDeck!.cards]
                if (studyMode === 'random') {
                    cardsToStudy = shuffleArray(cardsToStudy)
                }
                setStudyCards(cardsToStudy)
                setCurrentCardIndex(0)
            } else {
                setActiveTab('browse')
            }
        } else {
            // 下一张卡片
            setCurrentCardIndex(currentCardIndex + 1)
        }

        // 重置卡片状态
        setIsFlipped(false)
    }

    // 导出卡片集
    const exportDeck = () => {
        if (!activeDeck) return

        const dataStr = JSON.stringify(activeDeck)
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

        const exportFileDefaultName = `${activeDeck.name.replace(/\s+/g, '-').toLowerCase()}-flashcards.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()

        toast({
            title: '卡片集已导出',
            description: `已保存为 ${exportFileDefaultName}`
        })
    }

    // 导入卡片集
    const importDeck = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importedDeck = JSON.parse(e.target?.result as string) as FlashcardDeck

                // 验证导入的数据
                if (!importedDeck.name || !Array.isArray(importedDeck.cards)) {
                    throw new Error('无效的卡片集数据')
                }

                // 生成新ID避免冲突
                const newDeckId = generateId()
                const newDeck: FlashcardDeck = {
                    ...importedDeck,
                    id: newDeckId,
                    cards: importedDeck.cards.map(card => ({
                        ...card,
                        id: generateId()
                    })),
                    createdAt: Date.now(),
                    lastModified: Date.now()
                }

                setDecks([...decks, newDeck])
                setActiveDeckId(newDeckId)

                toast({
                    title: '卡片集已导入',
                    description: `已导入 "${newDeck.name}" 包含 ${newDeck.cards.length} 张卡片`
                })
            } catch (error) {
                toast({
                    title: '导入失败',
                    description: '无效的卡片集文件',
                    variant: 'destructive'
                })
            }
        }
        reader.readAsText(file)

        // 重置文件输入
        event.target.value = ''
    }

    // 格式化日期
    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleString()
    }

    // 渲染卡片集列表
    const renderDeckList = () => {
        if (decks.length === 0) {
            return (
                <div className="text-center py-12">
                    <Folder className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">没有卡片集</h3>
                    <p className="text-muted-foreground mb-4">创建一个新的卡片集开始学习</p>
                    <Button onClick={() => setIsCreatingDeck(true)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        创建卡片集
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {decks.map(deck => (
                    <Card
                        key={deck.id}
                        className={`cursor-pointer transition-colors ${activeDeckId === deck.id ? 'border-primary' : ''}`}
                        onClick={() => setActiveDeckId(deck.id)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-medium">{deck.name}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2">{deck.description}</p>
                                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                        <Badge variant="outline" className="mr-2">{deck.cards.length} 张卡片</Badge>
                                        <span>最后修改: {formatDate(deck.lastModified)}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            startEditingDeck(deck)
                                        }}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation()
                                            deleteDeck(deck.id)
                                        }}
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

    // 渲染卡片列表
    const renderCardList = () => {
        if (!activeDeck) return null

        if (activeDeck.cards.length === 0) {
            return (
                <div className="text-center py-12">
                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">没有卡片</h3>
                    <p className="text-muted-foreground mb-4">添加一些卡片到这个集合中</p>
                    <Button onClick={() => setIsCreatingCard(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加卡片
                    </Button>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {activeDeck.cards.map(card => (
                    <Card key={card.id} className="overflow-hidden">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <div className="w-full">
                                    <div className="font-medium mb-1">{card.front}</div>
                                    <div className="text-sm text-muted-foreground">{card.back}</div>

                                    <div className="flex items-center mt-2 text-xs text-muted-foreground">
                                        {card.mastered && (
                                            <Badge variant="outline" className="bg-green-50 text-green-700 mr-2">已掌握</Badge>
                                        )}
                                        {card.reviewCount > 0 && (
                                            <span>复习次数: {card.reviewCount}</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-1 ml-4">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => startEditingCard(card)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteCard(card.id)}
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

    // 渲染学习界面
    const renderStudyInterface = () => {
        if (!activeDeck) return null

        if (activeDeck.cards.length === 0) {
            return (
                <div className="text-center py-12">
                    <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">没有可学习的卡片</h3>
                    <p className="text-muted-foreground mb-4">请先添加一些卡片到这个集合中</p>
                    <Button onClick={() => setActiveTab('edit')}>
                        <Plus className="mr-2 h-4 w-4" />
                        添加卡片
                    </Button>
                </div>
            )
        }

        if (!currentStudyCard) {
            return (
                <div className="text-center py-12">
                    <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-spin" />
                    <h3 className="text-lg font-medium">准备中...</h3>
                </div>
            )
        }

        return (
            <div className="flex flex-col items-center">
                <div className="flex justify-between items-center w-full mb-4">
                    <div className="text-sm text-muted-foreground">
                        卡片 {currentCardIndex + 1} / {studyCards.length}
                    </div>

                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStudyMode(studyMode === 'sequential' ? 'random' : 'sequential')}
                        >
                            {studyMode === 'sequential' ? (
                                <>
                                    <Shuffle className="mr-2 h-4 w-4" />
                                    随机模式
                                </>
                            ) : (
                                <>
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    顺序模式
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div
                    className="w-full max-w-md h-64 perspective-1000 cursor-pointer mb-6"
                    onClick={flipCard}
                >
                    <div className={`relative w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg p-6 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-xl font-medium">{currentStudyCard.front}</div>
                                <div className="text-xs text-muted-foreground mt-4">点击卡片查看答案</div>
                            </div>
                        </div>

                        <div className="absolute w-full h-full backface-hidden bg-card border rounded-lg p-6 flex items-center justify-center rotate-y-180">
                            <div className="text-center">
                                <div className="text-xl">{currentStudyCard.back}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex space-x-4">
                    {isFlipped && (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => nextCard(false)}
                            >
                                <RotateCcw className="mr-2 h-4 w-4" />
                                再复习
                            </Button>

                            <Button
                                onClick={() => nextCard(true)}
                            >
                                <Check className="mr-2 h-4 w-4" />
                                已掌握
                            </Button>
                        </>
                    )}

                    {!isFlipped && (
                        <Button onClick={flipCard}>
                            查看答案
                        </Button>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-6">记忆卡片</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">卡片集</h2>

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsCreatingDeck(true)}
                                        disabled={isCreatingDeck}
                                    >
                                        <FolderPlus className="h-4 w-4" />
                                    </Button>

                                    <label htmlFor="import-deck">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => document.getElementById('import-deck')?.click()}
                                        >
                                            <Upload className="h-4 w-4" />
                                        </Button>
                                        <input
                                            type="file"
                                            id="import-deck"
                                            className="hidden"
                                            accept=".json"
                                            onChange={importDeck}
                                        />
                                    </label>
                                </div>
                            </div>

                            {isCreatingDeck ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="deck-name">卡片集名称</Label>
                                        <Input
                                            id="deck-name"
                                            value={newDeckName}
                                            onChange={(e) => setNewDeckName(e.target.value)}
                                            placeholder="例如：英语单词、历史事件..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="deck-description">描述（可选）</Label>
                                        <Textarea
                                            id="deck-description"
                                            value={newDeckDescription}
                                            onChange={(e) => setNewDeckDescription(e.target.value)}
                                            placeholder="简短描述这个卡片集..."
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsCreatingDeck(false)
                                                setNewDeckName('')
                                                setNewDeckDescription('')
                                            }}
                                        >
                                            取消
                                        </Button>
                                        <Button onClick={createDeck}>
                                            创建
                                        </Button>
                                    </div>
                                </div>
                            ) : isEditingDeck ? (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-deck-name">卡片集名称</Label>
                                        <Input
                                            id="edit-deck-name"
                                            value={newDeckName}
                                            onChange={(e) => setNewDeckName(e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="edit-deck-description">描述（可选）</Label>
                                        <Textarea
                                            id="edit-deck-description"
                                            value={newDeckDescription}
                                            onChange={(e) => setNewDeckDescription(e.target.value)}
                                            rows={3}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setIsEditingDeck(false)
                                                setEditingDeckId(null)
                                                setNewDeckName('')
                                                setNewDeckDescription('')
                                            }}
                                        >
                                            取消
                                        </Button>
                                        <Button onClick={updateDeck}>
                                            保存
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                renderDeckList()
                            )}
                        </CardContent>
                    </Card>

                    {activeDeck && (
                        <Card>
                            <CardContent className="pt-6">
                                <h2 className="text-xl font-semibold mb-2">{activeDeck.name}</h2>
                                <p className="text-sm text-muted-foreground mb-4">{activeDeck.description}</p>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>创建时间</span>
                                        <span>{formatDate(activeDeck.createdAt)}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span>卡片数量</span>
                                        <span>{activeDeck.cards.length}</span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span>已掌握</span>
                                        <span>{activeDeck.cards.filter(card => card.mastered).length} / {activeDeck.cards.length}</span>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                <div className="flex space-x-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={exportDeck}
                                        disabled={activeDeck.cards.length === 0}
                                    >
                                        <Download className="mr-2 h-4 w-4" />
                                        导出
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-semibold">
                                    {activeDeck ? activeDeck.name : '选择一个卡片集'}
                                </h2>

                                {activeDeck && (
                                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                                        <TabsList>
                                            <TabsTrigger value="browse">浏览</TabsTrigger>
                                            <TabsTrigger value="study">学习</TabsTrigger>
                                            <TabsTrigger value="edit">编辑</TabsTrigger>
                                        </TabsList>
                                    </Tabs>
                                )}
                            </div>

                            {!activeDeck ? (
                                <div className="text-center py-12">
                                    <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium mb-2">请选择一个卡片集</h3>
                                    <p className="text-muted-foreground mb-4">从左侧选择一个卡片集或创建新的卡片集</p>
                                </div>
                            ) : activeTab === 'browse' ? (
                                renderCardList()
                            ) : activeTab === 'study' ? (
                                renderStudyInterface()
                            ) : (
                                <div>
                                    {isCreatingCard ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="card-front">卡片正面（问题）</Label>
                                                <Textarea
                                                    id="card-front"
                                                    value={newCardFront}
                                                    onChange={(e) => setNewCardFront(e.target.value)}
                                                    placeholder="输入问题或需要记忆的内容..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="card-back">卡片背面（答案）</Label>
                                                <Textarea
                                                    id="card-back"
                                                    value={newCardBack}
                                                    onChange={(e) => setNewCardBack(e.target.value)}
                                                    placeholder="输入答案或解释..."
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsCreatingCard(false)
                                                        setNewCardFront('')
                                                        setNewCardBack('')
                                                    }}
                                                >
                                                    取消
                                                </Button>
                                                <Button onClick={createCard}>
                                                    添加卡片
                                                </Button>
                                            </div>
                                        </div>
                                    ) : isEditingCard ? (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="edit-card-front">卡片正面（问题）</Label>
                                                <Textarea
                                                    id="edit-card-front"
                                                    value={newCardFront}
                                                    onChange={(e) => setNewCardFront(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="edit-card-back">卡片背面（答案）</Label>
                                                <Textarea
                                                    id="edit-card-back"
                                                    value={newCardBack}
                                                    onChange={(e) => setNewCardBack(e.target.value)}
                                                    rows={3}
                                                />
                                            </div>

                                            <div className="flex justify-end space-x-2">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => {
                                                        setIsEditingCard(false)
                                                        setEditingCardId(null)
                                                        setNewCardFront('')
                                                        setNewCardBack('')
                                                    }}
                                                >
                                                    取消
                                                </Button>
                                                <Button onClick={updateCard}>
                                                    保存修改
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-medium">卡片管理</h3>
                                                <Button onClick={() => setIsCreatingCard(true)}>
                                                    <Plus className="mr-2 h-4 w-4" />
                                                    添加卡片
                                                </Button>
                                            </div>

                                            {renderCardList()}
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
