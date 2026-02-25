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
 * API 提供商配置
 */
export interface ApiProviderConfig {
  id: string;
  name: string;
  defaultEndpoint: string;
  defaultModel: string;
  docsUrl: string;
  keyPlaceholder: string;
}

/**
 * 大模型调用配置接口
 */
export interface LLMConfig {
  apiKey: string;
  providerId: string;
  endpoint: string;
  model: string;
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
 * 优化策略类型
 */
export type OptimizationStrategy =
  | 'general'
  | 'coding'
  | 'writing'
  | 'translation'
  | 'analysis'
  | 'creative'
  | 'custom';

/**
 * 提示词配置接口
 */
export interface PromptConfig {
  id: string;
  name: string;
  description: string;
  strategy: OptimizationStrategy;
  systemPrompt: string;
  userPromptTemplate: string;
  temperature: number;
  maxTokens: number;
  isBuiltIn: boolean;
  isEditable: boolean;
  createdAt: number;
  updatedAt: number;
}

/**
 * 用户提示词配置接口
 */
export interface UserPromptConfig {
  selectedPromptId: string;
  customPrompts: PromptConfig[];
  builtInOverrides: Record<string, Partial<PromptConfig>>;
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
  userPromptConfig: UserPromptConfig;
}
