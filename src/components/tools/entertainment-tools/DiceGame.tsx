"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Dices, History, RefreshCw, Plus, Minus, Settings, Save } from "lucide-react";

// 骰子类型
type DiceType = "standard" | "d4" | "d8" | "d10" | "d12" | "d20" | "custom";

// 骰子结果
interface DiceResult {
    type: DiceType;
    sides: number;
    value: number;
    timestamp: number;
}

// 骰子配置
interface DiceConfig {
    type: DiceType;
    sides: number;
    count: number;
}

// 保存的骰子组合
interface SavedDiceSet {
    name: string;
    diceConfigs: DiceConfig[];
}

export default function DiceGame() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"single" | "multiple" | "saved">("single");
    const [diceType, setDiceType] = useState<DiceType>("standard");
    const [customSides, setCustomSides] = useState<number>(6);
    const [diceCount, setDiceCount] = useState<number>(1);
    const [rolling, setRolling] = useState<boolean>(false);
    const [results, setResults] = useState<DiceResult[]>([]);
    const [history, setHistory] = useState<DiceResult[][]>([]);
    const [multipleDice, setMultipleDice] = useState<DiceConfig[]>([
        { type: "standard", sides: 6, count: 2 }
    ]);
    const [savedSets, setSavedSets] = useState<SavedDiceSet[]>([]);
    const [newSetName, setNewSetName] = useState<string>("");
    const [selectedSet, setSelectedSet] = useState<string>("");

    // 获取骰子面数
    const getDiceSides = (type: DiceType): number => {
        switch (type) {
            case "standard": return 6;
            case "d4": return 4;
            case "d8": return 8;
            case "d10": return 10;
            case "d12": return 12;
            case "d20": return 20;
            case "custom": return customSides;
            default: return 6;
        }
    };

    // 获取骰子类型显示名称
    const getDiceTypeName = (type: DiceType): string => {
        switch (type) {
            case "standard": return "标准骰子 (D6)";
            case "d4": return "四面骰 (D4)";
            case "d8": return "八面骰 (D8)";
            case "d10": return "十面骰 (D10)";
            case "d12": return "十二面骰 (D12)";
            case "d20": return "二十面骰 (D20)";
            case "custom": return `自定义骰子 (D${customSides})`;
            default: return "骰子";
        }
    };

    // 掷单个骰子
    const rollSingleDice = () => {
        setRolling(true);

        // 延迟显示结果，增加动画效果
        setTimeout(() => {
            const sides = getDiceSides(diceType);
            const newResults: DiceResult[] = [];

            for (let i = 0; i < diceCount; i++) {
                const value = Math.floor(Math.random() * sides) + 1;
                newResults.push({
                    type: diceType,
                    sides,
                    value,
                    timestamp: Date.now() + i
                });
            }

            setResults(newResults);
            setHistory(prev => [newResults, ...prev].slice(0, 10));
            setRolling(false);
        }, 800);
    };

    // 掷多个骰子
    const rollMultipleDice = () => {
        setRolling(true);

        setTimeout(() => {
            const newResults: DiceResult[] = [];

            multipleDice.forEach((dice, diceIndex) => {
                for (let i = 0; i < dice.count; i++) {
                    const value = Math.floor(Math.random() * dice.sides) + 1;
                    newResults.push({
                        type: dice.type,
                        sides: dice.sides,
                        value,
                        timestamp: Date.now() + diceIndex * 100 + i
                    });
                }
            });

            setResults(newResults);
            setHistory(prev => [newResults, ...prev].slice(0, 10));
            setRolling(false);
        }, 800);
    };

    // 掷保存的骰子组合
    const rollSavedSet = () => {
        if (!selectedSet) {
            toast({
                title: "请选择骰子组合",
                description: "请先选择一个已保存的骰子组合",
                variant: "destructive",
            });
            return;
        }

        const set = savedSets.find(s => s.name === selectedSet);
        if (!set) return;

        setRolling(true);

        setTimeout(() => {
            const newResults: DiceResult[] = [];

            set.diceConfigs.forEach((dice, diceIndex) => {
                for (let i = 0; i < dice.count; i++) {
                    const value = Math.floor(Math.random() * dice.sides) + 1;
                    newResults.push({
                        type: dice.type,
                        sides: dice.sides,
                        value,
                        timestamp: Date.now() + diceIndex * 100 + i
                    });
                }
            });

            setResults(newResults);
            setHistory(prev => [newResults, ...prev].slice(0, 10));
            setRolling(false);
        }, 800);
    };

    // 添加骰子到多骰子配置
    const addDiceToMultiple = () => {
        setMultipleDice(prev => [...prev, { type: "standard", sides: 6, count: 1 }]);
    };

    // 移除骰子从多骰子配置
    const removeDiceFromMultiple = (index: number) => {
        setMultipleDice(prev => prev.filter((_, i) => i !== index));
    };

    // 更新多骰子配置
    const updateMultipleDice = (index: number, field: keyof DiceConfig, value: any) => {
        setMultipleDice(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };

            // 如果类型改变，更新面数
            if (field === "type") {
                updated[index].sides = getDiceSides(value as DiceType);
            }

            return updated;
        });
    };

    // 保存当前骰子组合
    const saveCurrentSet = () => {
        if (!newSetName.trim()) {
            toast({
                title: "请输入名称",
                description: "请为骰子组合输入一个名称",
                variant: "destructive",
            });
            return;
        }

        // 检查名称是否已存在
        if (savedSets.some(set => set.name === newSetName.trim())) {
            toast({
                title: "名称已存在",
                description: "请使用一个不同的名称",
                variant: "destructive",
            });
            return;
        }

        const newSet: SavedDiceSet = {
            name: newSetName.trim(),
            diceConfigs: [...multipleDice]
        };

        setSavedSets(prev => [...prev, newSet]);
        setNewSetName("");

        toast({
            title: "保存成功",
            description: `骰子组合 "${newSet.name}" 已保存`,
        });
    };

    // 删除保存的骰子组合
    const deleteSavedSet = (name: string) => {
        setSavedSets(prev => prev.filter(set => set.name !== name));
        if (selectedSet === name) {
            setSelectedSet("");
        }

        toast({
            title: "删除成功",
            description: `骰子组合 "${name}" 已删除`,
        });
    };

    // 计算总点数
    const calculateTotal = (results: DiceResult[]): number => {
        return results.reduce((sum, dice) => sum + dice.value, 0);
    };

    // 格式化时间
    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleTimeString();
    };

    // 从本地存储加载保存的骰子组合
    useEffect(() => {
        const savedSetsJson = localStorage.getItem("dice-game-saved-sets");
        if (savedSetsJson) {
            try {
                const parsed = JSON.parse(savedSetsJson);
                setSavedSets(parsed);
            } catch (e) {
                console.error("无法解析保存的骰子组合", e);
            }
        }
    }, []);

    // 保存骰子组合到本地存储
    useEffect(() => {
        if (savedSets.length > 0) {
            localStorage.setItem("dice-game-saved-sets", JSON.stringify(savedSets));
        }
    }, [savedSets]);

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>骰子游戏</CardTitle>
                    <CardDescription>
                        虚拟骰子游戏，可以模拟掷骰子，支持多种骰子类型和自定义面数。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="single">单骰子</TabsTrigger>
                            <TabsTrigger value="multiple">多骰子</TabsTrigger>
                            <TabsTrigger value="saved">保存的组合</TabsTrigger>
                        </TabsList>

                        {/* 单骰子模式 */}
                        <TabsContent value="single" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="dice-type">骰子类型</Label>
                                        <Select
                                            value={diceType}
                                            onValueChange={(value) => setDiceType(value as DiceType)}
                                        >
                                            <SelectTrigger id="dice-type">
                                                <SelectValue placeholder="选择骰子类型" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">标准骰子 (D6)</SelectItem>
                                                <SelectItem value="d4">四面骰 (D4)</SelectItem>
                                                <SelectItem value="d8">八面骰 (D8)</SelectItem>
                                                <SelectItem value="d10">十面骰 (D10)</SelectItem>
                                                <SelectItem value="d12">十二面骰 (D12)</SelectItem>
                                                <SelectItem value="d20">二十面骰 (D20)</SelectItem>
                                                <SelectItem value="custom">自定义骰子</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {diceType === "custom" && (
                                        <div>
                                            <Label htmlFor="custom-sides">自定义面数</Label>
                                            <Input
                                                id="custom-sides"
                                                type="number"
                                                min="2"
                                                max="100"
                                                value={customSides}
                                                onChange={(e) => setCustomSides(parseInt(e.target.value) || 6)}
                                            />
                                        </div>
                                    )}

                                    <div>
                                        <Label htmlFor="dice-count">骰子数量</Label>
                                        <div className="flex items-center space-x-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setDiceCount(Math.max(1, diceCount - 1))}
                                                disabled={diceCount <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                            <Input
                                                id="dice-count"
                                                type="number"
                                                min="1"
                                                max="10"
                                                value={diceCount}
                                                onChange={(e) => setDiceCount(parseInt(e.target.value) || 1)}
                                                className="w-20 text-center"
                                            />
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                onClick={() => setDiceCount(Math.min(10, diceCount + 1))}
                                                disabled={diceCount >= 10}
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={rollSingleDice}
                                        disabled={rolling}
                                        className="w-full"
                                    >
                                        <Dices className="mr-2 h-4 w-4" />
                                        掷骰子
                                    </Button>
                                </div>

                                <div className="flex flex-col items-center justify-center">
                                    <div className="text-center mb-4">
                                        <h3 className="text-lg font-medium">
                                            {getDiceTypeName(diceType)}
                                        </h3>
                                        <p className="text-sm text-muted-foreground">
                                            {diceCount} 个骰子
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap justify-center gap-4 mb-4">
                                        <AnimatePresence mode="wait">
                                            {rolling ? (
                                                <motion.div
                                                    key="rolling"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="flex flex-wrap justify-center gap-4"
                                                >
                                                    {Array(diceCount).fill(0).map((_, i) => (
                                                        <motion.div
                                                            key={i}
                                                            animate={{
                                                                rotate: [0, 90, 180, 270, 360],
                                                                scale: [1, 1.1, 1]
                                                            }}
                                                            transition={{
                                                                duration: 0.8,
                                                                ease: "easeInOut",
                                                                times: [0, 0.25, 0.5, 0.75, 1]
                                                            }}
                                                            className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold"
                                                        >
                                                            <Dices className="h-8 w-8 text-primary/50" />
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="results"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex flex-wrap justify-center gap-4"
                                                >
                                                    {results.map((result, i) => (
                                                        <motion.div
                                                            key={result.timestamp}
                                                            initial={{ scale: 0.8, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold"
                                                        >
                                                            {result.value}
                                                        </motion.div>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {results.length > 0 && !rolling && (
                                        <div className="text-center">
                                            <Badge variant="outline" className="text-lg">
                                                总点数: {calculateTotal(results)}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        {/* 多骰子模式 */}
                        <TabsContent value="multiple" className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-medium">骰子配置</h3>
                                    <Button variant="outline" size="sm" onClick={addDiceToMultiple}>
                                        <Plus className="h-4 w-4 mr-1" />
                                        添加骰子
                                    </Button>
                                </div>

                                <div className="space-y-3">
                                    {multipleDice.map((dice, index) => (
                                        <div key={index} className="flex items-center space-x-2 p-3 border rounded-md">
                                            <div className="flex-1 grid grid-cols-3 gap-2">
                                                <div>
                                                    <Label htmlFor={`dice-type-${index}`} className="text-xs">类型</Label>
                                                    <Select
                                                        value={dice.type}
                                                        onValueChange={(value) => updateMultipleDice(index, "type", value as DiceType)}
                                                    >
                                                        <SelectTrigger id={`dice-type-${index}`}>
                                                            <SelectValue placeholder="选择类型" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="standard">D6</SelectItem>
                                                            <SelectItem value="d4">D4</SelectItem>
                                                            <SelectItem value="d8">D8</SelectItem>
                                                            <SelectItem value="d10">D10</SelectItem>
                                                            <SelectItem value="d12">D12</SelectItem>
                                                            <SelectItem value="d20">D20</SelectItem>
                                                            <SelectItem value="custom">自定义</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>

                                                {dice.type === "custom" ? (
                                                    <div>
                                                        <Label htmlFor={`dice-sides-${index}`} className="text-xs">面数</Label>
                                                        <Input
                                                            id={`dice-sides-${index}`}
                                                            type="number"
                                                            min="2"
                                                            max="100"
                                                            value={dice.sides}
                                                            onChange={(e) => updateMultipleDice(index, "sides", parseInt(e.target.value) || 6)}
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-end">
                                                        <Badge variant="outline">
                                                            {dice.sides} 面
                                                        </Badge>
                                                    </div>
                                                )}

                                                <div>
                                                    <Label htmlFor={`dice-count-${index}`} className="text-xs">数量</Label>
                                                    <Input
                                                        id={`dice-count-${index}`}
                                                        type="number"
                                                        min="1"
                                                        max="10"
                                                        value={dice.count}
                                                        onChange={(e) => updateMultipleDice(index, "count", parseInt(e.target.value) || 1)}
                                                    />
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeDiceFromMultiple(index)}
                                                disabled={multipleDice.length <= 1}
                                            >
                                                <Minus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex justify-between">
                                    <Button
                                        onClick={rollMultipleDice}
                                        disabled={rolling}
                                    >
                                        <Dices className="mr-2 h-4 w-4" />
                                        掷骰子
                                    </Button>

                                    <div className="flex space-x-2">
                                        <Input
                                            placeholder="输入组合名称"
                                            value={newSetName}
                                            onChange={(e) => setNewSetName(e.target.value)}
                                            className="w-48"
                                        />
                                        <Button variant="outline" onClick={saveCurrentSet}>
                                            <Save className="mr-2 h-4 w-4" />
                                            保存组合
                                        </Button>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex flex-wrap justify-center gap-4 my-4">
                                    <AnimatePresence mode="wait">
                                        {rolling ? (
                                            <motion.div
                                                key="rolling-multi"
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.8 }}
                                                className="flex flex-wrap justify-center gap-4"
                                            >
                                                {multipleDice.flatMap((dice, diceIndex) =>
                                                    Array(dice.count).fill(0).map((_, i) => (
                                                        <motion.div
                                                            key={`${diceIndex}-${i}`}
                                                            animate={{
                                                                rotate: [0, 90, 180, 270, 360],
                                                                scale: [1, 1.1, 1]
                                                            }}
                                                            transition={{
                                                                duration: 0.8,
                                                                ease: "easeInOut",
                                                                times: [0, 0.25, 0.5, 0.75, 1]
                                                            }}
                                                            className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold"
                                                        >
                                                            <Dices className="h-8 w-8 text-primary/50" />
                                                        </motion.div>
                                                    ))
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="results-multi"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="flex flex-wrap justify-center gap-4"
                                            >
                                                {results.map((result, i) => (
                                                    <motion.div
                                                        key={result.timestamp}
                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold
                                                            ${result.sides === 4 ? 'bg-blue-100' :
                                                                result.sides === 6 ? 'bg-primary/10' :
                                                                    result.sides === 8 ? 'bg-green-100' :
                                                                        result.sides === 10 ? 'bg-yellow-100' :
                                                                            result.sides === 12 ? 'bg-orange-100' :
                                                                                result.sides === 20 ? 'bg-red-100' :
                                                                                    'bg-purple-100'}`}
                                                    >
                                                        {result.value}
                                                        <span className="absolute bottom-1 right-1 text-xs text-muted-foreground">
                                                            d{result.sides}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {results.length > 0 && !rolling && (
                                    <div className="text-center">
                                        <Badge variant="outline" className="text-lg">
                                            总点数: {calculateTotal(results)}
                                        </Badge>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 保存的组合 */}
                        <TabsContent value="saved" className="space-y-4">
                            {savedSets.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>还没有保存的骰子组合</p>
                                    <p className="text-sm mt-2">在"多骰子"标签中配置并保存组合</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="saved-set">选择骰子组合</Label>
                                        <Select
                                            value={selectedSet}
                                            onValueChange={setSelectedSet}
                                        >
                                            <SelectTrigger id="saved-set">
                                                <SelectValue placeholder="选择骰子组合" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {savedSets.map((set) => (
                                                    <SelectItem key={set.name} value={set.name}>
                                                        {set.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {selectedSet && (
                                        <>
                                            <div className="border rounded-md p-4">
                                                <h3 className="font-medium mb-2">组合详情</h3>
                                                <div className="space-y-2">
                                                    {savedSets.find(s => s.name === selectedSet)?.diceConfigs.map((dice, index) => (
                                                        <div key={index} className="flex justify-between items-center">
                                                            <span>
                                                                {dice.count} × {dice.type === "custom" ? `D${dice.sides}` : getDiceTypeName(dice.type)}
                                                            </span>
                                                            <Badge variant="outline">
                                                                {dice.sides} 面
                                                            </Badge>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="flex justify-between mt-4">
                                                    <Button
                                                        onClick={rollSavedSet}
                                                        disabled={rolling}
                                                    >
                                                        <Dices className="mr-2 h-4 w-4" />
                                                        掷骰子
                                                    </Button>

                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => deleteSavedSet(selectedSet)}
                                                    >
                                                        删除组合
                                                    </Button>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex flex-wrap justify-center gap-4 my-4">
                                                <AnimatePresence mode="wait">
                                                    {rolling ? (
                                                        <motion.div
                                                            key="rolling-saved"
                                                            initial={{ opacity: 0, scale: 0.8 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.8 }}
                                                            className="flex flex-wrap justify-center gap-4"
                                                        >
                                                            {savedSets.find(s => s.name === selectedSet)?.diceConfigs.flatMap((dice, diceIndex) =>
                                                                Array(dice.count).fill(0).map((_, i) => (
                                                                    <motion.div
                                                                        key={`${diceIndex}-${i}`}
                                                                        animate={{
                                                                            rotate: [0, 90, 180, 270, 360],
                                                                            scale: [1, 1.1, 1]
                                                                        }}
                                                                        transition={{
                                                                            duration: 0.8,
                                                                            ease: "easeInOut",
                                                                            times: [0, 0.25, 0.5, 0.75, 1]
                                                                        }}
                                                                        className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-2xl font-bold"
                                                                    >
                                                                        <Dices className="h-8 w-8 text-primary/50" />
                                                                    </motion.div>
                                                                ))
                                                            )}
                                                        </motion.div>
                                                    ) : (
                                                        <motion.div
                                                            key="results-saved"
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            exit={{ opacity: 0 }}
                                                            className="flex flex-wrap justify-center gap-4"
                                                        >
                                                            {results.map((result, i) => (
                                                                <motion.div
                                                                    key={result.timestamp}
                                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                                    animate={{ scale: 1, opacity: 1 }}
                                                                    transition={{ delay: i * 0.05 }}
                                                                    className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold
                                                                        ${result.sides === 4 ? 'bg-blue-100' :
                                                                            result.sides === 6 ? 'bg-primary/10' :
                                                                                result.sides === 8 ? 'bg-green-100' :
                                                                                    result.sides === 10 ? 'bg-yellow-100' :
                                                                                        result.sides === 12 ? 'bg-orange-100' :
                                                                                            result.sides === 20 ? 'bg-red-100' :
                                                                                                'bg-purple-100'}`}
                                                                >
                                                                    {result.value}
                                                                    <span className="absolute bottom-1 right-1 text-xs text-muted-foreground">
                                                                        d{result.sides}
                                                                    </span>
                                                                </motion.div>
                                                            ))}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>

                                            {results.length > 0 && !rolling && (
                                                <div className="text-center">
                                                    <Badge variant="outline" className="text-lg">
                                                        总点数: {calculateTotal(results)}
                                                    </Badge>
                                                </div>
                                            )}
                                        </>
                                    )}
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
                            <Button variant="outline" size="sm" onClick={() => setHistory([])}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                清除历史
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>还没有掷骰记录</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                            {history.map((resultSet, index) => (
                                <div key={index} className="border rounded-md p-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-medium">
                                            {formatTime(resultSet[0]?.timestamp || Date.now())}
                                        </div>
                                        <Badge variant="outline">
                                            总点数: {calculateTotal(resultSet)}
                                        </Badge>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {resultSet.map((result, i) => (
                                            <div
                                                key={i}
                                                className={`w-8 h-8 rounded flex items-center justify-center text-sm font-medium
                                                    ${result.sides === 4 ? 'bg-blue-100' :
                                                        result.sides === 6 ? 'bg-primary/10' :
                                                            result.sides === 8 ? 'bg-green-100' :
                                                                result.sides === 10 ? 'bg-yellow-100' :
                                                                    result.sides === 12 ? 'bg-orange-100' :
                                                                        result.sides === 20 ? 'bg-red-100' :
                                                                            'bg-purple-100'}`}
                                            >
                                                {result.value}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
