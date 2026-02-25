import { storage } from '#imports';
import type { LLMConfig, UserPromptConfig, PromptTemplate, AppSettings } from '@/types/storage';
import { DEFAULT_LLM_CONFIG, DEFAULT_APP_SETTINGS, DEFAULT_TEMPLATES } from '@/constants/defaults';
import { DEFAULT_USER_PROMPT_CONFIG } from '@/utils/prompts';

/**
 * 初始化存储数据
 * 确保所有必需的存储项都有默认值
 */
async function initializeStorage(): Promise<void> {
  console.log('[AutoPromptOpt] 开始初始化存储数据...');

  try {
    // 检查并初始化 LLM 配置
    const llmConfig = await storage.getItem<LLMConfig>('local:llmConfig');
    if (!llmConfig) {
      console.log('[AutoPromptOpt] 初始化 LLM 配置为默认值');
      await storage.setItem('local:llmConfig', DEFAULT_LLM_CONFIG);
    }

    // 检查并初始化用户提示词配置
    const userPromptConfig = await storage.getItem<UserPromptConfig>('local:userPromptConfig');
    if (!userPromptConfig) {
      console.log('[AutoPromptOpt] 初始化用户提示词配置为默认值');
      await storage.setItem('local:userPromptConfig', DEFAULT_USER_PROMPT_CONFIG);
    }

    // 检查并初始化提示词模板
    const promptTemplates = await storage.getItem<PromptTemplate[]>('local:promptTemplates');
    if (!promptTemplates || promptTemplates.length === 0) {
      console.log('[AutoPromptOpt] 初始化提示词模板为默认值');
      await storage.setItem('local:promptTemplates', DEFAULT_TEMPLATES);
    }

    // 检查并初始化应用设置
    const appSettings = await storage.getItem<AppSettings>('local:appSettings');
    if (!appSettings) {
      console.log('[AutoPromptOpt] 初始化应用设置为默认值');
      await storage.setItem('local:appSettings', DEFAULT_APP_SETTINGS);
    }

    console.log('[AutoPromptOpt] 存储数据初始化完成');
  } catch (error) {
    console.error('[AutoPromptOpt] 存储数据初始化失败:', error);
  }
}

export default defineBackground(() => {
  console.log('[AutoPromptOpt] Background script started', { id: browser.runtime.id });

  // 插件安装或更新时初始化存储
  browser.runtime.onInstalled.addListener((details) => {
    console.log('[AutoPromptOpt] 插件状态变化:', details.reason);
    initializeStorage();
  });

  // 启动时初始化存储（处理浏览器重启的情况）
  initializeStorage();
});
