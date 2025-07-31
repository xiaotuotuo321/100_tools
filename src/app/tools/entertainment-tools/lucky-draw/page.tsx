import LuckyDraw from "@/components/tools/entertainment-tools/LuckyDraw";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '幸运抽奖 | 100+ 工具集合',
    description: '随机抽奖工具，可以进行名单抽奖、数字抽奖，适用于各种抽奖场景。',
}

export default function LuckyDrawPage() {
    return <LuckyDraw />;
}
