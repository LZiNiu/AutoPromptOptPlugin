<template>
  <div class="template-manager">
    <div class="manager-header">
      <h2 class="panel-title">{{ t('templates.title') }}</h2>
      <div class="header-actions">
        <button @click="showImportModal = true" class="btn btn-secondary">
          {{ t('templates.import') }}
        </button>
        <button @click="handleExport" class="btn btn-secondary">
          {{ t('templates.export') }}
        </button>
        <button @click="handleAddTemplate" class="btn btn-primary">
          {{ t('templates.addTemplate') }}
        </button>
      </div>
    </div>

    <div class="manager-toolbar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('templates.searchPlaceholder')"
        class="search-input"
      />
      <select v-model="selectedCategory" class="category-select">
        <option value="">{{ t('templates.allCategories') }}</option>
        <option v-for="category in categories" :key="category" :value="category">
          {{ category }}
        </option>
      </select>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <div class="empty-icon">📝</div>
      <p class="empty-text">{{ t('templates.noTemplates') }}</p>
      <p class="empty-description">{{ t('templates.noTemplatesDesc') }}</p>
    </div>

    <div v-else class="template-list">
      <TemplateCard
        v-for="template in filteredTemplates"
        :key="template.id"
        :template="template"
        @edit="handleEdit"
        @duplicate="handleDuplicate"
        @delete="handleDelete"
      />
    </div>

    <div class="manager-footer">
      <button @click="handleReset" class="btn btn-secondary">
        {{ t('templates.resetToDefaults') }}
      </button>
      <button @click="handleClearAll" class="btn btn-danger">
        {{ t('templates.clearAll') }}
      </button>
    </div>

    <TemplateForm
      v-if="showForm"
      :template="editingTemplate"
      @save="handleSave"
      @cancel="showForm = false"
    />

    <ImportModal
      v-if="showImportModal"
      @import="handleImport"
      @cancel="showImportModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useTemplatesStore } from '@/stores/templates';
import type { PromptTemplate } from '@/types/storage';
import TemplateCard from './TemplateCard.vue';
import TemplateForm from './TemplateForm.vue';
import ImportModal from './ImportModal.vue';

const { t } = useI18n();
const templatesStore = useTemplatesStore();

const searchQuery = computed({
  get: () => templatesStore.searchQuery,
  set: (value) => (templatesStore.searchQuery = value),
});
const selectedCategory = computed({
  get: () => templatesStore.selectedCategory,
  set: (value) => (templatesStore.selectedCategory = value),
});
const filteredTemplates = computed(() => templatesStore.filteredTemplates);
const categories = computed(() => templatesStore.categories);

const showForm = ref(false);
const showImportModal = ref(false);
const editingTemplate = ref<PromptTemplate | undefined>();

function handleEdit(template: PromptTemplate) {
  editingTemplate.value = template;
  showForm.value = true;
}

function handleAddTemplate() {
  editingTemplate.value = undefined;
  showForm.value = true;
}

function handleDuplicate(template: PromptTemplate) {
  templatesStore.duplicateTemplate(template.id);
}

function handleDelete(template: PromptTemplate) {
  if (confirm(t('templates.deleteConfirm'))) {
    templatesStore.deleteTemplate(template.id);
  }
}

function handleSave(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
  if (editingTemplate.value) {
    templatesStore.updateTemplate(editingTemplate.value.id, template);
  } else {
    templatesStore.addTemplate(template);
  }
  showForm.value = false;
  editingTemplate.value = undefined;
}

function handleExport() {
  const json = templatesStore.exportTemplates();
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `templates-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function handleImport(templates: PromptTemplate[]) {
  templatesStore.importTemplates(templates);
  showImportModal.value = false;
}

function handleReset() {
  if (confirm(t('templates.resetConfirm'))) {
    templatesStore.resetToDefaults();
  }
}

function handleClearAll() {
  if (confirm(t('templates.clearAllConfirm'))) {
    templatesStore.clearAllTemplates();
  }
}
</script>

<style scoped>
.template-manager {
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

.header-actions {
  display: flex;
  gap: 12px;
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
  background-color: white;
  transition: border-color 0.2s;
}

.search-input:hover {
  border-color: #9ca3af;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.category-select {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  color: #374151;
  background-color: white;
  transition: border-color 0.2s;
  min-width: 150px;
}

.category-select:hover {
  border-color: #9ca3af;
}

.category-select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.template-list {
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
}

.manager-footer {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
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

.btn-danger {
  background-color: #fee2e2;
  color: #dc2626;
}

.btn-danger:hover {
  background-color: #fecaca;
}
</style>
