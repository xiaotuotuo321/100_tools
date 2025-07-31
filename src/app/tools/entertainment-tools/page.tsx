import { Metadata } from 'next'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dices, Gift, BookOpen, Gamepad2 } from "lucide-react"

export const metadata: Metadata = {
    title: '娱乐工具 | 100+ 工具集合',
    description: '提供各种有趣的娱乐工具和小游戏，帮助您放松心情，享受休闲时光。',
}

export default function EntertainmentToolsPage() {
    const tools = [
        {
            icon: <Dices className="h-8 w-8" />,
            title: "骰子游戏",
            href: "/tools/entertainment-tools/dice-game",
            description: "虚拟骰子游戏，可以模拟掷骰子，支持多种骰子类型和自定义面数。"
        },
        {
            icon: <Gift className="h-8 w-8" />,
            title: "幸运抽奖",
            href: "/tools/entertainment-tools/lucky-draw",
            description: "随机抽奖工具，可以进行名单抽奖、数字抽奖，适用于各种抽奖场景。"
        },
        {
            icon: <BookOpen className="h-8 w-8" />,
            title: "文字游戏",
            href: "/tools/entertainment-tools/word-game",
            description: "包含猜词、成语接龙等多种文字游戏，锻炼词汇量和反应能力。"
        },
        {
            icon: <Gamepad2 className="h-8 w-8" />,
            title: "迷你游戏集合",
            href: "/tools/entertainment-tools/mini-games",
            description: "包含多种简单有趣的迷你游戏，如记忆游戏、反应测试等。"
        }
    ];

    return (
        <div className="container mx-auto py-8">
            <div className="flex flex-col items-center text-center mb-8">
                <h1 className="text-3xl font-bold mb-4">娱乐工具</h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                    提供各种有趣的娱乐工具和小游戏，帮助您放松心情，享受休闲时光。
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {tools.map((tool, index) => (
                    <Link href={tool.href} key={index} className="block">
                        <Card className="h-full transition-all hover:shadow-md">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-primary/10 rounded-md">
                                        {tool.icon}
                                    </div>
                                    <CardTitle>{tool.title}</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <CardDescription className="text-base">{tool.description}</CardDescription>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
