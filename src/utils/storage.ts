import { storage } from '#imports';
import type {
  StorageData,
  LLMConfig,
  PromptTemplate,
  OptimizeHistoryItem,
  AppSettings,
  UserSelectorConfig,
  UserPromptConfig,
} from '@/types/storage';
import { DEFAULT_LLM_CONFIG, DEFAULT_APP_SETTINGS, DEFAULT_TEMPLATES } from '@/constants/defaults';
import { DEFAULT_USER_PROMPT_CONFIG } from './prompts';
import { encryptIfNeeded, tryDecrypt } from './crypto';

// ==================== Storage Items 定义 ====================

const llmConfigItem = storage.defineItem<LLMConfig>('local:llmConfig', {
  fallback: DEFAULT_LLM_CONFIG,
});

const promptTemplatesItem = storage.defineItem<PromptTemplate[]>('local:promptTemplates', {
  fallback: DEFAULT_TEMPLATES,
});

const appSettingsItem = storage.defineItem<AppSettings>('local:appSettings', {
  fallback: DEFAULT_APP_SETTINGS,
});

const userSelectorsItem = storage.defineItem<Record<string, UserSelectorConfig>>('local:userSelectors', {
  fallback: {},
});

const userPromptConfigItem = storage.defineItem<UserPromptConfig>('local:userPromptConfig', {
  fallback: DEFAULT_USER_PROMPT_CONFIG,
});

// Session 级历史记录存储
const sessionHistoryItem = storage.defineItem<OptimizeHistoryItem[]>('session:apo-history', {
  fallback: [],
});

// ==================== 通用操作函数 ====================

type WxtStorageItem<T> = ReturnType<typeof storage.defineItem<T>>;

/**
 * 获取存储项的值
 */
export async function getStorageItem<T>(item: WxtStorageItem<T>, fallback: T): Promise<T> {
  const value = await item.getValue();
  return value ?? fallback;
}

/**
 * 设置存储项的值
 */
export async function setStorageItem<T>(item: WxtStorageItem<T>, value: T): Promise<void> {
  await item.setValue(value);
}

/**
 * 监听存储项的变化
 * @returns 取消监听函数
 */
export function watchStorageItem<T>(item: WxtStorageItem<T>, callback: (value: T) => void): () => void {
  return item.watch(callback as (value: T | null) => void); // 类型断言, 消除ts错误, 实际callback不会为null
}

/**
 * 更新存储项的值（部分更新）
 */
export async function updateStorageItem<T>(item: WxtStorageItem<T>, value: Partial<T>): Promise<void> {
  const currentValue = await item.getValue();
  if (!currentValue) return;
  await item.setValue({ ...currentValue, ...value });
}

// ==================== 便捷访问器工厂 ====================

interface StorageAccessors<T> {
  get: () => Promise<T>;
  set: (value: T) => Promise<void>;
  update: (value: Partial<T>) => Promise<void>;
  watch: (callback: (value: T) => void) => () => void;
}

/**
 * 创建存储项的便捷访问器
 */
function createStorageAccessors<T>(item: WxtStorageItem<T>, fallback: T): StorageAccessors<T> {
  return {
    get: () => getStorageItem(item, fallback),
    set: (value: T) => setStorageItem(item, value),
    update: (value: Partial<T>) => updateStorageItem(item, value),
    watch: (callback: (value: T) => void) => watchStorageItem(item, callback),
  };
}

// ==================== 便捷访问器导出 ====================

/**
 * LLM 配置便捷访问器（带加密）
 */
export const llmConfig = {
  async get(): Promise<LLMConfig> {
    const config = await getStorageItem(llmConfigItem, DEFAULT_LLM_CONFIG);
    // 解密 API Key
    if (config.apiKey) {
      config.apiKey = await tryDecrypt(config.apiKey);
    }
    return config;
  },
  async set(value: LLMConfig): Promise<void> {
    // 加密 API Key
    const encryptedValue = {
      ...value,
      apiKey: await encryptIfNeeded(value.apiKey),
    };
    await setStorageItem(llmConfigItem, encryptedValue);
  },
  async update(value: Partial<LLMConfig>): Promise<void> {
    const currentValue = await llmConfigItem.getValue();
    if (!currentValue) return;

    // 如果更新包含 apiKey，需要加密
    const updatedValue = { ...currentValue, ...value };
    if (value.apiKey !== undefined) {
      updatedValue.apiKey = await encryptIfNeeded(value.apiKey);
    }
    await llmConfigItem.setValue(updatedValue);
  },
  watch(callback: (value: LLMConfig) => void): () => void {
    return watchStorageItem(llmConfigItem, async (value) => {
      // 解密后回调
      if (value?.apiKey) {
        value.apiKey = await tryDecrypt(value.apiKey);
      }
      callback(value);
    });
  },
};

/**
 * 提示词模板便捷访问器
 */
export const promptTemplates = createStorageAccessors(promptTemplatesItem, DEFAULT_TEMPLATES);

/**
 * 应用设置便捷访问器
 */
export const appSettings = createStorageAccessors(appSettingsItem, DEFAULT_APP_SETTINGS);

/**
 * 用户选择器配置便捷访问器
 */
export const userSelectors = createStorageAccessors(userSelectorsItem, {});

/**
 * 用户提示词配置便捷访问器
 */
export const userPromptConfig = createStorageAccessors(userPromptConfigItem, DEFAULT_USER_PROMPT_CONFIG);

/**
 * Session 级历史记录便捷访问器
 */
export const sessionHistory = createStorageAccessors(sessionHistoryItem, []);

// ==================== 特殊操作函数 ====================



/**
 * 生成唯一 ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 检查是否在 content script 环境中
 */
function isContentScript(): boolean {
  return typeof window !== 'undefined' && window.location.protocol !== 'chrome-extension:';
}

/**
 * 添加 Session 级优化历史记录（FIFO 队列）
 * @param item 历史记录项（不含 id 和 timestamp）
 * @param maxLimit 最大记录数限制
 */
export async function addSessionHistory(
  item: Omit<OptimizeHistoryItem, 'id' | 'timestamp'>,
  maxLimit: number
): Promise<void> {
  // 在 content script 中通过消息传递访问
  if (isContentScript()) {
    const response = await browser.runtime.sendMessage({
      type: 'ADD_SESSION_HISTORY',
      payload: { item, maxLimit },
    });
    if (!response.success) {
      throw new Error(response.error);
    }
    return;
  }

  // 在 background/options/popup 中直接访问
  const histories = await sessionHistory.get();

  const newItem: OptimizeHistoryItem = {
    ...item,
    id: generateId(),
    timestamp: Date.now(),
  };

  // FIFO：新记录添加到队尾，超出限制时从队首移除
  const updated = [...histories, newItem];
  while (updated.length > maxLimit) {
    updated.shift(); // 移除最旧的记录
  }

  await sessionHistory.set(updated);
}

/**
 * 获取 Session 级优化历史记录（倒序，最新的在前）
 */
export async function getSessionHistory(): Promise<OptimizeHistoryItem[]> {
  // 在 content script 中通过消息传递访问
  if (isContentScript()) {
    const response = await browser.runtime.sendMessage({
      type: 'GET_SESSION_HISTORY',
    });
    if (!response.success) {
      throw new Error(response.error);
    }
    return [...response.data].reverse(); // 倒序返回
  }

  // 在 background/options/popup 中直接访问
  const histories = await sessionHistory.get();
  return [...histories].reverse(); // 倒序返回
}

/**
 * 清除 Session 级优化历史记录
 */
export async function clearSessionHistory(): Promise<void> {
  // 在 content script 中通过消息传递访问
  if (isContentScript()) {
    const response = await browser.runtime.sendMessage({
      type: 'CLEAR_SESSION_HISTORY',
    });
    if (!response.success) {
      throw new Error(response.error);
    }
    return;
  }

  // 在 background/options/popup 中直接访问
  await sessionHistory.set([]);
}

/**
 * 保存单个用户选择器配置
 */
export async function saveUserSelector(siteId: string, config: UserSelectorConfig): Promise<void> {
  const selectors = await userSelectors.get();
  await userSelectors.set({ ...selectors, [siteId]: config });
}

/**
 * 删除用户选择器配置
 */
export async function deleteUserSelector(siteId: string): Promise<void> {
  const selectors = await userSelectors.get();
  const { [siteId]: _, ...updatedSelectors } = selectors;
  await userSelectors.set(updatedSelectors);
}

// ==================== Utility API ====================

/**
 * 清除所有存储数据
 */
export async function clearAllStorage(): Promise<void> {
  await Promise.all([
    llmConfigItem.removeValue(),
    promptTemplatesItem.removeValue(),
    appSettingsItem.removeValue(),
    userSelectorsItem.removeValue(),
    userPromptConfigItem.removeValue(),
  ]);
}

/**
 * 导出存储数据
 */
export async function exportStorageData(): Promise<Partial<StorageData>> {
  const [llmConfigData, templates, settings, selectors, promptConfig] =
    await Promise.all([
      llmConfigItem.getValue(),
      promptTemplatesItem.getValue(),
      appSettingsItem.getValue(),
      userSelectorsItem.getValue(),
      userPromptConfigItem.getValue(),
    ]);

  return {
    userConfig: llmConfigData || DEFAULT_LLM_CONFIG,
    promptTemplates: templates || DEFAULT_TEMPLATES,
    appSettings: settings || DEFAULT_APP_SETTINGS,
    userSelectors: selectors || {},
    userPromptConfig: promptConfig || DEFAULT_USER_PROMPT_CONFIG,
  };
}

/**
 * 导入存储数据
 */
export async function importStorageData(data: Partial<StorageData>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (data.userConfig) promises.push(llmConfigItem.setValue(data.userConfig));
  if (data.promptTemplates) promises.push(promptTemplatesItem.setValue(data.promptTemplates));
  if (data.appSettings) promises.push(appSettingsItem.setValue(data.appSettings));
  if (data.userSelectors) promises.push(userSelectorsItem.setValue(data.userSelectors));
  if (data.userPromptConfig) promises.push(userPromptConfigItem.setValue(data.userPromptConfig));

  await Promise.all(promises);
}
