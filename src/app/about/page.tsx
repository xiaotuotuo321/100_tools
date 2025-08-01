import { Metadata } from "next"
import { PageHeader } from "@/components/layout/PageHeader"
import { SITE_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
    title: "关于我们",
    description: "了解100工具集合的起源、使命和团队",
}

export default function AboutPage() {
    return (
        <div>
            <PageHeader
                title="关于我们"
                description="了解100工具集合的起源、使命和团队"
            />
            <div className="container py-8 md:py-12">
                <div className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
                    <h2>我们的使命</h2>
                    <p>
                        {SITE_CONFIG.name}的使命是为用户提供一站式工具解决方案，让日常工作和生活更加便捷高效。
                        我们致力于开发简单易用、功能强大的在线工具，帮助用户解决各种实际问题。
                    </p>

                    <h2>我们的故事</h2>
                    <p>
                        {SITE_CONFIG.name}诞生于2024年，源于一个简单的想法：将常用工具集中在一个平台上，
                        让用户不必在不同网站间来回切换。我们的团队由一群热爱技术、追求卓越的开发者组成，
                        他们对用户体验和产品质量有着极高的要求。
                    </p>

                    <h2>我们的价值观</h2>
                    <ul>
                        <li><strong>用户至上</strong> - 我们的每一个决策都以用户需求为中心</li>
                        <li><strong>简约实用</strong> - 我们追求简洁的设计和实用的功能</li>
                        <li><strong>持续创新</strong> - 我们不断探索新技术和新方法</li>
                        <li><strong>开放共享</strong> - 我们相信开源精神和知识共享</li>
                    </ul>

                    <h2>我们的团队</h2>
                    <p>
                        我们的团队由充满激情的设计师、开发者和产品经理组成。每个人都带来了独特的技能和视角，
                        共同打造出这个多功能工具平台。我们重视团队协作和个人成长，鼓励创新思维和批判性思考。
                    </p>

                    <h2>联系我们</h2>
                    <p>
                        如果您有任何问题、建议或合作意向，欢迎通过以下方式联系我们：
                    </p>
                    <ul>
                        <li>邮箱：contact@100tools.com</li>
                        <li>GitHub：<a href={SITE_CONFIG.author.url} target="_blank" rel="noopener noreferrer">{SITE_CONFIG.author.url}</a></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}