import { storage } from '#imports';
import { ref, watch, onUnmounted } from 'vue';
import type { Ref } from 'vue';
import type {
  StorageData,
  UserConfig,
  PromptTemplate,
  OptimizeHistory,
  AppSettings,
  UserSelectorConfig,
} from '@/types/storage';
import { DEFAULT_USER_CONFIG, DEFAULT_APP_SETTINGS, DEFAULT_TEMPLATES } from '@/constants/defaults';

const userConfigItem = storage.defineItem<UserConfig>('local:userConfig', {
  fallback: DEFAULT_USER_CONFIG,
});

const promptTemplatesItem = storage.defineItem<PromptTemplate[]>('local:promptTemplates', {
  fallback: DEFAULT_TEMPLATES,
});

const optimizeHistoryItem = storage.defineItem<OptimizeHistory[]>('local:optimizeHistory', {
  fallback: [],
});

const appSettingsItem = storage.defineItem<AppSettings>('local:appSettings', {
  fallback: DEFAULT_APP_SETTINGS,
});

const userSelectorsItem = storage.defineItem<Record<string, UserSelectorConfig>>('local:userSelectors', {
  fallback: {},
});

/**
 * 创建响应式 Storage Item 的通用封装
 * 实现同一 Vue App 内数据同步 + 不同 Vue App (popup ↔ option) 数据同步
 * @param storageItem WXT storage.defineItem 创建的 storage item
 * @returns 响应式 Ref 对象
 */
function createReactiveStorageItem<T>(storageItem: {
  fallback: T;
  getValue: () => Promise<T | undefined>;
  setValue: (value: T) => Promise<void>;
  watch: (callback: (newValue: T | undefined, oldValue: T | undefined) => void) => () => void;
}): Ref<T> {
  const fallback = storageItem.fallback;
  const initialValue = Array.isArray(fallback)
    ? [...fallback]
    : typeof fallback === 'object' && fallback !== null
      ? { ...fallback }
      : fallback;
  const value = ref<T>(initialValue as T) as Ref<T>;

  const init = async () => {
    const storedValue = await storageItem.getValue();
    if (storedValue !== undefined && storedValue !== null) {
      value.value = storedValue;
    }
  };
  init();

  const unwatchStorage = storageItem.watch((newValue) => {
    if (newValue !== undefined && newValue !== null) {
      value.value = newValue;
    }
  });

  const stopWatchLocal = watch(
    value,
    (newVal) => {
      storageItem.setValue(newVal);
    },
    { deep: true }
  );

  onUnmounted(() => {
    unwatchStorage();
    stopWatchLocal();
  });

  return value;
}

/**
 * 用户配置响应式 Storage
 * 自动同步 popup 和 option 页面的用户配置
 */
export function useUserConfig(): Ref<UserConfig> {
  return createReactiveStorageItem(userConfigItem);
}

/**
 * 提示词模板响应式 Storage
 */
export function usePromptTemplates(): Ref<PromptTemplate[]> {
  return createReactiveStorageItem(promptTemplatesItem);
}

/**
 * 优化历史记录响应式 Storage
 */
export function useOptimizeHistory(): Ref<OptimizeHistory[]> {
  return createReactiveStorageItem(optimizeHistoryItem);
}

/**
 * 应用设置响应式 Storage
 * 自动同步 popup 和 option 页面的应用设置
 */
export function useAppSettings(): Ref<AppSettings> {
  return createReactiveStorageItem(appSettingsItem);
}

/**
 * 用户选择器配置响应式 Storage
 */
export function useUserSelectors(): Ref<Record<string, UserSelectorConfig>> {
  return createReactiveStorageItem(userSelectorsItem);
}

/**
 * 获取用户配置（非响应式）
 */
export async function getUserConfig(): Promise<UserConfig> {
  return (await userConfigItem.getValue()) || DEFAULT_USER_CONFIG;
}

/**
 * 更新用户配置（部分更新）
 */
export async function updateUserConfig(config: Partial<UserConfig>): Promise<void> {
  const currentConfig = await userConfigItem.getValue();
  if (!currentConfig) return;
  await userConfigItem.setValue({ ...currentConfig, ...config });
}

/**
 * 保存用户配置（完整覆盖）
 */
export async function saveUserConfig(config: UserConfig): Promise<void> {
  await userConfigItem.setValue(config);
}

/**
 * 保存提示词模板列表
 */
export async function savePromptTemplates(templates: PromptTemplate[]): Promise<void> {
  await promptTemplatesItem.setValue(templates);
}

/**
 * 添加提示词模板
 */
export async function addPromptTemplate(template: PromptTemplate): Promise<void> {
  const templates = (await promptTemplatesItem.getValue()) || [];
  await promptTemplatesItem.setValue([...templates, template]);
}

/**
 * 更新提示词模板
 */
export async function updatePromptTemplate(
  templateId: string,
  updates: Partial<PromptTemplate>
): Promise<void> {
  const templates = await promptTemplatesItem.getValue();
  if (!templates) return;

  const updatedTemplates = templates.map((template) =>
    template.id === templateId ? { ...template, ...updates, updatedAt: Date.now() } : template
  );
  await promptTemplatesItem.setValue(updatedTemplates);
}

/**
 * 删除提示词模板
 */
export async function deletePromptTemplate(templateId: string): Promise<void> {
  const templates = await promptTemplatesItem.getValue();
  if (!templates) return;

  await promptTemplatesItem.setValue(templates.filter((template) => template.id !== templateId));
}

/**
 * 添加优化历史记录
 */
export async function addOptimizeHistory(history: OptimizeHistory): Promise<void> {
  const histories = (await optimizeHistoryItem.getValue()) || [];
  const appSettings = await appSettingsItem.getValue();
  const maxCount = appSettings?.maxHistoryCount || 50;

  let updatedHistories = [history, ...histories];
  if (updatedHistories.length > maxCount) {
    updatedHistories = updatedHistories.slice(0, maxCount);
  }

  await optimizeHistoryItem.setValue(updatedHistories);
}

/**
 * 清除优化历史记录
 */
export async function clearOptimizeHistory(historyId?: string): Promise<void> {
  if (historyId) {
    const histories = await optimizeHistoryItem.getValue();
    if (!histories) return;
    await optimizeHistoryItem.setValue(histories.filter((history) => history.id !== historyId));
  } else {
    await optimizeHistoryItem.setValue([]);
  }
}

/**
 * 保存应用设置
 */
export async function saveAppSettings(settings: AppSettings): Promise<void> {
  await appSettingsItem.setValue(settings);
}

/**
 * 更新应用设置（部分更新）
 */
export async function updateAppSettings(settings: Partial<AppSettings>): Promise<void> {
  const currentSettings = await appSettingsItem.getValue();
  if (!currentSettings) return;
  await appSettingsItem.setValue({ ...currentSettings, ...settings });
}

/**
 * 保存用户选择器配置
 */
export async function saveUserSelector(siteId: string, config: UserSelectorConfig): Promise<void> {
  const selectors = (await userSelectorsItem.getValue()) || {};
  await userSelectorsItem.setValue({ ...selectors, [siteId]: config });
}

/**
 * 删除用户选择器配置
 */
export async function deleteUserSelector(siteId: string): Promise<void> {
  const selectors = await userSelectorsItem.getValue();
  if (!selectors) return;

  const { [siteId]: _, ...updatedSelectors } = selectors;
  await userSelectorsItem.setValue(updatedSelectors);
}

/**
 * 清除所有存储数据
 */
export async function clearAllStorage(): Promise<void> {
  await Promise.all([
    userConfigItem.removeValue(),
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
  const [userConfig, promptTemplates, optimizeHistory, appSettings, userSelectors] =
    await Promise.all([
      userConfigItem.getValue(),
      promptTemplatesItem.getValue(),
      optimizeHistoryItem.getValue(),
      appSettingsItem.getValue(),
      userSelectorsItem.getValue(),
    ]);

  return {
    userConfig: userConfig || DEFAULT_USER_CONFIG,
    promptTemplates: promptTemplates || DEFAULT_TEMPLATES,
    optimizeHistory: optimizeHistory || [],
    appSettings: appSettings || DEFAULT_APP_SETTINGS,
    userSelectors: userSelectors || {},
  };
}

/**
 * 导入存储数据
 */
export async function importStorageData(data: Partial<StorageData>): Promise<void> {
  const promises: Promise<void>[] = [];

  if (data.userConfig) promises.push(userConfigItem.setValue(data.userConfig));
  if (data.promptTemplates) promises.push(promptTemplatesItem.setValue(data.promptTemplates));
  if (data.optimizeHistory) promises.push(optimizeHistoryItem.setValue(data.optimizeHistory));
  if (data.appSettings) promises.push(appSettingsItem.setValue(data.appSettings));
  if (data.userSelectors) promises.push(userSelectorsItem.setValue(data.userSelectors));

  await Promise.all(promises);
}
