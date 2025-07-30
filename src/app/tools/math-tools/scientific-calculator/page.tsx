import ScientificCalculator from '@/components/tools/math-tools/ScientificCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '科学计算器 | 100+ 工具集合',
  description: '一个功能强大的科学计算器，支持基本算术运算、科学函数、常数和内存功能。',
}

export default function ScientificCalculatorPage() {
  return <ScientificCalculator />
}