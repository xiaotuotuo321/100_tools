import { Metadata } from 'next'
import { FavoritesClient } from './favorites-client'

export const metadata: Metadata = {
    title: '我的收藏 | 100+ 工具集合',
    description: '查看您收藏的工具列表，快速访问您最常用的工具。',
}

export default function FavoritesPage() {
    return <FavoritesClient />
}

    return (
        <div className="container mx-auto py-8">
            <div className="flex items-center mb-6">
                <Link href="/">
                    <Button variant="ghost" size="sm" className="mr-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        返回首页
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold flex items-center">
                    <Heart className="h-6 w-6 mr-2 text-red-500 fill-red-500" />
                    我的收藏
                </h1>
            </div>

            {favoriteTools.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {favoriteTools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader>
                        <CardTitle>暂无收藏</CardTitle>
                        <CardDescription>
                            您还没有收藏任何工具。浏览工具时，点击工具卡片右上角的心形图标可以将工具添加到收藏。
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button>
                                浏览工具
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}