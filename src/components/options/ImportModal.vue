<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2 class="modal-title">{{ t('templates.import') }}</h2>
      
      <div class="import-area">
        <input
          ref="fileInput"
          type="file"
          accept=".json"
          @change="handleFileChange"
          class="file-input"
        />
        <div v-if="!selectedFile" class="drop-zone" @click="fileInput?.click()">
          <div class="drop-icon">📁</div>
          <p class="drop-text">{{ t('templates.import') }}</p>
          <p class="drop-hint">Click to select a JSON file</p>
        </div>
        <div v-else class="file-info">
          <div class="file-icon">📄</div>
          <div class="file-details">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button @click="clearFile" class="clear-file">✕</button>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('cancel')" class="btn btn-secondary">
          {{ t('common.cancel') }}
        </button>
        <button @click="handleImport" class="btn btn-primary" :disabled="!selectedFile">
          {{ t('templates.import') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PromptTemplate } from '@/types/storage';

const { t } = useI18n();

const emit = defineEmits<{
  import: [templates: PromptTemplate[]];
  cancel: [];
}>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    selectedFile.value = file;
  }
}

function clearFile() {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

function handleImport() {
  if (!selectedFile.value) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const content = event.target?.result as string;
      const data = JSON.parse(content);
      
      if (Array.isArray(data)) {
        const templates: PromptTemplate[] = data.filter((item) => {
          return (
            typeof item === 'object' &&
            item !== null &&
            typeof item.id === 'string' &&
            typeof item.title === 'string' &&
            typeof item.category === 'string' &&
            typeof item.content === 'string'
          );
        });
        emit('import', templates);
      } else {
        alert('Invalid file format. Expected an array of templates.');
      }
    } catch (error) {
      alert('Failed to parse JSON file. Please check the file format.');
    }
  };
  reader.readAsText(selectedFile.value);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }
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
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.modal-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 24px 0;
  color: #1f2937;
}

.import-area {
  margin-bottom: 24px;
}

.file-input {
  display: none;
}

.drop-zone {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.drop-zone:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.drop-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.drop-text {
  font-size: 16px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 8px 0;
}

.drop-hint {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.file-icon {
  font-size: 32px;
}

.file-details {
  flex: 1;
}

.file-name {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin: 0 0 4px 0;
}

.file-size {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.clear-file {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.clear-file:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

.btn-primary:hover:not(:disabled) {
  background-color: #2563eb;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e5e7eb;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #d1d5db;
}
</style>
