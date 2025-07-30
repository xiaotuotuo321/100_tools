"use client";

import { useState, useEffect } from "react";
import * as math from "mathjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2, RotateCcw, ArrowLeft, Copy } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ScientificCalculator() {
  const { toast } = useToast();
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");
  const [memory, setMemory] = useState<number | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isRadians, setIsRadians] = useState(true);
  const [lastResult, setLastResult] = useState<number | null>(null);

  // 处理数字按钮点击
  const handleNumberClick = (num: string) => {
    if (display === "0" || display === "Error") {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
    setExpression(expression + num);
  };

  // 处理运算符按钮点击
  const handleOperatorClick = (operator: string) => {
    if (display === "Error") {
      return;
    }
    
    let op = operator;
    switch (operator) {
      case "×":
        op = "*";
        break;
      case "÷":
        op = "/";
        break;
    }
    
    setDisplay("0");
    setExpression(expression + op);
  };

  // 处理函数按钮点击
  const handleFunctionClick = (func: string) => {
    if (display === "Error") {
      return;
    }
    
    let value = parseFloat(display);
    let result: math.MathType = 0;
    
    try {
      switch (func) {
        case "sin":
        case "cos":
        case "tan":
          value = isRadians ? value : (value * Math.PI / 180);
          result = math.evaluate(`${func}(${value})`);
          break;
        case "log":
          result = math.log10(value);
          break;
        case "ln":
          result = math.log(value);
          break;
        case "sqrt":
          result = math.sqrt(value);
          break;
        case "x^2":
          result = math.pow(value, 2);
          break;
        case "x^y":
          setExpression(expression + "^");
          setDisplay("0");
          return;
        case "1/x":
          result = 1 / value;
          break;
      }
      
      setDisplay(typeof result === 'number' ? result.toString() : math.format(result));
      setExpression(`${func}(${expression})`);
      setLastResult(typeof result === 'number' ? result : null);
    } catch (error) {
      setDisplay("Error");
    }
  };

  // 处理常数按钮点击
  const handleConstantClick = (constant: string) => {
    let value = 0;
    
    switch (constant) {
      case "π":
        value = math.pi;
        break;
      case "e":
        value = math.e;
        break;
    }
    
    if (display === "0" || display === "Error") {
      setDisplay(value.toString());
    } else {
      setDisplay(display + value.toString());
    }
    setExpression(expression + constant);
  };

  // 处理内存按钮点击
  const handleMemoryClick = (action: string) => {
    let value = parseFloat(display);
    
    switch (action) {
      case "MC": // Memory Clear
        setMemory(null);
        break;
      case "MR": // Memory Recall
        if (memory !== null) {
          setDisplay(memory.toString());
          setExpression(memory.toString());
        }
        break;
      case "M+": // Memory Add
        setMemory((prev) => (prev !== null ? prev + value : value));
        break;
      case "M-": // Memory Subtract
        setMemory((prev) => (prev !== null ? prev - value : -value));
        break;
    }
  };

  // 处理清除按钮点击
  const handleClearClick = () => {
    setDisplay("0");
    setExpression("");
  };

  // 处理退格按钮点击
  const handleBackspaceClick = () => {
    if (display === "Error" || display.length === 1) {
      setDisplay("0");
    } else {
      setDisplay(display.slice(0, -1));
    }
    setExpression(expression.slice(0, -1));
  };

  // 处理等于按钮点击
  const handleEqualsClick = () => {
    if (display === "Error" || expression === "") {
      return;
    }
    
    try {
      // 替换表达式中的特殊字符
      let expr = expression.replace(/π/g, "pi").replace(/×/g, "*").replace(/÷/g, "/");
      
      // 计算表达式的值
      const result = math.evaluate(expr);
      
      // 更新显示和历史记录
      const formattedResult = typeof result === 'number' ? result.toString() : math.format(result);
      setDisplay(formattedResult);
      setHistory([...history, `${expression} = ${formattedResult}`]);
      setExpression(formattedResult);
      setLastResult(typeof result === 'number' ? result : null);
    } catch (error) {
      setDisplay("Error");
    }
  };

  // 处理角度/弧度切换
  const handleModeChange = () => {
    setIsRadians(!isRadians);
  };

  // 复制结果到剪贴板
  const handleCopyResult = () => {
    if (display !== "0" && display !== "Error") {
      navigator.clipboard.writeText(display);
      toast({
        title: "已复制到剪贴板",
        description: `结果 ${display} 已复制到剪贴板。`,
      });
    }
  };

  // 清除历史记录
  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>科学计算器</CardTitle>
          <CardDescription>
            一个功能强大的科学计算器，支持基本算术运算、科学函数、常数和内存功能。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="calculator">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="calculator">计算器</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calculator" className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="mode-switch"
                  checked={isRadians}
                  onCheckedChange={handleModeChange}
                />
                <Label htmlFor="mode-switch">
                  {isRadians ? "弧度模式" : "角度模式"}
                </Label>
              </div>
              
              {/* 显示屏 */}
              <div className="flex justify-between items-center">
                <div className="w-full p-4 h-16 bg-secondary rounded-md flex items-center justify-end overflow-x-auto text-2xl">
                  {display}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyResult}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              
              {/* 表达式显示 */}
              <div className="p-2 h-8 bg-muted rounded-md flex items-center overflow-x-auto text-sm text-muted-foreground">
                {expression || "0"}
              </div>
              
              {/* 内存显示 */}
              <div className="p-2 h-8 rounded-md flex items-center text-sm">
                内存: {memory !== null ? memory : "空"}
              </div>
              
              {/* 按钮区域 */}
              <div className="grid grid-cols-5 gap-2">
                {/* 第一行：内存和清除按钮 */}
                <Button variant="outline" onClick={() => handleMemoryClick("MC")}>MC</Button>
                <Button variant="outline" onClick={() => handleMemoryClick("MR")}>MR</Button>
                <Button variant="outline" onClick={() => handleMemoryClick("M+")}>M+</Button>
                <Button variant="outline" onClick={() => handleMemoryClick("M-")}>M-</Button>
                <Button variant="destructive" onClick={handleClearClick}>C</Button>
                
                {/* 第二行：科学函数 */}
                <Button variant="secondary" onClick={() => handleFunctionClick("sin")}>sin</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("cos")}>cos</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("tan")}>tan</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("log")}>log</Button>
                <Button variant="secondary" onClick={handleBackspaceClick}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                
                {/* 第三行：更多科学函数和常数 */}
                <Button variant="secondary" onClick={() => handleFunctionClick("ln")}>ln</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("sqrt")}>√</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("x^2")}>x²</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("x^y")}>x^y</Button>
                <Button variant="secondary" onClick={() => handleFunctionClick("1/x")}>1/x</Button>
                
                {/* 第四行：常数和数字 */}
                <Button variant="secondary" onClick={() => handleConstantClick("π")}>π</Button>
                <Button variant="secondary" onClick={() => handleConstantClick("e")}>e</Button>
                <Button variant="default" onClick={() => handleNumberClick("7")}>7</Button>
                <Button variant="default" onClick={() => handleNumberClick("8")}>8</Button>
                <Button variant="default" onClick={() => handleNumberClick("9")}>9</Button>
                
                {/* 第五行：数字和运算符 */}
                <Button variant="secondary" onClick={() => handleOperatorClick("(")}>(</Button>
                <Button variant="secondary" onClick={() => handleOperatorClick(")")}>)</Button>
                <Button variant="default" onClick={() => handleNumberClick("4")}>4</Button>
                <Button variant="default" onClick={() => handleNumberClick("5")}>5</Button>
                <Button variant="default" onClick={() => handleNumberClick("6")}>6</Button>
                
                {/* 第六行：数字和运算符 */}
                <Button variant="secondary" onClick={() => handleOperatorClick("×")}>×</Button>
                <Button variant="secondary" onClick={() => handleOperatorClick("÷")}>÷</Button>
                <Button variant="default" onClick={() => handleNumberClick("1")}>1</Button>
                <Button variant="default" onClick={() => handleNumberClick("2")}>2</Button>
                <Button variant="default" onClick={() => handleNumberClick("3")}>3</Button>
                
                {/* 第七行：数字和运算符 */}
                <Button variant="secondary" onClick={() => handleOperatorClick("+")}>+</Button>
                <Button variant="secondary" onClick={() => handleOperatorClick("-")}>-</Button>
                <Button variant="default" onClick={() => handleNumberClick("0")}>0</Button>
                <Button variant="default" onClick={() => handleNumberClick(".")}>.</Button>
                <Button variant="default" onClick={handleEqualsClick}>=</Button>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">计算历史</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearHistory}
                    disabled={history.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    清除历史
                  </Button>
                </div>
                
                <Separator />
                
                {history.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">暂无历史记录</p>
                ) : (
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {history.map((item, index) => (
                      <div
                        key={index}
                        className="p-2 bg-secondary/20 rounded-md flex justify-between"
                      >
                        <span>{item}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const result = item.split(" = ")[1];
                            setDisplay(result);
                            setExpression(result);
                          }}
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}