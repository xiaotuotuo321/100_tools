import MiniGames from "@/components/tools/entertainment-tools/MiniGames";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '迷你游戏集合 | 100+ 工具集合',
    description: '包含多种简单有趣的迷你游戏，如记忆游戏、反应测试等。',
}

export default function MiniGamesPage() {
    return <MiniGames />;
}
