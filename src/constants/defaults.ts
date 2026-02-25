import type { LLMConfig, AppSettings } from '../types/storage';

/**
 * 默认用户配置
 */
export const DEFAULT_LLM_CONFIG: LLMConfig = {
  apiKey: '',
  providerId: 'openai',
  endpoint: '',
  model: '',
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
 * 预置 API 提供商配置列表
 */
export const PRESET_API_PROVIDERS = [
  {
    id: 'openai',
    name: 'OpenAI',
    defaultEndpoint: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o-mini',
    docsUrl: 'https://platform.openai.com/docs',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    defaultEndpoint: 'https://api.anthropic.com/v1',
    defaultModel: 'claude-3-haiku-20240307',
    docsUrl: 'https://docs.anthropic.com',
    keyPlaceholder: 'sk-ant-...',
  },
  {
    id: 'aliyun-bailian',
    name: '阿里云百炼',
    defaultEndpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-max',
    docsUrl: 'https://help.aliyun.com/document_detail/611472.html',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'modelscope',
    name: 'ModelScope',
    defaultEndpoint: 'https://api-inference.modelscope.cn/v1',
    defaultModel: 'Qwen/Qwen2.5-72B-Instruct',
    docsUrl: 'https://modelscope.cn/docs',
    keyPlaceholder: 'ms-...',
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow',
    defaultEndpoint: 'https://api.siliconflow.cn/v1',
    defaultModel: 'Qwen/Qwen2.5-7B-Instruct',
    docsUrl: 'https://docs.siliconflow.cn',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'volcengine',
    name: '火山引擎',
    defaultEndpoint: 'https://ark.cn-beijing.volces.com/api/v3',
    defaultModel: 'doubao-pro-32k',
    docsUrl: 'https://www.volcengine.com/docs/82379',
    keyPlaceholder: '...',
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1beta',
    defaultModel: 'gemini-1.5-flash',
    docsUrl: 'https://ai.google.dev/docs',
    keyPlaceholder: '...',
  },
  {
    id: 'deepseek',
    name: 'Deepseek',
    defaultEndpoint: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    docsUrl: 'https://platform.deepseek.com/docs',
    keyPlaceholder: 'sk-...',
  },
  {
    id: 'zhipu',
    name: '智谱AI',
    defaultEndpoint: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4-flash',
    docsUrl: 'https://open.bigmodel.cn/dev/howuse/glm-4',
    keyPlaceholder: '...',
  },
  {
    id: 'custom',
    name: '自定义',
    defaultEndpoint: '',
    defaultModel: '',
    docsUrl: '',
    keyPlaceholder: '请输入 API Key',
  },
] as const;

/**
 * 根据 providerId 获取提供商配置
 * @param providerId 提供商 ID
 * @returns 提供商配置，未找到返回 custom
 */
export function getProviderConfig(providerId: string) {
  return PRESET_API_PROVIDERS.find(p => p.id === providerId) || PRESET_API_PROVIDERS[PRESET_API_PROVIDERS.length - 1];
}

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
