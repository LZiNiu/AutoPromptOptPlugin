import type { LLMConfig, AppSettings } from '../types/storage';

/**
 * 默认用户配置
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  apiKey: '',
  apiProvider: 'huggingface',
  customEndpoint: '',
  customModel: '',
};

/**
 * 默认应用设置
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  language: 'zh-CN',
  skipPreview: false,
  shortcutKey: 'Ctrl+Shift+O',
  maxHistoryCount: 50,
  privacyAccepted: false,
};

/**
 * 最大历史记录数量限制
 */
export const MAX_HISTORY_LIMIT = 100;

/**
 * 最小历史记录数量限制
 */
export const MIN_HISTORY_LIMIT = 10;

/**
 * 默认模板分类
 */
export const DEFAULT_TEMPLATE_CATEGORIES = [
  '通用',
  '编程',
  '写作',
  '翻译',
  '分析',
  '创意',
];

/**
 * 默认提示词模板
 */
export const DEFAULT_TEMPLATES = [
  {
    id: 'default-1',
    title: '代码优化',
    category: '编程',
    content: '请帮我优化以下代码，使其更加高效、可读和易于维护：\n\n{content}',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-2',
    title: '文本润色',
    category: '写作',
    content: '请帮我润色以下文本，使其更加专业、流畅和有说服力：\n\n{content}',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
  {
    id: 'default-3',
    title: '技术翻译',
    category: '翻译',
    content: '请将以下技术文档翻译成中文，保持专业术语的准确性：\n\n{content}',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  },
];

/**
 * API 提供商配置
 */
export const API_PROVIDERS = [
  {
    value: 'huggingface',
    label: 'Hugging Face',
    description: '使用 Hugging Face Inference API',
  },
  {
    value: 'replicate',
    label: 'Replicate',
    description: '使用 Replicate API',
  },
  {
    value: 'custom',
    label: '自定义',
    description: '使用自定义 API 端点',
  },
] as const;

/**
 * 支持的语言列表
 */
export const SUPPORTED_LANGUAGES = [
  {
    value: 'zh-CN',
    label: '简体中文',
    flag: '🇨🇳',
  },
  {
    value: 'en',
    label: 'English',
    flag: '🇺🇸',
  },
] as const;
