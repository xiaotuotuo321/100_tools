"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Calculator, Info, Scale } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

// 定义历史记录项类型
interface HistoryItem {
    height: number;
    weight: number;
    unit: string;
    bmi: number;
    category: string;
    timestamp: number;
}

// BMI分类标准
const BMI_CATEGORIES = [
    { min: 0, max: 18.5, name: "体重过轻", description: "体重过轻可能导致营养不良、免疫力下降等健康问题。" },
    { min: 18.5, max: 24.9, name: "体重正常", description: "恭喜！您的体重在健康范围内。" },
    { min: 25, max: 29.9, name: "超重", description: "超重可能增加患心脏病、高血压和糖尿病的风险。" },
    { min: 30, max: 34.9, name: "肥胖 (I级)", description: "肥胖会显著增加多种慢性疾病的风险。" },
    { min: 35, max: 39.9, name: "肥胖 (II级)", description: "严重肥胖，健康风险大幅增加。" },
    { min: 40, max: Infinity, name: "极度肥胖 (III级)", description: "极度肥胖会导致严重的健康问题，建议咨询医生。" },
];

export default function BMICalculator() {
    const { toast } = useToast();
    const [height, setHeight] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [unit, setUnit] = useState<string>("metric"); // metric 或 imperial
    const [bmi, setBmi] = useState<number | null>(null);
    const [category, setCategory] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);

    // 计算BMI
    const calculateBMI = () => {
        if (!height || !weight) {
            toast({
                title: "输入错误",
                description: "请输入身高和体重。",
                variant: "destructive",
            });
            return;
        }

        const heightValue = parseFloat(height);
        const weightValue = parseFloat(weight);

        if (isNaN(heightValue) || isNaN(weightValue) || heightValue <= 0 || weightValue <= 0) {
            toast({
                title: "输入错误",
                description: "请输入有效的身高和体重数值。",
                variant: "destructive",
            });
            return;
        }

        let bmiValue: number;

        if (unit === "metric") {
            // 公制：体重(kg) / 身高(m)²
            const heightInMeters = heightValue / 100; // 转换厘米为米
            bmiValue = weightValue / (heightInMeters * heightInMeters);
        } else {
            // 英制：体重(lb) * 703 / 身高(in)²
            bmiValue = (weightValue * 703) / (heightValue * heightValue);
        }

        // 四舍五入到小数点后一位
        bmiValue = Math.round(bmiValue * 10) / 10;

        // 确定BMI分类
        const bmiCategory = getBMICategory(bmiValue);

        setBmi(bmiValue);
        setCategory(bmiCategory.name);

        // 添加到历史记录
        const newHistoryItem: HistoryItem = {
            height: heightValue,
            weight: weightValue,
            unit,
            bmi: bmiValue,
            category: bmiCategory.name,
            timestamp: Date.now(),
        };

        setHistory((prev) => {
            // 限制历史记录最多10条
            const updatedHistory = [newHistoryItem, ...prev];
            if (updatedHistory.length > 10) {
                updatedHistory.pop();
            }
            return updatedHistory;
        });
    };

    // 获取BMI分类
    const getBMICategory = (bmiValue: number) => {
        for (const category of BMI_CATEGORIES) {
            if (bmiValue >= category.min && bmiValue < category.max) {
                return category;
            }
        }
        return BMI_CATEGORIES[BMI_CATEGORIES.length - 1]; // 默认返回最后一个分类
    };

    // 复制结果
    const copyResult = () => {
        if (bmi !== null) {
            navigator.clipboard.writeText(`BMI: ${bmi} - ${category}`);
            toast({
                title: "已复制到剪贴板",
                description: `BMI结果已复制到剪贴板。`,
            });
        }
    };

    // 清除历史记录
    const clearHistory = () => {
        setHistory([]);
    };

    // 从历史记录中加载数据
    const loadFromHistory = (item: HistoryItem) => {
        setHeight(item.height.toString());
        setWeight(item.weight.toString());
        setUnit(item.unit);
        setBmi(item.bmi);
        setCategory(item.category);
    };

    // 格式化时间戳
    const formatTimestamp = (timestamp: number) => {
        return new Date(timestamp).toLocaleString();
    };

    // 获取当前BMI分类的详细信息
    const getCurrentCategoryInfo = () => {
        if (bmi === null) return null;
        return getBMICategory(bmi);
    };

    // 获取BMI分类的颜色
    const getCategoryColor = (categoryName: string) => {
        switch (categoryName) {
            case "体重过轻":
                return "text-blue-500";
            case "体重正常":
                return "text-green-500";
            case "超重":
                return "text-yellow-500";
            case "肥胖 (I级)":
                return "text-orange-500";
            case "肥胖 (II级)":
                return "text-red-500";
            case "极度肥胖 (III级)":
                return "text-red-700";
            default:
                return "";
        }
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>BMI计算器</CardTitle>
                    <CardDescription>
                        计算身体质量指数(BMI)，评估您的体重是否在健康范围内。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="calculator">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="calculator">计算器</TabsTrigger>
                            <TabsTrigger value="history">历史记录</TabsTrigger>
                        </TabsList>

                        <TabsContent value="calculator" className="space-y-4">
                            {/* 单位选择 */}
                            <div className="space-y-2">
                                <Label htmlFor="unit">计量单位</Label>
                                <Select
                                    value={unit}
                                    onValueChange={(value) => {
                                        setUnit(value);
                                        setHeight("");
                                        setWeight("");
                                        setBmi(null);
                                        setCategory(null);
                                    }}
                                >
                                    <SelectTrigger id="unit">
                                        <SelectValue placeholder="选择单位" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="metric">公制 (厘米, 千克)</SelectItem>
                                        <SelectItem value="imperial">英制 (英寸, 磅)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* 身高体重输入 */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="height">
                                        身高 ({unit === "metric" ? "厘米" : "英寸"})
                                    </Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(e.target.value)}
                                        placeholder={`输入身高 ${unit === "metric" ? "(厘米)" : "(英寸)"}`}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight">
                                        体重 ({unit === "metric" ? "千克" : "磅"})
                                    </Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        value={weight}
                                        onChange={(e) => setWeight(e.target.value)}
                                        placeholder={`输入体重 ${unit === "metric" ? "(千克)" : "(磅)"}`}
                                    />
                                </div>
                            </div>

                            {/* 计算按钮 */}
                            <div className="flex justify-center">
                                <Button onClick={calculateBMI} className="w-full sm:w-auto">
                                    <Calculator className="h-4 w-4 mr-2" />
                                    计算BMI
                                </Button>
                            </div>

                            {/* 结果显示 */}
                            {bmi !== null && (
                                <Card className="bg-primary/10">
                                    <CardContent className="pt-4">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <h3 className="font-medium">BMI 结果</h3>
                                                <p className="text-xl font-mono">{bmi}</p>
                                                <p className={`font-medium ${getCategoryColor(category || "")}`}>
                                                    {category}
                                                </p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={copyResult}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {getCurrentCategoryInfo() && (
                                            <div className="mt-4 p-3 bg-background rounded-md">
                                                <div className="flex items-center mb-2">
                                                    <Info className="h-4 w-4 mr-2" />
                                                    <h4 className="font-medium">健康建议</h4>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {getCurrentCategoryInfo()?.description}
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* BMI解释 */}
                            <Card className="bg-muted/50">
                                <CardContent className="pt-4">
                                    <div className="flex items-center mb-2">
                                        <Info className="h-4 w-4 mr-2" />
                                        <h3 className="font-medium">什么是BMI？</h3>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        身体质量指数(BMI)是一个基于身高和体重的简单计算，用于评估一个人是否处于健康体重范围。
                                        BMI不直接测量体脂，但研究表明它与体脂测量有一定相关性。
                                    </p>

                                    <h4 className="font-medium text-sm mb-2">BMI分类标准</h4>
                                    <div className="space-y-1">
                                        {BMI_CATEGORIES.map((cat, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className={getCategoryColor(cat.name)}>{cat.name}</span>
                                                <span>
                                                    {cat.min === 0 ? "< " + cat.max :
                                                        cat.max === Infinity ? "≥ " + cat.min :
                                                            cat.min + " - " + cat.max}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    <p className="text-xs text-muted-foreground mt-4">
                                        注意：BMI是一个简单的筛查工具，不能诊断身体脂肪或健康状况。运动员可能因肌肉量大而BMI偏高，
                                        老年人可能因肌肉量减少而BMI偏低。请咨询医疗专业人士进行全面评估。
                                    </p>
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
                                                        <span>BMI: {item.bmi} - <span className={getCategoryColor(item.category)}>{item.category}</span></span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatTimestamp(item.timestamp)}
                                                        </span>
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent>
                                                    <div className="space-y-2">
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div>
                                                                <span className="text-sm font-medium">身高: </span>
                                                                <span className="text-sm">
                                                                    {item.height} {item.unit === "metric" ? "厘米" : "英寸"}
                                                                </span>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-medium">体重: </span>
                                                                <span className="text-sm">
                                                                    {item.weight} {item.unit === "metric" ? "千克" : "磅"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <Separator />

                                                        <div className="flex justify-between items-center">
                                                            <div>
                                                                <span className="text-sm font-medium">BMI: </span>
                                                                <span className="text-sm font-mono">{item.bmi}</span>
                                                                <span className={`text-sm font-medium ml-2 ${getCategoryColor(item.category)}`}>
                                                                    {item.category}
                                                                </span>
                                                            </div>
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