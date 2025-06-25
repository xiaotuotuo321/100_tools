import { JsonFormatter } from '@/components/tools/text-tools/JsonFormatter'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'JSON格式化器',
  description: '格式化、压缩、验证JSON数据，支持文件上传和下载',
}

export default function JsonFormatterPage() {
  return (
    <div className="container mx-auto py-8">
      <JsonFormatter />
    </div>
  )
} 