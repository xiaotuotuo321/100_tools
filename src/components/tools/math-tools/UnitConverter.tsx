"use client";

import { useState, useEffect } from "react";
import * as math from "mathjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Copy, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// 单位类别和单位定义
const unitCategories = [
  {
    id: "length",
    name: "长度",
    units: [
      { id: "m", name: "米" },
      { id: "km", name: "千米" },
      { id: "cm", name: "厘米" },
      { id: "mm", name: "毫米" },
      { id: "mi", name: "英里" },
      { id: "yd", name: "码" },
      { id: "ft", name: "英尺" },
      { id: "in", name: "英寸" },
    ],
  },
  {
    id: "mass",
    name: "质量",
    units: [
      { id: "kg", name: "千克" },
      { id: "g", name: "克" },
      { id: "mg", name: "毫克" },
      { id: "lb", name: "磅" },
      { id: "oz", name: "盎司" },
      { id: "ton", name: "吨" },
    ],
  },
  {
    id: "temperature",
    name: "温度",
    units: [
      { id: "degC", name: "摄氏度" },
      { id: "degF", name: "华氏度" },
      { id: "K", name: "开尔文" },
    ],
  },
  {
    id: "area",
    name: "面积",
    units: [
      { id: "m^2", name: "平方米" },
      { id: "km^2", name: "平方千米" },
      { id: "cm^2", name: "平方厘米" },
      { id: "mm^2", name: "平方毫米" },
      { id: "ha", name: "公顷" },
      { id: "acre", name: "英亩" },
      { id: "ft^2", name: "平方英尺" },
      { id: "in^2", name: "平方英寸" },
    ],
  },
  {
    id: "volume",
    name: "体积",
    units: [
      { id: "m^3", name: "立方米" },
      { id: "L", name: "升" },
      { id: "ml", name: "毫升" },
      { id: "gal", name: "加仑" },
      { id: "qt", name: "夸脱" },
      { id: "pt", name: "品脱" },
      { id: "fl oz", name: "液量盎司" },
      { id: "ft^3", name: "立方英尺" },
      { id: "in^3", name: "立方英寸" },
    ],
  },
  {
    id: "time",
    name: "时间",
    units: [
      { id: "s", name: "秒" },
      { id: "min", name: "分钟" },
      { id: "h", name: "小时" },
      { id: "day", name: "天" },
      { id: "week", name: "周" },
      { id: "month", name: "月" },
      { id: "year", name: "年" },
    ],
  },
  {
    id: "speed",
    name: "速度",
    units: [
      { id: "m/s", name: "米/秒" },
      { id: "km/h", name: "千米/小时" },
      { id: "mi/h", name: "英里/小时" },
      { id: "ft/s", name: "英尺/秒" },
      { id: "knot", name: "节" },
    ],
  },
  {
    id: "data",
    name: "数据",
    units: [
      { id: "b", name: "比特" },
      { id: "B", name: "字节" },
      { id: "kB", name: "千字节" },
      { id: "MB", name: "兆字节" },
      { id: "GB", name: "吉字节" },
      { id: "TB", name: "太字节" },
    ],
  },
];

// 常用转换快捷方式
const commonConversions = [
  { name: "英里 → 千米", from: "mi", to: "km", category: "length" },
  { name: "英尺 → 米", from: "ft", to: "m", category: "length" },
  { name: "英寸 → 厘米", from: "in", to: "cm", category: "length" },
  { name: "磅 → 千克", from: "lb", to: "kg", category: "mass" },
  { name: "华氏度 → 摄氏度", from: "degF", to: "degC", category: "temperature" },
  { name: "加仑 → 升", from: "gal", to: "L", category: "volume" },
  { name: "英里/小时 → 千米/小时", from: "mi/h", to: "km/h", category: "speed" },
];

export default function UnitConverter() {
  const { toast } = useToast();
  const [category, setCategory] = useState(unitCategories[0].id);
  const [fromUnit, setFromUnit] = useState(unitCategories[0].units[0].id);
  const [toUnit, setToUnit] = useState(unitCategories[0].units[1].id);
  const [fromValue, setFromValue] = useState("1");
  const [toValue, setToValue] = useState("");
  const [precision, setPrecision] = useState(4);
  const [history, setHistory] = useState<Array<{
    category: string;
    fromUnit: string;
    toUnit: string;
    fromValue: string;
    toValue: string;
  }>>([]);

  // 获取当前类别的单位
  const getCurrentCategoryUnits = () => {
    return unitCategories.find((cat) => cat.id === category)?.units || [];
  };

  // 获取单位名称
  const getUnitName = (unitId: string) => {
    for (const cat of unitCategories) {
      const unit = cat.units.find((u) => u.id === unitId);
      if (unit) return unit.name;
    }
    return unitId;
  };

  // 获取类别名称
  const getCategoryName = (categoryId: string) => {
    const cat = unitCategories.find((c) => c.id === categoryId);
    return cat ? cat.name : categoryId;
  };

  // 转换单位
  const convertUnits = () => {
    try {
      if (!fromValue || isNaN(Number(fromValue))) {
        setToValue("");
        return;
      }

      // 使用math.js进行单位转换
      const result = math.unit(parseFloat(fromValue), fromUnit).to(toUnit);
      
      // 根据精度设置格式化结果
      const formattedResult = result.toNumber().toFixed(precision);
      
      setToValue(formattedResult);
      
      // 添加到历史记录
      const newHistory = {
        category,
        fromUnit,
        toUnit,
        fromValue,
        toValue: formattedResult,
      };
      
      setHistory((prev) => {
        // 检查是否已存在相同的转换
        const exists = prev.some(
          (item) =>
            item.category === newHistory.category &&
            item.fromUnit === newHistory.fromUnit &&
            item.toUnit === newHistory.toUnit &&
            item.fromValue === newHistory.fromValue
        );
        
        if (!exists) {
          // 限制历史记录最多10条
          const updatedHistory = [newHistory, ...prev];
          if (updatedHistory.length > 10) {
            updatedHistory.pop();
          }
          return updatedHistory;
        }
        
        return prev;
      });
    } catch (error) {
      setToValue("错误");
      console.error("转换错误:", error);
    }
  };

  // 交换单位
  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    setFromValue(toValue);
    convertUnits();
  };

  // 应用快捷转换
  const applyCommonConversion = (conversion: typeof commonConversions[0]) => {
    setCategory(conversion.category);
    setFromUnit(conversion.from);
    setToUnit(conversion.to);
    // 延迟一下以确保状态更新后再转换
    setTimeout(convertUnits, 0);
  };

  // 复制结果
  const copyResult = () => {
    if (toValue && toValue !== "错误") {
      navigator.clipboard.writeText(toValue);
      toast({
        title: "已复制到剪贴板",
        description: `${toValue} ${getUnitName(toUnit)} 已复制到剪贴板。`,
      });
    }
  };

  // 清除历史记录
  const clearHistory = () => {
    setHistory([]);
  };

  // 当输入值、单位或精度变化时，自动转换
  useEffect(() => {
    convertUnits();
  }, [fromValue, fromUnit, toUnit, precision]);

  // 当类别变化时，更新单位
  useEffect(() => {
    const units = getCurrentCategoryUnits();
    if (units.length >= 2) {
      setFromUnit(units[0].id);
      setToUnit(units[1].id);
    }
  }, [category]);

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>单位转换器</CardTitle>
          <CardDescription>
            在不同单位之间进行转换，支持长度、质量、温度、面积、体积、时间、速度和数据等多种单位。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="converter">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="converter">转换器</TabsTrigger>
              <TabsTrigger value="common">常用转换</TabsTrigger>
              <TabsTrigger value="history">历史记录</TabsTrigger>
            </TabsList>
            
            <TabsContent value="converter" className="space-y-4">
              {/* 单位类别选择 */}
              <div className="space-y-2">
                <Label htmlFor="category">单位类别</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value)}
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="选择单位类别" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {/* 转换单位选择和输入 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 从单位 */}
                <div className="space-y-2">
                  <Label htmlFor="fromUnit">从</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={fromUnit}
                      onValueChange={(value) => setFromUnit(value)}
                    >
                      <SelectTrigger id="fromUnit" className="w-[180px]">
                        <SelectValue placeholder="选择单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentCategoryUnits().map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      value={fromValue}
                      onChange={(e) => setFromValue(e.target.value)}
                      placeholder="输入值"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* 到单位 */}
                <div className="space-y-2">
                  <Label htmlFor="toUnit">到</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={toUnit}
                      onValueChange={(value) => setToUnit(value)}
                    >
                      <SelectTrigger id="toUnit" className="w-[180px]">
                        <SelectValue placeholder="选择单位" />
                      </SelectTrigger>
                      <SelectContent>
                        {getCurrentCategoryUnits().map((unit) => (
                          <SelectItem key={unit.id} value={unit.id}>
                            {unit.name} ({unit.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex-1 flex items-center">
                      <Input
                        type="text"
                        value={toValue}
                        readOnly
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={copyResult}
                        className="ml-2"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* 交换按钮 */}
              <div className="flex justify-center my-4">
                <Button
                  variant="outline"
                  onClick={swapUnits}
                  className="flex items-center"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  交换单位
                </Button>
              </div>
              
              {/* 精度设置 */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="precision">精度: {precision} 位小数</Label>
                </div>
                <Slider
                  id="precision"
                  min={0}
                  max={10}
                  step={1}
                  value={[precision]}
                  onValueChange={(value) => setPrecision(value[0])}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="common" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {commonConversions.map((conversion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="justify-start"
                    onClick={() => applyCommonConversion(conversion)}
                  >
                    {conversion.name}
                  </Button>
                ))}
              </div>
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
                  <div className="space-y-2">
                    {history.map((item, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">
                                {getCategoryName(item.category)}
                              </p>
                              <p>
                                {item.fromValue} {getUnitName(item.fromUnit)} = {item.toValue}{" "}
                                {getUnitName(item.toUnit)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setCategory(item.category);
                                setFromUnit(item.fromUnit);
                                setToUnit(item.toUnit);
                                setFromValue(item.fromValue);
                                // 延迟一下以确保状态更新后再转换
                                setTimeout(convertUnits, 0);
                              }}
                            >
                              重用
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}