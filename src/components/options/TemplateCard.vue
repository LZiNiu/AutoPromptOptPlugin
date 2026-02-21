<template>
  <div class="template-card">
    <div class="card-header">
      <h3 class="card-title">{{ template.title }}</h3>
      <span class="card-category">{{ template.category }}</span>
    </div>
    <div class="card-content">
      <p class="content-preview">{{ contentPreview }}</p>
    </div>
    <div class="card-footer">
      <span class="card-date">{{ formatDate(template.updatedAt) }}</span>
      <div class="card-actions">
        <button @click="$emit('edit', template)" class="action-btn" title="Edit">
          ✏️
        </button>
        <button @click="$emit('duplicate', template)" class="action-btn" title="Duplicate">
          📋
        </button>
        <button @click="$emit('delete', template)" class="action-btn" title="Delete">
          🗑️
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PromptTemplate } from '@/types/storage';


const props = defineProps<{
  template: PromptTemplate;
}>();

defineEmits<{
  edit: [template: PromptTemplate];
  duplicate: [template: PromptTemplate];
  delete: [template: PromptTemplate];
}>();

const contentPreview = computed(() => {
  const maxLength = 150;
  const content = props.template.content;
  return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
});

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return 'Today';
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return `${days} days ago`;
  } else {
    return date.toLocaleDateString();
  }
}


</script>

<style scoped>
.template-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background-color: white;
}

.template-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
}

.card-category {
  font-size: 12px;
  padding: 4px 8px;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  margin-left: 12px;
}

.card-content {
  margin-bottom: 12px;
}

.content-preview {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.card-date {
  font-size: 12px;
  color: #9ca3af;
}

.card-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}
</style>
