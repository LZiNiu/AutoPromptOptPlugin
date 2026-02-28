/**
 * API Key 加密工具模块
 * 使用 AES-256-GCM 对称加密算法
 */

import { storage } from '#imports';

const ENCRYPTION_KEY_NAME = 'local:apo-encryption-key';
const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;

// 定义加密密钥存储项
const encryptionKeyItem = storage.defineItem<number[]>(ENCRYPTION_KEY_NAME, {
  fallback: [],
});

/**
 * 生成或获取加密密钥
 * 密钥存储在 local storage 中
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  // 尝试从存储中读取密钥
  const storedKey = await encryptionKeyItem.getValue();

  if (storedKey && storedKey.length > 0) {
    // 导入已有密钥
    const keyData = new Uint8Array(storedKey);
    return await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // 生成新密钥
  const newKey = await crypto.subtle.generateKey(
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt']
  );

  // 导出并存储密钥
  const exportedKey = await crypto.subtle.exportKey('raw', newKey);
  const keyArray = Array.from(new Uint8Array(exportedKey));
  await encryptionKeyItem.setValue(keyArray);

  return newKey;
}

/**
 * 加密 API Key
 * @param apiKey 明文 API Key
 * @returns 加密后的字符串（base64 格式）
 */
export async function encryptApiKey(apiKey: string): Promise<string> {
  if (!apiKey) return '';

  try {
    const key = await getOrCreateEncryptionKey();

    // 生成随机 IV
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // 编码数据
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);

    // 加密
    const encrypted = await crypto.subtle.encrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    // 组合 IV 和加密数据
    const encryptedArray = new Uint8Array(encrypted);
    const result = new Uint8Array(iv.length + encryptedArray.length);
    result.set(iv);
    result.set(encryptedArray, iv.length);

    // 转换为 base64
    return btoa(String.fromCharCode(...result));
  } catch (error) {
    console.error('[AutoPromptOpt] 加密失败:', error);
    throw new Error('加密 API Key 失败');
  }
}

/**
 * 解密 API Key
 * @param encryptedKey 加密后的字符串（base64 格式）
 * @returns 明文 API Key
 */
export async function decryptApiKey(encryptedKey: string): Promise<string> {
  if (!encryptedKey) return '';

  try {
    const key = await getOrCreateEncryptionKey();

    // 从 base64 解码
    const encryptedData = new Uint8Array(
      atob(encryptedKey).split('').map(c => c.charCodeAt(0))
    );

    // 提取 IV 和加密数据
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);

    // 解密
    const decrypted = await crypto.subtle.decrypt(
      { name: ENCRYPTION_ALGORITHM, iv },
      key,
      data
    );

    // 解码为字符串
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error('[AutoPromptOpt] 解密失败:', error);
    throw new Error('解密 API Key 失败');
  }
}

/**
 * 检查值是否为加密格式
 * 加密格式：base64 编码，且解密后不为空
 * @param value 要检查的值
 * @returns 是否为加密格式
 */
export function isEncrypted(value: string): boolean {
  if (!value) return false;

  // 简单检查：加密值通常是 base64 格式，且长度较长
  // base64 特征：只包含 A-Z, a-z, 0-9, +, /, =
  const base64Pattern = /^[A-Za-z0-9+/=]+$/;
  if (!base64Pattern.test(value)) return false;

  // 检查长度：加密值通常比明文长
  // 最小长度：12字节 IV + 至少 16 字节加密数据 = 28 字节，base64 编码后约 38 字符
  if (value.length < 38) return false;

  return true;
}

/**
 * 尝试解密，如果失败则返回原值
 * 用于向后兼容：如果值不是加密格式，直接返回原值
 * @param value 可能加密的值
 * @returns 解密后的值或原值
 */
export async function tryDecrypt(value: string): Promise<string> {
  if (!value) return '';

  // 如果不是加密格式，直接返回
  if (!isEncrypted(value)) {
    return value;
  }

  try {
    return await decryptApiKey(value);
  } catch {
    // 解密失败，返回原值
    return value;
  }
}

/**
 * 加密并迁移 API Key
 * 如果值是明文，则加密后返回；如果已是加密格式，则直接返回
 * @param value API Key 值
 * @returns 加密后的值
 */
export async function encryptIfNeeded(value: string): Promise<string> {
  if (!value) return '';

  // 如果已经是加密格式，直接返回
  if (isEncrypted(value)) {
    return value;
  }

  // 否则加密
  return await encryptApiKey(value);
}
