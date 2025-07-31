import WordGame from "@/components/tools/entertainment-tools/WordGame";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '文字游戏 | 100+ 工具集合',
    description: '包含猜词、成语接龙等多种文字游戏，锻炼词汇量和反应能力。',
}

export default function WordGamePage() {
    return <WordGame />;
}
