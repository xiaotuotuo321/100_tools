import PercentageCalculator from '@/components/tools/math-tools/PercentageCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '百分比计算器 | 100+ 工具集合',
    description: '快速计算百分比、增长率、折扣等百分比相关的数学问题。',
}

export default function PercentageCalculatorPage() {
    return <PercentageCalculator />
}