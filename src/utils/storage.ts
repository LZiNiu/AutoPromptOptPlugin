import { storage } from '#imports';
import type {
  StorageData,
  LLMConfig,
  PromptTemplate,
  OptimizeHistory,
  AppSettings,
  UserSelectorConfig,
} from '@/types/storage';
import { DEFAULT_LLM_CONFIG, DEFAULT_APP_SETTINGS, DEFAULT_TEMPLATES } from '@/constants/defaults';

// ==================== Storage Items 定义 ====================

const llmConfigItem = storage.defineItem<LLMConfig>('local:llmConfig', {
  fallback: DEFAULT_LLM_CONFIG,
});

const promptTemplatesItem = storage.defineItem<PromptTemplate[]>('local:promptTemplates', {
  fallback: DEFAULT_TEMPLATES,
});

const optimizeHistoryItem = storage.defineItem<OptimizeHistory[]>('session:optimizeHistory', {
  fallback: [],
});

const appSettingsItem = storage.defineItem<AppSettings>('local:appSettings', {
  fallback: DEFAULT_APP_SETTINGS,
});

const userSelectorsItem = storage.defineItem<Record<string, UserSelectorConfig>>('local:userSelectors', {
  fallback: {},
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
 * LLM 配置便捷访问器
 */
export const llmConfig = createStorageAccessors(llmConfigItem, DEFAULT_LLM_CONFIG);

/**
 * 提示词模板便捷访问器
 */
export const promptTemplates = createStorageAccessors(promptTemplatesItem, DEFAULT_TEMPLATES);

/**
 * 优化历史记录便捷访问器
 */
export const optimizeHistory = createStorageAccessors(optimizeHistoryItem, []);

/**
 * 应用设置便捷访问器
 */
export const appSettings = createStorageAccessors(appSettingsItem, DEFAULT_APP_SETTINGS);

/**
 * 用户选择器配置便捷访问器
 */
export const userSelectors = createStorageAccessors(userSelectorsItem, {});

// ==================== 特殊操作函数 ====================

/**
 * 添加优化历史记录
 */
export async function addOptimizeHistory(history: OptimizeHistory): Promise<void> {
  const histories = await optimizeHistory.get();
  const settings = await appSettings.get();
  const maxCount = settings?.maxHistoryCount || 50;

  const updatedHistories = [history, ...histories].slice(0, maxCount);
  await optimizeHistory.set(updatedHistories);
}

/**
 * 清除优化历史记录
 */
export async function clearOptimizeHistory(historyId?: string): Promise<void> {
  if (historyId) {
    const histories = await optimizeHistory.get();
    await optimizeHistory.set(histories.filter((h) => h.id !== historyId));
  } else {
    await optimizeHistory.set([]);
  }
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
    optimizeHistoryItem.removeValue(),
    appSettingsItem.removeValue(),
    userSelectorsItem.removeValue(),
  ]);
}

/**
 * 导出存储数据
 */
export async function exportStorageData(): Promise<Partial<StorageData>> {
  const [llmConfig, templates, history, settings, selectors] =
    await Promise.all([
      llmConfigItem.getValue(),
      promptTemplatesItem.getValue(),
      optimizeHistoryItem.getValue(),
      appSettingsItem.getValue(),
      userSelectorsItem.getValue(),
    ]);

  return {
    userConfig: llmConfig || DEFAULT_LLM_CONFIG,
    promptTemplates: templates || DEFAULT_TEMPLATES,
    optimizeHistory: history || [],
    appSettings: settings || DEFAULT_APP_SETTINGS,
    userSelectors: selectors || {},
  };
}

/**
 * 导入存储数据
 */
export async function importStorageData(data: Partial<StorageData>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (data.userConfig) promises.push(llmConfigItem.setValue(data.userConfig));
  if (data.promptTemplates) promises.push(promptTemplatesItem.setValue(data.promptTemplates));
  if (data.optimizeHistory) promises.push(optimizeHistoryItem.setValue(data.optimizeHistory));
  if (data.appSettings) promises.push(appSettingsItem.setValue(data.appSettings));
  if (data.userSelectors) promises.push(userSelectorsItem.setValue(data.userSelectors));

  await Promise.all(promises);
}
