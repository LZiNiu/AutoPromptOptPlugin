import { storage } from '#imports';
import type { LLMConfig, UserPromptConfig, PromptTemplate, AppSettings, OptimizeHistoryItem } from '@/types/storage';
import { llmConfig, userPromptConfig, promptTemplates, appSettings, sessionHistory } from '@/utils/storage';
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
    const llmConfigData = await llmConfig.get();
    if (!llmConfigData) {
      console.log('[AutoPromptOpt] 初始化 LLM 配置为默认值');
      await llmConfig.set(DEFAULT_LLM_CONFIG);
    }

    // 检查并初始化用户提示词配置
    const userPromptConfigData = await userPromptConfig.get();
    if (!userPromptConfigData) {
      console.log('[AutoPromptOpt] 初始化用户提示词配置为默认值');
      await userPromptConfig.set(DEFAULT_USER_PROMPT_CONFIG);
    }

    // 检查并初始化提示词模板
    const promptTemplatesData = await promptTemplates.get();
    if (!promptTemplatesData || promptTemplatesData.length === 0) {
      console.log('[AutoPromptOpt] 初始化提示词模板为默认值');
      await promptTemplates.set(DEFAULT_TEMPLATES);
    }

    // 检查并初始化应用设置
    const appSettingsData = await appSettings.get();
    if (!appSettingsData) {
      console.log('[AutoPromptOpt] 初始化应用设置为默认值');
      await appSettings.set(DEFAULT_APP_SETTINGS);
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

  // 监听来自 content script 的消息
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_SESSION_HISTORY') {
      sessionHistory.get().then((history) => {
        sendResponse({ success: true, data: history });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true; // 保持消息通道开放
    }

    if (message.type === 'ADD_SESSION_HISTORY') {
      const { item, maxLimit } = message.payload;
      sessionHistory.get().then((histories) => {
        const newItem: OptimizeHistoryItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
        };

        // FIFO：新记录添加到队尾，超出限制时从队首移除
        const updated = [...histories, newItem];
        while (updated.length > maxLimit) {
          updated.shift();
        }

        return sessionHistory.set(updated);
      }).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }

    if (message.type === 'CLEAR_SESSION_HISTORY') {
      sessionHistory.set([]).then(() => {
        sendResponse({ success: true });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }

    if (message.type === 'LOAD_CONTEXT') {
      // 加载所有配置数据
      Promise.all([
        llmConfig.get(),
        userPromptConfig.get(),
        promptTemplates.get(),
        appSettings.get(),
      ]).then(([llmConfig, userPromptConfig, templates, appSettings]) => {
        sendResponse({
          success: true,
          data: {
            llmConfig,
            userPromptConfig,
            templates,
            appSettings,
          }
        });
      }).catch((error) => {
        sendResponse({ success: false, error: error.message });
      });
      return true;
    }
  });
});
