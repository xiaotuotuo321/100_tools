"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Copy, Lock, Unlock, RefreshCw, Loader2, Save, Trash2, History } from "lucide-react";

// 类型定义
interface CipherOption {
    mode?: any;
    padding?: any;
    iv?: any;
}

// 加密模式
const MODES = [
    { value: "CBC", label: "CBC (推荐)" },
    { value: "ECB", label: "ECB" },
    { value: "CFB", label: "CFB" },
    { value: "OFB", label: "OFB" },
    { value: "CTR", label: "CTR" }
];

// 填充方式
const PADDINGS = [
    { value: "Pkcs7", label: "PKCS7 (推荐)" },
    { value: "Iso97971", label: "ISO/IEC 9797-1" },
    { value: "AnsiX923", label: "ANSI X.923" },
    { value: "Iso10126", label: "ISO 10126" },
    { value: "ZeroPadding", label: "Zero Padding" },
    { value: "NoPadding", label: "No Padding" }
];

// 输出格式
const OUTPUT_FORMATS = [
    { value: "Base64", label: "Base64 (推荐)" },
    { value: "Hex", label: "Hex (十六进制)" }
];

// 密钥长度
const KEY_SIZES = [
    { value: "128", label: "128位 (16字节)" },
    { value: "192", label: "192位 (24字节)" },
    { value: "256", label: "256位 (32字节) (推荐)" }
];

// 历史记录类型
interface HistoryRecord {
    id: string;
    text: string;
    key: string;
    iv: string;
    mode: string;
    padding: string;
    outputFormat: string;
    isEncryption: boolean;
    timestamp: number;
}

export default function AESEncryption() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState<"encrypt" | "decrypt" | "history">("encrypt");

    // 加密/解密参数
    const [text, setText] = useState<string>("");
    const [key, setKey] = useState<string>("");
    const [iv, setIv] = useState<string>("");
    const [mode, setMode] = useState<string>("CBC");
    const [padding, setPadding] = useState<string>("Pkcs7");
    const [outputFormat, setOutputFormat] = useState<string>("Base64");
    const [keySize, setKeySize] = useState<string>("256");
    const [result, setResult] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [useRandomIv, setUseRandomIv] = useState<boolean>(true);
    const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

    // 历史记录
    const [history, setHistory] = useState<HistoryRecord[]>([]);

    // CryptoJS模块
    const [cryptoJS, setCryptoJS] = useState<any>(null);
    const [isBrowser, setIsBrowser] = useState<boolean>(false);

    // 检测是否在浏览器环境
    useEffect(() => {
        setIsBrowser(true);
    }, []);

    // 加载CryptoJS
    useEffect(() => {
        if (isBrowser) {
            import('crypto-js').then((module) => {
                setCryptoJS(module);
            }).catch(error => {
                console.error("加载CryptoJS失败:", error);
            });
        }
    }, [isBrowser]);

    // 从本地存储加载历史记录
    useEffect(() => {
        if (isBrowser) {
            const savedHistory = localStorage.getItem("aes-encryption-history");
            if (savedHistory) {
                try {
                    setHistory(JSON.parse(savedHistory));
                } catch (e) {
                    console.error("无法解析历史记录", e);
                }
            }
        }
    }, [isBrowser]);

    // 保存历史记录到本地存储
    useEffect(() => {
        if (isBrowser && history.length > 0) {
            localStorage.setItem("aes-encryption-history", JSON.stringify(history));
        }
    }, [history, isBrowser]);

    // 生成随机密钥
    const generateRandomKey = () => {
        if (!isBrowser || !cryptoJS) {
            toast({
                title: "无法生成密钥",
                description: "加密库尚未加载完成，请稍后再试",
                variant: "destructive",
            });
            return;
        }

        const keyBytes = parseInt(keySize) / 8;
        const randomKey = cryptoJS.lib.WordArray.random(keyBytes);
        setKey(randomKey.toString());

        toast({
            title: "已生成随机密钥",
            description: `已生成${keySize}位随机密钥`,
        });
    };

    // 生成随机IV
    const generateRandomIv = () => {
        if (!isBrowser || !cryptoJS) {
            toast({
                title: "无法生成IV",
                description: "加密库尚未加载完成，请稍后再试",
                variant: "destructive",
            });
            return;
        }

        // AES块大小为128位(16字节)
        const randomIv = cryptoJS.lib.WordArray.random(16);
        setIv(randomIv.toString());

        toast({
            title: "已生成随机IV",
            description: "已生成128位随机初始化向量",
        });
    };

    // 执行加密
    const handleEncrypt = () => {
        if (!text) {
            toast({
                title: "请输入明文",
                description: "请输入需要加密的文本",
                variant: "destructive",
            });
            return;
        }

        if (!key) {
            toast({
                title: "请输入密钥",
                description: "请输入加密密钥或生成一个随机密钥",
                variant: "destructive",
            });
            return;
        }

        if (mode !== "ECB" && !iv && !useRandomIv) {
            toast({
                title: "请输入IV",
                description: "除ECB模式外，其他模式需要初始化向量(IV)",
                variant: "destructive",
            });
            return;
        }

        if (!isBrowser) {
            toast({
                title: "加密失败",
                description: "此功能仅在客户端可用",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResult("");

        // 确保CryptoJS已加载
        const encryptWithCryptoJS = (cryptoModule: any) => {
            try {
                // 如果启用了随机IV且当前模式不是ECB，则生成一个随机IV
                let currentIv = iv;
                if (useRandomIv && mode !== "ECB") {
                    const randomIv = cryptoModule.lib.WordArray.random(16);
                    currentIv = randomIv.toString();
                    setIv(currentIv);
                }

                // 准备加密选项
                const options: any = {};

                // 设置加密模式
                if (cryptoModule.mode && cryptoModule.mode[mode]) {
                    options.mode = cryptoModule.mode[mode];
                }

                // 设置填充方式
                if (cryptoModule.pad && cryptoModule.pad[padding]) {
                    options.padding = cryptoModule.pad[padding];
                }

                // 除ECB模式外，其他模式需要IV
                if (mode !== "ECB") {
                    options.iv = cryptoModule.enc.Utf8.parse(currentIv);
                }

                // 准备密钥
                const parsedKey = cryptoModule.enc.Utf8.parse(key);

                // 执行加密
                const encrypted = cryptoModule.AES.encrypt(text, parsedKey, options);

                // 根据选择的输出格式转换结果
                let encryptedResult = "";
                if (outputFormat === "Base64") {
                    encryptedResult = encrypted.toString();
                } else if (outputFormat === "Hex") {
                    encryptedResult = encrypted.ciphertext.toString(cryptoModule.enc.Hex);
                }

                setResult(encryptedResult);

                // 添加到历史记录
                const newRecord: HistoryRecord = {
                    id: `aes-${Date.now()}`,
                    text,
                    key,
                    iv: currentIv,
                    mode,
                    padding,
                    outputFormat,
                    isEncryption: true,
                    timestamp: Date.now()
                };

                setHistory(prev => [newRecord, ...prev].slice(0, 50)); // 限制历史记录数量

                toast({
                    title: "加密成功",
                    description: "文本已成功加密",
                });
            } catch (error) {
                console.error("加密错误:", error);
                toast({
                    title: "加密失败",
                    description: "加密过程中发生错误，请检查输入参数",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        // 如果CryptoJS已加载，直接使用；否则先加载
        if (cryptoJS) {
            encryptWithCryptoJS(cryptoJS);
        } else {
            import('crypto-js').then(module => {
                setCryptoJS(module);
                encryptWithCryptoJS(module);
            }).catch(error => {
                console.error("加载CryptoJS失败:", error);
                toast({
                    title: "加密失败",
                    description: "加载加密库失败，请刷新页面重试",
                    variant: "destructive",
                });
                setIsLoading(false);
            });
        }
    };

    // 执行解密
    const handleDecrypt = () => {
        if (!text) {
            toast({
                title: "请输入密文",
                description: "请输入需要解密的文本",
                variant: "destructive",
            });
            return;
        }

        if (!key) {
            toast({
                title: "请输入密钥",
                description: "请输入解密密钥",
                variant: "destructive",
            });
            return;
        }

        if (mode !== "ECB" && !iv) {
            toast({
                title: "请输入IV",
                description: "除ECB模式外，其他模式需要初始化向量(IV)",
                variant: "destructive",
            });
            return;
        }

        if (!isBrowser) {
            toast({
                title: "解密失败",
                description: "此功能仅在客户端可用",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setResult("");

        // 确保CryptoJS已加载
        const decryptWithCryptoJS = (cryptoModule: any) => {
            try {
                // 准备解密选项
                const options: any = {};

                // 设置加密模式
                if (cryptoModule.mode && cryptoModule.mode[mode]) {
                    options.mode = cryptoModule.mode[mode];
                }

                // 设置填充方式
                if (cryptoModule.pad && cryptoModule.pad[padding]) {
                    options.padding = cryptoModule.pad[padding];
                }

                // 除ECB模式外，其他模式需要IV
                if (mode !== "ECB") {
                    options.iv = cryptoModule.enc.Utf8.parse(iv);
                }

                // 准备密钥
                const parsedKey = cryptoModule.enc.Utf8.parse(key);

                // 根据输入格式处理密文
                let cipherParams;
                if (outputFormat === "Base64") {
                    cipherParams = cryptoModule.lib.CipherParams.create({
                        ciphertext: cryptoModule.enc.Base64.parse(text)
                    });
                } else if (outputFormat === "Hex") {
                    cipherParams = cryptoModule.lib.CipherParams.create({
                        ciphertext: cryptoModule.enc.Hex.parse(text)
                    });
                }

                // 执行解密
                const decrypted = cryptoModule.AES.decrypt(cipherParams, parsedKey, options);

                // 转换为UTF-8字符串
                const decryptedText = decrypted.toString(cryptoModule.enc.Utf8);

                if (!decryptedText) {
                    throw new Error("解密结果为空，可能是密钥或IV不正确");
                }

                setResult(decryptedText);

                // 添加到历史记录
                const newRecord: HistoryRecord = {
                    id: `aes-${Date.now()}`,
                    text,
                    key,
                    iv,
                    mode,
                    padding,
                    outputFormat,
                    isEncryption: false,
                    timestamp: Date.now()
                };

                setHistory(prev => [newRecord, ...prev].slice(0, 50)); // 限制历史记录数量

                toast({
                    title: "解密成功",
                    description: "文本已成功解密",
                });
            } catch (err) {
                console.error("解密错误:", err);
                toast({
                    title: "解密失败",
                    description: "解密过程中发生错误，请检查输入参数和密文格式",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };

        // 如果CryptoJS已加载，直接使用；否则先加载
        if (cryptoJS) {
            decryptWithCryptoJS(cryptoJS);
        } else {
            import('crypto-js').then(module => {
                setCryptoJS(module);
                decryptWithCryptoJS(module);
            }).catch(err => {
                console.error("加载CryptoJS失败:", err);
                toast({
                    title: "解密失败",
                    description: "加载解密库失败，请刷新页面重试",
                    variant: "destructive",
                });
                setIsLoading(false);
            });
        }
    };

    // 复制结果到剪贴板
    const copyToClipboard = (text: string) => {
        if (!isBrowser) return;

        navigator.clipboard.writeText(text);

        toast({
            title: "已复制",
            description: "内容已复制到剪贴板",
        });
    };

    // 从历史记录中加载
    const loadFromHistory = (record: HistoryRecord) => {
        setText(record.text);
        setKey(record.key);
        setIv(record.iv);
        setMode(record.mode);
        setPadding(record.padding);
        setOutputFormat(record.outputFormat);
        setActiveTab(record.isEncryption ? "encrypt" : "decrypt");

        toast({
            title: "已加载",
            description: `已从历史记录加载${record.isEncryption ? "加密" : "解密"}数据`,
        });
    };

    // 清除历史记录
    const clearHistory = () => {
        if (!isBrowser) return;

        setHistory([]);
        localStorage.removeItem("aes-encryption-history");

        toast({
            title: "历史记录已清除",
            description: "所有加密/解密历史记录已删除",
        });
    };

    // 删除单个历史记录
    const deleteHistoryItem = (id: string) => {
        setHistory(prev => prev.filter(item => item.id !== id));

        toast({
            title: "记录已删除",
            description: "历史记录已删除",
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
                    <CardTitle>AES 加密/解密工具</CardTitle>
                    <CardDescription>
                        使用高级加密标准(AES)加密和解密文本数据，支持多种加密模式和选项。
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="encrypt">加密</TabsTrigger>
                            <TabsTrigger value="decrypt">解密</TabsTrigger>
                            <TabsTrigger value="history">历史记录</TabsTrigger>
                        </TabsList>

                        {/* 加密选项卡 */}
                        <TabsContent value="encrypt" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="plaintext">明文</Label>
                                    <Textarea
                                        id="plaintext"
                                        placeholder="输入需要加密的文本"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <Label htmlFor="key">密钥</Label>
                                        <div className="flex space-x-2">
                                            <Input
                                                id="key"
                                                placeholder="输入加密密钥"
                                                value={key}
                                                onChange={(e) => setKey(e.target.value)}
                                            />
                                            <Button variant="outline" size="icon" onClick={generateRandomKey} title="生成随机密钥">
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="key-size">密钥长度</Label>
                                        <Select value={keySize} onValueChange={setKeySize}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="选择密钥长度" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {KEY_SIZES.map((size) => (
                                                    <SelectItem key={size.value} value={size.value}>
                                                        {size.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show-advanced"
                                        checked={showAdvanced}
                                        onCheckedChange={setShowAdvanced}
                                    />
                                    <Label htmlFor="show-advanced">显示高级选项</Label>
                                </div>

                                {showAdvanced && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="mode">加密模式</Label>
                                                <Select value={mode} onValueChange={setMode}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择加密模式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MODES.map((m) => (
                                                            <SelectItem key={m.value} value={m.value}>
                                                                {m.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="padding">填充方式</Label>
                                                <Select value={padding} onValueChange={setPadding}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择填充方式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PADDINGS.map((p) => (
                                                            <SelectItem key={p.value} value={p.value}>
                                                                {p.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="output-format">输出格式</Label>
                                                <Select value={outputFormat} onValueChange={setOutputFormat}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择输出格式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OUTPUT_FORMATS.map((f) => (
                                                            <SelectItem key={f.value} value={f.value}>
                                                                {f.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {mode !== "ECB" && (
                                                <div>
                                                    <div className="flex justify-between items-center">
                                                        <Label htmlFor="iv">初始化向量 (IV)</Label>
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                id="use-random-iv"
                                                                checked={useRandomIv}
                                                                onCheckedChange={setUseRandomIv}
                                                            />
                                                            <Label htmlFor="use-random-iv" className="text-xs">自动生成IV</Label>
                                                        </div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <Input
                                                            id="iv"
                                                            placeholder="输入初始化向量"
                                                            value={iv}
                                                            onChange={(e) => setIv(e.target.value)}
                                                            disabled={useRandomIv}
                                                        />
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            onClick={generateRandomIv}
                                                            disabled={useRandomIv}
                                                            title="生成随机IV"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleEncrypt}
                                    disabled={isLoading || !text || !key}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            加密中...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            加密
                                        </>
                                    )}
                                </Button>

                                {result && (
                                    <div className="p-4 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>加密结果</Label>
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={result}
                                            readOnly
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 解密选项卡 */}
                        <TabsContent value="decrypt" className="space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="ciphertext">密文</Label>
                                    <Textarea
                                        id="ciphertext"
                                        placeholder="输入需要解密的文本"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                        className="min-h-[100px]"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="key-decrypt">密钥</Label>
                                    <Input
                                        id="key-decrypt"
                                        placeholder="输入解密密钥"
                                        value={key}
                                        onChange={(e) => setKey(e.target.value)}
                                    />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="show-advanced-decrypt"
                                        checked={showAdvanced}
                                        onCheckedChange={setShowAdvanced}
                                    />
                                    <Label htmlFor="show-advanced-decrypt">显示高级选项</Label>
                                </div>

                                {showAdvanced && (
                                    <div className="space-y-4 border rounded-md p-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="mode-decrypt">加密模式</Label>
                                                <Select value={mode} onValueChange={setMode}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择加密模式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {MODES.map((m) => (
                                                            <SelectItem key={m.value} value={m.value}>
                                                                {m.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="padding-decrypt">填充方式</Label>
                                                <Select value={padding} onValueChange={setPadding}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择填充方式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {PADDINGS.map((p) => (
                                                            <SelectItem key={p.value} value={p.value}>
                                                                {p.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label htmlFor="output-format-decrypt">输入格式</Label>
                                                <Select value={outputFormat} onValueChange={setOutputFormat}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="选择输入格式" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {OUTPUT_FORMATS.map((f) => (
                                                            <SelectItem key={f.value} value={f.value}>
                                                                {f.label}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {mode !== "ECB" && (
                                                <div>
                                                    <Label htmlFor="iv-decrypt">初始化向量 (IV)</Label>
                                                    <Input
                                                        id="iv-decrypt"
                                                        placeholder="输入初始化向量"
                                                        value={iv}
                                                        onChange={(e) => setIv(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <Button
                                    onClick={handleDecrypt}
                                    disabled={isLoading || !text || !key || (mode !== "ECB" && !iv)}
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            解密中...
                                        </>
                                    ) : (
                                        <>
                                            <Unlock className="mr-2 h-4 w-4" />
                                            解密
                                        </>
                                    )}
                                </Button>

                                {result && (
                                    <div className="p-4 border rounded-md bg-muted/30">
                                        <div className="flex justify-between items-center mb-2">
                                            <Label>解密结果</Label>
                                            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(result)}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <Textarea
                                            value={result}
                                            readOnly
                                            className="min-h-[100px]"
                                        />
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* 历史记录选项卡 */}
                        <TabsContent value="history" className="space-y-4">
                            {history.length > 0 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-lg font-medium">历史记录</h3>
                                        <Button variant="outline" size="sm" onClick={clearHistory}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            清除全部
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {history.map((record) => (
                                            <Card key={record.id} className="overflow-hidden">
                                                <CardContent className="p-4">
                                                    <div className="flex justify-between items-start">
                                                        <div className="space-y-1">
                                                            <div className="flex items-center space-x-2">
                                                                {record.isEncryption ? (
                                                                    <Lock className="h-4 w-4 text-blue-500" />
                                                                ) : (
                                                                    <Unlock className="h-4 w-4 text-green-500" />
                                                                )}
                                                                <span className="font-medium">
                                                                    {record.isEncryption ? "加密" : "解密"}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {formatDate(record.timestamp)}
                                                                </span>
                                                            </div>
                                                            <div className="text-sm truncate max-w-[300px]">
                                                                <span className="font-medium">文本: </span>
                                                                {record.text.length > 30
                                                                    ? `${record.text.substring(0, 30)}...`
                                                                    : record.text}
                                                            </div>
                                                            <div className="text-sm truncate max-w-[300px]">
                                                                <span className="font-medium">密钥: </span>
                                                                {record.key.length > 30
                                                                    ? `${record.key.substring(0, 30)}...`
                                                                    : record.key}
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                模式: {record.mode}, 填充: {record.padding}, 格式: {record.outputFormat}
                                                            </div>
                                                        </div>
                                                        <div className="flex space-x-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => loadFromHistory(record)}
                                                                title="加载此记录"
                                                            >
                                                                <History className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => deleteHistoryItem(record.id)}
                                                                title="删除此记录"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>暂无历史记录</p>
                                    <p className="text-sm">加密或解密操作后会自动保存到历史记录</p>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
