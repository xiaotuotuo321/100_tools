"use client"

import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export function FeedbackForm() {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [feedbackType, setFeedbackType] = useState("suggestion")
    const [message, setMessage] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            // 准备要提交的数据
            const feedbackData = {
                name,
                email,
                feedbackType,
                message,
                userAgent: navigator.userAgent,
                timestamp: new Date().toISOString()
            }

            // 发送到 API 端点
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(feedbackData),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || '提交反馈时出错')
            }

            // 提交成功
            toast({
                title: "反馈已提交",
                description: "感谢您的反馈，我们会尽快处理！",
            })

            // 清空表单
            setName("")
            setEmail("")
            setFeedbackType("suggestion")
            setMessage("")
        } catch (error) {
            console.error('提交反馈时出错:', error)
            toast({
                title: "提交失败",
                description: error instanceof Error ? error.message : "提交反馈时出错，请稍后再试",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div>
            <PageHeader
                title="意见反馈"
                description="我们非常重视您的意见和建议，它们将帮助我们不断改进产品"
            />
            <div className="container py-8 md:py-12">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">您的姓名</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="请输入您的姓名（选填）"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">电子邮箱</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="请输入您的电子邮箱（选填）"
                            />
                            <p className="text-sm text-muted-foreground">
                                如果您希望我们回复，请填写电子邮箱
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>反馈类型</Label>
                            <RadioGroup
                                value={feedbackType}
                                onValueChange={setFeedbackType}
                                className="flex flex-col space-y-1"
                            >
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="suggestion" id="suggestion" />
                                    <Label htmlFor="suggestion">功能建议</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="bug" id="bug" />
                                    <Label htmlFor="bug">问题反馈</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">其他</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">反馈内容</Label>
                            <Textarea
                                id="message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="请详细描述您的反馈内容"
                                required
                                rows={6}
                            />
                        </div>

                        <Button type="submit" disabled={isSubmitting || !message}>
                            {isSubmitting ? "提交中..." : "提交反馈"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}