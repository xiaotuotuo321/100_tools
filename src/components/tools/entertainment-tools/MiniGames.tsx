"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer,
    RefreshCw,
    Award,
    Zap,
    Brain,
    MousePointer,
    History,
    Sparkles
} from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 游戏记录类型
interface GameRecord {
    gameType: "memory" | "reaction" | "click";
    score: number;
    date: number;
}

export default function MiniGames() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"memory" | "reaction" | "click">("memory");
    const [gameRecords, setGameRecords] = useState<GameRecord[]>([]);

    // 从本地存储加载游戏记录
    useEffect(() => {
        const savedRecords = localStorage.getItem("mini-games-records");
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
            localStorage.setItem("mini-games-records", JSON.stringify(gameRecords));
        }
    }, [gameRecords]);

    // 添加游戏记录
    const addGameRecord = (gameType: "memory" | "reaction" | "click", score: number) => {
        const newRecord: GameRecord = {
            gameType,
            score,
            date: Date.now()
        };

        setGameRecords(prev => [newRecord, ...prev].slice(0, 10));
    };

    // 清除游戏记录
    const clearGameRecords = () => {
        setGameRecords([]);
        localStorage.removeItem("mini-games-records");

        toast({
            title: "记录已清除",
            description: "所有游戏记录已清除",
        });
    };

    // 格式化日期
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>迷你游戏集合</CardTitle>
                    <CardDescription>
                        包含多种简单有趣的迷你游戏，如记忆游戏、反应测试等。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="memory">记忆游戏</TabsTrigger>
                            <TabsTrigger value="reaction">反应测试</TabsTrigger>
                            <TabsTrigger value="click">点击挑战</TabsTrigger>
                        </TabsList>

                        {/* 记忆游戏 */}
                        <TabsContent value="memory">
                            <MemoryGame addGameRecord={addGameRecord} />
                        </TabsContent>

                        {/* 反应测试 */}
                        <TabsContent value="reaction">
                            <ReactionTest addGameRecord={addGameRecord} />
                        </TabsContent>

                        {/* 点击挑战 */}
                        <TabsContent value="click">
                            <ClickChallenge addGameRecord={addGameRecord} />
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
                                                    {record.gameType === "memory" ? "记忆游戏" :
                                                        record.gameType === "reaction" ? "反应测试" : "点击挑战"} -
                                                    {record.gameType === "reaction" ? `${record.score} 毫秒` : `${record.score} 分`}
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
                                                            {record.gameType === "memory" ? "记忆游戏" :
                                                                record.gameType === "reaction" ? "反应测试" : "点击挑战"}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span className="text-sm font-medium">
                                                            {record.gameType === "reaction" ? "反应时间: " : "得分: "}
                                                        </span>
                                                        <span className="text-sm">
                                                            {record.gameType === "reaction" ? `${record.score} 毫秒` : `${record.score} 分`}
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

// 记忆游戏组件
function MemoryGame({ addGameRecord }: { addGameRecord: (gameType: "memory", score: number) => void }) {
    const { toast } = useToast();
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [sequence, setSequence] = useState<number[]>([]);
    const [userSequence, setUserSequence] = useState<number[]>([]);
    const [showingSequence, setShowingSequence] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [level, setLevel] = useState(1);

    // 颜色映射
    const colors = [
        "bg-red-500",
        "bg-blue-500",
        "bg-green-500",
        "bg-yellow-500"
    ];

    // 开始游戏
    const startGame = () => {
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setLevel(1);
        generateSequence(1);
    };

    // 生成序列
    const generateSequence = (level: number) => {
        const newSequence = [];
        for (let i = 0; i < level + 2; i++) {
            newSequence.push(Math.floor(Math.random() * 4));
        }
        setSequence(newSequence);
        setUserSequence([]);
        setCurrentIndex(0);
        showSequence(newSequence);
    };

    // 显示序列
    const showSequence = (seq: number[]) => {
        setShowingSequence(true);

        let i = 0;
        const interval = setInterval(() => {
            setCurrentIndex(i);
            i++;

            if (i >= seq.length) {
                clearInterval(interval);
                setTimeout(() => {
                    setShowingSequence(false);
                    setCurrentIndex(-1);
                }, 500);
            }
        }, 800);
    };

    // 处理用户点击
    const handleColorClick = (colorIndex: number) => {
        if (showingSequence || !gameActive || gameOver) return;

        const newUserSequence = [...userSequence, colorIndex];
        setUserSequence(newUserSequence);

        // 检查是否正确
        if (colorIndex !== sequence[userSequence.length]) {
            // 游戏结束
            setGameOver(true);
            setGameActive(false);

            toast({
                title: "游戏结束",
                description: `你的得分是 ${score}`,
            });

            addGameRecord("memory", score);
            return;
        }

        // 检查是否完成当前级别
        if (newUserSequence.length === sequence.length) {
            // 增加分数
            const newScore = score + level * 10;
            setScore(newScore);

            // 进入下一级别
            const newLevel = level + 1;
            setLevel(newLevel);

            toast({
                title: "级别完成",
                description: `进入第 ${newLevel} 级`,
            });

            // 生成新序列
            setTimeout(() => {
                generateSequence(newLevel);
            }, 1000);
        }
    };

    return (
        <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">记忆游戏</h3>
                    <p className="text-sm text-muted-foreground">
                        记住并重复显示的颜色序列
                    </p>
                </div>

                {!gameActive && !gameOver && (
                    <Button onClick={startGame}>
                        开始游戏
                    </Button>
                )}

                {gameActive && (
                    <Button variant="destructive" onClick={() => {
                        setGameActive(false);
                        setGameOver(true);
                        addGameRecord("memory", score);
                    }}>
                        结束游戏
                    </Button>
                )}

                {gameOver && (
                    <Button variant="outline" onClick={startGame}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重新开始
                    </Button>
                )}
            </div>

            {(gameActive || gameOver) && (
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-lg">
                        得分: {score}
                    </Badge>
                    <Badge variant="outline">
                        级别: {level}
                    </Badge>
                </div>
            )}

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {colors.map((color, index) => (
                    <motion.div
                        key={index}
                        className={`${color} h-32 rounded-lg cursor-pointer flex items-center justify-center`}
                        animate={{
                            scale: showingSequence && currentIndex === index ? 1.1 : 1,
                            opacity: showingSequence && currentIndex === index ? 1 : 0.7
                        }}
                        onClick={() => handleColorClick(index)}
                    >
                        <span className="text-white text-2xl font-bold">
                            {index + 1}
                        </span>
                    </motion.div>
                ))}
            </div>

            {showingSequence && (
                <div className="text-center text-lg font-medium">
                    记住序列...
                </div>
            )}

            {!showingSequence && gameActive && !gameOver && (
                <div className="text-center text-lg font-medium">
                    请重复序列
                </div>
            )}

            {gameOver && (
                <div className="p-4 bg-primary/10 rounded-md text-center">
                    <Award className="h-8 w-8 mx-auto mb-2" />
                    <h3 className="text-lg font-medium">游戏结束</h3>
                    <p>你的最终得分: {score}</p>
                    <p className="text-sm text-muted-foreground">
                        最高级别: {level - 1}
                    </p>
                </div>
            )}

            {!gameActive && !gameOver && (
                <div className="p-8 text-center border rounded-md">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                    <h3 className="text-lg font-medium mb-1">记忆游戏</h3>
                    <p className="text-sm text-muted-foreground">
                        点击"开始游戏"按钮开始记忆游戏
                    </p>
                </div>
            )}
        </div>
    );
}

// 反应测试组件
function ReactionTest({ addGameRecord }: { addGameRecord: (gameType: "reaction", score: number) => void }) {
    const { toast } = useToast();
    const [gameState, setGameState] = useState<"idle" | "waiting" | "ready" | "clicked" | "tooEarly">("idle");
    const [startTime, setStartTime] = useState<number>(0);
    const [reactionTime, setReactionTime] = useState<number>(0);
    const [bestTime, setBestTime] = useState<number | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 开始游戏
    const startGame = () => {
        setGameState("waiting");

        // 随机等待1-5秒
        const waitTime = Math.floor(Math.random() * 4000) + 1000;
        timeoutRef.current = setTimeout(() => {
            setGameState("ready");
            setStartTime(Date.now());
        }, waitTime);
    };

    // 处理点击
    const handleClick = () => {
        if (gameState === "waiting") {
            // 点击太早
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            setGameState("tooEarly");

            toast({
                title: "太早了！",
                description: "请等待屏幕变绿再点击",
                variant: "destructive",
            });

            return;
        }

        if (gameState === "ready") {
            const endTime = Date.now();
            const time = endTime - startTime;
            setReactionTime(time);
            setGameState("clicked");

            // 更新最佳时间
            if (bestTime === null || time < bestTime) {
                setBestTime(time);
            }

            toast({
                title: "反应时间",
                description: `${time} 毫秒`,
            });

            addGameRecord("reaction", time);
        }
    };

    // 重置游戏
    const resetGame = () => {
        setGameState("idle");
        setReactionTime(0);
    };

    return (
        <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">反应测试</h3>
                    <p className="text-sm text-muted-foreground">
                        测试你的反应速度，屏幕变绿时立即点击
                    </p>
                </div>

                {gameState === "idle" && (
                    <Button onClick={startGame}>
                        开始测试
                    </Button>
                )}

                {(gameState === "clicked" || gameState === "tooEarly") && (
                    <Button variant="outline" onClick={resetGame}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        再次测试
                    </Button>
                )}
            </div>

            {bestTime !== null && (
                <div className="flex justify-center">
                    <Badge variant="outline" className="text-lg">
                        最佳时间: {bestTime} 毫秒
                    </Badge>
                </div>
            )}

            <div
                className={`
                    p-8 rounded-lg cursor-pointer text-center
                    ${gameState === "idle" ? "bg-gray-100" :
                        gameState === "waiting" ? "bg-red-500" :
                            gameState === "ready" ? "bg-green-500" :
                                gameState === "clicked" ? "bg-blue-500" :
                                    "bg-yellow-500"}
                `}
                onClick={handleClick}
            >
                {gameState === "idle" && (
                    <div>
                        <Zap className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                        <h3 className="text-lg font-medium">点击"开始测试"按钮开始</h3>
                    </div>
                )}

                {gameState === "waiting" && (
                    <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2">等待...</h3>
                        <p>屏幕变绿时立即点击</p>
                    </div>
                )}

                {gameState === "ready" && (
                    <div className="text-white">
                        <h3 className="text-3xl font-bold">立即点击！</h3>
                    </div>
                )}

                {gameState === "clicked" && (
                    <div>
                        <h3 className="text-2xl font-bold mb-2 text-white">你的反应时间</h3>
                        <p className="text-4xl font-bold text-white">{reactionTime} 毫秒</p>
                    </div>
                )}

                {gameState === "tooEarly" && (
                    <div className="text-white">
                        <h3 className="text-2xl font-bold mb-2">太早了！</h3>
                        <p>请等待屏幕变绿再点击</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// 点击挑战组件
function ClickChallenge({ addGameRecord }: { addGameRecord: (gameType: "click", score: number) => void }) {
    const { toast } = useToast();
    const [gameActive, setGameActive] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [targetPosition, setTargetPosition] = useState({ x: 50, y: 50 });

    // 开始游戏
    const startGame = () => {
        setGameActive(true);
        setGameOver(false);
        setScore(0);
        setTimeLeft(10);
        moveTarget();
    };

    // 移动目标
    const moveTarget = () => {
        const x = Math.floor(Math.random() * 80) + 10; // 10% - 90%
        const y = Math.floor(Math.random() * 80) + 10; // 10% - 90%
        setTargetPosition({ x, y });
    };

    // 点击目标
    const handleTargetClick = () => {
        if (!gameActive || gameOver) return;

        setScore(prev => prev + 1);
        moveTarget();
    };

    // 计时器
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameActive && !gameOver && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGameActive(false);
                        setGameOver(true);

                        toast({
                            title: "游戏结束",
                            description: `你的得分是 ${score}`,
                        });

                        addGameRecord("click", score);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [gameActive, gameOver, timeLeft, score, toast, addGameRecord]);

    return (
        <div className="space-y-4 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium">点击挑战</h3>
                    <p className="text-sm text-muted-foreground">
                        在限定时间内点击尽可能多的目标
                    </p>
                </div>

                {!gameActive && !gameOver && (
                    <Button onClick={startGame}>
                        开始游戏
                    </Button>
                )}

                {gameActive && (
                    <Button variant="destructive" onClick={() => {
                        setGameActive(false);
                        setGameOver(true);
                        addGameRecord("click", score);
                    }}>
                        结束游戏
                    </Button>
                )}

                {gameOver && (
                    <Button variant="outline" onClick={startGame}>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        重新开始
                    </Button>
                )}
            </div>

            {(gameActive || gameOver) && (
                <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-lg">
                        得分: {score}
                    </Badge>
                    <div className="flex items-center">
                        <Timer className="mr-1 h-4 w-4" />
                        <span className={`${timeLeft < 3 ? 'text-red-500' : ''}`}>
                            {timeLeft}秒
                        </span>
                    </div>
                </div>
            )}

            <div
                className="relative h-[300px] border rounded-lg overflow-hidden bg-gray-50"
                style={{ cursor: gameActive && !gameOver ? 'none' : 'default' }}
            >
                {!gameActive && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <MousePointer className="h-12 w-12 mx-auto mb-2 text-primary/50" />
                            <h3 className="text-lg font-medium mb-1">点击挑战</h3>
                            <p className="text-sm text-muted-foreground">
                                点击"开始游戏"按钮开始点击挑战
                            </p>
                        </div>
                    </div>
                )}

                {gameActive && !gameOver && (
                    <motion.div
                        className="absolute w-10 h-10 bg-primary rounded-full flex items-center justify-center"
                        style={{
                            left: `${targetPosition.x}%`,
                            top: `${targetPosition.y}%`,
                            transform: 'translate(-50%, -50%)'
                        }}
                        animate={{ scale: [0.8, 1, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        onClick={handleTargetClick}
                    >
                        <Sparkles className="h-5 w-5 text-white" />
                    </motion.div>
                )}

                {gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="p-4 bg-primary/10 rounded-md text-center">
                            <Award className="h-8 w-8 mx-auto mb-2" />
                            <h3 className="text-lg font-medium">游戏结束</h3>
                            <p>你的最终得分: {score}</p>
                            <p className="text-sm text-muted-foreground">
                                平均每秒: {(score / 10).toFixed(1)} 次点击
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}