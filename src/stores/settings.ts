import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppSettings } from '@/types/storage';
import { appSettings } from '@/utils/storage';
import { DEFAULT_APP_SETTINGS } from '@/constants/defaults';

/**
 * 设置 Store
 * 管理应用设置状态，业务变量与 storage 同步
 */
export const useSettingsStore = defineStore('settings', () => {
  // 业务响应式变量
  const language = ref<'zh-CN' | 'en'>(DEFAULT_APP_SETTINGS.language);
  const skipPreview = ref(DEFAULT_APP_SETTINGS.skipPreview);
  const shortcutKey = ref(DEFAULT_APP_SETTINGS.shortcutKey);
  const maxHistoryCount = ref(DEFAULT_APP_SETTINGS.maxHistoryCount);
  const privacyAccepted = ref(DEFAULT_APP_SETTINGS.privacyAccepted);
  const isLoaded = ref(false);

  // 存储监听取消函数
  let unwatchStorage: (() => void) | null = null;

  /**
   * 初始化 Store：从 storage 加载数据并监听变化
   */
  async function initialize() {
    if (isLoaded.value) return;

    const settings = await appSettings.get();
    language.value = settings.language;
    skipPreview.value = settings.skipPreview;
    shortcutKey.value = settings.shortcutKey;
    maxHistoryCount.value = settings.maxHistoryCount;
    privacyAccepted.value = settings.privacyAccepted;
    isLoaded.value = true;

    // 监听外部变化（其他页面修改 storage）
    unwatchStorage = appSettings.watch((newValue) => {
      language.value = newValue.language;
      skipPreview.value = newValue.skipPreview;
      shortcutKey.value = newValue.shortcutKey;
      maxHistoryCount.value = newValue.maxHistoryCount;
      privacyAccepted.value = newValue.privacyAccepted;
    });
  }

  /**
   * 清理资源：取消 storage 监听
   */
  function cleanup() {
    if (unwatchStorage) {
      unwatchStorage();
      unwatchStorage = null;
    }
  }

  /**
   * 同步数据到 storage
   */
  async function syncToStorage() {
    const settings: AppSettings = {
      language: language.value,
      skipPreview: skipPreview.value,
      shortcutKey: shortcutKey.value,
      maxHistoryCount: maxHistoryCount.value,
      privacyAccepted: privacyAccepted.value,
    };
    await appSettings.set(settings);
  }

  // 计算属性：隐私是否已接受
  const isPrivacyAccepted = computed(() => privacyAccepted.value);

  /**
   * 设置语言
   */
  async function setLanguage(lang: 'zh-CN' | 'en') {
    language.value = lang;
    await syncToStorage();
  }

  /**
   * 设置是否跳过预览
   */
  async function setSkipPreview(skip: boolean) {
    skipPreview.value = skip;
    await syncToStorage();
  }

  /**
   * 设置快捷键
   */
  async function setShortcutKey(key: string) {
    shortcutKey.value = key;
    await syncToStorage();
  }

  /**
   * 设置最大历史记录数
   */
  async function setMaxHistoryCount(count: number) {
    maxHistoryCount.value = count;
    await syncToStorage();
  }

  /**
   * 设置隐私接受状态
   */
  async function setPrivacyAccepted(accepted: boolean) {
    privacyAccepted.value = accepted;
    await syncToStorage();
  }

  /**
   * 重置为默认设置
   */
  async function resetSettings() {
    language.value = DEFAULT_APP_SETTINGS.language;
    skipPreview.value = DEFAULT_APP_SETTINGS.skipPreview;
    shortcutKey.value = DEFAULT_APP_SETTINGS.shortcutKey;
    maxHistoryCount.value = DEFAULT_APP_SETTINGS.maxHistoryCount;
    privacyAccepted.value = DEFAULT_APP_SETTINGS.privacyAccepted;
    await syncToStorage();
  }

  return {
    language,
    skipPreview,
    shortcutKey,
    maxHistoryCount,
    privacyAccepted,
    isLoaded,
    isPrivacyAccepted,
    initialize,
    cleanup,
    setLanguage,
    setSkipPreview,
    setShortcutKey,
    setMaxHistoryCount,
    setPrivacyAccepted,
    resetSettings,
  };
});
