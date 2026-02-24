<template>
  <select
    :value="settingsStore.language"
    @change="handleLanguageChange"
    class="language-switcher"
  >
    <option
      v-for="lang in supportedLanguages"
      :key="lang.value"
      :value="lang.value"
    >
      {{ lang.flag }} {{ lang.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores';
import { SUPPORTED_LANGUAGES } from '@/constants/defaults';

const { locale } = useI18n();
const settingsStore = useSettingsStore();
const supportedLanguages = SUPPORTED_LANGUAGES;

async function handleLanguageChange(event: Event) {
  const target = event.target as HTMLSelectElement;
  const newLang = target.value as 'zh-CN' | 'en';
  locale.value = newLang;
  await settingsStore.setLanguage(newLang);
}
</script>

<style scoped>
.language-switcher {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  cursor: pointer;
  transition: border-color 0.2s;
}

.language-switcher:hover {
  border-color: #9ca3af;
}

.language-switcher:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
</style>
