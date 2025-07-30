import GraphCalculator from '@/components/tools/math-tools/GraphCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '图形计算器 | 100+ 工具集合',
  description: '绘制和可视化数学函数，支持多函数比较、缩放和自定义范围。',
}

export default function GraphCalculatorPage() {
  return <GraphCalculator />
}