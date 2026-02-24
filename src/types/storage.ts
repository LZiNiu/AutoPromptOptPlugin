/**
 * 用户选择器配置接口
 */
export interface UserSelectorConfig {
  siteId: string;
  inputSelector: string;
  buttonContainerSelector: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 元素选择器信息
 */
export interface ElementSelectorInfo {
  domPath: string;
  xpath: string;
  cssSelector: string;
}

/**
 * API 提供商类型
 */
export type ApiProvider = 'huggingface' | 'replicate' | 'custom';

/**
 * 大模型调用配置接口
 */
export interface LLMConfig {
  apiKey: string;
  apiProvider: ApiProvider;
  customEndpoint?: string;
  customModel?: string;
}

/**
 * 提示词模板接口
 */
export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * 优化历史记录接口
 */
export interface OptimizeHistory {
  id: string;
  originalPrompt: string;
  optimizedPrompt: string;
  timestamp: number;
  siteId: string;
}

/**
 * 应用设置接口
 */
export interface AppSettings {
  language: 'zh-CN' | 'en';
  skipPreview: boolean;
  shortcutKey: string;
  maxHistoryCount: number;
  privacyAccepted: boolean;
}

/**
 * 存储数据接口
 */
export interface StorageData {
  userConfig: LLMConfig;
  promptTemplates: PromptTemplate[];
  optimizeHistory: OptimizeHistory[];
  appSettings: AppSettings;
  userSelectors: Record<string, UserSelectorConfig>;
}
