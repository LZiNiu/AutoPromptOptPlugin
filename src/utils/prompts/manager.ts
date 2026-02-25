import type { PromptConfig, UserPromptConfig, OptimizationStrategy } from '@/types/storage';
import { BUILT_IN_PROMPTS, getBuiltInPromptById } from './built-in';

/**
 * 默认用户提示词配置
 */
export const DEFAULT_USER_PROMPT_CONFIG: UserPromptConfig = {
  selectedPromptId: 'general-v1',
  customPrompts: [],
  builtInOverrides: {},
};

/**
 * 构建优化请求参数
 * @param userInput 用户输入的原始提示词
 * @param promptConfig 提示词配置
 * @returns 系统提示词和用户提示词
 */
export function buildOptimizationParams(
  userInput: string,
  promptConfig: PromptConfig
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = promptConfig.systemPrompt;
  const userPrompt = promptConfig.userPromptTemplate.replace(/\{\{input\}\}/g, userInput);

  return { systemPrompt, userPrompt };
}

/**
 * 获取完整的提示词配置（应用用户覆盖）
 * @param promptId 提示词 ID
 * @param userConfig 用户提示词配置
 * @returns 完整的提示词配置
 */
export function getPromptConfig(
  promptId: string,
  userConfig: UserPromptConfig
): PromptConfig {
  // 首先查找内置提示词
  const builtIn = getBuiltInPromptById(promptId);

  if (builtIn) {
    // 检查是否有用户覆盖
    const override = userConfig.builtInOverrides[promptId];
    if (override) {
      return { ...builtIn, ...override };
    }
    return builtIn;
  }

  // 查找自定义提示词
  const custom = userConfig.customPrompts.find(p => p.id === promptId);
  if (custom) {
    return custom;
  }

  // 返回默认配置
  return getBuiltInPromptById(DEFAULT_USER_PROMPT_CONFIG.selectedPromptId) || BUILT_IN_PROMPTS[0];
}

/**
 * 获取所有可用提示词列表
 * @param userConfig 用户提示词配置
 * @returns 提示词配置列表（内置 + 自定义）
 */
export function getAllPrompts(userConfig: UserPromptConfig): PromptConfig[] {
  // 获取所有内置提示词（应用用户覆盖）
  const builtInPrompts = BUILT_IN_PROMPTS.map(prompt => {
    const override = userConfig.builtInOverrides[prompt.id];
    return override ? { ...prompt, ...override } : prompt;
  });

  // 合并自定义提示词
  return [...builtInPrompts, ...userConfig.customPrompts];
}

/**
 * 获取当前选中的提示词配置
 * @param userConfig 用户提示词配置
 * @returns 当前选中的提示词配置
 */
export function getSelectedPrompt(userConfig: UserPromptConfig): PromptConfig {
  return getPromptConfig(userConfig.selectedPromptId, userConfig);
}

/**
 * 设置当前选中的提示词
 * @param userConfig 用户提示词配置
 * @param promptId 提示词 ID
 * @returns 更新后的配置
 */
export function setSelectedPrompt(
  userConfig: UserPromptConfig,
  promptId: string
): UserPromptConfig {
  return {
    ...userConfig,
    selectedPromptId: promptId,
  };
}

/**
 * 重置内置提示词到默认
 * @param promptId 提示词 ID
 * @returns 重置后的配置
 */
export function resetBuiltInPrompt(promptId: string): PromptConfig | null {
  const original = getBuiltInPromptById(promptId);
  return original ? { ...original } : null;
}

/**
 * 更新内置提示词（创建覆盖）
 * @param userConfig 用户提示词配置
 * @param promptId 提示词 ID
 * @param updates 更新的字段
 * @returns 更新后的配置
 */
export function updateBuiltInPrompt(
  userConfig: UserPromptConfig,
  promptId: string,
  updates: Partial<PromptConfig>
): UserPromptConfig {
  const original = getBuiltInPromptById(promptId);
  if (!original) {
    return userConfig;
  }

  return {
    ...userConfig,
    builtInOverrides: {
      ...userConfig.builtInOverrides,
      [promptId]: {
        ...userConfig.builtInOverrides[promptId],
        ...updates,
        updatedAt: Date.now(),
      },
    },
  };
}

/**
 * 删除内置提示词的覆盖（恢复默认）
 * @param userConfig 用户提示词配置
 * @param promptId 提示词 ID
 * @returns 更新后的配置
 */
export function removeBuiltInOverride(
  userConfig: UserPromptConfig,
  promptId: string
): UserPromptConfig {
  const { [promptId]: _, ...remainingOverrides } = userConfig.builtInOverrides;
  return {
    ...userConfig,
    builtInOverrides: remainingOverrides,
  };
}

/**
 * 添加自定义提示词
 * @param userConfig 用户提示词配置
 * @param prompt 提示词配置（不含 id、createdAt、updatedAt）
 * @returns 更新后的配置和新生成的提示词 ID
 */
export function addCustomPrompt(
  userConfig: UserPromptConfig,
  prompt: Omit<PromptConfig, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>
): { config: UserPromptConfig; newPromptId: string } {
  const newPromptId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const now = Date.now();

  const newPrompt: PromptConfig = {
    ...prompt,
    id: newPromptId,
    isBuiltIn: false,
    isEditable: true,
    createdAt: now,
    updatedAt: now,
  };

  return {
    config: {
      ...userConfig,
      customPrompts: [...userConfig.customPrompts, newPrompt],
    },
    newPromptId,
  };
}

/**
 * 更新自定义提示词
 * @param userConfig 用户提示词配置
 * @param promptId 提示词 ID
 * @param updates 更新的字段
 * @returns 更新后的配置
 */
export function updateCustomPrompt(
  userConfig: UserPromptConfig,
  promptId: string,
  updates: Partial<PromptConfig>
): UserPromptConfig {
  return {
    ...userConfig,
    customPrompts: userConfig.customPrompts.map(prompt =>
      prompt.id === promptId
        ? { ...prompt, ...updates, updatedAt: Date.now() }
        : prompt
    ),
  };
}

/**
 * 删除自定义提示词
 * @param userConfig 用户提示词配置
 * @param promptId 提示词 ID
 * @returns 更新后的配置
 */
export function deleteCustomPrompt(
  userConfig: UserPromptConfig,
  promptId: string
): UserPromptConfig {
  const filteredPrompts = userConfig.customPrompts.filter(p => p.id !== promptId);

  // 如果删除的是当前选中的提示词，重置为默认
  let newSelectedId = userConfig.selectedPromptId;
  if (promptId === userConfig.selectedPromptId) {
    newSelectedId = DEFAULT_USER_PROMPT_CONFIG.selectedPromptId;
  }

  return {
    ...userConfig,
    selectedPromptId: newSelectedId,
    customPrompts: filteredPrompts,
  };
}

/**
 * 验证提示词配置是否有效
 * @param config 提示词配置
 * @returns 验证结果
 */
export function validatePromptConfig(
  config: Partial<PromptConfig>
): { valid: boolean; error?: string } {
  if (!config.name || config.name.trim() === '') {
    return { valid: false, error: '提示词名称不能为空' };
  }

  if (!config.systemPrompt || config.systemPrompt.trim() === '') {
    return { valid: false, error: '系统提示词不能为空' };
  }

  if (!config.userPromptTemplate || config.userPromptTemplate.trim() === '') {
    return { valid: false, error: '用户提示词模板不能为空' };
  }

  if (!config.userPromptTemplate.includes('{{input}}')) {
    return { valid: false, error: '用户提示词模板必须包含 {{input}} 占位符' };
  }

  if (config.temperature !== undefined) {
    if (config.temperature < 0 || config.temperature > 2) {
      return { valid: false, error: 'Temperature 必须在 0-2 之间' };
    }
  }

  if (config.maxTokens !== undefined) {
    if (config.maxTokens < 1 || config.maxTokens > 8192) {
      return { valid: false, error: 'Max Tokens 必须在 1-8192 之间' };
    }
  }

  return { valid: true };
}

/**
 * 根据策略获取提示词列表
 * @param userConfig 用户提示词配置
 * @param strategy 优化策略
 * @returns 符合条件的提示词列表
 */
export function getPromptsByStrategy(
  userConfig: UserPromptConfig,
  strategy: OptimizationStrategy
): PromptConfig[] {
  return getAllPrompts(userConfig).filter(p => p.strategy === strategy);
}

/**
 * 搜索提示词
 * @param userConfig 用户提示词配置
 * @param keyword 搜索关键词
 * @returns 符合条件的提示词列表
 */
export function searchPrompts(
  userConfig: UserPromptConfig,
  keyword: string
): PromptConfig[] {
  const lowerKeyword = keyword.toLowerCase();
  return getAllPrompts(userConfig).filter(
    p =>
      p.name.toLowerCase().includes(lowerKeyword) ||
      p.description.toLowerCase().includes(lowerKeyword)
  );
}
