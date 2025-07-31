import AgeCalculator from '@/components/tools/math-tools/AgeCalculator'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '年龄计算器 | 100+ 工具集合',
    description: '根据出生日期计算准确年龄，包括年、月、日和总天数。',
}

export default function AgeCalculatorPage() {
    return <AgeCalculator />
}