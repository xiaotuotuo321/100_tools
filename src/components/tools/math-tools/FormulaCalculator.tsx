"use client";

import { useState, useEffect } from "react";
import * as math from "mathjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Copy, Calculator, History, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// 定义参数类型
interface FormulaParameter {
  id: string;
  name: string;
  unit: string;
  isArray?: boolean;
}

// 定义结果类型
interface FormulaResult {
  name: string;
  unit: string;
}

// 定义公式类型
interface Formula {
  id: string;
  name: string;
  formula: string;
  description: string;
  parameters: FormulaParameter[];
  result: FormulaResult;
  customCalculation?: (params: Record<string, number | string>) => string;
}

// 定义类别类型
interface FormulaCategory {
  id: string;
  name: string;
  formulas: Formula[];
}

// 定义历史记录项类型
interface HistoryItem {
  categoryId: string;
  formulaId: string;
  parameters: Record<string, string>;
  result: string;
  timestamp: number;
}

// 公式类别和公式定义
const formulaCategories: FormulaCategory[] = [
  {
    id: "geometry",
    name: "几何",
    formulas: [
      {
        id: "rectangle-area",
        name: "矩形面积",
        formula: "a * b",
        description: "矩形的面积等于长乘以宽。",
        parameters: [
          { id: "a", name: "长", unit: "m" },
          { id: "b", name: "宽", unit: "m" },
        ],
        result: { name: "面积", unit: "m²" },
      },
      {
        id: "circle-area",
        name: "圆形面积",
        formula: "pi * r^2",
        description: "圆的面积等于π乘以半径的平方。",
        parameters: [
          { id: "r", name: "半径", unit: "m" },
        ],
        result: { name: "面积", unit: "m²" },
      },
      {
        id: "triangle-area",
        name: "三角形面积",
        formula: "0.5 * b * h",
        description: "三角形的面积等于底乘以高的一半。",
        parameters: [
          { id: "b", name: "底", unit: "m" },
          { id: "h", name: "高", unit: "m" },
        ],
        result: { name: "面积", unit: "m²" },
      },
      {
        id: "sphere-volume",
        name: "球体体积",
        formula: "(4/3) * pi * r^3",
        description: "球体的体积等于(4/3)πr³。",
        parameters: [
          { id: "r", name: "半径", unit: "m" },
        ],
        result: { name: "体积", unit: "m³" },
      },
      {
        id: "cylinder-volume",
        name: "圆柱体积",
        formula: "pi * r^2 * h",
        description: "圆柱的体积等于底面积乘以高，即πr²h。",
        parameters: [
          { id: "r", name: "半径", unit: "m" },
          { id: "h", name: "高", unit: "m" },
        ],
        result: { name: "体积", unit: "m³" },
      },
    ],
  },
  {
    id: "physics",
    name: "物理",
    formulas: [
      {
        id: "velocity",
        name: "速度",
        formula: "d / t",
        description: "速度等于距离除以时间。",
        parameters: [
          { id: "d", name: "距离", unit: "m" },
          { id: "t", name: "时间", unit: "s" },
        ],
        result: { name: "速度", unit: "m/s" },
      },
      {
        id: "acceleration",
        name: "加速度",
        formula: "(v - v0) / t",
        description: "加速度等于速度变化量除以时间。",
        parameters: [
          { id: "v", name: "末速度", unit: "m/s" },
          { id: "v0", name: "初速度", unit: "m/s" },
          { id: "t", name: "时间", unit: "s" },
        ],
        result: { name: "加速度", unit: "m/s²" },
      },
      {
        id: "force",
        name: "力",
        formula: "m * a",
        description: "力等于质量乘以加速度。",
        parameters: [
          { id: "m", name: "质量", unit: "kg" },
          { id: "a", name: "加速度", unit: "m/s²" },
        ],
        result: { name: "力", unit: "N" },
      },
      {
        id: "kinetic-energy",
        name: "动能",
        formula: "0.5 * m * v^2",
        description: "动能等于1/2质量乘以速度的平方。",
        parameters: [
          { id: "m", name: "质量", unit: "kg" },
          { id: "v", name: "速度", unit: "m/s" },
        ],
        result: { name: "动能", unit: "J" },
      },
    ],
  },
  {
    id: "math",
    name: "数学",
    formulas: [
      {
        id: "quadratic-formula",
        name: "一元二次方程",
        formula: "(-b ± sqrt(b^2 - 4*a*c)) / (2*a)",
        description: "一元二次方程ax² + bx + c = 0的解。",
        parameters: [
          { id: "a", name: "a", unit: "" },
          { id: "b", name: "b", unit: "" },
          { id: "c", name: "c", unit: "" },
        ],
        result: { name: "x₁, x₂", unit: "" },
        customCalculation: (params: Record<string, number | string>) => {
          if (typeof params.a !== 'number' || typeof params.b !== 'number' || typeof params.c !== 'number') {
            return "参数类型错误";
          }
          
          const a = params.a;
          const b = params.b;
          const c = params.c;
          const discriminant = b * b - 4 * a * c;
          
          if (discriminant < 0) {
            return "无实数解";
          } else if (discriminant === 0) {
            const x = -b / (2 * a);
            return `x = ${x.toFixed(4)}`;
          } else {
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            return `x₁ = ${x1.toFixed(4)}, x₂ = ${x2.toFixed(4)}`;
          }
        },
      },
      {
        id: "pythagorean-theorem",
        name: "勾股定理",
        formula: "a^2 + b^2 = c^2",
        description: "直角三角形中，两直角边的平方和等于斜边的平方。",
        parameters: [
          { id: "a", name: "直角边a", unit: "" },
          { id: "b", name: "直角边b", unit: "" },
        ],
        result: { name: "斜边c", unit: "" },
        customCalculation: (params: Record<string, number | string>) => {
          if (typeof params.a !== 'number' || typeof params.b !== 'number') {
            return "参数类型错误";
          }
          
          const a = params.a;
          const b = params.b;
          const c = Math.sqrt(a * a + b * b);
          return c.toFixed(4);
        },
      },
      {
        id: "compound-interest",
        name: "复利",
        formula: "P * (1 + r/n)^(n*t)",
        description: "复利计算公式，其中P是本金，r是年利率，n是每年复利次数，t是年数。",
        parameters: [
          { id: "P", name: "本金", unit: "" },
          { id: "r", name: "年利率", unit: "" },
          { id: "n", name: "每年复利次数", unit: "" },
          { id: "t", name: "年数", unit: "" },
        ],
        result: { name: "终值", unit: "" },
        customCalculation: (params: Record<string, number | string>) => {
          if (typeof params.P !== 'number' || 
              typeof params.r !== 'number' || 
              typeof params.n !== 'number' || 
              typeof params.t !== 'number') {
            return "参数类型错误";
          }
          
          const principal = params.P;
          const rate = params.r / 100;
          const n = params.n;
          const time = params.t;
          
          const amount = principal * Math.pow(1 + rate / n, n * time);
          return amount.toFixed(2);
        },
      },
    ],
  },
  {
    id: "statistics",
    name: "统计",
    formulas: [
      {
        id: "mean",
        name: "平均值",
        formula: "(x₁ + x₂ + ... + xₙ) / n",
        description: "平均值是所有数据点的和除以数据点的数量。",
        parameters: [
          { id: "values", name: "数据集", unit: "", isArray: true },
        ],
        result: { name: "平均值", unit: "" },
        customCalculation: (params: Record<string, number | string>) => {
          if (typeof params.values !== 'string') {
            return "参数类型错误";
          }
          
          if (params.values.trim() === '') {
            return "请输入数据";
          }
          
          const valueStrings = params.values.split(",");
          const values: number[] = [];
          
          for (const valueStr of valueStrings) {
            const trimmed = valueStr.trim();
            if (trimmed === '') continue;
            
            const value = parseFloat(trimmed);
            if (isNaN(value)) {
              return `无效的数值: "${trimmed}"`;
            }
            values.push(value);
          }
          
          if (values.length === 0) {
            return "请输入至少一个有效数值";
          }
          
          const sum = values.reduce((a, b) => a + b, 0);
          return (sum / values.length).toFixed(4);
        },
      },
      {
        id: "standard-deviation",
        name: "标准差",
        formula: "sqrt((Σ(x - μ)²) / n)",
        description: "标准差是数据点与平均值差的平方的平均值的平方根。",
        parameters: [
          { id: "values", name: "数据集", unit: "", isArray: true },
        ],
        result: { name: "标准差", unit: "" },
        customCalculation: (params: Record<string, number | string>) => {
          if (typeof params.values !== 'string') {
            return "参数类型错误";
          }
          
          if (params.values.trim() === '') {
            return "请输入数据";
          }
          
          const valueStrings = params.values.split(",");
          const values: number[] = [];
          
          for (const valueStr of valueStrings) {
            const trimmed = valueStr.trim();
            if (trimmed === '') continue;
            
            const value = parseFloat(trimmed);
            if (isNaN(value)) {
              return `无效的数值: "${trimmed}"`;
            }
            values.push(value);
          }
          
          if (values.length <= 1) {
            return "请输入至少两个有效数值";
          }
          
          const mean = values.reduce((a, b) => a + b, 0) / values.length;
          const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
          return Math.sqrt(variance).toFixed(4);
        },
      },
    ],
  },
];

export default function FormulaCalculator() {
  const { toast } = useToast();
  const [categoryId, setCategoryId] = useState(formulaCategories[0].id);
  const [formulaId, setFormulaId] = useState(formulaCategories[0].formulas[0].id);
  const [parameters, setParameters] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // 获取当前类别
  const getCurrentCategory = () => {
    return formulaCategories.find((cat) => cat.id === categoryId);
  };

  // 获取当前公式
  const getCurrentFormula = () => {
    const category = getCurrentCategory();
    return category?.formulas.find((f) => f.id === formulaId);
  };

  // 计算公式结果
  const calculateResult = () => {
    const formula = getCurrentFormula();
    if (!formula) return;

    try {
      // 检查所有参数是否已填写
      const missingParams = formula.parameters.filter(
        (param) => !parameters[param.id] || parameters[param.id].trim() === ""
      );

      if (missingParams.length > 0) {
        setResult(`请填写所有参数: ${missingParams.map((p) => p.name).join(", ")}`);
        return;
      }

      // 将参数值转换为数字
      const numericParams: Record<string, number | string> = {};
      for (const param of formula.parameters) {
        if (param.isArray) {
          numericParams[param.id] = parameters[param.id];
        } else {
          if (typeof parameters[param.id] !== 'string') {
            setResult(`参数 ${param.name} 类型错误`);
            return;
          }
          const value = parseFloat(parameters[param.id]);
          if (isNaN(value)) {
            setResult(`参数 ${param.name} 不是有效的数字`);
            return;
          }
          numericParams[param.id] = value;
        }
      }

      // 使用自定义计算函数或math.js计算结果
      let calculatedResult;
      if (formula.customCalculation) {
        calculatedResult = formula.customCalculation(numericParams);
      } else {
        // 替换公式中的参数
        let expr = formula.formula;
        for (const paramId in numericParams) {
          const param = formula.parameters.find(p => p.id === paramId);
          
          if (!param) {
            setResult(`找不到参数 ${paramId}`);
            return;
          }
          
          if (param.isArray) {
            // 如果是数组参数，我们不能直接替换到公式中
            // 数组参数通常需要自定义计算函数处理
            setResult(`参数 ${param.name} 是数组类型，需要使用自定义计算函数`);
            return;
          } else if (typeof numericParams[paramId] === 'number') {
            expr = expr.replace(new RegExp(paramId, "g"), numericParams[paramId].toString());
          }
        }
        
        // 计算表达式
        try {
          calculatedResult = math.evaluate(expr);
          calculatedResult = typeof calculatedResult === 'number' 
            ? calculatedResult.toFixed(4) 
            : calculatedResult.toString();
        } catch (evalError) {
          setResult(`计算错误: ${evalError instanceof Error ? evalError.message : String(evalError)}`);
          return;
        }
      }

      setResult(calculatedResult);

      // 添加到历史记录
      const newHistoryItem = {
        categoryId,
        formulaId,
        parameters: { ...parameters },
        result: calculatedResult,
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
    } catch (error) {
      console.error("计算错误:", error);
      setResult("计算错误");
    }
  };

  // 复制结果
  const copyResult = () => {
    if (result && result !== "计算错误") {
      navigator.clipboard.writeText(result);
      toast({
        title: "已复制到剪贴板",
        description: `结果 ${result} 已复制到剪贴板。`,
      });
    }
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
  };

  // 从历史记录中加载公式
  const loadFromHistory = (historyItem: HistoryItem) => {
    setCategoryId(historyItem.categoryId);
    setFormulaId(historyItem.formulaId);
    setParameters(historyItem.parameters);
    setResult(historyItem.result);
  };

  // 当类别变化时，更新公式
  useEffect(() => {
    const category = getCurrentCategory();
    if (category && category.formulas.length > 0) {
      setFormulaId(category.formulas[0].id);
    }
  }, [categoryId]);

  // 当公式变化时，重置参数和结果
  useEffect(() => {
    const formula = getCurrentFormula();
    if (formula) {
      const initialParams: Record<string, string> = {};
      formula.parameters.forEach((param) => {
        initialParams[param.id] = "";
      });
      setParameters(initialParams);
      setResult(null);
    }
  }, [formulaId]);

  // 格式化时间戳
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>数学公式计算器</CardTitle>
          <CardDescription>
            计算各种数学、物理、几何和统计公式，提供常用公式选择和详细说明。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">计算器</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-4">
              {/* 公式类别和公式选择 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">公式类别</Label>
                  <Select
                    value={categoryId}
                    onValueChange={(value) => setCategoryId(value)}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="选择公式类别" />
                    </SelectTrigger>
                    <SelectContent>
                      {formulaCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="formula">公式</Label>
                  <Select
                    value={formulaId}
                    onValueChange={(value) => setFormulaId(value)}
                  >
                    <SelectTrigger id="formula">
                      <SelectValue placeholder="选择公式" />
                    </SelectTrigger>
                    <SelectContent>
                      {getCurrentCategory()?.formulas.map((formula) => (
                        <SelectItem key={formula.id} value={formula.id}>
                          {formula.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* 公式说明 */}
              {getCurrentFormula() && (
                <Card className="bg-muted/50">
                  <CardContent className="pt-4">
                    <div className="flex items-center mb-2">
                      <Info className="h-4 w-4 mr-2" />
                      <h3 className="font-medium">{getCurrentFormula()?.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {getCurrentFormula()?.description}
                    </p>
                    <div className="bg-background p-2 rounded-md text-center">
                      <span className="font-mono">{getCurrentFormula()?.formula}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {/* 参数输入 */}
              <div className="space-y-4">
                <h3 className="font-medium">参数输入</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {getCurrentFormula()?.parameters?.map((param) => (
                    <div key={param.id} className="space-y-2">
                      <Label htmlFor={param.id}>
                        {param.name} {param.unit && `(${param.unit})`}
                      </Label>
                      <Input
                        id={param.id}
                        value={parameters[param.id] || ""}
                        onChange={(e) =>
                          setParameters({ ...parameters, [param.id]: e.target.value })
                        }
                        placeholder={param.isArray ? "例如: 1, 2, 3, 4, 5" : "输入数值"}
                      />
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
              {result !== null && (
                <Card className="bg-primary/10">
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">
                          {getCurrentFormula()?.result.name}{" "}
                          {getCurrentFormula()?.result.unit && `(${getCurrentFormula()?.result.unit})`}
                        </h3>
                        <p className="text-xl font-mono">{result}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={copyResult}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
                      const category = formulaCategories.find((c) => c.id === item.categoryId);
                      const formula = category?.formulas.find((f) => f.id === item.formulaId);
                      
                      return (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>
                            <div className="flex flex-col items-start">
                              <span>{formula?.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(item.timestamp)}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-2">
                              <div className="grid grid-cols-2 gap-2">
                                {formula?.parameters.map((param) => (
                                  <div key={param.id}>
                                    <span className="text-sm font-medium">
                                      {param.name}{param.isArray ? " (数组)" : ""}: 
                                    </span>{" "}
                                    <span className="text-sm">
                                      {item.parameters[param.id]} {param.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                              
                              <Separator />
                              
                              <div className="flex justify-between items-center">
                                <div>
                                  <span className="text-sm font-medium">
                                    {formula?.result.name}:
                                  </span>{" "}
                                  <span className="text-sm font-mono">
                                    {item.result} {formula?.result.unit}
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