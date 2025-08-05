import { Metadata } from "next"
import { PageHeader } from "@/components/layout/PageHeader"
import { SITE_CONFIG } from "@/lib/constants"

export const metadata: Metadata = {
    title: "隐私政策",
    description: "了解100工具集合如何收集、使用和保护您的个人信息",
}

export default function PrivacyPage() {
    return (
        <div>
            <PageHeader
                title="隐私政策"
                description="我们重视您的隐私，本政策说明了我们如何收集、使用和保护您的个人信息"
            />
            <div className="container py-8 md:py-12">
                <div className="prose prose-gray dark:prose-invert max-w-3xl mx-auto">
                    <p>
                        最后更新日期：2024年1月1日
                    </p>

                    <h2>1. 引言</h2>
                    <p>
                        {SITE_CONFIG.name}（"我们"、"我们的"或"本网站"）致力于保护您的隐私。本隐私政策说明了我们如何收集、使用、披露和保护您的个人信息。
                        使用我们的网站和服务，即表示您同意本隐私政策中描述的做法。
                    </p>

                    <h2>2. 我们收集的信息</h2>
                    <p>
                        我们可能会收集以下类型的信息：
                    </p>
                    <ul>
                        <li><strong>使用数据</strong>：我们自动收集有关您如何访问和使用我们网站的信息，包括您的IP地址、浏览器类型、访问时间、访问的页面以及您与我们网站的交互方式。</li>
                        <li><strong>设备信息</strong>：我们可能会收集有关您用于访问我们网站的设备的信息，包括硬件型号、操作系统和版本、唯一设备标识符等。</li>
                        <li><strong>Cookie和类似技术</strong>：我们使用cookie和类似技术来收集信息并改善您的体验。</li>
                    </ul>

                    <h2>3. 我们如何使用信息</h2>
                    <p>
                        我们可能会将收集的信息用于以下目的：
                    </p>
                    <ul>
                        <li>提供、维护和改进我们的服务</li>
                        <li>分析用户如何使用我们的网站，以便我们可以改进用户体验</li>
                        <li>检测、预防和解决技术问题</li>
                        <li>开发新产品和服务</li>
                    </ul>

                    <h2>4. 信息共享与披露</h2>
                    <p>
                        我们不会出售、出租或交易您的个人信息给第三方。我们可能在以下情况下共享您的信息：
                    </p>
                    <ul>
                        <li><strong>服务提供商</strong>：我们可能会与帮助我们运营网站和提供服务的第三方服务提供商共享信息。</li>
                        <li><strong>法律要求</strong>：如果法律要求或为了保护我们的权利，我们可能会披露您的信息。</li>
                    </ul>

                    <h2>5. 数据安全</h2>
                    <p>
                        我们采取合理的措施来保护您的个人信息免受未经授权的访问、使用或披露。然而，没有任何网站或互联网传输是完全安全的，我们不能保证信息的绝对安全。
                    </p>

                    <h2>6. 您的权利</h2>
                    <p>
                        根据适用的数据保护法律，您可能有权访问、更正或删除我们持有的关于您的个人信息。如果您想行使这些权利，请通过以下方式联系我们。
                    </p>

                    <h2>7. Cookie政策</h2>
                    <p>
                        我们使用cookie和类似技术来收集信息并改善您的体验。您可以通过浏览器设置控制cookie的使用。
                    </p>

                    <h2>8. 隐私政策的变更</h2>
                    <p>
                        我们可能会不时更新本隐私政策。我们会在网站上发布更新后的版本，并在政策顶部更新"最后更新日期"。
                    </p>

                    <h2>9. 联系我们</h2>
                    <p>
                        如果您对本隐私政策有任何疑问或顾虑，请通过以下方式联系我们：
                    </p>
                    <ul>
                        <li>邮箱：shiyue32123@126.com</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}