<template>
  <div class="settings-panel">
    <h2 class="panel-title">{{ t('settings.title') }}</h2>
    
    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.apiKey') }}</h3>
      <ApiKeyInput v-model="apiKey" />
      <p class="help-text">{{ t('settings.apiKeyHelp') }}</p>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.apiProvider') }}</h3>
      <div class="select-wrapper">
        <select v-model="apiProvider" class="form-select">
          <option value="huggingface">{{ t('settings.apiProviderHuggingface') }}</option>
          <option value="replicate">{{ t('settings.apiProviderReplicate') }}</option>
          <option value="custom">{{ t('settings.apiProviderCustom') }}</option>
        </select>
        <span class="select-arrow">▼</span>
      </div>
    </div>

    <div v-if="apiProvider === 'custom'" class="settings-section">
      <h3 class="section-title">{{ t('settings.customEndpoint') }}</h3>
      <input
        v-model="customEndpoint"
        type="text"
        :placeholder="t('settings.customEndpointPlaceholder')"
        class="form-input"
      />
    </div>

    <div v-if="apiProvider === 'custom'" class="settings-section">
      <h3 class="section-title">{{ t('settings.customModel') }}</h3>
      <input
        v-model="customModel"
        type="text"
        :placeholder="t('settings.customModelPlaceholder')"
        class="form-input"
      />
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.skipPreview') }}</h3>
      <div class="setting-row">
        <ToggleSwitch :model-value="settingsStore.skipPreview" @update:model-value="handleSkipPreviewChange" />
        <p class="help-text">{{ t('settings.skipPreviewHelp') }}</p>
      </div>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.shortcutKey') }}</h3>
      <input
        :value="settingsStore.shortcutKey"
        type="text"
        class="form-input"
        readonly
      />
      <p class="help-text">{{ t('settings.shortcutKeyHelp') }}</p>
    </div>

    <div class="settings-section">
      <h3 class="section-title">{{ t('settings.maxHistoryCount') }}</h3>
      <input
        :value="settingsStore.maxHistoryCount"
        @input="handleMaxHistoryCountChange"
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
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores';
import { llmConfig as llmConfigStorage } from '@/utils/storage';
import type { LLMConfig } from '@/types/storage';
import { DEFAULT_LLM_CONFIG } from '@/constants/defaults';
import ApiKeyInput from '@/components/common/ApiKeyInput.vue';
import ToggleSwitch from './ToggleSwitch.vue';

const { t } = useI18n();
const settingsStore = useSettingsStore();

const llmConfig = ref<LLMConfig>({ ...DEFAULT_LLM_CONFIG });
let unwatchLLMConfig: (() => void) | null = null;

const showSavedMessage = ref(false);

const apiKey = computed({
  get: () => llmConfig.value.apiKey,
  set: (val) => {
    llmConfig.value.apiKey = val;
    llmConfigStorage.set(llmConfig.value);
  }
});

const apiProvider = computed({
  get: () => llmConfig.value.apiProvider,
  set: (val) => {
    llmConfig.value.apiProvider = val;
    llmConfigStorage.set(llmConfig.value);
  }
});

const customEndpoint = computed({
  get: () => llmConfig.value.customEndpoint || '',
  set: (val) => {
    llmConfig.value.customEndpoint = val;
    llmConfigStorage.set(llmConfig.value);
  }
});

const customModel = computed({
  get: () => llmConfig.value.customModel || '',
  set: (val) => {
    llmConfig.value.customModel = val;
    llmConfigStorage.set(llmConfig.value);
  }
});

async function handleSkipPreviewChange(val: boolean) {
  await settingsStore.setSkipPreview(val);
}

async function handleMaxHistoryCountChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = parseInt(target.value, 10);
  if (!isNaN(value) && value >= 10 && value <= 100) {
    await settingsStore.setMaxHistoryCount(value);
  }
}

async function handleReset() {
  if (confirm(t('settings.resetConfirm'))) {
    llmConfig.value = { ...DEFAULT_LLM_CONFIG };
    await llmConfigStorage.set(llmConfig.value);
    await settingsStore.resetSettings();
    showSavedMessage.value = true;
    setTimeout(() => {
      showSavedMessage.value = false;
    }, 1500);
  }
}

onMounted(async () => {
  llmConfig.value = await llmConfigStorage.get();
  unwatchLLMConfig = llmConfigStorage.watch((newValue) => {
    llmConfig.value = newValue;
  });
});
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
