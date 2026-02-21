<template>
  <div class="privacy-modal-overlay">
    <div class="privacy-modal">
      <h2 class="privacy-modal-title">{{ t('privacy.title') }}</h2>
      <p class="privacy-modal-description">{{ t('privacy.description') }}</p>
      <ul class="privacy-modal-points">
        <li v-for="(point, index) in tm('privacy.points')" :key="index">
          {{ point }}
        </li>
      </ul>
      <div class="privacy-modal-actions">
        <button @click="$emit('decline')" class="btn btn-secondary">
          {{ t('privacy.decline') }}
        </button>
        <button @click="$emit('accept')" class="btn btn-primary">
          {{ t('privacy.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t, tm } = useI18n();

defineEmits<{
  accept: [];
  decline: [];
}>();
</script>

<style scoped>
.privacy-modal-overlay {
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

.privacy-modal {
  background: white;
  border-radius: 12px;
  padding: 32px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.privacy-modal-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #1f2937;
}

.privacy-modal-description {
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 20px 0;
  line-height: 1.5;
}

.privacy-modal-points {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
}

.privacy-modal-points li {
  position: relative;
  padding-left: 24px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.privacy-modal-points li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #10b981;
  font-weight: bold;
}

.privacy-modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.btn {
  padding: 8px 16px;
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
