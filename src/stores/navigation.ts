import { defineStore } from 'pinia';
import { ref } from 'vue';

/**
 * 导航 Store
 * 管理 options 页面的 Tab 切换状态
 */
export const useNavigationStore = defineStore('navigation', () => {
  const activeTab = ref('settings');

  const tabs = [
    { id: 'settings', label: 'nav.settings', icon: '⚙️' },
    { id: 'prompts', label: 'nav.prompts', icon: '🎯' },
    { id: 'templates', label: 'nav.templates', icon: '📝' },
    { id: 'history', label: 'nav.history', icon: '📜' },
  ];

  function setActiveTab(tabId: string) {
    activeTab.value = tabId;
  }

  return {
    activeTab,
    tabs,
    setActiveTab,
  };
});
