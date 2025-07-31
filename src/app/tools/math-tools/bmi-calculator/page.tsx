import BMICalculator from '@/components/tools/math-tools/BMICalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'BMI计算器 | 100+ 工具集合',
    description: '计算身体质量指数(BMI)，评估您的体重是否在健康范围内。',
}

export default function BMICalculatorPage() {
    return <BMICalculator />
}