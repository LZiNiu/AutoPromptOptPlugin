<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore, useHistoryStore } from '@/stores';
import { llmConfig as llmConfigStorage } from '@/utils/storage';
import type { LLMConfig } from '@/types/storage';
import { DEFAULT_LLM_CONFIG, PRESET_API_PROVIDERS, getProviderConfig } from '@/constants/defaults';
import ApiKeyInput from '@/components/common/ApiKeyInput.vue';

const { t } = useI18n();
const settingsStore = useSettingsStore();
const historyStore = useHistoryStore();

const isLoading = ref(true);
const llmConfig = ref<LLMConfig>({ ...DEFAULT_LLM_CONFIG });

let unwatchLLMConfig: (() => void) | null = null;

const skipPreview = computed({
  get: () => settingsStore.skipPreview,
  set: (val) => { settingsStore.setSkipPreview(val); }
});

// API Key 防抖更新
let apiKeyDebounceTimer: ReturnType<typeof setTimeout> | null = null;
const apiKey = computed({
  get: () => llmConfig.value.apiKey,
  set: (val) => {
    llmConfig.value.apiKey = val;
    // 防抖：500ms 后保存
    if (apiKeyDebounceTimer) {
      clearTimeout(apiKeyDebounceTimer);
    }
    apiKeyDebounceTimer = setTimeout(() => {
      llmConfigStorage.set(llmConfig.value);
    }, 500);
  }
});

const providerId = computed({
  get: () => llmConfig.value.providerId,
  set: (val) => {
    llmConfig.value.providerId = val;
    const config = getProviderConfig(val);
    if (val !== 'custom') {
      llmConfig.value.endpoint = config.defaultEndpoint;
      llmConfig.value.model = config.defaultModel;
    }
    llmConfigStorage.set(llmConfig.value);
  }
});

const isCustomProvider = computed(() => providerId.value === 'custom');

const currentProvider = computed(() => getProviderConfig(providerId.value));

const apiKeyPlaceholder = computed(() => currentProvider.value.keyPlaceholder);

const totalOptimizations = computed(() => historyStore.histories.length);

function openOptionsPage() {
  browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
  });
}

onMounted(async () => {
  await Promise.all([
    settingsStore.initialize(),
    historyStore.initialize(),
  ]);
  
  llmConfig.value = await llmConfigStorage.get();
  
  unwatchLLMConfig = llmConfigStorage.watch((newValue) => {
    llmConfig.value = newValue;
  });
  
  isLoading.value = false;
});

onUnmounted(() => {
  settingsStore.cleanup();
  historyStore.cleanup();
  if (unwatchLLMConfig) {
    unwatchLLMConfig();
  }
});
</script>

<template>
  <div class="popup-container">
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <div class="popup-header">
        <div class="logo">
          <span class="logo-icon">✨</span>
          <span class="logo-text">AutoPromptOpt</span>
        </div>
      </div>

      <div class="popup-content">
        <div class="setting-section">
          <label class="section-label">{{ t('settings.apiProvider') }}</label>
          <div class="select-wrapper">
            <select v-model="providerId" class="form-select">
              <option v-for="provider in PRESET_API_PROVIDERS" :key="provider.id" :value="provider.id">
                {{ provider.name }}
              </option>
            </select>
            <span class="select-arrow">▼</span>
          </div>
        </div>

        <div class="setting-section">
          <label class="section-label">{{ t('settings.apiKey') }}</label>
          <ApiKeyInput v-model="apiKey" :placeholder="apiKeyPlaceholder" compact />
        </div>

        <div v-if="isCustomProvider" class="setting-section">
          <label class="section-label">{{ t('settings.endpoint') }}</label>
          <input
            v-model="llmConfig.endpoint"
            @change="llmConfigStorage.set(llmConfig)"
            type="text"
            :placeholder="t('settings.endpointPlaceholder')"
            class="form-input"
          />
        </div>

        <div class="setting-section">
          <label class="section-label">{{ t('settings.model') }}</label>
          <input
            v-model="llmConfig.model"
            @change="llmConfigStorage.set(llmConfig)"
            type="text"
            :placeholder="t('settings.modelPlaceholder')"
            class="form-input"
          />
        </div>

        <div class="quick-setting">
          <label class="setting-label">
            <input 
              type="checkbox" 
              v-model="skipPreview"
              class="setting-checkbox"
            />
            <span>{{ t('settings.skipPreview') }}</span>
          </label>
        </div>

        <div class="stats-info">
          <div class="stat-item">
            <span class="stat-icon">📊</span>
            <div class="stat-content">
              <span class="stat-value">{{ totalOptimizations }}</span>
              <span class="stat-label">{{ t('history.totalOptimizations') }}</span>
            </div>
          </div>
        </div>

        <button @click="openOptionsPage" class="btn btn-settings">
          ⚙️ {{ t('settings.title') }}
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.popup-container {
  width: 320px;
  min-height: 420px;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e5e7eb;
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.popup-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
  color: white;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
}

.popup-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.setting-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.section-label {
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
}

.form-input:hover {
  border-color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.form-input::placeholder {
  color: #9ca3af;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.form-select {
  width: 100%;
  padding: 8px 28px 8px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
  appearance: none;
  cursor: pointer;
}

.form-select:hover {
  border-color: #9ca3af;
}

.form-select:focus {
  outline: none;
  border-color: #14b8a6;
  box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.1);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 8px;
  color: #6b7280;
  pointer-events: none;
}

.quick-setting {
  padding: 10px 12px;
  background: #f0fdfa;
  border-radius: 8px;
  border: 1px solid #ccfbf1;
}

.setting-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.setting-checkbox {
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: #14b8a6;
}

.stats-info {
  padding: 12px;
  background: #f0fdfa;
  border-radius: 8px;
  border: 1px solid #ccfbf1;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  font-size: 24px;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 22px;
  font-weight: 700;
  color: #0f766e;
}

.stat-label {
  font-size: 12px;
  color: #5eead4;
}

.btn {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-settings {
  background: #14b8a6;
  color: white;
}

.btn-settings:hover {
  background: #0d9488;
}
</style>
