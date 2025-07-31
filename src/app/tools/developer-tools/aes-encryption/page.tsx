import AESEncryption from "@/components/tools/developer-tools/AESEncryption";
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'AES 加密/解密工具 | 100+ 工具集合',
    description: '使用高级加密标准(AES)加密和解密文本数据，支持多种加密模式和选项。',
}

export default function AESEncryptionPage() {
    return <AESEncryption />;
}