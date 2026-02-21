import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { AppSettings } from '@/types/storage';
import {
  useAppSettings,
  saveAppSettings,
} from '@/utils/storage';
import { DEFAULT_APP_SETTINGS } from '@/constants/defaults';

/**
 * 设置 Store
 * 管理应用设置状态
 */
export const useSettingsStore = defineStore('settings', () => {
  const storageSettings = useAppSettings() as Ref<AppSettings>;
  const language = ref(storageSettings.value.language);
  const skipPreview = ref(storageSettings.value.skipPreview);
  const shortcutKey = ref(storageSettings.value.shortcutKey);
  const maxHistoryCount = ref(storageSettings.value.maxHistoryCount);
  const privacyAccepted = ref(storageSettings.value.privacyAccepted);

  const isPrivacyAccepted = computed(() => privacyAccepted.value);

  function setLanguage(lang: 'zh-CN' | 'en') {
    language.value = lang;
    saveSettings();
  }

  function setSkipPreview(skip: boolean) {
    skipPreview.value = skip;
    saveSettings();
  }

  function setShortcutKey(key: string) {
    shortcutKey.value = key;
    saveSettings();
  }

  function setMaxHistoryCount(count: number) {
    maxHistoryCount.value = count;
    saveSettings();
  }

  function setPrivacyAccepted(accepted: boolean) {
    privacyAccepted.value = accepted;
    saveSettings();
  }

  function saveSettings() {
    const settings: AppSettings = {
      language: language.value,
      skipPreview: skipPreview.value,
      shortcutKey: shortcutKey.value,
      maxHistoryCount: maxHistoryCount.value,
      privacyAccepted: privacyAccepted.value,
    };
    saveAppSettings(settings);
  }

  function resetSettings() {
    language.value = DEFAULT_APP_SETTINGS.language;
    skipPreview.value = DEFAULT_APP_SETTINGS.skipPreview;
    shortcutKey.value = DEFAULT_APP_SETTINGS.shortcutKey;
    maxHistoryCount.value = DEFAULT_APP_SETTINGS.maxHistoryCount;
    privacyAccepted.value = DEFAULT_APP_SETTINGS.privacyAccepted;
    saveSettings();
  }

  return {
    language,
    skipPreview,
    shortcutKey,
    maxHistoryCount,
    privacyAccepted,
    isPrivacyAccepted,
    setLanguage,
    setSkipPreview,
    setShortcutKey,
    setMaxHistoryCount,
    setPrivacyAccepted,
    saveSettings,
    resetSettings,
  };
});
