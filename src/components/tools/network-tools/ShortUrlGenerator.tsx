"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
    Link,
    Copy,
    History,
    Trash2,
    ExternalLink,
    CheckCircle,
    XCircle,
    Loader2
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

// 短链接服务提供商
const URL_SHORTENERS = [
    { id: "tinyurl", name: "TinyURL", api: "https://tinyurl.com/api-create.php?url=" },
    { id: "bitly", name: "Bit.ly", api: "https://api-ssl.bitly.com/v4/shorten" },
    { id: "custom", name: "自定义", api: "" }
];

// 短链接历史记录类型
interface ShortUrlRecord {
    id: string;
    originalUrl: string;
    shortUrl: string;
    provider: string;
    createdAt: number;
    clicks?: number;
}

export default function ShortUrlGenerator() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"single" | "batch" | "history">("single");

    // 单个链接缩短
    const [originalUrl, setOriginalUrl] = useState<string>("");
    const [shortUrl, setShortUrl] = useState<string>("");
    const [selectedProvider, setSelectedProvider] = useState<string>("tinyurl");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customApiUrl, setCustomApiUrl] = useState<string>("");
    const [customApiKey, setCustomApiKey] = useState<string>("");

    // 批量链接缩短
    const [batchUrls, setBatchUrls] = useState<string>("");
    const [batchResults, setBatchResults] = useState<{ original: string, shortened: string }[]>([]);
    const [batchLoading, setBatchLoading] = useState<boolean>(false);

    // 历史记录
    const [urlHistory, setUrlHistory] = useState<ShortUrlRecord[]>([]);

    // 从本地存储加载历史记录
    useEffect(() => {
        const savedHistory = localStorage.getItem("short-url-history");
        if (savedHistory) {
            try {
                setUrlHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error("无法解析历史记录", e);
            }
        }
    }, []);

    // 保存历史记录到本地存储
    useEffect(() => {
        if (urlHistory.length > 0) {
            localStorage.setItem("short-url-history", JSON.stringify(urlHistory));
        }
    }, [urlHistory]);

    // 验证URL
    const isValidUrl = (url: string): boolean => {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    };

    // 使用TinyURL API缩短链接
    const shortenWithTinyUrl = async (url: string): Promise<string> => {
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.text();
            return data;
        } catch (error) {
            console.error("Error shortening URL with TinyURL:", error);
            throw error;
        }
    };

    // 使用Bit.ly API缩短链接（需要API密钥）
    const shortenWithBitly = async (url: string): Promise<string> => {
        // 注意：实际使用时需要用户提供自己的Bit.ly API密钥
        const apiKey = "YOUR_BITLY_API_KEY"; // 这里应该让用户输入他们自己的API密钥

        try {
            const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ long_url: url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.link;
        } catch (error) {
            console.error("Error shortening URL with Bit.ly:", error);
            throw error;
        }
    };

    // 使用自定义API缩短链接
    const shortenWithCustomApi = async (url: string): Promise<string> => {
        try {
            // 这里应该根据用户提供的API端点和参数进行定制
            const response = await fetch(customApiUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(customApiKey && { "Authorization": `Bearer ${customApiKey}` })
                },
                body: JSON.stringify({ url: url })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // 这里需要根据API的响应格式进行调整
            return data.shortUrl || data.short_url || data.url || "";
        } catch (error) {
            console.error("Error shortening URL with custom API:", error);
            throw error;
        }
    };

    // 缩短单个URL
    const shortenUrl = async () => {
        if (!originalUrl) {
            toast({
                title: "请输入URL",
                description: "请输入需要缩短的URL",
                variant: "destructive",
            });
            return;
        }

        if (!isValidUrl(originalUrl)) {
            toast({
                title: "无效的URL",
                description: "请输入有效的URL，包括http://或https://",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setShortUrl("");

        try {
            let shortened = "";

            // 根据选择的服务提供商调用不同的API
            if (selectedProvider === "tinyurl") {
                shortened = await shortenWithTinyUrl(originalUrl);
            } else if (selectedProvider === "bitly") {
                shortened = await shortenWithBitly(originalUrl);
            } else if (selectedProvider === "custom") {
                shortened = await shortenWithCustomApi(originalUrl);
            }

            if (shortened) {
                setShortUrl(shortened);

                // 添加到历史记录
                const newRecord: ShortUrlRecord = {
                    id: `url-${Date.now()}`,
                    originalUrl,
                    shortUrl: shortened,
                    provider: selectedProvider,
                    createdAt: Date.now(),
                    clicks: 0
                };

                setUrlHistory(prev => [newRecord, ...prev].slice(0, 50)); // 限制历史记录数量

                toast({
                    title: "URL已缩短",
                    description: "短链接已生成成功",
                });
            } else {
                toast({
                    title: "生成失败",
                    description: "无法生成短链接，请稍后再试",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error shortening URL:", error);
            toast({
                title: "生成失败",
                description: "无法生成短链接，请检查网络连接或API设置",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // 批量缩短URL
    const shortenBatchUrls = async () => {
        if (!batchUrls.trim()) {
            toast({
                title: "请输入URL",
                description: "请输入需要缩短的URL列表",
                variant: "destructive",
            });
            return;
        }

        const urls = batchUrls.split("\n").filter(url => url.trim() !== "");

        if (urls.length === 0) {
            toast({
                title: "没有有效的URL",
                description: "请输入至少一个有效的URL",
                variant: "destructive",
            });
            return;
        }

        setBatchLoading(true);
        setBatchResults([]);

        const results: { original: string, shortened: string }[] = [];

        for (const url of urls) {
            if (!isValidUrl(url)) {
                results.push({
                    original: url,
                    shortened: "无效的URL"
                });
                continue;
            }

            try {
                let shortened = "";

                // 根据选择的服务提供商调用不同的API
                if (selectedProvider === "tinyurl") {
                    shortened = await shortenWithTinyUrl(url);
                } else if (selectedProvider === "bitly") {
                    shortened = await shortenWithBitly(url);
                } else if (selectedProvider === "custom") {
                    shortened = await shortenWithCustomApi(url);
                }

                if (shortened) {
                    results.push({
                        original: url,
                        shortened
                    });

                    // 添加到历史记录
                    const newRecord: ShortUrlRecord = {
                        id: `url-${Date.now()}-${results.length}`,
                        originalUrl: url,
                        shortUrl: shortened,
                        provider: selectedProvider,
                        createdAt: Date.now(),
                        clicks: 0
                    };

                    setUrlHistory(prev => [newRecord, ...prev].slice(0, 50));
                } else {
                    results.push({
                        original: url,
                        shortened: "生成失败"
                    });
                }
            } catch (error) {
                console.error("Error shortening URL:", error);
                results.push({
                    original: url,
                    shortened: "生成失败"
                });
            }
        }

        setBatchResults(results);
        setBatchLoading(false);

        toast({
            title: "批量处理完成",
            description: `成功处理 ${results.filter(r => r.shortened !== "无效的URL" && r.shortened !== "生成失败").length} 个URL，失败 ${results.filter(r => r.shortened === "无效的URL" || r.shortened === "生成失败").length} 个`,
        });
    };

    // 复制URL到剪贴板
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);

        toast({
            title: "已复制",
            description: "URL已复制到剪贴板",
        });
    };

    // 清除历史记录
    const clearHistory = () => {
        setUrlHistory([]);
        localStorage.removeItem("short-url-history");

        toast({
            title: "历史记录已清除",
            description: "所有短链接历史记录已删除",
        });
    };

    // 删除单个历史记录
    const deleteHistoryItem = (id: string) => {
        setUrlHistory(prev => prev.filter(item => item.id !== id));

        toast({
            title: "记录已删除",
            description: "短链接记录已从历史中删除",
        });
    };

    // 格式化日期
    const formatDate = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString();
    };

    return (
        <div className="container mx-auto py-8">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>短链接生成器</CardTitle>
                    <CardDescription>
                        将长URL转换为短链接，便于分享和使用。支持单个和批量处理。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="single">单个链接</TabsTrigger>
                            <TabsTrigger value="batch">批量处理</TabsTrigger>
                            <TabsTrigger value="history">历史记录</TabsTrigger>
                        </TabsList>

                        {/* 单个链接处理 */}
                        <TabsContent value="single" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="original-url">原始URL</Label>
                                    <Input
                                        id="original-url"
                                        placeholder="https://example.com/very/long/url/that/needs/shortening"
                                        value={originalUrl}
                                        onChange={(e) => setOriginalUrl(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="provider">短链接服务提供商</Label>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {URL_SHORTENERS.map((provider) => (
                                            <div
                                                key={provider.id}
                                                className={`flex items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${selectedProvider === provider.id
                                                        ? "border-primary bg-primary/10"
                                                        : "border-muted hover:border-primary/50"
                                                    }`}
                                                onClick={() => setSelectedProvider(provider.id)}
                                            >
                                                <span className="font-medium">{provider.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedProvider === "custom" && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div>
                                            <Label htmlFor="custom-api-url">自定义API端点</Label>
                                            <Input
                                                id="custom-api-url"
                                                placeholder="https://api.example.com/shorten"
                                                value={customApiUrl}
                                                onChange={(e) => setCustomApiUrl(e.target.value)}
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                输入您想使用的短链接API的完整URL
                                            </p>
                                        </div>

                                        <div>
                                            <Label htmlFor="custom-api-key">API密钥 (可选)</Label>
                                            <Input
                                                id="custom-api-key"
                                                placeholder="您的API密钥"
                                                value={customApiKey}
                                                onChange={(e) => setCustomApiKey(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={shortenUrl}
                                    disabled={isLoading || !originalUrl}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            处理中...
                                        </>
                                    ) : (
                                        <>
                                            <Link className="mr-2 h-4 w-4" />
                                            生成短链接
                                        </>
                                    )}
                                </Button>

                                {shortUrl && (
                                    <div className="p-4 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>短链接</Label>
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(shortUrl)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex items-center">
                                            <Input
                                                value={shortUrl}
                                                readOnly
                                                className="mr-2"
                                            />
                                            <Button variant="outline" size="icon" onClick={() => window.open(shortUrl, "_blank")}>
                                                <ExternalLink className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 批量处理 */}
                        <TabsContent value="batch" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="batch-urls">输入多个URL (每行一个)</Label>
                                    <Textarea
                                        id="batch-urls"
                                        placeholder="https://example.com/url1&#10;https://example.com/url2&#10;https://example.com/url3"
                                        value={batchUrls}
                                        onChange={(e) => setBatchUrls(e.target.value)}
                                        className="min-h-[150px]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="provider">短链接服务提供商</Label>
                                    <div className="grid grid-cols-3 gap-4 mt-2">
                                        {URL_SHORTENERS.map((provider) => (
                                            <div
                                                key={provider.id}
                                                className={`flex items-center justify-center p-4 border rounded-md cursor-pointer transition-all ${selectedProvider === provider.id
                                                        ? "border-primary bg-primary/10"
                                                        : "border-muted hover:border-primary/50"
                                                    }`}
                                                onClick={() => setSelectedProvider(provider.id)}
                                            >
                                                <span className="font-medium">{provider.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {selectedProvider === "custom" && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div>
                                            <Label htmlFor="custom-api-url-batch">自定义API端点</Label>
                                            <Input
                                                id="custom-api-url-batch"
                                                placeholder="https://api.example.com/shorten"
                                                value={customApiUrl}
                                                onChange={(e) => setCustomApiUrl(e.target.value)}
                                            />
                                        </div>

                                        <div>
                                            <Label htmlFor="custom-api-key-batch">API密钥 (可选)</Label>
                                            <Input
                                                id="custom-api-key-batch"
                                                placeholder="您的API密钥"
                                                value={customApiKey}
                                                onChange={(e) => setCustomApiKey(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={shortenBatchUrls}
                                    disabled={batchLoading || !batchUrls.trim()}
                                    className="w-full"
                                >
                                    {batchLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            处理中...
                                        </>
                                    ) : (
                                        <>
                                            <Link className="mr-2 h-4 w-4" />
                                            批量生成短链接
                                        </>
                                    )}
                                </Button>

                                {batchResults.length > 0 && (
                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableCaption>批量处理结果</TableCaption>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>原始URL</TableHead>
                                                    <TableHead>短链接</TableHead>
                                                    <TableHead className="w-[100px]">操作</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {batchResults.map((result, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell className="font-medium truncate max-w-[200px]">
                                                            {result.original}
                                                        </TableCell>
                                                        <TableCell>
                                                            {result.shortened === "无效的URL" || result.shortened === "生成失败" ? (
                                                                <Badge variant="destructive">{result.shortened}</Badge>
                                                            ) : (
                                                                <span className="text-blue-500 truncate max-w-[200px] inline-block">
                                                                    {result.shortened}
                                                                </span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>
                                                            {result.shortened !== "无效的URL" && result.shortened !== "生成失败" && (
                                                                <div className="flex space-x-1">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => copyToClipboard(result.shortened)}
                                                                    >
                                                                        <Copy className="h-4 w-4" />
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => window.open(result.shortened, "_blank")}
                                                                    >
                                                                        <ExternalLink className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 历史记录 */}
                        <TabsContent value="history" className="space-y-4">
                            {urlHistory.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>还没有短链接历史记录</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={clearHistory}>
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            清除历史记录
                                        </Button>
                                    </div>

                                    <div className="border rounded-md overflow-hidden">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>原始URL</TableHead>
                                                    <TableHead>短链接</TableHead>
                                                    <TableHead>服务商</TableHead>
                                                    <TableHead>创建时间</TableHead>
                                                    <TableHead className="w-[100px]">操作</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {urlHistory.map((record) => (
                                                    <TableRow key={record.id}>
                                                        <TableCell className="font-medium truncate max-w-[200px]">
                                                            {record.originalUrl}
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="text-blue-500 truncate max-w-[200px] inline-block">
                                                                {record.shortUrl}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell>
                                                            {record.provider === "tinyurl" ? "TinyURL" :
                                                                record.provider === "bitly" ? "Bit.ly" :
                                                                    "自定义"}
                                                        </TableCell>
                                                        <TableCell>
                                                            {formatDate(record.createdAt)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex space-x-1">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => copyToClipboard(record.shortUrl)}
                                                                >
                                                                    <Copy className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => window.open(record.shortUrl, "_blank")}
                                                                >
                                                                    <ExternalLink className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => deleteHistoryItem(record.id)}
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>关于短链接</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">什么是短链接？</h3>
                            <p className="text-muted-foreground">
                                短链接是一种将长URL转换为更短、更易于分享的URL的技术。它们通常用于社交媒体、短信和其他字符数有限的平台。
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium">使用提示</h3>
                            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                <li>确保输入的URL包含http://或https://前缀</li>
                                <li>批量处理时，每行输入一个URL</li>
                                <li>使用自定义API时，请确保API端点正确</li>
                                <li>短链接生成后会自动保存到历史记录中</li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium">注意事项</h3>
                            <p className="text-muted-foreground">
                                短链接服务可能会有使用限制或要求API密钥。本工具默认使用TinyURL的公共API，不需要API密钥，但可能有使用限制。
                                如果您需要更高的使用限制或自定义功能，请考虑使用Bit.ly或其他需要API密钥的服务。
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}