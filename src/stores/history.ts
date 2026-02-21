import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { OptimizeHistory } from '@/types/storage';
import {
  useOptimizeHistory as useOptimizeHistoryStorage,
  addOptimizeHistory,
  clearOptimizeHistory,
} from '@/utils/storage';

/**
 * 历史记录 Store
 * 管理优化历史记录状态
 */
export const useHistoryStore = defineStore('history', () => {
  const storageHistory = useOptimizeHistoryStorage() as Ref<OptimizeHistory[]>;
  const histories = ref<OptimizeHistory[]>(storageHistory.value);
  const searchQuery = ref('');

  const filteredHistories = computed(() => {
    if (!searchQuery.value) {
      return histories.value;
    }

    const query = searchQuery.value.toLowerCase();
    return histories.value.filter(
      (history) =>
        history.originalPrompt.toLowerCase().includes(query) ||
        history.optimizedPrompt.toLowerCase().includes(query)
    );
  });

  const recentHistories = computed(() => {
    return histories.value.slice(0, 10);
  });

  const getHistoryById = (id: string) => {
    return histories.value.find((history) => history.id === id);
  };

  const addHistory = (history: Omit<OptimizeHistory, 'id' | 'timestamp'>) => {
    const newHistory: OptimizeHistory = {
      ...history,
      id: generateId(),
      timestamp: Date.now(),
    };
    histories.value.unshift(newHistory);
    addOptimizeHistory(newHistory);
  };

  const deleteHistory = (id: string) => {
    const index = histories.value.findIndex((history) => history.id === id);
    if (index !== -1) {
      histories.value.splice(index, 1);
      clearOptimizeHistory(id);
    }
  };

  const clearAllHistories = () => {
    histories.value = [];
    clearOptimizeHistory();
  };

  const clearOldHistories = (days: number) => {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    const oldHistories = histories.value.filter(
      (history) => history.timestamp < cutoffTime
    );
    oldHistories.forEach((history) => {
      clearOptimizeHistory(history.id);
    });
    histories.value = histories.value.filter((history) => history.timestamp >= cutoffTime);
  };

  const getHistoriesBySite = (siteId: string) => {
    return histories.value.filter((history) => history.siteId === siteId);
  };

  const getHistoriesByDateRange = (startTime: number, endTime: number) => {
    return histories.value.filter(
      (history) => history.timestamp >= startTime && history.timestamp <= endTime
    );
  };

  const getStatistics = () => {
    const totalOptimizations = histories.value.length;
    const siteStats: Record<string, number> = {};

    histories.value.forEach((history) => {
      siteStats[history.siteId] = (siteStats[history.siteId] || 0) + 1;
    });

    const averagePromptLength =
      totalOptimizations > 0
        ? histories.value.reduce(
            (sum, history) => sum + history.originalPrompt.length,
            0
          ) / totalOptimizations
        : 0;

    return {
      totalOptimizations,
      siteStats,
      averagePromptLength,
    };
  };

  function generateId(): string {
    return `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return {
    histories,
    searchQuery,
    filteredHistories,
    recentHistories,
    getHistoryById,
    addHistory,
    deleteHistory,
    clearAllHistories,
    clearOldHistories,
    getHistoriesBySite,
    getHistoriesByDateRange,
    getStatistics,
  };
});
