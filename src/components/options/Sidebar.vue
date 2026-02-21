<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h1 class="app-title">{{ t('app.name') }}</h1>
      <p class="app-description">{{ t('app.description') }}</p>
    </div>
    <nav class="sidebar-nav">
      <button
        v-for="tab in navigationStore.tabs"
        :key="tab.id"
        @click="navigationStore.setActiveTab(tab.id)"
        :class="['nav-item', { active: navigationStore.activeTab === tab.id }]"
      >
        <span class="nav-icon">{{ tab.icon }}</span>
        <span class="nav-label">{{ t(tab.label) }}</span>
      </button>
    </nav>
    <div class="sidebar-footer">
      <LanguageSwitcher />
    </div>
  </aside>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useNavigationStore } from '@/stores/navigation';
import LanguageSwitcher from './LanguageSwitcher.vue';

const { t } = useI18n();
const navigationStore = useNavigationStore();
</script>

<style scoped>
.sidebar {
  width: 240px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.app-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.app-description {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
}

.sidebar-nav {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  font-size: 14px;
  color: #6b7280;
}

.nav-item:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

.nav-item.active {
  background-color: #eff6ff;
  color: #2563eb;
  font-weight: 500;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  flex: 1;
}

.sidebar-footer {
  padding: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
