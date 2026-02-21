<template>
  <div class="modal-overlay">
    <div class="modal">
      <h2 class="modal-title">{{ t('history.statistics') }}</h2>
      
      <div class="statistics-content">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-info">
            <p class="stat-value">{{ statistics.totalOptimizations }}</p>
            <p class="stat-label">{{ t('history.totalOptimizations') }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📏</div>
          <div class="stat-info">
            <p class="stat-value">{{ Math.round(statistics.averagePromptLength) }}</p>
            <p class="stat-label">{{ t('history.averagePromptLength') }}</p>
          </div>
        </div>

        <div class="section-title">{{ t('history.bySite') }}</div>
        <div class="site-stats">
          <div
            v-for="(count, siteId) in statistics.siteStats"
            :key="siteId"
            class="site-stat-item"
          >
            <span class="site-name">{{ getSiteName(siteId) }}</span>
            <span class="site-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <div class="modal-actions">
        <button @click="$emit('close')" class="btn btn-primary">
          {{ t('common.close') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHistoryStore } from '@/stores/history';

const { t } = useI18n();
const historyStore = useHistoryStore();

const statistics = computed(() => historyStore.getStatistics());

function getSiteName(siteId: string): string {
  const siteNames: Record<string, string> = {
    'qwen-intl': 'Qwen Intl',
    'z-ai': 'Z.AI',
    'qwen-cn': 'Qwen CN',
    'qwen-aliyun': 'Qwen Aliyun',
    'tongyi-aliyun': 'Tongyi',
    'chatgpt': 'ChatGPT',
    'claude': 'Claude',
    'chatglm': 'GLM-4',
  };
  return siteNames[siteId] || siteId;
}

defineEmits<{
  close: [];
}>();
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

.statistics-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.stat-icon {
  font-size: 32px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 4px 0;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 12px 0;
}

.site-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.site-stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f9fafb;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.site-name {
  font-size: 14px;
  color: #374151;
  font-weight: 500;
}

.site-count {
  font-size: 16px;
  color: #3b82f6;
  font-weight: 600;
}

.modal-actions {
  display: flex;
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

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
