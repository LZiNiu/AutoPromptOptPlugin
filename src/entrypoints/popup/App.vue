<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppSettings, useUserConfig, useOptimizeHistory } from '@/utils/storage';
import ApiKeyInput from '@/components/common/ApiKeyInput.vue';

const { t } = useI18n();
const appSettings = useAppSettings();
const userConfig = useUserConfig();
const optimizeHistory = useOptimizeHistory();

const skipPreview = computed({
  get: () => appSettings.value.skipPreview,
  set: (val) => { appSettings.value.skipPreview = val; }
});

const apiKey = computed({
  get: () => userConfig.value.apiKey,
  set: (val) => { userConfig.value.apiKey = val; }
});

const apiProvider = computed({
  get: () => userConfig.value.apiProvider,
  set: (val) => { userConfig.value.apiProvider = val; }
});

const customEndpoint = computed({
  get: () => userConfig.value.customEndpoint || '',
  set: (val) => { userConfig.value.customEndpoint = val; }
});

const customModel = computed({
  get: () => userConfig.value.customModel || '',
  set: (val) => { userConfig.value.customModel = val; }
});

const totalOptimizations = computed(() => optimizeHistory.value.length);

function openOptionsPage() {
  browser.tabs.create({
    url: browser.runtime.getURL('/options.html'),
  });
}
</script>

<template>
  <div class="popup-container">
    <div class="popup-header">
      <div class="logo">
        <span class="logo-icon">✨</span>
        <span class="logo-text">AutoPromptOpt</span>
      </div>
    </div>

    <div class="popup-content">
      <div class="setting-section">
        <label class="section-label">{{ t('settings.apiKey') }}</label>
        <ApiKeyInput v-model="apiKey" compact />
      </div>

      <div class="setting-section">
        <label class="section-label">{{ t('settings.apiProvider') }}</label>
        <div class="select-wrapper">
          <select v-model="apiProvider" class="form-select">
            <option value="huggingface">{{ t('settings.apiProviderHuggingface') }}</option>
            <option value="replicate">{{ t('settings.apiProviderReplicate') }}</option>
            <option value="custom">{{ t('settings.apiProviderCustom') }}</option>
          </select>
          <span class="select-arrow">▼</span>
        </div>
      </div>

      <div v-if="apiProvider === 'custom'" class="setting-section">
        <label class="section-label">{{ t('settings.customEndpoint') }}</label>
        <input
          v-model="customEndpoint"
          type="text"
          :placeholder="t('settings.customEndpointPlaceholder')"
          class="form-input"
        />
      </div>

      <div v-if="apiProvider === 'custom'" class="setting-section">
        <label class="section-label">{{ t('settings.customModel') }}</label>
        <input
          v-model="customModel"
          type="text"
          :placeholder="t('settings.customModelPlaceholder')"
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
  </div>
</template>

<style scoped>
.popup-container {
  width: 320px;
  min-height: 420px;
  background: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
