import type { SiteAdapter, SiteConfig } from '../types/adapter';
import { InputType } from '../types/adapter';

/**
 * 目标网站配置列表
 */
export const SITE_CONFIGS: SiteConfig[] = [
  {
    siteId: 'qwen-intl',
    siteName: '千问国际版',
    inputSelector: 'textarea[class*="message-input-textarea"]',
    buttonContainerSelector: 'div[class*="message-input-right-button"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'z-ai',
    siteName: '智谱国际版',
    inputSelector: 'textarea[id*="chat-input"]',
    buttonContainerSelector: 'div[class~="messageInputContainer"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'qwen-cn',
    siteName: '千问国内版',
    inputSelector: 'textarea[placeholder*="输入"]',
    buttonContainerSelector: 'div[class*="input-container"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'qwen-aliyun',
    siteName: '阿里云千问',
    inputSelector: 'textarea[placeholder*="输入"]',
    buttonContainerSelector: 'div[class*="input-container"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'tongyi-aliyun',
    siteName: '通义千问',
    inputSelector: 'textarea[placeholder*="输入"]',
    buttonContainerSelector: 'div[class*="input-container"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'chatgpt',
    siteName: 'ChatGPT',
    inputSelector: '#prompt-textarea',
    buttonContainerSelector: 'div[data-testid="chat-input-container"]',
    inputType: InputType.TEXTAREA,
  },
  {
    siteId: 'claude',
    siteName: 'Claude',
    inputSelector: 'div[contenteditable="true"][data-testid="chat-input"]',
    buttonContainerSelector: 'div[class*="chat-input-container"]',
    inputType: InputType.CONTENTEDITABLE,
  },
  {
    siteId: 'chatglm',
    siteName: 'GLM-4',
    inputSelector: 'textarea[placeholder*="输入"]',
    buttonContainerSelector: 'div[class*="input-container"]',
    inputType: InputType.TEXTAREA,
  },
];

/**
 * 基础适配器实现
 */
class BaseAdapter implements SiteAdapter {
  siteId: string;
  siteName: string;
  private inputSelector: string;
  private buttonContainerSelector: string;
  private inputType: InputType;

  constructor(config: SiteConfig) {
    this.siteId = config.siteId;
    this.siteName = config.siteName;
    this.inputSelector = config.inputSelector;
    this.buttonContainerSelector = config.buttonContainerSelector;
    this.inputType = config.inputType;
  }

  getInputSelector(): string {
    return this.inputSelector;
  }

  getButtonContainerSelector(): string {
    return this.buttonContainerSelector;
  }

  getInputType(): InputType {
    return this.inputType;
  }

  getInputValue(): string {
    try {
      const inputElement = document.querySelector(this.inputSelector) as HTMLTextAreaElement | HTMLElement;
      if (!inputElement) return '';

      if (this.inputType === InputType.TEXTAREA) {
        return (inputElement as HTMLTextAreaElement).value;
      } else {
        return inputElement.textContent || '';
      }
    } catch (error) {
      console.error('[AutoPromptOpt] Failed to get input value:', error);
      return '';
    }
  }

  setInputValue(value: string): void {
    try {
      const inputElement = document.querySelector(this.inputSelector) as HTMLTextAreaElement | HTMLElement;
      if (!inputElement) return;

      if (this.inputType === InputType.TEXTAREA) {
        const textarea = inputElement as HTMLTextAreaElement;
        textarea.value = value;
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        inputElement.textContent = value;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      }
    } catch (error) {
      console.error('[AutoPromptOpt] Failed to set input value:', error);
    }
  }

  isInputAvailable(): boolean {
    try {
      const inputElement = document.querySelector(this.inputSelector);
      return inputElement !== null;
    } catch (error) {
      console.error('[AutoPromptOpt] Failed to check input availability:', error);
      return false;
    }
  }
}

/**
 * 适配器工厂函数
 * 根据当前 URL 返回对应的适配器
 */
export function getAdapterForCurrentSite(): SiteAdapter | null {
  const currentUrl = window.location.href;

  for (const config of SITE_CONFIGS) {
    if (isUrlMatchSite(currentUrl, config.siteId)) {
      console.log('[AutoPromptOpt] Matched site:', config.siteName);
      return new BaseAdapter(config);
    }
  }

  return null;
}

/**
 * 检查 URL 是否匹配指定网站
 */
function isUrlMatchSite(url: string, siteId: string): boolean {
  const urlLower = url.toLowerCase();

  switch (siteId) {
    case 'qwen-intl':
      return urlLower.includes('qwen.ai');
    case 'z-ai':
      return urlLower.includes('z.ai');
    case 'qwen-cn':
      return urlLower.includes('qianwen.com');
    case 'qwen-aliyun':
      return urlLower.includes('qianwen.aliyun.com');
    case 'tongyi-aliyun':
      return urlLower.includes('tongyi.aliyun.com');
    case 'chatgpt':
      return urlLower.includes('chatgpt.com') || urlLower.includes('chat.openai.com');
    case 'claude':
      return urlLower.includes('claude.ai');
    case 'chatglm':
      return urlLower.includes('chatglm.cn');
    default:
      return false;
  }
}
