import FormulaCalculator from '@/components/tools/math-tools/FormulaCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '数学公式计算器 | 100+ 工具集合',
  description: '计算各种数学、物理、几何和统计公式，提供常用公式选择和详细说明。',
}

export default function FormulaCalculatorPage() {
  return <FormulaCalculator />
}