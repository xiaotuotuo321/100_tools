import { CaseConverter } from '@/components/tools/text-tools/CaseConverter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '文本格式转换器',
  description: '转换文本大小写、驼峰命名等格式',
}

export default function CaseConverterPage() {
  return (
    <div className="container mx-auto py-8">
      <CaseConverter />
    </div>
  )
} 