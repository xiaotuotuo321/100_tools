"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { motion, AnimatePresence } from "framer-motion";
import {
    Gift,
    Trash2,
    Copy,
    RotateCw,
    Save,
    List,
    FileText,
    Settings,
    RefreshCw,
    CheckCircle2,
    XCircle
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 抽奖项类型
interface DrawItem {
    id: string;
    name: string;
    weight: number;
    selected?: boolean;
}

// 抽奖结果类型
interface DrawResult {
    items: DrawItem[];
    timestamp: number;
    drawType: "name" | "number";
    count: number;
}

// 保存的抽奖配置
interface SavedDrawConfig {
    name: string;
    items: DrawItem[];
    drawType: "name" | "number";
}

export default function LuckyDraw() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"name" | "number" | "saved">("name");

    // 名单抽奖
    const [nameItems, setNameItems] = useState<DrawItem[]>([]);
    const [nameInput, setNameInput] = useState<string>("");
    const [nameDrawCount, setNameDrawCount] = useState<number>(1);
    const [nameAllowDuplicates, setNameAllowDuplicates] = useState<boolean>(false);
    const [nameUseWeights, setNameUseWeights] = useState<boolean>(false);

    // 数字抽奖
    const [numberMin, setNumberMin] = useState<number>(1);
    const [numberMax, setNumberMax] = useState<number>(100);
    const [numberDrawCount, setNumberDrawCount] = useState<number>(1);
    const [numberAllowDuplicates, setNumberAllowDuplicates] = useState<boolean>(false);

    // 通用状态
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [drawResults, setDrawResults] = useState<DrawItem[]>([]);
    const [history, setHistory] = useState<DrawResult[]>([]);
    const [savedConfigs, setSavedConfigs] = useState<SavedDrawConfig[]>([]);
    const [newConfigName, setNewConfigName] = useState<string>("");
    const [selectedConfig, setSelectedConfig] = useState<string>("");

    // 从本地存储加载保存的配置
    useEffect(() => {
        const savedConfigsJson = localStorage.getItem("lucky-draw-saved-configs");
        if (savedConfigsJson) {
            try {
                const parsed = JSON.parse(savedConfigsJson);
                setSavedConfigs(parsed);
            } catch (e) {
                console.error("无法解析保存的抽奖配置", e);
            }
        }

        const historyJson = localStorage.getItem("lucky-draw-history");
        if (historyJson) {
            try {
                const parsed = JSON.parse(historyJson);
                setHistory(parsed);
            } catch (e) {
                console.error("无法解析抽奖历史记录", e);
            }
        }
    }, []);

    // 保存配置到本地存储
    useEffect(() => {
        if (savedConfigs.length > 0) {
            localStorage.setItem("lucky-draw-saved-configs", JSON.stringify(savedConfigs));
        }
    }, [savedConfigs]);

    // 保存历史记录到本地存储
    useEffect(() => {
        if (history.length > 0) {
            localStorage.setItem("lucky-draw-history", JSON.stringify(history));
        }
    }, [history]);

    // 处理名单输入
    const handleNameInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNameInput(e.target.value);
    };

    // 解析名单
    const parseNameList = () => {
        if (!nameInput.trim()) {
            toast({
                title: "输入错误",
                description: "请输入抽奖名单",
                variant: "destructive",
            });
            return;
        }

        // 按行分割，过滤空行
        const lines = nameInput.split("\n").filter(line => line.trim() !== "");

        // 解析每一行
        const items: DrawItem[] = lines.map((line, index) => {
            // 检查是否包含权重（格式：名称,权重）
            const parts = line.split(",");
            const name = parts[0].trim();
            const weight = parts.length > 1 ? parseFloat(parts[1]) || 1 : 1;

            return {
                id: `name-${index}-${Date.now()}`,
                name,
                weight
            };
        });

        setNameItems(items);

        toast({
            title: "名单已解析",
            description: `共添加了 ${items.length} 个抽奖项`,
        });
    };

    // 清空名单
    const clearNameList = () => {
        setNameItems([]);
        setNameInput("");
    };

    // 名单抽奖
    const drawFromNames = () => {
        if (nameItems.length === 0) {
            toast({
                title: "抽奖错误",
                description: "请先添加抽奖名单",
                variant: "destructive",
            });
            return;
        }

        if (nameDrawCount <= 0 || nameDrawCount > nameItems.length) {
            toast({
                title: "抽奖错误",
                description: `抽奖数量必须在 1 到 ${nameItems.length} 之间`,
                variant: "destructive",
            });
            return;
        }

        if (!nameAllowDuplicates && nameDrawCount > nameItems.length) {
            toast({
                title: "抽奖错误",
                description: "不允许重复抽取时，抽取数量不能超过名单总数",
                variant: "destructive",
            });
            return;
        }

        setIsDrawing(true);

        // 模拟抽奖动画
        let drawInterval = 0;
        const intervalId = setInterval(() => {
            // 随机选择一个项目
            const randomIndex = Math.floor(Math.random() * nameItems.length);
            const tempResult = nameItems.map((item, index) => ({
                ...item,
                selected: index === randomIndex
            }));
            setDrawResults(tempResult);

            drawInterval++;
            if (drawInterval > 10) {
                clearInterval(intervalId);
                performNameDraw();
            }
        }, 100);
    };

    // 执行名单抽奖
    const performNameDraw = () => {
        let availableItems = [...nameItems];
        const results: DrawItem[] = [];

        for (let i = 0; i < nameDrawCount; i++) {
            if (availableItems.length === 0) break;

            let selectedItem: DrawItem;

            if (nameUseWeights) {
                // 使用权重抽奖
                const totalWeight = availableItems.reduce((sum, item) => sum + item.weight, 0);
                let random = Math.random() * totalWeight;

                for (const item of availableItems) {
                    random -= item.weight;
                    if (random <= 0) {
                        selectedItem = { ...item, selected: true };
                        break;
                    }
                }

                // 如果由于浮点数精度问题没有选中，就选最后一个
                if (!selectedItem!) {
                    selectedItem = { ...availableItems[availableItems.length - 1], selected: true };
                }
            } else {
                // 随机抽奖
                const randomIndex = Math.floor(Math.random() * availableItems.length);
                selectedItem = { ...availableItems[randomIndex], selected: true };
            }

            results.push(selectedItem!);

            // 如果不允许重复，从可用项目中移除已选项
            if (!nameAllowDuplicates) {
                availableItems = availableItems.filter(item => item.id !== selectedItem!.id);
            }
        }

        // 更新结果
        const finalResults = nameItems.map(item => {
            const found = results.find(r => r.id === item.id);
            return found ? found : { ...item, selected: false };
        });

        setDrawResults(finalResults);
        setIsDrawing(false);

        // 添加到历史记录
        const newHistoryItem: DrawResult = {
            items: results,
            timestamp: Date.now(),
            drawType: "name",
            count: results.length
        };

        setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    };

    // 数字抽奖
    const drawNumbers = () => {
        if (numberMin >= numberMax) {
            toast({
                title: "抽奖错误",
                description: "最小值必须小于最大值",
                variant: "destructive",
            });
            return;
        }

        const range = numberMax - numberMin + 1;

        if (!numberAllowDuplicates && numberDrawCount > range) {
            toast({
                title: "抽奖错误",
                description: "不允许重复抽取时，抽取数量不能超过数字范围",
                variant: "destructive",
            });
            return;
        }

        setIsDrawing(true);

        // 模拟抽奖动画
        let drawInterval = 0;
        const intervalId = setInterval(() => {
            const tempResults: DrawItem[] = [];
            for (let i = 0; i < numberDrawCount; i++) {
                const randomNum = Math.floor(Math.random() * range) + numberMin;
                tempResults.push({
                    id: `temp-${i}`,
                    name: randomNum.toString(),
                    weight: 1,
                    selected: true
                });
            }
            setDrawResults(tempResults);

            drawInterval++;
            if (drawInterval > 10) {
                clearInterval(intervalId);
                performNumberDraw();
            }
        }, 100);
    };

    // 执行数字抽奖
    const performNumberDraw = () => {
        const results: DrawItem[] = [];
        const usedNumbers = new Set<number>();

        for (let i = 0; i < numberDrawCount; i++) {
            let randomNum: number;

            // 如果不允许重复，确保生成的数字不重复
            if (!numberAllowDuplicates) {
                do {
                    randomNum = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
                } while (usedNumbers.has(randomNum));

                usedNumbers.add(randomNum);
            } else {
                randomNum = Math.floor(Math.random() * (numberMax - numberMin + 1)) + numberMin;
            }

            results.push({
                id: `number-${i}-${Date.now()}`,
                name: randomNum.toString(),
                weight: 1,
                selected: true
            });
        }

        setDrawResults(results);
        setIsDrawing(false);

        // 添加到历史记录
        const newHistoryItem: DrawResult = {
            items: results,
            timestamp: Date.now(),
            drawType: "number",
            count: results.length
        };

        setHistory(prev => [newHistoryItem, ...prev].slice(0, 10));
    };

    // 保存当前配置
    const saveCurrentConfig = () => {
        if (!newConfigName.trim()) {
            toast({
                title: "保存错误",
                description: "请输入配置名称",
                variant: "destructive",
            });
            return;
        }

        // 检查名称是否已存在
        if (savedConfigs.some(config => config.name === newConfigName.trim())) {
            toast({
                title: "保存错误",
                description: "配置名称已存在",
                variant: "destructive",
            });
            return;
        }

        if (activeTab === "name" && nameItems.length === 0) {
            toast({
                title: "保存错误",
                description: "请先添加抽奖名单",
                variant: "destructive",
            });
            return;
        }

        const newConfig: SavedDrawConfig = {
            name: newConfigName.trim(),
            items: activeTab === "name" ? [...nameItems] :
                Array.from({ length: numberMax - numberMin + 1 }, (_, i) => ({
                    id: `number-${i}-${Date.now()}`,
                    name: (numberMin + i).toString(),
                    weight: 1
                })),
            drawType: activeTab as "name" | "number"
        };

        setSavedConfigs(prev => [...prev, newConfig]);
        setNewConfigName("");

        toast({
            title: "保存成功",
            description: `抽奖配置 "${newConfig.name}" 已保存`,
        });
    };

    // 删除保存的配置
    const deleteConfig = (name: string) => {
        setSavedConfigs(prev => prev.filter(config => config.name !== name));

        if (selectedConfig === name) {
            setSelectedConfig("");
        }

        toast({
            title: "删除成功",
            description: `抽奖配置 "${name}" 已删除`,
        });
    };

    // 加载保存的配置
    const loadConfig = (name: string) => {
        const config = savedConfigs.find(c => c.name === name);
        if (!config) return;

        if (config.drawType === "name") {
            setNameItems(config.items);
            setNameInput(config.items.map(item => `${item.name},${item.weight}`).join("\n"));
            setActiveTab("name");
        } else {
            // 对于数字抽奖，找出最小值和最大值
            const numbers = config.items.map(item => parseInt(item.name));
            setNumberMin(Math.min(...numbers));
            setNumberMax(Math.max(...numbers));
            setActiveTab("number");
        }

        toast({
            title: "加载成功",
            description: `抽奖配置 "${name}" 已加载`,
        });
    };

    // 清除历史记录
    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem("lucky-draw-history");

        toast({
            title: "清除成功",
            description: "历史记录已清除",
        });
    };

    // 复制结果
    const copyResults = () => {
        const selectedItems = drawResults.filter(item => item.selected);
        if (selectedItems.length === 0) {
            toast({
                title: "复制错误",
                description: "没有可复制的结果",
                variant: "destructive",
            });
            return;
        }

        const text = selectedItems.map(item => item.name).join(", ");
        navigator.clipboard.writeText(text);

        toast({
            title: "复制成功",
            description: "抽奖结果已复制到剪贴板",
        });
    };

    // 格式化时间
    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>幸运抽奖</CardTitle>
                    <CardDescription>
                        随机抽奖工具，可以进行名单抽奖、数字抽奖，适用于各种抽奖场景。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="name">名单抽奖</TabsTrigger>
                            <TabsTrigger value="number">数字抽奖</TabsTrigger>
                            <TabsTrigger value="saved">保存的配置</TabsTrigger>
                        </TabsList>

                        {/* 名单抽奖 */}
                        <TabsContent value="name" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name-input">抽奖名单</Label>
                                        <div className="text-xs text-muted-foreground mb-1">
                                            每行一个名称，可选添加权重（格式：名称,权重）
                                        </div>
                                        <Textarea
                                            id="name-input"
                                            placeholder="张三,1&#10;李四,2&#10;王五,1"
                                            value={nameInput}
                                            onChange={handleNameInputChange}
                                            className="min-h-[200px]"
                                        />
                                    </div>

                                    <div className="flex justify-between">
                                        <Button variant="outline" onClick={parseNameList}>
                                            <FileText className="mr-2 h-4 w-4" />
                                            解析名单
                                        </Button>
                                        <Button variant="outline" onClick={clearNameList}>
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            清空名单
                                        </Button>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="name-draw-count">抽取数量</Label>
                                        <Input
                                            id="name-draw-count"
                                            type="number"
                                            min="1"
                                            max={nameItems.length || 1}
                                            value={nameDrawCount}
                                            onChange={(e) => setNameDrawCount(parseInt(e.target.value) || 1)}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="name-allow-duplicates"
                                            checked={nameAllowDuplicates}
                                            onCheckedChange={setNameAllowDuplicates}
                                        />
                                        <Label htmlFor="name-allow-duplicates">允许重复抽取</Label>
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="name-use-weights"
                                            checked={nameUseWeights}
                                            onCheckedChange={setNameUseWeights}
                                        />
                                        <Label htmlFor="name-use-weights">使用权重</Label>
                                    </div>

                                    <Button
                                        onClick={drawFromNames}
                                        disabled={isDrawing || nameItems.length === 0}
                                        className="w-full"
                                    >
                                        <Gift className="mr-2 h-4 w-4" />
                                        开始抽奖
                                    </Button>
                                </div>

                                <div>
                                    <div className="mb-4">
                                        <h3 className="text-lg font-medium mb-2">名单列表</h3>
                                        {nameItems.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground border rounded-md">
                                                <List className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>还没有添加抽奖名单</p>
                                            </div>
                                        ) : (
                                            <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                                                <div className="text-sm text-muted-foreground mb-2">
                                                    共 {nameItems.length} 个抽奖项
                                                </div>
                                                <div className="space-y-1">
                                                    {nameItems.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className={`flex justify-between items-center p-2 rounded-md ${item.selected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'
                                                                }`}
                                                        >
                                                            <span>{item.name}</span>
                                                            {nameUseWeights && (
                                                                <Badge variant="outline" className={item.selected ? 'border-primary-foreground' : ''}>
                                                                    权重: {item.weight}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {drawResults.filter(r => r.selected).length > 0 && !isDrawing && (
                                        <div className="border rounded-md p-4 bg-primary/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-lg font-medium">抽奖结果</h3>
                                                <Button variant="ghost" size="icon" onClick={copyResults}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-2">
                                                {drawResults
                                                    .filter(item => item.selected)
                                                    .map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="p-2 bg-primary text-primary-foreground rounded-md flex justify-between items-center"
                                                        >
                                                            <span className="font-medium">{item.name}</span>
                                                            {nameUseWeights && (
                                                                <Badge variant="outline" className="border-primary-foreground">
                                                                    权重: {item.weight}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <div className="text-sm text-muted-foreground">
                                    可以保存当前配置以便将来使用
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="输入配置名称"
                                        value={newConfigName}
                                        onChange={(e) => setNewConfigName(e.target.value)}
                                        className="w-48"
                                    />
                                    <Button variant="outline" onClick={saveCurrentConfig}>
                                        <Save className="mr-2 h-4 w-4" />
                                        保存配置
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* 数字抽奖 */}
                        <TabsContent value="number" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="number-min">最小值</Label>
                                            <Input
                                                id="number-min"
                                                type="number"
                                                value={numberMin}
                                                onChange={(e) => setNumberMin(parseInt(e.target.value) || 1)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="number-max">最大值</Label>
                                            <Input
                                                id="number-max"
                                                type="number"
                                                value={numberMax}
                                                onChange={(e) => setNumberMax(parseInt(e.target.value) || 100)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="number-draw-count">抽取数量</Label>
                                        <Input
                                            id="number-draw-count"
                                            type="number"
                                            min="1"
                                            max={numberAllowDuplicates ? 100 : (numberMax - numberMin + 1)}
                                            value={numberDrawCount}
                                            onChange={(e) => setNumberDrawCount(parseInt(e.target.value) || 1)}
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id="number-allow-duplicates"
                                            checked={numberAllowDuplicates}
                                            onCheckedChange={setNumberAllowDuplicates}
                                        />
                                        <Label htmlFor="number-allow-duplicates">允许重复抽取</Label>
                                    </div>

                                    <Button
                                        onClick={drawNumbers}
                                        disabled={isDrawing}
                                        className="w-full"
                                    >
                                        <Gift className="mr-2 h-4 w-4" />
                                        开始抽奖
                                    </Button>

                                    <div className="text-sm text-muted-foreground">
                                        <p>数字范围: {numberMin} - {numberMax}</p>
                                        <p>可能的组合数: {numberMax - numberMin + 1}</p>
                                    </div>
                                </div>

                                <div>
                                    {isDrawing ? (
                                        <div className="border rounded-md p-8 text-center">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="mx-auto mb-4"
                                            >
                                                <RotateCw className="h-12 w-12 text-primary/50" />
                                            </motion.div>
                                            <p className="text-lg font-medium">抽奖中...</p>
                                        </div>
                                    ) : drawResults.length > 0 ? (
                                        <div className="border rounded-md p-4 bg-primary/5">
                                            <div className="flex justify-between items-center mb-3">
                                                <h3 className="text-lg font-medium">抽奖结果</h3>
                                                <Button variant="ghost" size="icon" onClick={copyResults}>
                                                    <Copy className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                {drawResults.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        className="p-3 bg-primary text-primary-foreground rounded-md text-center"
                                                    >
                                                        <span className="text-xl font-bold">{item.name}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-muted-foreground border rounded-md">
                                            <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>点击"开始抽奖"按钮开始</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4">
                                <div className="text-sm text-muted-foreground">
                                    可以保存当前配置以便将来使用
                                </div>
                                <div className="flex space-x-2">
                                    <Input
                                        placeholder="输入配置名称"
                                        value={newConfigName}
                                        onChange={(e) => setNewConfigName(e.target.value)}
                                        className="w-48"
                                    />
                                    <Button variant="outline" onClick={saveCurrentConfig}>
                                        <Save className="mr-2 h-4 w-4" />
                                        保存配置
                                    </Button>
                                </div>
                            </div>
                        </TabsContent>

                        {/* 保存的配置 */}
                        <TabsContent value="saved" className="space-y-4">
                            {savedConfigs.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>还没有保存的抽奖配置</p>
                                    <p className="text-sm mt-2">在"名单抽奖"或"数字抽奖"标签中配置并保存</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-lg font-medium mb-2">已保存的配置</h3>
                                            <div className="border rounded-md p-4 max-h-[300px] overflow-y-auto">
                                                <div className="space-y-2">
                                                    {savedConfigs.map((config) => (
                                                        <div
                                                            key={config.name}
                                                            className={`flex justify-between items-center p-2 rounded-md hover:bg-muted ${selectedConfig === config.name ? 'bg-muted' : ''
                                                                }`}
                                                            onClick={() => setSelectedConfig(config.name)}
                                                        >
                                                            <div>
                                                                <span className="font-medium">{config.name}</span>
                                                                <div className="text-xs text-muted-foreground">
                                                                    {config.drawType === "name" ?
                                                                        `名单抽奖 (${config.items.length} 项)` :
                                                                        `数字抽奖 (${config.items.length} 个数字)`
                                                                    }
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        loadConfig(config.name);
                                                                    }}
                                                                >
                                                                    <Settings className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        deleteConfig(config.name);
                                                                    }}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedConfig && (
                                            <div>
                                                <h3 className="text-lg font-medium mb-2">配置详情</h3>
                                                <div className="border rounded-md p-4">
                                                    <div className="mb-4">
                                                        <h4 className="font-medium">{selectedConfig}</h4>
                                                        <p className="text-sm text-muted-foreground">
                                                            {savedConfigs.find(c => c.name === selectedConfig)?.drawType === "name" ?
                                                                "名单抽奖" : "数字抽奖"
                                                            }
                                                        </p>
                                                    </div>

                                                    <Button
                                                        onClick={() => loadConfig(selectedConfig)}
                                                        className="w-full"
                                                    >
                                                        <Settings className="mr-2 h-4 w-4" />
                                                        加载此配置
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* 历史记录 */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>历史记录</CardTitle>
                        {history.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearHistory}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                清除历史
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Gift className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>还没有抽奖记录</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                {history.map((result, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col items-start">
                                                <span>
                                                    {result.drawType === "name" ? "名单抽奖" : "数字抽奖"} -
                                                    {result.count} 项
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatTime(result.timestamp)}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                    {result.items.map((item, i) => (
                                                        <div
                                                            key={i}
                                                            className="p-2 bg-primary/10 rounded-md text-center"
                                                        >
                                                            <span className="font-medium">{item.name}</span>
                                                            {result.drawType === "name" && item.weight !== 1 && (
                                                                <div className="text-xs text-muted-foreground">
                                                                    权重: {item.weight}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
