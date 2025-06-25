import { ColorPicker } from '@/components/tools/developer-tools/ColorPicker'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '颜色选择器',
  description: '选择、转换和管理颜色，支持HEX、RGB、HSL、HSV等多种格式',
}

export default function ColorPickerPage() {
  return (
    <div className="container mx-auto py-8">
      <ColorPicker />
    </div>
  )
} 