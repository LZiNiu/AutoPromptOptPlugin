<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="loading-screen">
      <div class="loading-spinner"></div>
    </div>
    <template v-else>
      <PrivacyModal v-if="!privacyAccepted" @accept="handlePrivacyAccept" />
      <div v-else class="flex h-screen">
        <Sidebar />
        <main class="flex-1 overflow-auto">
          <TabContent />
        </main>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useSettingsStore, useTemplatesStore, useHistoryStore } from '@/stores';
import Sidebar from '@/components/options/Sidebar.vue';
import TabContent from '@/components/options/TabContent.vue';
import PrivacyModal from '@/components/options/PrivacyModal.vue';

const settingsStore = useSettingsStore();
const templatesStore = useTemplatesStore();
const historyStore = useHistoryStore();

const isLoading = ref(true);

const privacyAccepted = computed(() => settingsStore.privacyAccepted);

async function handlePrivacyAccept() {
  await settingsStore.setPrivacyAccepted(true);
}

onMounted(async () => {
  await Promise.all([
    settingsStore.initialize(),
    templatesStore.initialize(),
    historyStore.initialize(),
  ]);
  isLoading.value = false;
});

onUnmounted(() => {
  settingsStore.cleanup();
  templatesStore.cleanup();
  historyStore.cleanup();
});
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.loading-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e5e7eb;
  border-top-color: #14b8a6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
