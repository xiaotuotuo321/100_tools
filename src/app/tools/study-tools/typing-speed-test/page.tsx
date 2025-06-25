import TypingSpeedTest from '@/components/tools/study-tools/TypingSpeedTest'

export default function TypingSpeedTestPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">打字速度测试</h1>
          <p className="text-muted-foreground">
            测试和提升您的打字速度与准确率，支持多种测试模式和难度等级，帮助您成为打字高手
          </p>
        </div>
        
        <TypingSpeedTest />
      </div>
    </div>
  )
}

export const metadata = {
  title: '打字速度测试 - 键盘技能练习工具',
  description: '在线打字速度测试工具，支持限时测试、单词数测试、自定义文本等多种模式，实时统计WPM、准确率，提升键盘技能。',
} 