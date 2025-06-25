import QrGenerator from '@/components/tools/developer-tools/QrGenerator'

export default function QrGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">二维码生成器</h1>
          <p className="text-muted-foreground">
            生成各种类型的二维码，支持文本、网址、WiFi、联系人等多种格式，可自定义颜色和尺寸
          </p>
        </div>
        
        <QrGenerator />
      </div>
    </div>
  )
}

export const metadata = {
  title: '二维码生成器 - QR Code工具',
  description: '在线二维码生成器，支持文本、网址、WiFi、联系人等多种格式，可自定义颜色和尺寸，快速生成高质量二维码。',
} 