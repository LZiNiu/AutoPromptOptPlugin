<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <PrivacyModal v-if="!privacyAccepted" @accept="handlePrivacyAccept" />
    <div v-else class="flex h-screen">
      <Sidebar />
      <main class="flex-1 overflow-auto">
        <TabContent />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAppSettings } from '@/utils/storage';
import Sidebar from '@/components/options/Sidebar.vue';
import TabContent from '@/components/options/TabContent.vue';
import PrivacyModal from '@/components/options/PrivacyModal.vue';

const appSettings = useAppSettings();

const privacyAccepted = computed(() => appSettings.value.privacyAccepted);

function handlePrivacyAccept() {
  appSettings.value.privacyAccepted = true;
}
</script>

<style scoped>
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
