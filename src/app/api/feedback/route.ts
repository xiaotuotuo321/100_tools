import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

// 确保反馈目录存在
const feedbackDir = path.join(process.cwd(), 'data', 'feedback')
if (!fs.existsSync(feedbackDir)) {
  fs.mkdirSync(feedbackDir, { recursive: true })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // 验证必填字段
    if (!data.message) {
      return NextResponse.json(
        { error: '反馈内容不能为空' },
        { status: 400 }
      )
    }
    
    // 添加时间戳
    const feedback = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    
    // 将反馈保存到文件
    const filePath = path.join(feedbackDir, `${feedback.id}.json`)
    fs.writeFileSync(filePath, JSON.stringify(feedback, null, 2))
    
    // 返回成功响应
    return NextResponse.json({ success: true, message: '反馈已成功提交' })
  } catch (error) {
    console.error('提交反馈时出错:', error)
    return NextResponse.json(
      { error: '提交反馈时出错，请稍后再试' },
      { status: 500 }
    )
  }
}