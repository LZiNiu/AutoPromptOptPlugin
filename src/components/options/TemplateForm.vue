<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2 class="modal-title">
        {{ template ? t('templates.editTemplate') : t('templates.addTemplate') }}
      </h2>
      
      <form id="template-form" @submit.prevent="handleSubmit" class="form">
        <div class="form-group">
          <label class="form-label">{{ t('templates.templateTitle') }}</label>
          <input
            id="template-title"
            v-model="formData.title"
            type="text"
            :placeholder="t('templates.templateTitlePlaceholder')"
            class="form-input"
            required
          />
        </div>

        <div class="form-group form-group-compact">
          <label class="form-label">{{ t('templates.templateCategory') }}</label>
          <Combobox
            v-model="formData.category"
            :options="availableCategories"
            :placeholder="t('templates.templateCategoryPlaceholder')"
            class="form-input-compact"
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('templates.templateContent') }}</label>
          <textarea
            id="template-content"
            v-model="formData.content"
            :placeholder="t('templates.templateContentPlaceholder')"
            class="form-textarea"
            rows="8"
            required
          ></textarea>
        </div>

        <div class="form-actions">
          <button type="button" @click="$emit('cancel')" class="btn btn-secondary">
            {{ t('common.cancel') }}
          </button>
          <button type="submit" class="btn btn-primary">
            {{ t('common.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTemplatesStore } from '@/stores/templates';
import type { PromptTemplate } from '@/types/storage';
import { DEFAULT_TEMPLATE_CATEGORIES } from '@/constants/defaults';
import Combobox from '@/components/common/Combobox.vue';

const { t } = useI18n();
const templatesStore = useTemplatesStore();

const props = defineProps<{
  template?: PromptTemplate;
}>();

const emit = defineEmits<{
  save: [template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>];
  cancel: [];
}>();

const formData = ref({
  title: '',
  category: '',
  content: '',
});

const availableCategories = computed(() => {
  const storeCategories = templatesStore.categories;
  return [...new Set([...DEFAULT_TEMPLATE_CATEGORIES, ...storeCategories])];
});

watch(
  () => props.template,
  (template) => {
    if (template) {
      formData.value = {
        title: template.title,
        category: template.category,
        content: template.content,
      };
    } else {
      formData.value = {
        title: '',
        category: '',
        content: '',
      };
    }
  },
  { immediate: true }
);

function handleSubmit() {
  emit('save', formData.value);
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #1f2937;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 400px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-input,
.form-textarea {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-input-compact {
  width: 100%;
}

.form-input:hover,
.form-textarea:hover {
  border-color: #9ca3af;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
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

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>
