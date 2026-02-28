import { injectOptimizeButton, findSingleInputElement, removeAllInjectedButtons, type InjectContext, type InjectInstance } from '@/utils/injector';
import { llmConfig, userPromptConfig, promptTemplates, appSettings } from '@/utils/storage';
import type { LLMConfig, UserPromptConfig, PromptTemplate, AppSettings } from '@/types/storage';

// 目标网站配置
const SITE_CONFIGS: Record<string, { inputSelector: string; buttonContainerSelector?: string }> = {
  'qwen.ai': {
    inputSelector: 'textarea[class~="message-input-textarea"], textarea[placeholder*="有什么我能帮您的吗？"]',
    buttonContainerSelector: 'div.message-input-right-button',
  },
  'z.ai': {
    inputSelector: '#chat-input, textarea[placeholder*="什么"]',
    buttonContainerSelector: '',
  },
  'qianwen.aliyun.com': {
    inputSelector: 'textarea[placeholder*="提问"], #chat-input, .chat-input textarea',
    buttonContainerSelector: '.chat-input-actions, .input-actions, [class*="send-box"]',
  },
  'tongyi.aliyun.com': {
    inputSelector: 'textarea[placeholder*="提问"], #chat-input, .chat-input textarea',
    buttonContainerSelector: '.chat-input-actions, .input-actions',
  },
  'chatgpt.com': {
    inputSelector: 'textarea[placeholder*="Message"], #prompt-textarea, [data-testid*="text-input"]',
    buttonContainerSelector: '[class*="send-button"], [class*="submit"]',
  },
  'chat.openai.com': {
    inputSelector: 'textarea[placeholder*="Message"], #prompt-textarea',
    buttonContainerSelector: '[class*="send-button"], [class*="submit"]',
  },
  'claude.ai': {
    inputSelector: '[contenteditable="true"], .ProseMirror, [placeholder*="Message"]',
    buttonContainerSelector: '[class*="send-button"], [class*="submit"]',
  },
  'chatglm.cn': {
    inputSelector: '.input-box-inner > textarea',
    buttonContainerSelector: '',
  },
};

// 注入实例数组
let injectInstances: InjectInstance[] = [];

// 当前上下文
let currentContext: InjectContext | null = null;

// 存储监听取消函数
let unwatchStorage: (() => void) | null = null;

export default defineContentScript({
  matches: [
    '*://*.qwen.ai/*',
    '*://qwen.ai/*',
    '*://*.z.ai/*',
    '*://z.ai/*',
    '*://*.qianwen.com/*',
    '*://qianwen.com/*',
    '*://*.qianwen.aliyun.com/*',
    '*://qianwen.aliyun.com/*',
    '*://tongyi.aliyun.com/*',
    '*://chatgpt.com/*',
    '*://chat.openai.com/*',
    '*://claude.ai/*',
    '*://chatglm.cn/*',
  ],
  main(ctx) {
    console.log('[AutoPromptOpt] Content script loaded, context valid:', ctx.isValid);

    // 检查上下文是否有效
    if (!ctx.isValid) {
      console.error('[AutoPromptOpt] Context is invalid, cannot proceed');
      return;
    }

    // 初始化
    init();

    // 监听存储变化
    watchStorageChanges(ctx);

    // 监听页面变化（SPA 路由变化）
    observePageChanges(ctx);
  },
});

/**
 * 初始化内容脚本
 */
async function init(): Promise<void> {
  console.log('[AutoPromptOpt] 开始初始化...');

  try {
    // 加载配置
    await loadContext();
    console.log('[AutoPromptOpt] 配置加载完成:', currentContext);

    // 注入按钮
    injectButtons();
  } catch (error) {
    console.error('[AutoPromptOpt] 初始化失败:', error);
  }
}

/**
 * 加载注入上下文
 * 通过 background script 加载配置，避免 content script 直接访问 storage
 */
async function loadContext(): Promise<void> {
  console.log('[AutoPromptOpt] 开始加载存储数据...');

  try {
    // 通过消息传递从 background script 加载配置
    const response = await browser.runtime.sendMessage({ type: 'LOAD_CONTEXT' });

    if (!response.success) {
      throw new Error(response.error);
    }

    const { llmConfig: llmData, userPromptConfig: promptData, templates: templatesData, appSettings: settingsData } = response.data;

    console.log('[AutoPromptOpt] 存储数据加载结果:', {
      llm: llmData ? '已加载' : '未找到',
      prompt: promptData ? '已加载' : '未找到',
      templates: templatesData ? `已加载 ${templatesData.length} 个模板` : '未找到',
      settings: settingsData ? '已加载' : '未找到',
    });

    currentContext = {
      llmConfig: llmData,
      userPromptConfig: promptData,
      templates: templatesData,
      skipPreview: settingsData?.skipPreview || false,
    };

    console.log('[AutoPromptOpt] 上下文加载完成');
  } catch (error) {
    console.error('[AutoPromptOpt] 加载存储数据失败:', error);
    // 使用默认配置
    currentContext = {
      llmConfig: { apiKey: '', providerId: 'custom', endpoint: '', model: '' },
      userPromptConfig: { selectedPromptId: 'general-v1', customPrompts: [], builtInOverrides: {} },
      templates: [],
      skipPreview: false,
    };
  }
}

/**
 * 注入按钮到页面
 */
function injectButtons(): void {
  console.log('[AutoPromptOpt] 开始注入按钮...');

  // 先清理已有的按钮
  cleanup();

  const hostname = window.location.hostname;

  const config = findSiteConfig(hostname);

  if (!config) {
    console.log('[AutoPromptOpt] 未找到站点配置:', hostname);
    return;
  }

  console.log('[AutoPromptOpt] 找到站点配置:', config);

  if (!currentContext) {
    console.log('[AutoPromptOpt] 上下文未加载，无法注入');
    return;
  }

  // 只查找选择器指定的第一个输入框
  const input = findSingleInputElement(config.inputSelector);

  if (!input) {
    console.log('[AutoPromptOpt] 未找到输入框元素，选择器:', config.inputSelector);
    return;
  }

  console.log('[AutoPromptOpt] 找到输入框元素，开始注入');
  const instance = injectOptimizeButton(input, config, currentContext);
  injectInstances.push(instance);
}

/**
 * 查找站点配置
 * @param hostname 主机名
 * @returns 站点配置
 */
function findSiteConfig(hostname: string): { inputSelector: string; buttonContainerSelector?: string } | null {
  // 直接匹配
  if (SITE_CONFIGS[hostname]) {
    return SITE_CONFIGS[hostname];
  }

  // 尝试匹配子域名
  for (const [domain, config] of Object.entries(SITE_CONFIGS)) {
    if (hostname.endsWith(domain)) {
      return config;
    }
  }

  return null;
}

/**
 * 清理注入的按钮
 */
function cleanup(): void {
  console.log('[AutoPromptOpt] 清理注入的按钮...');
  injectInstances.forEach(instance => instance.cleanup());
  injectInstances = [];
  removeAllInjectedButtons();
}

/**
 * 更新所有注入实例的上下文
 */
function updateInjectInstances(): void {
  if (!currentContext) return;

  console.log('[AutoPromptOpt] 更新所有注入实例的上下文...');
  injectInstances.forEach(instance => {
    instance.updateContext(currentContext!);
  });
}

/**
 * 监听存储变化
 */
function watchStorageChanges(ctx: any): void {
  console.log('[AutoPromptOpt] 开始监听存储变化...');

  // 如果之前有监听，先取消
  if (unwatchStorage) {
    unwatchStorage();
    unwatchStorage = null;
  }

  try {
    // 使用 storage 模块的 watch 方法监听变化
    const unwatchPromptTemplates = promptTemplates.watch((newTemplates) => {
      if (ctx.isInvalid) {
        console.log('[AutoPromptOpt] 上下文已失效，忽略存储变化');
        return;
      }

      if (currentContext && newTemplates) {
        currentContext.templates = newTemplates;
        console.log('[AutoPromptOpt] 模板数据已更新到上下文');
        // 更新所有注入实例
        updateInjectInstances();
      }
    });

    const unwatchLLMConfig = llmConfig.watch((newConfig) => {
      console.log('[AutoPromptOpt] LLM 配置变化:', newConfig ? '已更新' : 'null');
      console.log('更新为:', newConfig);
      if (ctx.isInvalid) return;
      if (currentContext && newConfig) {
        currentContext.llmConfig = newConfig;
        // 更新所有注入实例
        updateInjectInstances();
      }
    });

    const unwatchUserPromptConfig = userPromptConfig.watch((newConfig) => {
      console.log('[AutoPromptOpt] 提示词配置变化:', newConfig ? '已更新' : 'null');
      if (ctx.isInvalid) return;
      if (currentContext && newConfig) {
        currentContext.userPromptConfig = newConfig;
        // 更新所有注入实例（策略选择器会重新渲染）
        updateInjectInstances();
      }
    });

    const unwatchAppSettings = appSettings.watch((newSettings) => {
      console.log('[AutoPromptOpt] 应用设置变化:', newSettings ? '已更新' : 'null');
      if (ctx.isInvalid) return;
      if (currentContext && newSettings) {
        currentContext.skipPreview = newSettings.skipPreview;
        // 更新所有注入实例
        updateInjectInstances();
      }
    });

    // 保存取消监听函数
    unwatchStorage = () => {
      unwatchPromptTemplates();
      unwatchLLMConfig();
      unwatchUserPromptConfig();
      unwatchAppSettings();
      console.log('[AutoPromptOpt] 已取消存储监听');
    };

    console.log('[AutoPromptOpt] 存储监听已设置');
  } catch (error) {
    console.error('[AutoPromptOpt] 设置存储监听失败:', error);
  }
}

/**
 * 监听页面变化
 */
function observePageChanges(ctx: any): void {
  let lastUrl = location.href;
  let lastContainer: Element | null = null;

  const observer = new MutationObserver((mutations) => {
    if (ctx.isInvalid) {
      console.log('[AutoPromptOpt] 上下文已失效，停止观察');
      observer.disconnect();
      return;
    }

    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      console.log('[AutoPromptOpt] URL 变化:', lastUrl, '->', currentUrl);
      lastUrl = currentUrl;
      lastContainer = null;
      setTimeout(() => injectButtons(), 500);
    } else {
      // 检查容器是否发生变化（被重新创建或移动）
      checkContainerChanges((newContainer) => {
        lastContainer = newContainer;
      });
      // 检查是否有新的输入框出现
      checkForNewInputs();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  console.log('[AutoPromptOpt] 页面变化观察已启动');
}

/**
 * 检查按钮容器是否发生变化
 * 当容器被重新创建或移动时，重新注入按钮
 */
function checkContainerChanges(onContainerFound: (container: Element) => void): void {
  const hostname = window.location.hostname;
  const config = findSiteConfig(hostname);

  if (!config?.buttonContainerSelector) return;

  // 查找当前容器
  const currentContainer = document.querySelector(config.buttonContainerSelector);

  // 如果找到了容器但按钮不在其中，说明容器被重新创建了
  if (currentContainer) {
    const buttonContainer = currentContainer.querySelector('.apo-container');
    if (!buttonContainer && injectInstances.length > 0) {
      console.log('[AutoPromptOpt] 容器被重新创建，重新注入按钮');
      cleanup();
      setTimeout(() => injectButtons(), 100);
    }
    onContainerFound(currentContainer);
  }
}

/**
 * 检查是否有新的输入框
 * 只检查选择器指定的第一个输入框
 */
function checkForNewInputs(): void {
  const hostname = window.location.hostname;
  const config = findSiteConfig(hostname);

  if (!config || !currentContext) return;

  // 如果已经注入过，不再重复检查
  if (injectInstances.length > 0) return;

  // 只查找选择器指定的第一个输入框
  const input = findSingleInputElement(config.inputSelector);

  if (input) {
    console.log('[AutoPromptOpt] 发现新的输入框，注入按钮');
    const instance = injectOptimizeButton(input, config, currentContext);
    injectInstances.push(instance);
  }
}
