"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Copy, Calculator, Info, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 定义历史记录项类型
interface HistoryItem {
    birthDate: string;
    referenceDate: string;
    result: {
        years: number;
        months: number;
        days: number;
        totalDays: number;
    };
    timestamp: number;
}

export default function AgeCalculator() {
    const { toast } = useToast();
    const [birthDate, setBirthDate] = useState<string>("");
    const [referenceDate, setReferenceDate] = useState<string>(new Date().toISOString().split('T')[0]);
    const [result, setResult] = useState<{
        years: number;
        months: number;
        days: number;
        totalDays: number;
    } | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // 计算年龄
    const calculateAge = () => {
        if (!birthDate) {
            toast({
                title: "输入错误",
                description: "请输入出生日期。",
                variant: "destructive",
            });
            return;
        }

        const birthDateObj = new Date(birthDate);
        const referenceDateObj = referenceDate ? new Date(referenceDate) : new Date();

        // 验证日期有效性
        if (isNaN(birthDateObj.getTime()) || isNaN(referenceDateObj.getTime())) {
            toast({
                title: "输入错误",
                description: "请输入有效的日期格式。",
                variant: "destructive",
            });
            return;
        }

        // 验证出生日期不能在参考日期之后
        if (birthDateObj > referenceDateObj) {
            toast({
                title: "输入错误",
                description: "出生日期不能在参考日期之后。",
                variant: "destructive",
            });
            return;
        }

        // 计算年龄（年、月、日）
        let years = referenceDateObj.getFullYear() - birthDateObj.getFullYear();
        let months = referenceDateObj.getMonth() - birthDateObj.getMonth();
        let days = referenceDateObj.getDate() - birthDateObj.getDate();

        // 调整月份和天数
        if (days < 0) {
            months--;
            // 获取上个月的天数
            const lastMonth = new Date(referenceDateObj.getFullYear(), referenceDateObj.getMonth(), 0);
            days += lastMonth.getDate();
        }

        if (months < 0) {
            years--;
            months += 12;
        }

        // 计算总天数
        const diffTime = Math.abs(referenceDateObj.getTime() - birthDateObj.getTime());
        const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        const ageResult = {
            years,
            months,
            days,
            totalDays
        };

        setResult(ageResult);

        // 添加到历史记录
        const newHistoryItem: HistoryItem = {
            birthDate,
            referenceDate: referenceDate || new Date().toISOString().split('T')[0],
            result: ageResult,
            timestamp: Date.now(),
        };

        setHistory(prev => {
            // 限制历史记录最多10条
            const updatedHistory = [newHistoryItem, ...prev];
            if (updatedHistory.length > 10) {
                updatedHistory.pop();
            }
            return updatedHistory;
        });
    };

    // 复制结果
    const copyResult = () => {
        if (result) {
            const resultText = `年龄: ${result.years}年 ${result.months}个月 ${result.days}天 (总共${result.totalDays}天)`;
            navigator.clipboard.writeText(resultText);
            toast({
                title: "已复制到剪贴板",
                description: "年龄计算结果已复制到剪贴板。",
            });
        }
    };

    // 清除历史记录
    const clearHistory = () => {
        setHistory([]);
    };

    // 从历史记录中加载数据
    const loadFromHistory = (item: HistoryItem) => {
        setBirthDate(item.birthDate);
        setReferenceDate(item.referenceDate);
        setResult(item.result);
    };

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // 格式化日期显示
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    // 重置输入
    const resetInputs = () => {
        setBirthDate("");
        setReferenceDate(new Date().toISOString().split('T')[0]);
        setResult(null);
    };

    // 设置今天日期为参考日期
    const setTodayAsReference = () => {
        setReferenceDate(new Date().toISOString().split('T')[0]);
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>年龄计算器</CardTitle>
                    <CardDescription>
                        根据出生日期计算准确年龄，包括年、月、日和总天数。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="calculator">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="calculator">计算器</TabsTrigger>
                            <TabsTrigger value="history">历史记录</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-4">
                            {/* 日期输入 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="birthDate">出生日期</Label>
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="referenceDate">参考日期 (默认为今天)</Label>
                                    <div className="flex space-x-2">
                                        <Input
                                            id="referenceDate"
                                            type="date"
                                            value={referenceDate}
                                            onChange={(e) => setReferenceDate(e.target.value)}
                                        />
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={setTodayAsReference}
                                            title="设置为今天"
                                        >
                                            <Calendar className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* 计算按钮 */}
                            <div className="flex justify-center">
                                <Button onClick={calculateAge} className="w-full sm:w-auto">
                                    <Calculator className="h-4 w-4 mr-2" />
                                    计算年龄
                                </Button>
                            </div>

                            {/* 结果显示 */}
                            {result && (
                                <Card className="bg-primary/10">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium">年龄结果</h3>
                                                <div className="space-y-1 mt-2">
                                                    <p className="text-lg">
                                                        <span className="font-medium">{result.years}</span> 年
                                                        <span className="font-medium">{result.months}</span> 个月
                                                        <span className="font-medium">{result.days}</span> 天
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        总共 <span className="font-medium">{result.totalDays}</span> 天
                                                    </p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={copyResult}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 年龄计算说明 */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="flex items-center mb-2">
                                        <Info className="h-4 w-4 mr-2" />
                                        <h3 className="font-medium">关于年龄计算</h3>
                                    </div>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <p>
                                            年龄计算器可以精确计算从出生日期到参考日期之间的年龄，包括年、月、日和总天数。
                                        </p>
                                        <p>
                                            计算方法考虑了闰年、不同月份的天数等因素，确保结果的准确性。
                                        </p>
                                        <p>
                                            您可以使用此计算器来：
                                        </p>
                                        <ul className="list-disc pl-5 space-y-1">
                                            <li>计算精确年龄</li>
                                            <li>计算特定日期之间的时间间隔</li>
                                            <li>计算重要事件的周年纪念日</li>
                                            <li>计算法定年龄要求（如退休、领取福利等）</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="history">
                            {history.length === 0 ? (
                                <p className="text-center py-4 text-muted-foreground">暂无历史记录</p>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={clearHistory}>
                                            清除历史记录
                                        </Button>
                                    </div>

                                    <Accordion type="single" collapsible className="w-full">
                                        {history.map((item, index) => (
                                            <AccordionItem key={index} value={`item-${index}`}>
                                                <AccordionTrigger>
                                                    <div className="flex flex-col items-start">
                                                        <span>
                                                            {item.result.years}年 {item.result.months}个月 {item.result.days}天
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTimestamp(item.timestamp)}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="text-sm font-medium">出生日期: </span>
                                                                <span className="text-sm">
                                                                    {formatDate(item.birthDate)}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium">参考日期: </span>
                                                                <span className="text-sm">
                                                                    {formatDate(item.referenceDate)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        <div>
                                                            <span className="text-sm font-medium">年龄: </span>
                                                            <span className="text-sm">
                                                                {item.result.years}年 {item.result.months}个月 {item.result.days}天
                                                                (总共{item.result.totalDays}天)
                                                            </span>
                                                        </div>

                                                        <div className="flex justify-end">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => loadFromHistory(item)}
                                                            >
                                                                重用
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        ))}
                                    </Accordion>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}