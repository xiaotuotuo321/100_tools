import PasswordGenerator from '@/components/tools/developer-tools/PasswordGenerator'

export default function PasswordGeneratorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">密码生成器</h1>
          <p className="text-muted-foreground">
            生成安全的随机密码，支持自定义长度和字符集，提供密码强度分析和安全建议
          </p>
        </div>
        
        <PasswordGenerator />
      </div>
    </div>
  )
}

export const metadata = {
  title: '密码生成器 - 安全密码工具',
  description: '在线密码生成器，生成安全的随机密码，支持自定义长度和字符集，提供密码强度分析，保护您的账户安全。',
} 