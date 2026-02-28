<template>
  <div class="history-panel">
    <div class="panel-header">
      <h2 class="panel-title">{{ t('history.title') }}</h2>
      <div class="header-actions">
        <button @click="showStatistics = true" class="btn btn-secondary">
          {{ t('history.statistics') }}
        </button>
        <button @click="handleClearOld" class="btn btn-secondary">
          {{ t('history.clearOld') }}
        </button>
        <button @click="handleClearAll" class="btn btn-danger">
          {{ t('history.clearAll') }}
        </button>
      </div>
    </div>

    <div class="search-bar">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="t('history.searchPlaceholder')"
        class="search-input"
      />
    </div>

    <div v-if="filteredHistories.length === 0" class="empty-state">
      <div class="empty-icon">📜</div>
      <p class="empty-text">{{ t('history.noHistory') }}</p>
      <p class="empty-description">{{ t('history.noHistoryDesc') }}</p>
    </div>

    <div v-else class="history-list">
      <HistoryItem
        v-for="history in filteredHistories"
        :key="history.id"
        :history="history"
        @copy-original="handleCopyOriginal"
        @copy-optimized="handleCopyOptimized"
        @delete="handleDelete"
      />
    </div>

    <StatisticsModal
      v-if="showStatistics"
      @close="showStatistics = false"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHistoryStore } from '@/stores/history';
import type { OptimizeHistoryItem } from '@/types/storage';
import HistoryItem from './HistoryItem.vue';
import StatisticsModal from './StatisticsModal.vue';

const { t } = useI18n();
const historyStore = useHistoryStore();

const searchQuery = computed({
  get: () => historyStore.searchQuery,
  set: (value) => (historyStore.searchQuery = value),
});
const filteredHistories = computed(() => historyStore.filteredHistories);
const showStatistics = ref(false);

function handleCopyOriginal(history: OptimizeHistoryItem) {
  navigator.clipboard.writeText(history.originalPrompt);
}

function handleCopyOptimized(history: OptimizeHistoryItem) {
  navigator.clipboard.writeText(history.optimizedPrompt);
}

function handleDelete(history: OptimizeHistoryItem) {
  if (confirm(t('history.delete'))) {
    historyStore.deleteHistory(history.id);
  }
}

function handleClearAll() {
  if (confirm(t('history.clearAllConfirm'))) {
    historyStore.clearAllHistories();
  }
}

function handleClearOld() {
  const days = prompt(t('history.clearOldConfirm'), '30');
  if (days && !isNaN(Number(days))) {
    historyStore.clearOldHistories(Number(days));
  }
}
</script>

<style scoped>
.history-panel {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.panel-header {
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

.search-bar {
  margin-bottom: 24px;
}

.search-input {
  width: 100%;
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

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
