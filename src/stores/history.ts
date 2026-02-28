import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { OptimizeHistoryItem } from '@/types/storage';
import { sessionHistory } from '@/utils/storage';

/**
 * 历史记录 Store
 * 管理优化历史记录状态，业务变量与 storage 同步
 */
export const useHistoryStore = defineStore('history', () => {
  // 业务响应式变量
  const histories = ref<OptimizeHistoryItem[]>([]);
  const searchQuery = ref('');
  const isLoaded = ref(false);

  // 存储监听取消函数
  let unwatchStorage: (() => void) | null = null;
  let isInitializing = false;

  /**
   * 初始化 Store：从 storage 加载数据并监听变化
   * 后台脚本已确保 storage 有默认值，这里直接读取即可
   */
  async function initialize() {
    if (isLoaded.value || isInitializing) return;

    isInitializing = true;

    try {
      histories.value = await sessionHistory.get();
      isLoaded.value = true;

      // 监听外部变化（其他页面修改 storage）
      if (unwatchStorage) {
        unwatchStorage();
      }
      unwatchStorage = sessionHistory.watch((newValue) => {
        histories.value = newValue;
      });
    } finally {
      isInitializing = false;
    }
  }

  /**
   * 清理资源：取消 storage 监听
   */
  function cleanup() {
    if (unwatchStorage) {
      unwatchStorage();
      unwatchStorage = null;
    }
  }

  /**
   * 同步数据到 storage
   */
  async function syncToStorage() {
    await sessionHistory.set([...histories.value]);
  }

  // 计算属性：过滤后的历史记录
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

  // 计算属性：最近的历史记录
  const recentHistories = computed(() => {
    return histories.value.slice(0, 10);
  });

  /**
   * 根据 ID 获取历史记录
   */
  const getHistoryById = (id: string) => {
    return histories.value.find((history) => history.id === id);
  };

  /**
   * 生成唯一 ID
   */
  function generateId(): string {
    return `history-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 添加历史记录
   */
  async function addHistory(history: Omit<OptimizeHistoryItem, 'id' | 'timestamp'>) {
    const newHistory: OptimizeHistoryItem = {
      ...history,
      id: generateId(),
      timestamp: Date.now(),
    };
    histories.value.unshift(newHistory);
    await syncToStorage();
  }

  /**
   * 删除历史记录
   */
  async function deleteHistory(id: string) {
    const index = histories.value.findIndex((history) => history.id === id);
    if (index !== -1) {
      histories.value.splice(index, 1);
      await syncToStorage();
    }
  }

  /**
   * 清空所有历史记录
   */
  async function clearAllHistories() {
    histories.value = [];
    await syncToStorage();
  }

  /**
   * 清除指定天数前的历史记录
   */
  async function clearOldHistories(days: number) {
    const cutoffTime = Date.now() - days * 24 * 60 * 60 * 1000;
    histories.value = histories.value.filter((history) => history.timestamp >= cutoffTime);
    await syncToStorage();
  }

  /**
   * 获取指定日期范围内的历史记录
   */
  const getHistoriesByDateRange = (startTime: number, endTime: number) => {
    return histories.value.filter(
      (history) => history.timestamp >= startTime && history.timestamp <= endTime
    );
  };

  /**
   * 获取统计数据
   */
  const getStatistics = () => {
    const totalOptimizations = histories.value.length;

    const averagePromptLength =
      totalOptimizations > 0
        ? histories.value.reduce(
            (sum, history) => sum + history.originalPrompt.length,
            0
          ) / totalOptimizations
        : 0;

    return {
      totalOptimizations,
      averagePromptLength,
    };
  };

  return {
    histories,
    searchQuery,
    isLoaded,
    filteredHistories,
    recentHistories,
    getHistoryById,
    initialize,
    cleanup,
    addHistory,
    deleteHistory,
    clearAllHistories,
    clearOldHistories,
    getHistoriesByDateRange,
    getStatistics,
  };
});
