<template>
  <div class="settings-panel">
    <h2 class="panel-title">{{ t('settings.title') }}</h2>
    
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.apiKey') }}</h3>
      <ApiKeyInput v-model="userConfig.apiKey" />
      <p class="help-text">{{ t('settings.apiKeyHelp') }}</p>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.apiProvider') }}</h3>
      <div class="select-wrapper">
        <select v-model="userConfig.apiProvider" class="form-select">
          <option value="huggingface">{{ t('settings.apiProviderHuggingface') }}</option>
          <option value="replicate">{{ t('settings.apiProviderReplicate') }}</option>
          <option value="custom">{{ t('settings.apiProviderCustom') }}</option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div v-if="userConfig.apiProvider === 'custom'" class="settings-section">
      <h3 class="section-title">{{ t('settings.customEndpoint') }}</h3>
      <input
        v-model="userConfig.customEndpoint"
        type="text"
        :placeholder="t('settings.customEndpointPlaceholder')"
        class="form-input"
      />
    </div>

    <div v-if="userConfig.apiProvider === 'custom'" class="settings-section">
      <h3 class="section-title">{{ t('settings.customModel') }}</h3>
      <input
        v-model="userConfig.customModel"
        type="text"
        :placeholder="t('settings.customModelPlaceholder')"
        class="form-input"
      />
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.skipPreview') }}</h3>
      <div class="setting-row">
        <ToggleSwitch v-model="appSettings.skipPreview" />
        <p class="help-text">{{ t('settings.skipPreviewHelp') }}</p>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.shortcutKey') }}</h3>
      <input
        v-model="appSettings.shortcutKey"
        type="text"
        class="form-input"
        readonly
      />
      <p class="help-text">{{ t('settings.shortcutKeyHelp') }}</p>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.maxHistoryCount') }}</h3>
      <input
        v-model.number="appSettings.maxHistoryCount"
        type="number"
        :min="10"
        :max="100"
        class="form-input"
      />
      <p class="help-text">{{ t('settings.maxHistoryCountHelp') }}</p>
    </div>

    <div class="settings-actions">
      <button @click="handleReset" class="btn btn-secondary">
        {{ t('settings.reset') }}
      </button>
    </div>

    <div v-if="showSavedMessage" class="success-message">
      {{ t('settings.saved') }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAppSettings, useUserConfig } from '@/utils/storage';
import { DEFAULT_APP_SETTINGS, DEFAULT_USER_CONFIG } from '@/constants/defaults';
import ApiKeyInput from '@/components/common/ApiKeyInput.vue';
import ToggleSwitch from './ToggleSwitch.vue';

const { t } = useI18n();
const appSettings = useAppSettings();
const userConfig = useUserConfig();
const showSavedMessage = ref(false);

function handleReset() {
  if (confirm(t('settings.resetConfirm'))) {
    Object.assign(appSettings.value, DEFAULT_APP_SETTINGS);
    Object.assign(userConfig.value, DEFAULT_USER_CONFIG);
    showSavedMessage.value = true;
    setTimeout(() => {
      showSavedMessage.value = false;
    }, 2000);
  }
}
</script>

<style scoped>
.settings-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.panel-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #1f2937;
}

.settings-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.settings-section:last-child {
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #374151;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
}

.form-input:hover {
  border-color: #9ca3af;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input[readonly] {
  background-color: #f9fafb;
  cursor: default;
}

.select-wrapper {
  position: relative;
  width: 100%;
}

.form-select {
  width: 100%;
  padding: 10px 32px 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
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
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #6b7280;
  pointer-events: none;
}

.help-text {
  font-size: 12px;
  color: #6b7280;
  margin: 8px 0 0 0;
}

.setting-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}

.success-message {
  margin-top: 16px;
  padding: 12px;
  background-color: #d1fae5;
  color: #065f46;
  border-radius: 6px;
  font-size: 14px;
  text-align: center;
}
</style>
