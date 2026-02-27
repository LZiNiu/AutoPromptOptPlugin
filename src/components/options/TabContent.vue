<template>
  <div class="tab-content">
    <SettingsPanel v-if="navigationStore.activeTab === 'settings'" />
    <PromptManager v-else-if="navigationStore.activeTab === 'prompts'" />
    <TemplateManager v-else-if="navigationStore.activeTab === 'templates'" />
    <HistoryPanel v-else-if="navigationStore.activeTab === 'history'" />
  </div>
</template>

<script setup lang="ts">
import { useNavigationStore } from '@/stores/navigation';
import SettingsPanel from './SettingsPanel.vue';
import PromptManager from './PromptManager.vue';
import TemplateManager from './TemplateManager.vue';
import HistoryPanel from './HistoryPanel.vue';

const navigationStore = useNavigationStore();
</script>

<style scoped>
.tab-content {
  padding: 32px;
  max-width: 900px;
  margin: 0 auto;
}
</style>
