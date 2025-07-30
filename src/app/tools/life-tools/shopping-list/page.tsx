'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Trash2, ShoppingCart, Check, X, Save, Download, Upload, Share2 } from 'lucide-react'

// 购物项类型
interface ShoppingItem {
    id: string
    name: string
    quantity: number
    category: string
    completed: boolean
    price?: number
}

// 购物清单类型
interface ShoppingList {
    id: string
    name: string
    items: ShoppingItem[]
    createdAt: string
    updatedAt: string
}

export default function ShoppingListPage() {
    // 当前清单
    const [currentList, setCurrentList] = useState<ShoppingList>({
        id: 'default',
        name: '我的购物清单',
        items: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    })

    // 保存的清单
    const [savedLists, setSavedLists] = useState<ShoppingList[]>([])

    // 新项目
    const [newItemName, setNewItemName] = useState('')
    const [newItemQuantity, setNewItemQuantity] = useState(1)
    const [newItemCategory, setNewItemCategory] = useState('食品')
    const [newItemPrice, setNewItemPrice] = useState<string>('')

    // 编辑清单名称
    const [isEditingName, setIsEditingName] = useState(false)
    const [editedName, setEditedName] = useState(currentList.name)

    // 过滤和排序
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
    const [sortBy, setSortBy] = useState<'category' | 'name' | 'added'>('added')

    const { toast } = useToast()

    // 从本地存储加载数据
    useEffect(() => {
        const savedListsData = localStorage.getItem('shopping-lists')
        if (savedListsData) {
            try {
                const parsed = JSON.parse(savedListsData)
                setSavedLists(parsed)

                // 加载最近的清单
                const lastListId = localStorage.getItem('last-shopping-list')
                if (lastListId) {
                    const lastList = parsed.find((list: ShoppingList) => list.id === lastListId)
                    if (lastList) {
                        setCurrentList(lastList)
                        setEditedName(lastList.name)
                    }
                }
            } catch (e) {
                console.error('无法解析保存的购物清单', e)
            }
        }
    }, [])

    // 保存到本地存储
    useEffect(() => {
        if (savedLists.length > 0) {
            localStorage.setItem('shopping-lists', JSON.stringify(savedLists))
        }

        // 保存当前清单ID
        localStorage.setItem('last-shopping-list', currentList.id)
    }, [savedLists, currentList.id])

    // 添加项目
    const addItem = () => {
        if (!newItemName.trim()) {
            toast({
                title: '请输入商品名称',
                description: '商品名称不能为空',
                variant: 'destructive'
            })
            return
        }

        const newItem: ShoppingItem = {
            id: Date.now().toString(),
            name: newItemName.trim(),
            quantity: newItemQuantity,
            category: newItemCategory,
            completed: false,
            price: newItemPrice ? parseFloat(newItemPrice) : undefined
        }

        const updatedList = {
            ...currentList,
            items: [...currentList.items, newItem],
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)

        // 重置表单
        setNewItemName('')
        setNewItemQuantity(1)
        setNewItemPrice('')

        toast({
            title: '已添加商品',
            description: `${newItem.name} 已添加到购物清单`
        })
    }

    // 删除项目
    const removeItem = (id: string) => {
        const updatedList = {
            ...currentList,
            items: currentList.items.filter(item => item.id !== id),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)

        toast({
            title: '已删除商品',
            description: '商品已从购物清单中删除'
        })
    }

    // 切换完成状态
    const toggleItemCompleted = (id: string) => {
        const updatedList = {
            ...currentList,
            items: currentList.items.map(item =>
                item.id === id ? { ...item, completed: !item.completed } : item
            ),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)
    }

    // 更新项目数量
    const updateItemQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return

        const updatedList = {
            ...currentList,
            items: currentList.items.map(item =>
                item.id === id ? { ...item, quantity } : item
            ),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)
    }

    // 更新保存的清单
    const updateSavedList = (updatedList: ShoppingList) => {
        const listExists = savedLists.some(list => list.id === updatedList.id)

        if (listExists) {
            setSavedLists(savedLists.map(list =>
                list.id === updatedList.id ? updatedList : list
            ))
        } else {
            setSavedLists([...savedLists, updatedList])
        }
    }

    // 创建新清单
    const createNewList = () => {
        const newList: ShoppingList = {
            id: Date.now().toString(),
            name: '新购物清单',
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(newList)
        setSavedLists([...savedLists, newList])
        setEditedName(newList.name)
        setIsEditingName(true)

        toast({
            title: '已创建新清单',
            description: '开始添加商品到您的新购物清单'
        })
    }

    // 切换到保存的清单
    const switchToList = (listId: string) => {
        const list = savedLists.find(list => list.id === listId)
        if (list) {
            setCurrentList(list)
            setEditedName(list.name)
        }
    }

    // 删除清单
    const deleteList = (listId: string) => {
        const updatedLists = savedLists.filter(list => list.id !== listId)
        setSavedLists(updatedLists)

        // 如果删除的是当前清单，切换到另一个清单或创建新的
        if (listId === currentList.id) {
            if (updatedLists.length > 0) {
                setCurrentList(updatedLists[0])
                setEditedName(updatedLists[0].name)
            } else {
                createNewList()
            }
        }

        toast({
            title: '已删除清单',
            description: '购物清单已被删除'
        })
    }

    // 保存清单名称
    const saveListName = () => {
        if (!editedName.trim()) {
            toast({
                title: '清单名称不能为空',
                description: '请输入有效的清单名称',
                variant: 'destructive'
            })
            return
        }

        const updatedList = {
            ...currentList,
            name: editedName.trim(),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)
        setIsEditingName(false)

        toast({
            title: '已更新清单名称',
            description: `清单名称已更改为"${editedName.trim()}"`
        })
    }

    // 清除已完成项目
    const clearCompletedItems = () => {
        const updatedList = {
            ...currentList,
            items: currentList.items.filter(item => !item.completed),
            updatedAt: new Date().toISOString()
        }

        setCurrentList(updatedList)
        updateSavedList(updatedList)

        toast({
            title: '已清除完成项目',
            description: '所有已完成的商品已从清单中移除'
        })
    }

    // 导出清单
    const exportList = () => {
        const dataStr = JSON.stringify(currentList)
        const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`

        const exportFileDefaultName = `${currentList.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`

        const linkElement = document.createElement('a')
        linkElement.setAttribute('href', dataUri)
        linkElement.setAttribute('download', exportFileDefaultName)
        linkElement.click()

        toast({
            title: '已导出清单',
            description: '购物清单已导出为JSON文件'
        })
    }

    // 导入清单
    const importList = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (e) => {
            try {
                const importedList = JSON.parse(e.target?.result as string) as ShoppingList

                // 验证导入的数据
                if (!importedList.name || !Array.isArray(importedList.items)) {
                    throw new Error('无效的购物清单格式')
                }

                // 生成新ID以避免冲突
                const newList = {
                    ...importedList,
                    id: Date.now().toString(),
                    updatedAt: new Date().toISOString()
                }

                setCurrentList(newList)
                setSavedLists([...savedLists, newList])
                setEditedName(newList.name)

                toast({
                    title: '已导入清单',
                    description: `"${newList.name}" 已成功导入`
                })
            } catch (error) {
                toast({
                    title: '导入失败',
                    description: '无法导入购物清单，请检查文件格式',
                    variant: 'destructive'
                })
            }
        }
        reader.readAsText(file)

        // 重置文件输入
        event.target.value = ''
    }

    // 过滤项目
    const filteredItems = currentList.items.filter(item => {
        if (filter === 'active') return !item.completed
        if (filter === 'completed') return item.completed
        return true
    })

    // 排序项目
    const sortedItems = [...filteredItems].sort((a, b) => {
        if (sortBy === 'category') return a.category.localeCompare(b.category)
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0 // 默认按添加顺序
    })

    // 计算统计信息
    const totalItems = currentList.items.length
    const completedItems = currentList.items.filter(item => item.completed).length
    const totalPrice = currentList.items
        .filter(item => item.price !== undefined)
        .reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0)

    // 分类
    const categories = ['食品', '日用品', '电子产品', '服装', '其他']

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                    <ShoppingCart className="h-8 w-8" />
                    {isEditingName ? (
                        <div className="flex items-center space-x-2">
                            <Input
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-2xl font-bold h-auto py-1"
                                autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveListName}>
                                <Save className="h-4 w-4" />
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                    setIsEditingName(false)
                                    setEditedName(currentList.name)
                                }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ) : (
                        <h1
                            className="text-3xl font-bold cursor-pointer hover:underline"
                            onClick={() => setIsEditingName(true)}
                        >
                            {currentList.name}
                        </h1>
                    )}
                </div>

                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={createNewList}>
                        <Plus className="h-4 w-4 mr-1" />
                        新建清单
                    </Button>

                    <Button variant="outline" size="sm" onClick={exportList}>
                        <Download className="h-4 w-4 mr-1" />
                        导出
                    </Button>

                    <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => document.getElementById('import-file')?.click()}>
                            <Upload className="h-4 w-4 mr-1" />
                            导入
                        </Button>
                        <input
                            id="import-file"
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={importList}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <div className="space-y-4">
                                <div className="flex items-end space-x-2">
                                    <div className="flex-1">
                                        <Label htmlFor="item-name" className="mb-2 block">商品名称</Label>
                                        <Input
                                            id="item-name"
                                            placeholder="输入商品名称"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                                        />
                                    </div>

                                    <div className="w-20">
                                        <Label htmlFor="item-quantity" className="mb-2 block">数量</Label>
                                        <Input
                                            id="item-quantity"
                                            type="number"
                                            min="1"
                                            value={newItemQuantity}
                                            onChange={(e) => setNewItemQuantity(parseInt(e.target.value) || 1)}
                                        />
                                    </div>

                                    <div className="w-24">
                                        <Label htmlFor="item-price" className="mb-2 block">单价</Label>
                                        <Input
                                            id="item-price"
                                            placeholder="选填"
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                        />
                                    </div>

                                    <div className="w-28">
                                        <Label htmlFor="item-category" className="mb-2 block">分类</Label>
                                        <select
                                            id="item-category"
                                            className="w-full h-10 px-3 rounded-md border border-input bg-background"
                                            value={newItemCategory}
                                            onChange={(e) => setNewItemCategory(e.target.value)}
                                        >
                                            {categories.map(category => (
                                                <option key={category} value={category}>{category}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button onClick={addItem}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        添加
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <div className="flex items-center space-x-4">
                                    <div>
                                        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
                                            <TabsList>
                                                <TabsTrigger value="all">全部</TabsTrigger>
                                                <TabsTrigger value="active">未购买</TabsTrigger>
                                                <TabsTrigger value="completed">已购买</TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </div>

                                    <select
                                        className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value as any)}
                                    >
                                        <option value="added">按添加顺序</option>
                                        <option value="category">按分类</option>
                                        <option value="name">按名称</option>
                                    </select>
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={clearCompletedItems}
                                    disabled={completedItems === 0}
                                >
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    清除已购买
                                </Button>
                            </div>

                            {sortedItems.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground">
                                    {filter === 'all'
                                        ? '购物清单为空，请添加商品'
                                        : filter === 'active'
                                            ? '没有未购买的商品'
                                            : '没有已购买的商品'}
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {sortedItems.map(item => (
                                        <div
                                            key={item.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${item.completed ? 'bg-muted/50' : ''
                                                }`}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <Checkbox
                                                    checked={item.completed}
                                                    onCheckedChange={() => toggleItemCompleted(item.id)}
                                                    id={`item-${item.id}`}
                                                />
                                                <div>
                                                    <Label
                                                        htmlFor={`item-${item.id}`}
                                                        className={`font-medium ${item.completed ? 'line-through text-muted-foreground' : ''}`}
                                                    >
                                                        {item.name}
                                                    </Label>
                                                    <div className="text-xs text-muted-foreground flex space-x-2">
                                                        <span>{item.category}</span>
                                                        {item.price && (
                                                            <span>¥{item.price.toFixed(2)} × {item.quantity} = ¥{(item.price * item.quantity).toFixed(2)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center space-x-2">
                                                <div className="flex items-center space-x-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        -
                                                    </Button>
                                                    <span className="w-6 text-center">{item.quantity}</span>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0"
                                                        onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </Button>
                                                </div>

                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive"
                                                    onClick={() => removeItem(item.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">统计信息</h2>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span>总商品数</span>
                                    <span className="font-medium">{totalItems}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>已购买</span>
                                    <span className="font-medium">{completedItems} / {totalItems}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span>完成度</span>
                                    <span className="font-medium">
                                        {totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0}%
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex justify-between">
                                    <span>总价格</span>
                                    <span className="font-medium">¥{totalPrice.toFixed(2)}</span>
                                </div>

                                <div className="w-full bg-muted rounded-full h-2.5">
                                    <div
                                        className="bg-primary h-2.5 rounded-full"
                                        style={{ width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="mb-6">
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">我的清单</h2>

                            {savedLists.length === 0 ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    没有保存的购物清单
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {savedLists.map(list => (
                                        <div
                                            key={list.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border ${list.id === currentList.id ? 'border-primary bg-primary/5' : ''
                                                }`}
                                        >
                                            <div
                                                className="flex-1 cursor-pointer"
                                                onClick={() => switchToList(list.id)}
                                            >
                                                <div className="font-medium">{list.name}</div>
                                                <div className="text-xs text-muted-foreground">
                                                    {list.items.length} 个商品 ·
                                                    {new Date(list.updatedAt).toLocaleDateString()}
                                                </div>
                                            </div>

                                            {list.id !== currentList.id && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 text-destructive"
                                                    onClick={() => deleteList(list.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="pt-6">
                            <h2 className="text-xl font-semibold mb-4">使用说明</h2>

                            <ul className="list-disc pl-5 space-y-2 text-sm">
                                <li>添加商品：输入名称、数量、价格（可选）和分类</li>
                                <li>勾选商品表示已购买</li>
                                <li>点击清单名称可以编辑</li>
                                <li>可以创建多个购物清单</li>
                                <li>支持导入/导出清单</li>
                                <li>数据保存在本地，不会丢失</li>
                            </ul>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}