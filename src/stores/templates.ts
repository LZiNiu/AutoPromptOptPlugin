import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Ref } from 'vue';
import type { PromptTemplate } from '@/types/storage';
import {
  usePromptTemplates as usePromptTemplatesStorage,
  addPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  savePromptTemplates,
} from '@/utils/storage';
import { DEFAULT_TEMPLATES } from '@/constants/defaults';

/**
 * 模板 Store
 * 管理提示词模板状态
 */
export const useTemplatesStore = defineStore('templates', () => {
  const storageTemplates = usePromptTemplatesStorage() as Ref<PromptTemplate[]>;
  const templates = ref<PromptTemplate[]>(storageTemplates.value);
  const searchQuery = ref('');
  const selectedCategory = ref('');

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

  const categories = computed(() => {
    const categorySet = new Set(templates.value.map((template) => template.category));
    return Array.from(categorySet).sort();
  });

  const getTemplateById = (id: string) => {
    return templates.value.find((template) => template.id === id);
  };

  const addTemplate = (template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: PromptTemplate = {
      ...template,
      id: generateId(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    templates.value.push(newTemplate);
    addPromptTemplate(newTemplate);
  };

  const updateTemplate = (id: string, updates: Partial<PromptTemplate>) => {
    const index = templates.value.findIndex((template) => template.id === id);
    if (index !== -1) {
      templates.value[index] = {
        ...templates.value[index],
        ...updates,
        updatedAt: Date.now(),
      };
      updatePromptTemplate(id, updates);
    }
  };

  const deleteTemplate = (id: string) => {
    const index = templates.value.findIndex((template) => template.id === id);
    if (index !== -1) {
      templates.value.splice(index, 1);
      deletePromptTemplate(id);
    }
  };

  const duplicateTemplate = (id: string) => {
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
      addPromptTemplate(duplicated);
    }
  };

  const importTemplates = (importedTemplates: PromptTemplate[]) => {
    templates.value = [...templates.value, ...importedTemplates];
    savePromptTemplates(templates.value);
  };

  const exportTemplates = () => {
    return JSON.stringify(templates.value, null, 2);
  };

  const clearAllTemplates = () => {
    templates.value = [];
    savePromptTemplates([]);
  };

  const resetToDefaults = () => {
    templates.value = [...DEFAULT_TEMPLATES];
    savePromptTemplates(templates.value);
  };

  function generateId(): string {
    return `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  return {
    templates,
    searchQuery,
    selectedCategory,
    filteredTemplates,
    categories,
    getTemplateById,
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
