import DiceGame from "@/components/tools/entertainment-tools/DiceGame";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '骰子游戏 | 100+ 工具集合',
    description: '虚拟骰子游戏，可以模拟掷骰子，支持多种骰子类型和自定义面数。',
}

export default function DiceGamePage() {
    return <DiceGame />;
}
