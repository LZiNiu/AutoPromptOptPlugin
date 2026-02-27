<template>
  <div class="modal-overlay" @click.self="handleCancel">
    <div class="modal-content">
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isNew ? t('promptEditor.newTitle') : t('promptEditor.editTitle') }}
        </h3>
        <button @click="handleCancel" class="btn-close">×</button>
      </div>

      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">
            {{ t('promptEditor.name') }}
            <span class="required">*</span>
          </label>
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :placeholder="t('promptEditor.namePlaceholder')"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('promptEditor.description') }}</label>
          <input
            v-model="formData.description"
            type="text"
            class="form-input"
            :placeholder="t('promptEditor.descriptionPlaceholder')"
          />
        </div>

        <div class="form-group">
          <label class="form-label">
            {{ t('promptEditor.strategy') }}
            <span class="required">*</span>
          </label>
          <select v-model="formData.strategy" class="form-select">
            <option v-for="strategy in strategies" :key="strategy.value" :value="strategy.value">
              {{ strategy.label }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">
            {{ t('promptEditor.systemPrompt') }}
            <span class="required">*</span>
          </label>
          <textarea
            v-model="formData.systemPrompt"
            class="form-textarea"
            rows="6"
            :placeholder="t('promptEditor.systemPromptPlaceholder')"
          ></textarea>
        </div>

        <div class="form-group">
          <label class="form-label">
            {{ t('promptEditor.userPromptTemplate') }}
            <span class="required">*</span>
          </label>
          <textarea
            v-model="formData.userPromptTemplate"
            class="form-textarea"
            rows="4"
            :placeholder="t('promptEditor.userPromptTemplatePlaceholder')"
          ></textarea>
          <p class="form-hint">
            <span class="hint-icon">ℹ️</span>
            {{ t('promptEditor.placeholderTip') }}
          </p>
        </div>

        <div class="form-section">
          <h4 class="section-title">{{ t('promptEditor.advancedParams') }}</h4>
          <div class="form-row">
            <div class="form-group half">
              <label class="form-label">
                {{ t('promptEditor.temperature') }}
                <span class="param-range">(0-2)</span>
              </label>
              <input
                v-model.number="formData.temperature"
                type="number"
                min="0"
                max="2"
                step="0.1"
                class="form-input"
              />
            </div>
            <div class="form-group half">
              <label class="form-label">{{ t('promptEditor.maxTokens') }}</label>
              <input
                v-model.number="formData.maxTokens"
                type="number"
                min="1"
                max="8192"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="handleCancel" class="btn btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button
          v-if="!isNew && isBuiltIn"
          @click="handleReset"
          class="btn btn-warning"
        >
          {{ t('promptEditor.resetToDefault') }}
        </button>
        <button @click="handleSave" class="btn btn-primary" :disabled="!isValid">
          {{ t('common.save') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PromptConfig, OptimizationStrategy } from '@/types/storage';
import { getBuiltInPromptById } from '@/utils/prompts';

const { t } = useI18n();

const props = defineProps<{
  prompt?: PromptConfig;
  isBuiltIn: boolean;
}>();

const emit = defineEmits<{
  save: [data: Partial<PromptConfig>, isNew: boolean];
  cancel: [];
  reset: [];
}>();

const isNew = computed(() => !props.prompt);

// 默认表单数据
const defaultFormData = {
  name: '',
  description: '',
  strategy: 'general' as OptimizationStrategy,
  systemPrompt: '',
  userPromptTemplate: '请优化以下提示词：\n\n{{input}}',
  temperature: 0.7,
  maxTokens: 2048,
};

// 表单数据
const formData = ref({
  ...defaultFormData,
  ...props.prompt,
});

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

// 表单验证
const isValid = computed(() => {
  return (
    formData.value.name.trim() !== '' &&
    formData.value.systemPrompt.trim() !== '' &&
    formData.value.userPromptTemplate.trim() !== '' &&
    formData.value.userPromptTemplate.includes('{{input}}') &&
    formData.value.temperature >= 0 &&
    formData.value.temperature <= 2 &&
    formData.value.maxTokens >= 1 &&
    formData.value.maxTokens <= 8192
  );
});

// 保存
function handleSave() {
  if (!isValid.value) return;

  const data: Partial<PromptConfig> = {
    name: formData.value.name.trim(),
    description: formData.value.description.trim(),
    strategy: formData.value.strategy,
    systemPrompt: formData.value.systemPrompt.trim(),
    userPromptTemplate: formData.value.userPromptTemplate.trim(),
    temperature: formData.value.temperature,
    maxTokens: formData.value.maxTokens,
  };

  emit('save', data, isNew.value);
}

// 取消
function handleCancel() {
  emit('cancel');
}

// 重置为默认
function handleReset() {
  if (props.prompt?.isBuiltIn && props.prompt.id) {
    const original = getBuiltInPromptById(props.prompt.id);
    if (original) {
      formData.value = {
        name: original.name,
        description: original.description,
        strategy: original.strategy,
        systemPrompt: original.systemPrompt,
        userPromptTemplate: original.userPromptTemplate,
        temperature: original.temperature,
        maxTokens: original.maxTokens,
      };
    }
  }
  emit('reset');
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.btn-close {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  font-size: 24px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.btn-close:hover {
  background: #f3f4f6;
  color: #1f2937;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group.half {
  flex: 1;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
}

.required {
  color: #ef4444;
  margin-left: 2px;
}

.param-range {
  font-size: 12px;
  color: #9ca3af;
  font-weight: normal;
  margin-left: 4px;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background: white;
  transition: all 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-textarea {
  resize: vertical;
  font-family: inherit;
  line-height: 1.5;
}

.form-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #6b7280;
}

.hint-icon {
  font-size: 14px;
}

.form-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 16px 0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #e5e7eb;
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

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #1d4ed8;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-warning {
  background: #fbbf24;
  color: #92400e;
}

.btn-warning:hover {
  background: #f59e0b;
}
</style>
