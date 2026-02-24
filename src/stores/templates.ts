import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PromptTemplate } from '@/types/storage';
import { promptTemplates } from '@/utils/storage';
import { DEFAULT_TEMPLATES } from '@/constants/defaults';

/**
 * 模板 Store
 * 管理提示词模板状态，业务变量与 storage 同步
 */
export const useTemplatesStore = defineStore('templates', () => {
  // 业务响应式变量
  const templates = ref<PromptTemplate[]>([]);
  const searchQuery = ref('');
  const selectedCategory = ref('');
  const isLoaded = ref(false);

  // 存储监听取消函数
  let unwatchStorage: (() => void) | null = null;

  /**
   * 初始化 Store：从 storage 加载数据并监听变化
   */
  async function initialize() {
    if (isLoaded.value) return;

    templates.value = await promptTemplates.get();
    isLoaded.value = true;

    // 监听外部变化（其他页面修改 storage）
    unwatchStorage = promptTemplates.watch((newValue) => {
      templates.value = newValue;
    });
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
    await promptTemplates.set([...templates.value]);
  }

  // 计算属性：过滤后的模板列表
  const filteredTemplates = computed(() => {
    let result = templates.value;

    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(
        (template) =>
          template.title.toLowerCase().includes(query) ||
          template.content.toLowerCase().includes(query)
      );
    }

    if (selectedCategory.value) {
      result = result.filter((template) => template.category === selectedCategory.value);
    }

    return result;
  });

  // 计算属性：所有分类
  const categories = computed(() => {
    const categorySet = new Set(templates.value.map((template) => template.category));
    return Array.from(categorySet).sort();
  });

  /**
   * 根据 ID 获取模板
   */
  const getTemplateById = (id: string) => {
    return templates.value.find((template) => template.id === id);
  };

  /**
   * 生成唯一 ID
   */
  function generateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * 添加模板
   */
  async function addTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) {
    const newTemplate: PromptTemplate = {
      ...template,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    templates.value.push(newTemplate);
    await syncToStorage();
  }

  /**
   * 更新模板
   */
  async function updateTemplate(id: string, updates: Partial<PromptTemplate>) {
    const index = templates.value.findIndex((template) => template.id === id);
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updates,
        updatedAt: Date.now(),
      };
      await syncToStorage();
    }
  }

  /**
   * 删除模板
   */
  async function deleteTemplate(id: string) {
    const index = templates.value.findIndex((template) => template.id === id);
    if (index !== -1) {
      templates.value.splice(index, 1);
      await syncToStorage();
    }
  }

  /**
   * 复制模板
   */
  async function duplicateTemplate(id: string) {
    const original = getTemplateById(id);
    if (original) {
      const duplicated: PromptTemplate = {
        ...original,
        id: generateId(),
        title: `${original.title} (副本)`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      templates.value.push(duplicated);
      await syncToStorage();
    }
  }

  /**
   * 导入模板
   */
  async function importTemplates(importedTemplates: PromptTemplate[]) {
    templates.value = [...templates.value, ...importedTemplates];
    await syncToStorage();
  }

  /**
   * 导出模板为 JSON 字符串
   */
  const exportTemplates = () => {
    return JSON.stringify(templates.value, null, 2);
  };

  /**
   * 清空所有模板
   */
  async function clearAllTemplates() {
    templates.value = [];
    await syncToStorage();
  }

  /**
   * 重置为默认模板
   */
  async function resetToDefaults() {
    templates.value = [...DEFAULT_TEMPLATES];
    await syncToStorage();
  }

  return {
    templates,
    searchQuery,
    selectedCategory,
    isLoaded,
    filteredTemplates,
    categories,
    getTemplateById,
    initialize,
    cleanup,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    importTemplates,
    exportTemplates,
    clearAllTemplates,
    resetToDefaults,
  };
});
