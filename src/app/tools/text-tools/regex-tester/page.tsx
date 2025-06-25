import { RegexTester } from '@/components/tools/text-tools/RegexTester'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '正则表达式测试器',
  description: '测试和验证正则表达式，实时查看匹配结果',
}

export default function RegexTesterPage() {
  return (
    <div className="container mx-auto py-8">
      <RegexTester />
    </div>
  )
} 