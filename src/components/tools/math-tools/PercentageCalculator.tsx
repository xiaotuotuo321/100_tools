"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Calculator, Info, Percent } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 定义计算类型
type CalculationType =
    | "percentOfNumber"
    | "numberIsWhatPercent"
    | "percentChange"
    | "percentIncrease"
    | "percentDecrease"
    | "discountCalculator";

// 定义历史记录项类型
interface HistoryItem {
    calculationType: CalculationType;
    inputs: Record<string, string>;
    result: string;
    timestamp: number;
}

// 计算类型定义
const calculationTypes = [
    {
        id: "percentOfNumber" as CalculationType,
        name: "百分比值",
        description: "计算一个数的百分比值"
    },
    {
        id: "numberIsWhatPercent" as CalculationType,
        name: "百分比比例",
        description: "计算一个数是另一个数的百分之几"
    },
    {
        id: "percentChange" as CalculationType,
        name: "百分比变化",
        description: "计算两个数之间的百分比变化"
    },
    {
        id: "percentIncrease" as CalculationType,
        name: "百分比增加",
        description: "计算一个数增加特定百分比后的值"
    },
    {
        id: "percentDecrease" as CalculationType,
        name: "百分比减少",
        description: "计算一个数减少特定百分比后的值"
    },
    {
        id: "discountCalculator" as CalculationType,
        name: "折扣计算器",
        description: "计算折扣价格和节省金额"
    }
];

export default function PercentageCalculator() {
    const { toast } = useToast();
    const [calculationType, setCalculationType] = useState<CalculationType>("percentOfNumber");
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [result, setResult] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // 处理输入变化
    const handleInputChange = (key: string, value: string) => {
        setInputs(prev => ({ ...prev, [key]: value }));
    };

    // 计算结果
    const calculateResult = () => {
        // 验证输入
        const requiredInputs = getRequiredInputs();
        const missingInputs = requiredInputs.filter(input => !inputs[input.id] || inputs[input.id].trim() === "");

        if (missingInputs.length > 0) {
            toast({
                title: "输入错误",
                description: `请填写所有必填字段: ${missingInputs.map(i => i.name).join(", ")}`,
                variant: "destructive",
            });
            return;
        }

        // 转换输入为数字
        const numericInputs: Record<string, number> = {};
        for (const input of requiredInputs) {
            const value = parseFloat(inputs[input.id] || "0");
            if (isNaN(value)) {
                toast({
                    title: "输入错误",
                    description: `${input.name} 不是有效的数字`,
                    variant: "destructive",
                });
                return;
            }
            numericInputs[input.id] = value;
        }

        // 根据计算类型执行计算
        let calculatedResult = "";
        let formattedResult = "";

        switch (calculationType) {
            case "percentOfNumber":
                calculatedResult = ((numericInputs.percent / 100) * numericInputs.number).toString();
                formattedResult = `${numericInputs.percent}% × ${numericInputs.number} = ${parseFloat(calculatedResult).toFixed(2)}`;
                break;

            case "numberIsWhatPercent":
                calculatedResult = ((numericInputs.part / numericInputs.whole) * 100).toString();
                formattedResult = `${numericInputs.part} 是 ${numericInputs.whole} 的 ${parseFloat(calculatedResult).toFixed(2)}%`;
                break;

            case "percentChange":
                const change = ((numericInputs.newValue - numericInputs.oldValue) / numericInputs.oldValue) * 100;
                calculatedResult = change.toString();
                const direction = change >= 0 ? "增加" : "减少";
                formattedResult = `从 ${numericInputs.oldValue} 到 ${numericInputs.newValue} ${direction} 了 ${Math.abs(parseFloat(calculatedResult)).toFixed(2)}%`;
                break;

            case "percentIncrease":
                calculatedResult = (numericInputs.number * (1 + numericInputs.percent / 100)).toString();
                formattedResult = `${numericInputs.number} 增加 ${numericInputs.percent}% 后 = ${parseFloat(calculatedResult).toFixed(2)}`;
                break;

            case "percentDecrease":
                calculatedResult = (numericInputs.number * (1 - numericInputs.percent / 100)).toString();
                formattedResult = `${numericInputs.number} 减少 ${numericInputs.percent}% 后 = ${parseFloat(calculatedResult).toFixed(2)}`;
                break;

            case "discountCalculator":
                const discountedPrice = numericInputs.originalPrice * (1 - numericInputs.discountPercent / 100);
                const savedAmount = numericInputs.originalPrice - discountedPrice;
                calculatedResult = discountedPrice.toString();
                formattedResult = `原价: ${numericInputs.originalPrice.toFixed(2)}, 折扣: ${numericInputs.discountPercent}%, 折后价: ${discountedPrice.toFixed(2)}, 节省: ${savedAmount.toFixed(2)}`;
                break;
        }

        setResult(formattedResult);

        // 添加到历史记录
        const newHistoryItem: HistoryItem = {
            calculationType,
            inputs: { ...inputs },
            result: formattedResult,
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

    // 获取当前计算类型所需的输入字段
    const getRequiredInputs = () => {
        switch (calculationType) {
            case "percentOfNumber":
                return [
                    { id: "percent", name: "百分比值", placeholder: "例如: 25", suffix: "%" },
                    { id: "number", name: "数值", placeholder: "例如: 200", suffix: "" }
                ];

            case "numberIsWhatPercent":
                return [
                    { id: "part", name: "部分值", placeholder: "例如: 25", suffix: "" },
                    { id: "whole", name: "总值", placeholder: "例如: 100", suffix: "" }
                ];

            case "percentChange":
                return [
                    { id: "oldValue", name: "原始值", placeholder: "例如: 100", suffix: "" },
                    { id: "newValue", name: "新值", placeholder: "例如: 125", suffix: "" }
                ];

            case "percentIncrease":
                return [
                    { id: "number", name: "原始值", placeholder: "例如: 100", suffix: "" },
                    { id: "percent", name: "增加百分比", placeholder: "例如: 25", suffix: "%" }
                ];

            case "percentDecrease":
                return [
                    { id: "number", name: "原始值", placeholder: "例如: 100", suffix: "" },
                    { id: "percent", name: "减少百分比", placeholder: "例如: 25", suffix: "%" }
                ];

            case "discountCalculator":
                return [
                    { id: "originalPrice", name: "原价", placeholder: "例如: 100", suffix: "" },
                    { id: "discountPercent", name: "折扣百分比", placeholder: "例如: 25", suffix: "%" }
                ];

            default:
                return [];
        }
    };

    // 复制结果
    const copyResult = () => {
        if (result) {
            navigator.clipboard.writeText(result);
            toast({
                title: "已复制到剪贴板",
                description: "计算结果已复制到剪贴板。",
            });
        }
    };

    // 清除历史记录
    const clearHistory = () => {
        setHistory([]);
    };

    // 从历史记录中加载数据
    const loadFromHistory = (item: HistoryItem) => {
        setCalculationType(item.calculationType);
        setInputs(item.inputs);
        setResult(item.result);
    };

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // 获取当前计算类型的名称
    const getCurrentCalculationTypeName = () => {
        return calculationTypes.find(type => type.id === calculationType)?.name || "";
    };

    // 获取当前计算类型的描述
    const getCurrentCalculationTypeDescription = () => {
        return calculationTypes.find(type => type.id === calculationType)?.description || "";
    };

    // 重置输入
    const resetInputs = () => {
        setInputs({});
        setResult(null);
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>百分比计算器</CardTitle>
                    <CardDescription>
                        快速计算百分比、增长率、折扣等百分比相关的数学问题。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="calculator">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="calculator">计算器</TabsTrigger>
                            <TabsTrigger value="history">历史记录</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-4">
                            {/* 计算类型选择 */}
                            <div className="space-y-2">
                                <Label htmlFor="calculationType">计算类型</Label>
                                <Select
                                    value={calculationType}
                                    onValueChange={(value: CalculationType) => {
                                        setCalculationType(value);
                                        resetInputs();
                                    }}
                                >
                                    <SelectTrigger id="calculationType">
                                        <SelectValue placeholder="选择计算类型" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {calculationTypes.map((type) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                {type.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-sm text-muted-foreground">
                                    {getCurrentCalculationTypeDescription()}
                                </p>
                            </div>

                            {/* 输入字段 */}
                            <div className="space-y-4">
                                <h3 className="font-medium">输入数据</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {getRequiredInputs().map((input) => (
                                        <div key={input.id} className="space-y-2">
                                            <Label htmlFor={input.id}>
                                                {input.name}
                                            </Label>
                                            <div className="relative">
                                                <Input
                                                    id={input.id}
                                                    type="number"
                                                    value={inputs[input.id] || ""}
                                                    onChange={(e) => handleInputChange(input.id, e.target.value)}
                                                    placeholder={input.placeholder}
                                                    className={input.suffix ? "pr-8" : ""}
                                                />
                                                {input.suffix && (
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <span className="text-sm text-muted-foreground">
                                                            {input.suffix}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 计算按钮 */}
                            <div className="flex justify-center">
                                <Button onClick={calculateResult} className="w-full sm:w-auto">
                                    <Calculator className="h-4 w-4 mr-2" />
                                    计算
                                </Button>
                            </div>

                            {/* 结果显示 */}
                            {result && (
                                <Card className="bg-primary/10">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium">计算结果</h3>
                                                <p className="text-xl font-mono">{result}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={copyResult}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* 百分比计算说明 */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="flex items-center mb-2">
                                        <Info className="h-4 w-4 mr-2" />
                                        <h3 className="font-medium">百分比计算公式</h3>
                                    </div>
                                    <div className="space-y-3 text-sm text-muted-foreground">
                                        <div>
                                            <p className="font-medium">百分比值</p>
                                            <p>百分比 × 数值 = 结果</p>
                                            <p className="text-xs">例如：25% × 200 = 50</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">百分比比例</p>
                                            <p>(部分值 ÷ 总值) × 100 = 百分比</p>
                                            <p className="text-xs">例如：(25 ÷ 100) × 100 = 25%</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">百分比变化</p>
                                            <p>((新值 - 原值) ÷ 原值) × 100 = 变化百分比</p>
                                            <p className="text-xs">例如：((125 - 100) ÷ 100) × 100 = 25%</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">百分比增加</p>
                                            <p>原值 × (1 + 百分比/100) = 新值</p>
                                            <p className="text-xs">例如：100 × (1 + 25/100) = 125</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">百分比减少</p>
                                            <p>原值 × (1 - 百分比/100) = 新值</p>
                                            <p className="text-xs">例如：100 × (1 - 25/100) = 75</p>
                                        </div>

                                        <div>
                                            <p className="font-medium">折扣计算</p>
                                            <p>原价 × (1 - 折扣百分比/100) = 折扣价</p>
                                            <p className="text-xs">例如：100 × (1 - 25/100) = 75</p>
                                        </div>
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
                                        {history.map((item, index) => {
                                            const typeName = calculationTypes.find(type => type.id === item.calculationType)?.name || "";

                                            return (
                                                <AccordionItem key={index} value={`item-${index}`}>
                                                    <AccordionTrigger>
                                                        <div className="flex flex-col items-start">
                                                            <span>{typeName}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatTimestamp(item.timestamp)}
                                                            </span>
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent>
                                                        <div className="space-y-2">
                                                            <div>
                                                                <span className="text-sm font-medium">结果: </span>
                                                                <span className="text-sm">{item.result}</span>
                                                            </div>

                                                            <Separator />

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
                                            );
                                        })}
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