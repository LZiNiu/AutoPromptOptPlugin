<template>
  <div class="history-item">
    <div class="item-header">
      <div class="item-meta">
        <span class="item-date">{{ formatTimestamp(history.timestamp) }}</span>
      </div>
      <div class="item-actions">
        <button @click="$emit('copyOriginal', history)" class="action-btn" :title="t('history.copyOriginal')">
          📋
        </button>
        <button @click="$emit('copyOptimized', history)" class="action-btn" :title="t('history.copyOptimized')">
          ✨
        </button>
        <button @click="showDetails = !showDetails" class="action-btn" :title="t('history.viewDetails')">
          {{ showDetails ? '▼' : '▶' }}
        </button>
        <button @click="$emit('delete', history)" class="action-btn delete-btn" :title="t('history.delete')"> 
          🗑️
        </button>
      </div>
    </div>

    <div v-if="showDetails" class="item-content">
      <div class="content-section">
        <h4 class="section-title">{{ t('history.originalPrompt') }}</h4>
        <p class="content-text">{{ history.originalPrompt }}</p>
      </div>
      <div class="content-divider">↓</div>
      <div class="content-section">
        <h4 class="section-title">{{ t('history.optimizedPrompt') }}</h4>
        <p class="content-text optimized">{{ history.optimizedPrompt }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OptimizeHistoryItem } from '@/types/storage';

const { t } = useI18n();

defineProps<{
  history: OptimizeHistoryItem;
}>();

defineEmits<{
  copyOriginal: [history: OptimizeHistoryItem];
  copyOptimized: [history: OptimizeHistoryItem];
  delete: [history: OptimizeHistoryItem];
}>();

const showDetails = ref(true);

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return 'Just now';
  } else if (minutes < 60) {
    return `${minutes}m ago`;
  } else if (hours < 24) {
    return `${hours}h ago`;
  } else if (days < 7) {
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}


</script>

<style scoped>
.history-item {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  background-color: white;
}

.history-item:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.item-meta {
  display: flex;
  gap: 12px;
  align-items: center;
}

.item-site {
  font-size: 12px;
  padding: 4px 8px;
  background-color: #eff6ff;
  color: #2563eb;
  border-radius: 4px;
  font-weight: 500;
}

.item-date {
  font-size: 12px;
  color: #9ca3af;
}

.item-actions {
  display: flex;
  gap: 4px;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.action-btn:hover {
  background-color: #f3f4f6;
}

.action-btn.delete-btn:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

.item-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.content-section {
  margin-bottom: 12px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  margin: 0 0 8px 0;
  text-transform: uppercase;
}

.content-text {
  font-size: 14px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.content-text.optimized {
  color: #059669;
  font-weight: 500;
}

.content-divider {
  text-align: center;
  color: #9ca3af;
  font-size: 16px;
  margin: 8px 0;
}
</style>
