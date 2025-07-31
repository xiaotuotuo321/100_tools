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
import { motion } from "framer-motion";
import {
    BookOpen,
    Timer,
    RefreshCw,
    Check,
    X,
    Award,
    Brain,
    Lightbulb,
    History,
    ChevronRight
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 常用成语库（简化版）
const IDIOMS = [
    "一举两得", "一石二鸟", "九牛一毛", "二话不说", "三思而行",
    "四面八方", "五光十色", "六神无主", "七上八下", "八面玲珑",
    "九死一生", "十全十美", "百发百中", "千方百计", "万无一失",
    "万水千山", "千军万马", "百战百胜", "一日千里", "一鸣惊人",
    "一帆风顺", "一触即发", "一丝不苟", "一毛不拔", "一针见血",
    "一心一意", "一举一动", "一言为定", "一言九鼎", "一步登天"
];

// 常用词汇库（简化版）
const WORDS = [
    "苹果", "香蕉", "橙子", "西瓜", "草莓",
    "电脑", "手机", "相机", "电视", "冰箱",
    "书本", "铅笔", "钢笔", "尺子", "橡皮",
    "桌子", "椅子", "沙发", "床铺", "柜子",
    "医生", "教师", "工程师", "司机", "厨师",
    "学校", "医院", "公园", "超市", "餐厅"
];

// 游戏记录类型
interface GameRecord {
    gameType: "idiom" | "word";
    score: number;
    time: number;
    date: number;
}

export default function WordGame() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"idiom" | "word">("idiom");

    // 成语接龙状态
    const [currentIdiom, setCurrentIdiom] = useState<string>("");
    const [idiomInput, setIdiomInput] = useState<string>("");
    const [idiomHistory, setIdiomHistory] = useState<string[]>([]);
    const [idiomScore, setIdiomScore] = useState<number>(0);
    const [idiomTime, setIdiomTime] = useState<number>(60);
    const [idiomGameActive, setIdiomGameActive] = useState<boolean>(false);
    const [idiomGameOver, setIdiomGameOver] = useState<boolean>(false);
    const [idiomHint, setIdiomHint] = useState<string>("");

    // 猜词游戏状态
    const [targetWord, setTargetWord] = useState<string>("");
    const [wordInput, setWordInput] = useState<string>("");
    const [wordHints, setWordHints] = useState<string[]>([]);
    const [wordGuesses, setWordGuesses] = useState<string[]>([]);
    const [wordScore, setWordScore] = useState<number>(0);
    const [wordTime, setWordTime] = useState<number>(60);
    const [wordGameActive, setWordGameActive] = useState<boolean>(false);
    const [wordGameOver, setWordGameOver] = useState<boolean>(false);
    const [showWordAnswer, setShowWordAnswer] = useState<boolean>(false);

    // 游戏记录
    const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);

    // 从本地存储加载游戏记录
    useEffect(() => {
        const savedRecords = localStorage.getItem("word-game-records");
        if (savedRecords) {
            try {
                setGameRecords(JSON.parse(savedRecords));
            } catch (e) {
                console.error("无法解析游戏记录", e);
            }
        }
    }, []);

    // 保存游戏记录到本地存储
    useEffect(() => {
        if (gameRecords.length > 0) {
            localStorage.setItem("word-game-records", JSON.stringify(gameRecords));
        }
    }, [gameRecords]);

    // 成语接龙计时器
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (idiomGameActive && idiomTime > 0) {
            timer = setInterval(() => {
                setIdiomTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        endIdiomGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [idiomGameActive, idiomTime]);

    // 猜词游戏计时器
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (wordGameActive && wordTime > 0) {
            timer = setInterval(() => {
                setWordTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        endWordGame();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [wordGameActive, wordTime]);

    // 开始成语接龙游戏
    const startIdiomGame = () => {
        // 随机选择一个成语作为开始
        const randomIdiom = IDIOMS[Math.floor(Math.random() * IDIOMS.length)];
        setCurrentIdiom(randomIdiom);
        setIdiomHistory([randomIdiom]);
        setIdiomInput("");
        setIdiomScore(0);
        setIdiomTime(60);
        setIdiomGameActive(true);
        setIdiomGameOver(false);
        setIdiomHint("");

        toast({
            title: "游戏开始",
            description: `成语接龙开始，第一个成语是"${randomIdiom}"`,
        });
    };

    // 结束成语接龙游戏
    const endIdiomGame = () => {
        setIdiomGameActive(false);
        setIdiomGameOver(true);

        // 保存游戏记录
        const newRecord: GameRecord = {
            gameType: "idiom",
            score: idiomScore,
            time: 60 - idiomTime,
            date: Date.now()
        };

        setGameRecords(prev => [newRecord, ...prev].slice(0, 10));

        toast({
            title: "游戏结束",
            description: `成语接龙结束，你的得分是 ${idiomScore}`,
        });
    };

    // 提交成语
    const submitIdiom = () => {
        if (!idiomInput.trim()) {
            toast({
                title: "输入错误",
                description: "请输入成语",
                variant: "destructive",
            });
            return;
        }

        const input = idiomInput.trim();

        // 检查是否是有效的成语接龙
        if (!isValidIdiomChain(currentIdiom, input)) {
            toast({
                title: "接龙失败",
                description: `"${input}"不能接在"${currentIdiom}"之后`,
                variant: "destructive",
            });
            return;
        }

        // 检查是否已经使用过
        if (idiomHistory.includes(input)) {
            toast({
                title: "接龙失败",
                description: `"${input}"已经使用过了`,
                variant: "destructive",
            });
            return;
        }

        // 更新游戏状态
        setCurrentIdiom(input);
        setIdiomHistory(prev => [...prev, input]);
        setIdiomInput("");
        setIdiomScore(prev => prev + 1);
        setIdiomHint("");

        // 增加时间奖励
        setIdiomTime(prev => Math.min(prev + 5, 60));

        toast({
            title: "接龙成功",
            description: `+1分，时间+5秒`,
        });
    };

    // 检查成语接龙是否有效
    const isValidIdiomChain = (prev: string, next: string): boolean => {
        if (!prev || !next) return false;

        // 简化版：检查前一个成语的最后一个字是否与下一个成语的第一个字相同
        const lastChar = prev.charAt(prev.length - 1);
        const firstChar = next.charAt(0);

        return lastChar === firstChar && IDIOMS.includes(next);
    };

    // 获取成语提示
    const getIdiomHint = () => {
        if (!currentIdiom) return;

        const lastChar = currentIdiom.charAt(currentIdiom.length - 1);

        // 查找可能的下一个成语
        const possibleIdioms = IDIOMS.filter(idiom =>
            idiom.charAt(0) === lastChar && !idiomHistory.includes(idiom)
        );

        if (possibleIdioms.length > 0) {
            // 随机选择一个提示
            const hint = possibleIdioms[Math.floor(Math.random() * possibleIdioms.length)];
            setIdiomHint(hint);

            // 使用提示会减少时间
            setIdiomTime(prev => Math.max(prev - 10, 0));

            toast({
                title: "已提供提示",
                description: `使用提示减少10秒时间`,
            });
        } else {
            toast({
                title: "没有可用的提示",
                description: "找不到可用的成语提示",
                variant: "destructive",
            });
        }
    };

    // 开始猜词游戏
    const startWordGame = () => {
        // 随机选择一个词作为目标
        const randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        setTargetWord(randomWord);
        setWordInput("");
        setWordHints(generateWordHints(randomWord));
        setWordGuesses([]);
        setWordScore(100);
        setWordTime(60);
        setWordGameActive(true);
        setWordGameOver(false);
        setShowWordAnswer(false);

        toast({
            title: "游戏开始",
            description: "猜词游戏开始，请根据提示猜词",
        });
    };

    // 结束猜词游戏
    const endWordGame = () => {
        setWordGameActive(false);
        setWordGameOver(true);

        // 保存游戏记录
        const newRecord: GameRecord = {
            gameType: "word",
            score: wordScore,
            time: 60 - wordTime,
            date: Date.now()
        };

        setGameRecords(prev => [newRecord, ...prev].slice(0, 10));

        toast({
            title: "游戏结束",
            description: `猜词游戏结束，你的得分是 ${wordScore}`,
        });
    };

    // 提交猜词
    const submitWordGuess = () => {
        if (!wordInput.trim()) {
            toast({
                title: "输入错误",
                description: "请输入你的猜测",
                variant: "destructive",
            });
            return;
        }

        const guess = wordInput.trim();

        // 添加到猜测历史
        setWordGuesses(prev => [guess, ...prev]);
        setWordInput("");

        // 检查是否猜对
        if (guess === targetWord) {
            toast({
                title: "猜对了！",
                description: `恭喜你猜对了，答案是"${targetWord}"`,
            });
            endWordGame();
            return;
        }

        // 猜错了，减少分数
        setWordScore(prev => Math.max(prev - 10, 0));

        toast({
            title: "猜错了",
            description: "继续尝试，每次猜错减少10分",
            variant: "destructive",
        });
    };

    // 生成词语提示
    const generateWordHints = (word: string): string[] => {
        const hints: string[] = [];

        // 提示1：词语长度
        hints.push(`这个词有 ${word.length} 个字`);

        // 提示2：第一个字
        hints.push(`第一个字是"${word.charAt(0)}"`);

        // 提示3：类别（简化版）
        if (["苹果", "香蕉", "橙子", "西瓜", "草莓"].includes(word)) {
            hints.push("这是一种水果");
        } else if (["电脑", "手机", "相机", "电视", "冰箱"].includes(word)) {
            hints.push("这是一种电子设备");
        } else if (["书本", "铅笔", "钢笔", "尺子", "橡皮"].includes(word)) {
            hints.push("这是学习用品");
        } else if (["桌子", "椅子", "沙发", "床铺", "柜子"].includes(word)) {
            hints.push("这是家具");
        } else if (["医生", "教师", "工程师", "司机", "厨师"].includes(word)) {
            hints.push("这是一种职业");
        } else if (["学校", "医院", "公园", "超市", "餐厅"].includes(word)) {
            hints.push("这是一个场所");
        }

        return hints;
    };

    // 显示答案
    const revealWordAnswer = () => {
        setShowWordAnswer(true);
        setWordScore(0); // 显示答案将分数清零

        toast({
            title: "已显示答案",
            description: "查看答案会将分数清零",
        });
    };

    // 清除游戏记录
    const clearGameRecords = () => {
        setGameRecords([]);
        localStorage.removeItem("word-game-records");

        toast({
            title: "记录已清除",
            description: "所有游戏记录已清除",
        });
    };

    // 格式化时间
    const formatTime = (seconds: number): string => {
        return `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    };

    // 格式化日期
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>文字游戏</CardTitle>
                    <CardDescription>
                        包含猜词、成语接龙等多种文字游戏，锻炼词汇量和反应能力。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="idiom">成语接龙</TabsTrigger>
                            <TabsTrigger value="word">猜词游戏</TabsTrigger>
                        </TabsList>

                        {/* 成语接龙 */}
                        <TabsContent value="idiom" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-medium">成语接龙</h3>
                                            <p className="text-sm text-muted-foreground">
                                                根据上一个成语的最后一个字接新成语
                                            </p>
                                        </div>

                                        {!idiomGameActive && !idiomGameOver && (
                                            <Button onClick={startIdiomGame}>
                                                开始游戏
                                            </Button>
                                        )}

                                        {idiomGameActive && (
                                            <Button variant="destructive" onClick={endIdiomGame}>
                                                结束游戏
                                            </Button>
                                        )}

                                        {idiomGameOver && (
                                            <Button variant="outline" onClick={startIdiomGame}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                重新开始
                                            </Button>
                                        )}
                                    </div>

                                    {(idiomGameActive || idiomGameOver) && (
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-lg">
                                                得分: {idiomScore}
                                            </Badge>
                                            <div className="flex items-center">
                                                <Timer className="mr-1 h-4 w-4" />
                                                <span className={`${idiomTime < 10 ? 'text-red-500' : ''}`}>
                                                    {formatTime(idiomTime)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {idiomGameActive && (
                                        <>
                                            <div className="p-4 bg-primary/10 rounded-md">
                                                <div className="text-sm text-muted-foreground mb-1">当前成语:</div>
                                                <div className="text-xl font-bold">{currentIdiom}</div>
                                                <div className="text-sm text-muted-foreground mt-2">
                                                    请接以"{currentIdiom.charAt(currentIdiom.length - 1)}"开头的成语
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="idiom-input">你的回答</Label>
                                                <div className="flex space-x-2">
                                                    <Input
                                                        id="idiom-input"
                                                        value={idiomInput}
                                                        onChange={(e) => setIdiomInput(e.target.value)}
                                                        placeholder="输入成语..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') submitIdiom();
                                                        }}
                                                    />
                                                    <Button onClick={submitIdiom}>
                                                        提交
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <Button variant="outline" onClick={getIdiomHint}>
                                                    <Lightbulb className="mr-2 h-4 w-4" />
                                                    获取提示 (-10秒)
                                                </Button>
                                            </div>

                                            {idiomHint && (
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <div className="text-sm font-medium">提示:</div>
                                                    <div>{idiomHint}</div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {!idiomGameActive && !idiomGameOver && (
                                        <div className="p-8 text-center border rounded-md">
                                            <BookOpen className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                                            <h3 className="text-lg font-medium mb-1">成语接龙</h3>
                                            <p className="text-sm text-muted-foreground">
                                                点击"开始游戏"按钮开始成语接龙游戏
                                            </p>
                                        </div>
                                    )}

                                    {idiomGameOver && (
                                        <div className="p-4 bg-primary/10 rounded-md text-center">
                                            <Award className="h-8 w-8 mx-auto mb-2" />
                                            <h3 className="text-lg font-medium">游戏结束</h3>
                                            <p>你的最终得分: {idiomScore}</p>
                                            <p className="text-sm text-muted-foreground">
                                                用时: {formatTime(60 - idiomTime)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">成语历史</h3>
                                    <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                                        {idiomHistory.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>还没有成语记录</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {idiomHistory.map((idiom, index) => (
                                                    <div key={index} className="flex items-center">
                                                        <Badge variant="outline" className="mr-2">
                                                            {index + 1}
                                                        </Badge>
                                                        <div className="flex-1 p-2 bg-muted/50 rounded-md">
                                                            {idiom}
                                                        </div>
                                                        {index < idiomHistory.length - 1 && (
                                                            <ChevronRight className="mx-2 h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>

                        {/* 猜词游戏 */}
                        <TabsContent value="word" className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="text-lg font-medium">猜词游戏</h3>
                                            <p className="text-sm text-muted-foreground">
                                                根据提示猜出隐藏的词语
                                            </p>
                                        </div>

                                        {!wordGameActive && !wordGameOver && (
                                            <Button onClick={startWordGame}>
                                                开始游戏
                                            </Button>
                                        )}

                                        {wordGameActive && (
                                            <Button variant="destructive" onClick={endWordGame}>
                                                结束游戏
                                            </Button>
                                        )}

                                        {wordGameOver && (
                                            <Button variant="outline" onClick={startWordGame}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                重新开始
                                            </Button>
                                        )}
                                    </div>

                                    {(wordGameActive || wordGameOver) && (
                                        <div className="flex justify-between items-center">
                                            <Badge variant="outline" className="text-lg">
                                                得分: {wordScore}
                                            </Badge>
                                            <div className="flex items-center">
                                                <Timer className="mr-1 h-4 w-4" />
                                                <span className={`${wordTime < 10 ? 'text-red-500' : ''}`}>
                                                    {formatTime(wordTime)}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {wordGameActive && (
                                        <>
                                            <div className="p-4 bg-primary/10 rounded-md">
                                                <h4 className="font-medium mb-2">提示:</h4>
                                                <ul className="space-y-1 list-disc list-inside">
                                                    {wordHints.map((hint, index) => (
                                                        <li key={index}>{hint}</li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="word-input">你的猜测</Label>
                                                <div className="flex space-x-2">
                                                    <Input
                                                        id="word-input"
                                                        value={wordInput}
                                                        onChange={(e) => setWordInput(e.target.value)}
                                                        placeholder="输入词语..."
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') submitWordGuess();
                                                        }}
                                                    />
                                                    <Button onClick={submitWordGuess}>
                                                        猜测
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex justify-between">
                                                <Button variant="outline" onClick={revealWordAnswer}>
                                                    <Brain className="mr-2 h-4 w-4" />
                                                    查看答案 (得分清零)
                                                </Button>
                                            </div>

                                            {showWordAnswer && (
                                                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                                    <div className="text-sm font-medium">答案:</div>
                                                    <div className="text-lg font-bold">{targetWord}</div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {!wordGameActive && !wordGameOver && (
                                        <div className="p-8 text-center border rounded-md">
                                            <Brain className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                                            <h3 className="text-lg font-medium mb-1">猜词游戏</h3>
                                            <p className="text-sm text-muted-foreground">
                                                点击"开始游戏"按钮开始猜词游戏
                                            </p>
                                        </div>
                                    )}

                                    {wordGameOver && (
                                        <div className="p-4 bg-primary/10 rounded-md text-center">
                                            <Award className="h-8 w-8 mx-auto mb-2" />
                                            <h3 className="text-lg font-medium">游戏结束</h3>
                                            <p>你的最终得分: {wordScore}</p>
                                            <p className="text-sm text-muted-foreground">
                                                用时: {formatTime(60 - wordTime)}
                                            </p>
                                            <p className="mt-2">
                                                正确答案: <span className="font-bold">{targetWord}</span>
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <h3 className="text-lg font-medium mb-2">猜测历史</h3>
                                    <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                                        {wordGuesses.length === 0 ? (
                                            <div className="text-center py-8 text-muted-foreground">
                                                <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                                <p>还没有猜测记录</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {wordGuesses.map((guess, index) => (
                                                    <div
                                                        key={index}
                                                        className={`flex justify-between items-center p-2 rounded-md ${guess === targetWord
                                                            ? 'bg-green-100'
                                                            : 'bg-muted/50'
                                                            }`}
                                                    >
                                                        <span>{guess}</span>
                                                        {guess === targetWord ? (
                                                            <Check className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <X className="h-4 w-4 text-red-500" />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* 游戏记录 */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>游戏记录</CardTitle>
                        {gameRecords.length > 0 && (
                            <Button variant="outline" size="sm" onClick={clearGameRecords}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                清除记录
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {gameRecords.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>还没有游戏记录</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Accordion type="single" collapsible className="w-full">
                                {gameRecords.map((record, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger>
                                            <div className="flex flex-col items-start">
                                                <span>
                                                    {record.gameType === "idiom" ? "成语接龙" : "猜词游戏"} -
                                                    得分: {record.score}
                                                </span>
                                                <span className="text-xs text-muted-foreground">
                                                    {formatDate(record.date)}
                                                </span>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-2">
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <span className="text-sm font-medium">游戏类型: </span>
                                                        <span className="text-sm">
                                                            {record.gameType === "idiom" ? "成语接龙" : "猜词游戏"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">得分: </span>
                                                        <span className="text-sm">
                                                            {record.score}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">用时: </span>
                                                        <span className="text-sm">
                                                            {formatTime(record.time)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">日期: </span>
                                                        <span className="text-sm">
                                                            {formatDate(record.date)}
                                                        </span>
                                                    </div>
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
