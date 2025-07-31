import ShortUrlGenerator from "@/components/tools/network-tools/ShortUrlGenerator";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: '短链接生成器 | 100+ 工具集合',
    description: '将长URL转换为短链接，便于分享和使用。支持单个和批量处理。',
}

export default function UrlShortenerPage() {
    return <ShortUrlGenerator />;
}