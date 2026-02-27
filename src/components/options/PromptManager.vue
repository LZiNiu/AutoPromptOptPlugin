<template>
  <div class="prompt-manager">
    <div class="manager-header">
      <h2 class="panel-title">{{ t('promptManager.title') }}</h2>
      <button @click="handleAddPrompt" class="btn btn-primary">
        {{ t('promptManager.newPrompt') }}
      </button>
    </div>

    <div class="manager-toolbar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('promptManager.searchPlaceholder')"
        class="search-input"
      />
      <select v-model="selectedStrategy" class="strategy-select">
        <option value="">{{ t('promptManager.allStrategies') }}</option>
        <option v-for="strategy in strategies" :key="strategy.value" :value="strategy.value">
          {{ strategy.label }}
        </option>
      </select>
    </div>

    <!-- 内置提示词 -->
    <div class="prompt-section">
      <h3 class="section-title">
        <span class="section-icon">📚</span>
        {{ t('promptManager.builtInPrompts') }}
      </h3>
      <div v-if="filteredBuiltInPrompts.length === 0" class="empty-state">
        <p class="empty-text">{{ t('promptManager.noBuiltInPrompts') }}</p>
      </div>
      <div v-else class="prompt-list">
        <div
          v-for="prompt in filteredBuiltInPrompts"
          :key="prompt.id"
          class="prompt-card"
          :class="{ 'is-overridden': isOverridden(prompt.id) }"
        >
          <div class="prompt-header">
            <div class="prompt-info">
              <span class="prompt-icon">{{ getStrategyIcon(prompt.strategy) }}</span>
              <div class="prompt-title-wrapper">
                <h4 class="prompt-name">{{ prompt.name }}</h4>
                <span v-if="isOverridden(prompt.id)" class="override-badge">
                  {{ t('promptManager.modified') }}
                </span>
              </div>
            </div>
            <div class="prompt-actions">
              <button @click="handleEdit(prompt)" class="btn-icon" :title="t('common.edit')">
                ✏️
              </button>
              <button
                v-if="isOverridden(prompt.id)"
                @click="handleReset(prompt)"
                class="btn-icon"
                :title="t('promptManager.resetToDefault')"
              >
                ↺
              </button>
            </div>
          </div>
          <p class="prompt-description">{{ prompt.description }}</p>
          <div class="prompt-meta">
            <span class="meta-item">temperature: {{ prompt.temperature }}</span>
            <span class="meta-item">maxTokens: {{ prompt.maxTokens }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 自定义提示词 -->
    <div class="prompt-section">
      <h3 class="section-title">
        <span class="section-icon">✨</span>
        {{ t('promptManager.customPrompts') }}
      </h3>
      <div v-if="filteredCustomPrompts.length === 0" class="empty-state">
        <p class="empty-text">{{ t('promptManager.noCustomPrompts') }}</p>
        <p class="empty-description">{{ t('promptManager.noCustomPromptsDesc') }}</p>
      </div>
      <div v-else class="prompt-list">
        <div
          v-for="prompt in filteredCustomPrompts"
          :key="prompt.id"
          class="prompt-card"
        >
          <div class="prompt-header">
            <div class="prompt-info">
              <span class="prompt-icon">{{ getStrategyIcon(prompt.strategy) }}</span>
              <h4 class="prompt-name">{{ prompt.name }}</h4>
            </div>
            <div class="prompt-actions">
              <button @click="handleEdit(prompt)" class="btn-icon" :title="t('common.edit')">
                ✏️
              </button>
              <button @click="handleDelete(prompt)" class="btn-icon" :title="t('common.delete')">
                🗑️
              </button>
            </div>
          </div>
          <p class="prompt-description">{{ prompt.description }}</p>
          <div class="prompt-meta">
            <span class="meta-item">temperature: {{ prompt.temperature }}</span>
            <span class="meta-item">maxTokens: {{ prompt.maxTokens }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑器模态框 -->
    <PromptEditor
      v-if="showEditor"
      :prompt="editingPrompt"
      :is-built-in="editingPrompt?.isBuiltIn ?? false"
      @save="handleSave"
      @cancel="showEditor = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { userPromptConfig } from '@/utils/storage';
import type { PromptConfig, UserPromptConfig, OptimizationStrategy } from '@/types/storage';
import {
  getAllPrompts,
  updateBuiltInPrompt,
  removeBuiltInOverride,
  addCustomPrompt,
  updateCustomPrompt,
  deleteCustomPrompt,
} from '@/utils/prompts';
import PromptEditor from './PromptEditor.vue';

const { t } = useI18n();

const searchQuery = ref('');
const selectedStrategy = ref<OptimizationStrategy | ''>('');
const showEditor = ref(false);
const editingPrompt = ref<PromptConfig | undefined>();

const userConfig = ref<UserPromptConfig>({
  selectedPromptId: 'general-v1',
  customPrompts: [],
  builtInOverrides: {},
});

// 加载用户配置
async function loadUserConfig() {
  const config = await userPromptConfig.get();
  userConfig.value = config;
}

loadUserConfig();

// 策略选项
const strategies = computed(() => [
  { value: 'general', label: t('strategies.general') },
  { value: 'coding', label: t('strategies.coding') },
  { value: 'writing', label: t('strategies.writing') },
  { value: 'translation', label: t('strategies.translation') },
  { value: 'analysis', label: t('strategies.analysis') },
  { value: 'creative', label: t('strategies.creative') },
  { value: 'custom', label: t('strategies.custom') },
]);

// 获取所有提示词
const allPrompts = computed(() => getAllPrompts(userConfig.value));

// 内置提示词
const builtInPrompts = computed(() => allPrompts.value.filter(p => p.isBuiltIn));

// 自定义提示词
const customPrompts = computed(() => allPrompts.value.filter(p => !p.isBuiltIn));

// 过滤后的内置提示词
const filteredBuiltInPrompts = computed(() => {
  let prompts = builtInPrompts.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    prompts = prompts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }
  
  if (selectedStrategy.value) {
    prompts = prompts.filter(p => p.strategy === selectedStrategy.value);
  }
  
  return prompts;
});

// 过滤后的自定义提示词
const filteredCustomPrompts = computed(() => {
  let prompts = customPrompts.value;
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    prompts = prompts.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query)
    );
  }
  
  if (selectedStrategy.value) {
    prompts = prompts.filter(p => p.strategy === selectedStrategy.value);
  }
  
  return prompts;
});

// 检查内置提示词是否被覆盖
function isOverridden(promptId: string): boolean {
  return promptId in userConfig.value.builtInOverrides;
}

// 获取策略图标
function getStrategyIcon(strategy: OptimizationStrategy): string {
  const icons: Record<OptimizationStrategy, string> = {
    general: '⚙️',
    coding: '💻',
    writing: '✍️',
    translation: '🌐',
    analysis: '📊',
    creative: '🎨',
    custom: '🔧',
  };
  return icons[strategy] || '🔧';
}

// 添加提示词
function handleAddPrompt() {
  editingPrompt.value = undefined;
  showEditor.value = true;
}

// 编辑提示词
function handleEdit(prompt: PromptConfig) {
  editingPrompt.value = prompt;
  showEditor.value = true;
}

// 重置内置提示词
async function handleReset(prompt: PromptConfig) {
  if (confirm(t('promptManager.resetConfirm'))) {
    const newConfig = removeBuiltInOverride(userConfig.value, prompt.id);
    await userPromptConfig.set(newConfig);
    userConfig.value = newConfig;
  }
}

// 删除自定义提示词
async function handleDelete(prompt: PromptConfig) {
  if (confirm(t('promptManager.deleteConfirm'))) {
    const newConfig = deleteCustomPrompt(userConfig.value, prompt.id);
    await userPromptConfig.set(newConfig);
    userConfig.value = newConfig;
  }
}

// 保存提示词
async function handleSave(promptData: Partial<PromptConfig>, isNew: boolean) {
  if (editingPrompt.value?.isBuiltIn) {
    // 更新内置提示词（创建覆盖）
    const newConfig = updateBuiltInPrompt(userConfig.value, editingPrompt.value.id, promptData);
    await userPromptConfig.set(newConfig);
    userConfig.value = newConfig;
  } else if (isNew) {
    // 添加新自定义提示词
    const { config: newConfig } = addCustomPrompt(userConfig.value, promptData as Omit<PromptConfig, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>);
    await userPromptConfig.set(newConfig);
    userConfig.value = newConfig;
  } else if (editingPrompt.value) {
    // 更新自定义提示词
    const newConfig = updateCustomPrompt(userConfig.value, editingPrompt.value.id, promptData);
    await userPromptConfig.set(newConfig);
    userConfig.value = newConfig;
  }
  
  showEditor.value = false;
  editingPrompt.value = undefined;
}
</script>

<style scoped>
.prompt-manager {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.manager-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.panel-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.manager-toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
}

.search-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.strategy-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  min-width: 140px;
}

.strategy-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.prompt-section {
  margin-bottom: 32px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e5e7eb;
}

.section-icon {
  font-size: 18px;
}

.prompt-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.prompt-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  transition: all 0.2s;
}

.prompt-card:hover {
  border-color: #d1d5db;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.prompt-card.is-overridden {
  background: #fffbeb;
  border-color: #fbbf24;
}

.prompt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
}

.prompt-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.prompt-icon {
  font-size: 20px;
}

.prompt-title-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prompt-name {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.override-badge {
  font-size: 11px;
  padding: 2px 8px;
  background: #fbbf24;
  color: #92400e;
  border-radius: 12px;
  font-weight: 500;
}

.prompt-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: #e5e7eb;
}

.prompt-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.prompt-meta {
  display: flex;
  gap: 16px;
}

.meta-item {
  font-size: 12px;
  color: #9ca3af;
  font-family: monospace;
}

.empty-state {
  text-align: center;
  padding: 32px;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
}

.empty-text {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
}

.empty-description {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}
</style>
