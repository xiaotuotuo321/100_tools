import UnitConverter from '@/components/tools/math-tools/UnitConverter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '单位转换器 | 100+ 工具集合',
  description: '在不同单位之间进行转换，支持长度、质量、温度、面积、体积、时间、速度和数据等多种单位。',
}

export default function UnitConverterPage() {
  return <UnitConverter />
}