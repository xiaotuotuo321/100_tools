"use client";

import { useState, useEffect, useRef } from "react";
import type { FunctionPlotOptions } from "function-plot";

// 定义 functionPlot 的类型
type FunctionPlotType = (options: FunctionPlotOptions) => void;
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash, RefreshCw, ZoomIn, ZoomOut, MoveHorizontal, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getRandomColor } from "@/lib/utils";

// 函数图形计算器组件
export default function GraphCalculator() {
  const { toast } = useToast();
  const plotContainerRef = useRef<HTMLDivElement>(null);
  const [functionPlot, setFunctionPlot] = useState<FunctionPlotType | null>(null);
  const [functions, setFunctions] = useState<Array<{
    id: string;
    expression: string;
    color: string;
    visible: boolean;
  }>>([
    { id: "f1", expression: "x^2", color: "#ff0000", visible: true },
    { id: "f2", expression: "sin(x)", color: "#0000ff", visible: true },
  ]);
  const [newFunction, setNewFunction] = useState("");
  const [xRange, setXRange] = useState<[number, number]>([-10, 10]);
  const [yRange, setYRange] = useState<[number, number]>([-10, 10]);
  const [showGrid, setShowGrid] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 动态导入function-plot库
  useEffect(() => {
    const loadFunctionPlot = async () => {
      try {
        const functionPlotModule = await import("function-plot");
        setFunctionPlot(() => functionPlotModule.default);
      } catch (err) {
        console.error("Failed to load function-plot:", err);
        setError("无法加载绘图库，请刷新页面重试。");
      }
    };
    
    loadFunctionPlot();
  }, []);

  // 绘制函数图形
  const drawPlot = () => {
    if (!functionPlot || !plotContainerRef.current) return;

    try {
      // 清除之前的图形
      plotContainerRef.current.innerHTML = "";

      // 准备可见函数的数据
      const visibleFunctions = functions
        .filter((f) => f.visible)
        .map((f) => ({
          fn: f.expression,
          color: f.color,
        }));

      if (visibleFunctions.length === 0) {
        // 如果没有可见函数，绘制一个空图形
        functionPlot({
          target: plotContainerRef.current,
          width: plotContainerRef.current.clientWidth,
          height: 400,
          grid: showGrid,
          xAxis: { domain: xRange },
          yAxis: { domain: yRange },
          data: [],
        });
        return;
      }

      // 绘制函数图形
      functionPlot({
        target: plotContainerRef.current,
        width: plotContainerRef.current.clientWidth,
        height: 400,
        grid: showGrid,
        xAxis: { domain: xRange },
        yAxis: { domain: yRange },
        disableZoom: false,
        data: visibleFunctions,
      });

      setError(null);
    } catch (err) {
      console.error("Plot error:", err);
      setError("绘图错误，请检查函数表达式是否正确。");
    }
  };

  // 添加新函数
  const addFunction = () => {
    if (!newFunction.trim()) {
      toast({
        title: "错误",
        description: "请输入函数表达式",
        variant: "destructive",
      });
      return;
    }

    try {
      // 尝试解析函数表达式
      const newId = `f${functions.length + 1}`;
      const newColor = getRandomColor();
      
      setFunctions([
        ...functions,
        { id: newId, expression: newFunction, color: newColor, visible: true },
      ]);
      
      setNewFunction("");
      
      toast({
        title: "成功",
        description: `已添加函数: ${newFunction}`,
      });
    } catch (err) {
      toast({
        title: "错误",
        description: "函数表达式无效",
        variant: "destructive",
      });
    }
  };

  // 删除函数
  const deleteFunction = (id: string) => {
    setFunctions(functions.filter((f) => f.id !== id));
  };

  // 切换函数可见性
  const toggleFunctionVisibility = (id: string) => {
    setFunctions(
      functions.map((f) =>
        f.id === id ? { ...f, visible: !f.visible } : f
      )
    );
  };

  // 重置视图
  const resetView = () => {
    setXRange([-10, 10]);
    setYRange([-10, 10]);
  };

  // 放大
  const zoomIn = () => {
    const xCenter = (xRange[0] + xRange[1]) / 2;
    const yCenter = (yRange[0] + yRange[1]) / 2;
    const xWidth = (xRange[1] - xRange[0]) * 0.8;
    const yWidth = (yRange[1] - yRange[0]) * 0.8;
    
    setXRange([xCenter - xWidth / 2, xCenter + xWidth / 2]);
    setYRange([yCenter - yWidth / 2, yCenter + yWidth / 2]);
  };

  // 缩小
  const zoomOut = () => {
    const xCenter = (xRange[0] + xRange[1]) / 2;
    const yCenter = (yRange[0] + yRange[1]) / 2;
    const xWidth = (xRange[1] - xRange[0]) * 1.2;
    const yWidth = (yRange[1] - yRange[0]) * 1.2;
    
    setXRange([xCenter - xWidth / 2, xCenter + xWidth / 2]);
    setYRange([yCenter - yWidth / 2, yCenter + yWidth / 2]);
  };

  // 保存图像
  const saveImage = () => {
    if (!plotContainerRef.current) return;
    
    try {
      const svg = plotContainerRef.current.querySelector("svg");
      if (!svg) {
        toast({
          title: "错误",
          description: "无法找到SVG元素",
          variant: "destructive",
        });
        return;
      }
      
      // 创建一个新的SVG元素，复制原始SVG的内容
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      
      // 设置canvas大小
      canvas.width = svg.clientWidth;
      canvas.height = svg.clientHeight;
      
      // 创建Image对象
      const img = new Image();
      img.onload = () => {
        // 绘制图像到canvas
        if (ctx) {
          ctx.fillStyle = "white";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          // 转换为数据URL并下载
          const dataUrl = canvas.toDataURL("image/png");
          const a = document.createElement("a");
          a.href = dataUrl;
          a.download = "function-plot.png";
          a.click();
        }
      };
      
      // 设置SVG数据
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
      
      toast({
        title: "成功",
        description: "图像已保存",
      });
    } catch (err) {
      console.error("Save image error:", err);
      toast({
        title: "错误",
        description: "保存图像失败",
        variant: "destructive",
      });
    }
  };

  // 当组件挂载、函数列表、范围或网格设置变化时，重新绘制图形
  useEffect(() => {
    drawPlot();
  }, [functionPlot, functions, xRange, yRange, showGrid]);

  // 当窗口大小变化时，重新绘制图形
  useEffect(() => {
    const handleResize = () => {
      drawPlot();
    };
    
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [functionPlot, functions, xRange, yRange, showGrid]);

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>图形计算器</CardTitle>
          <CardDescription>
            绘制和可视化数学函数，支持多函数比较、缩放和自定义范围。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="plot">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plot">图形</TabsTrigger>
              <TabsTrigger value="functions">函数管理</TabsTrigger>
            </TabsList>
            
            <TabsContent value="plot" className="space-y-4">
              {/* 图形显示区域 */}
              <div className="border rounded-lg p-4 bg-background">
                <div ref={plotContainerRef} className="w-full h-[400px]"></div>
                {error && (
                  <div className="mt-2 p-2 bg-destructive/10 text-destructive rounded text-sm">
                    {error}
                  </div>
                )}
              </div>
              
              {/* 控制按钮 */}
              <div className="flex flex-wrap gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={resetView}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  重置视图
                </Button>
                <Button variant="outline" size="sm" onClick={zoomIn}>
                  <ZoomIn className="h-4 w-4 mr-2" />
                  放大
                </Button>
                <Button variant="outline" size="sm" onClick={zoomOut}>
                  <ZoomOut className="h-4 w-4 mr-2" />
                  缩小
                </Button>
                <Button variant="outline" size="sm" onClick={saveImage}>
                  <Download className="h-4 w-4 mr-2" />
                  保存图像
                </Button>
              </div>
              
              {/* 范围设置 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="x-range">X 范围: [{xRange[0]}, {xRange[1]}]</Label>
                  </div>
                  <Slider
                    id="x-range"
                    min={-100}
                    max={100}
                    step={1}
                    value={xRange}
                    onValueChange={(value) => setXRange([value[0], value[1]])}
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="y-range">Y 范围: [{yRange[0]}, {yRange[1]}]</Label>
                  </div>
                  <Slider
                    id="y-range"
                    min={-100}
                    max={100}
                    step={1}
                    value={yRange}
                    onValueChange={(value) => setYRange([value[0], value[1]])}
                  />
                </div>
              </div>
              
              {/* 网格设置 */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-grid"
                  checked={showGrid}
                  onCheckedChange={setShowGrid}
                />
                <Label htmlFor="show-grid">显示网格</Label>
              </div>
              
              {/* 函数列表 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">当前函数:</h3>
                <div className="flex flex-wrap gap-2">
                  {functions.map((f) => (
                    <Badge
                      key={f.id}
                      variant={f.visible ? "default" : "outline"}
                      style={{ backgroundColor: f.visible ? f.color : undefined }}
                      className="cursor-pointer"
                      onClick={() => toggleFunctionVisibility(f.id)}
                    >
                      {f.expression}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="functions" className="space-y-4">
              {/* 添加新函数 */}
              <div className="flex space-x-2">
                <Input
                  value={newFunction}
                  onChange={(e) => setNewFunction(e.target.value)}
                  placeholder="输入函数表达式，例如: x^2, sin(x), cos(2*x)"
                  className="flex-1"
                />
                <Button onClick={addFunction}>
                  <Plus className="h-4 w-4 mr-2" />
                  添加
                </Button>
              </div>
              
              <Separator />
              
              {/* 函数列表 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">函数列表:</h3>
                {functions.length === 0 ? (
                  <p className="text-center py-4 text-muted-foreground">暂无函数</p>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <div className="space-y-2">
                      {functions.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between p-2 border rounded-md"
                          style={{ borderColor: f.color }}
                        >
                          <div className="flex items-center space-x-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: f.color }}
                            ></div>
                            <span className="font-mono">{f.expression}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={f.visible}
                              onCheckedChange={() => toggleFunctionVisibility(f.id)}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteFunction(f.id)}
                            >
                              <Trash className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </div>
              
              {/* 函数语法帮助 */}
              <Card className="bg-muted/50">
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">函数语法帮助:</h3>
                  <div className="text-sm space-y-1">
                    <p><span className="font-mono">x^2</span> - 平方函数</p>
                    <p><span className="font-mono">sqrt(x)</span> - 平方根</p>
                    <p><span className="font-mono">sin(x), cos(x), tan(x)</span> - 三角函数</p>
                    <p><span className="font-mono">log(x)</span> - 自然对数</p>
                    <p><span className="font-mono">exp(x)</span> - 指数函数</p>
                    <p><span className="font-mono">abs(x)</span> - 绝对值</p>
                    <p><span className="font-mono">x^2 + 2*x + 1</span> - 多项式</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}