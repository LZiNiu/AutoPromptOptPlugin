import type { SiteAdapter, SiteConfig } from '../types/adapter';
import { InputType } from '../types/adapter';
import type { UserSelectorConfig, ElementSelectorInfo } from '../types/storage';

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

/**
 * 降级处理接口预留
 * 这些接口将在后续实现中完善
 */

/**
 * 设置用户自定义选择器
 * @param siteId 网站 ID
 * @param type 选择器类型 ('input' | 'container')
 * @param selector CSS 选择器
 */
export function setCustomSelector(
  siteId: string,
  type: 'input' | 'container',
  selector: string
): void {
  console.log('[AutoPromptOpt] setCustomSelector called (not implemented yet)', { siteId, type, selector });
}

/**
 * 获取用户自定义选择器
 * @param siteId 网站 ID
 * @param type 选择器类型 ('input' | 'container')
 * @returns CSS 选择器或 null
 */
export function getCustomSelector(
  siteId: string,
  type: 'input' | 'container'
): string | null {
  console.log('[AutoPromptOpt] getCustomSelector called (not implemented yet)', { siteId, type });
  return null;
}

/**
 * 验证选择器是否有效
 * @param selector CSS 选择器
 * @returns 是否有效
 */
export function validateSelector(selector: string): boolean {
  try {
    const element = document.querySelector(selector);
    return element !== null;
  } catch (error) {
    console.error('[AutoPromptOpt] Invalid selector:', selector, error);
    return false;
  }
}

/**
 * 捕获元素的选择器信息
 * @param element HTML 元素
 * @returns 元素选择器信息
 */
export function captureElement(element: HTMLElement): ElementSelectorInfo {
  const domPath = getDomPath(element);
  const xpath = getXPath(element);
  const cssSelector = getCssSelector(element);

  return {
    domPath,
    xpath,
    cssSelector,
  };
}

/**
 * 获取元素的 DOM Path
 * @param element HTML 元素
 * @returns DOM Path 字符串
 */
function getDomPath(element: HTMLElement): string {
  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
    } else if (current.classList.length > 0) {
      selector += `.${Array.from(current.classList).join('.')}`;
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children);
      const index = siblings.indexOf(current);
      if (index > 0) {
        selector += `:nth-child(${index + 1})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}

/**
 * 获取元素的 XPath
 * @param element HTML 元素
 * @returns XPath 字符串
 */
function getXPath(element: HTMLElement): string {
  if (element.id) {
    return `//*[@id="${element.id}"]`;
  }

  const parts: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.documentElement) {
    let index = 0;
    let sibling = current.previousElementSibling;

    while (sibling) {
      if (sibling.tagName === current.tagName) {
        index++;
      }
      sibling = sibling.previousElementSibling;
    }

    const tagName = current.tagName.toLowerCase();
    const pathIndex = index > 0 ? `[${index + 1}]` : '';
    parts.unshift(`${tagName}${pathIndex}`);

    current = current.parentElement;
  }

  return '/' + parts.join('/');
}

/**
 * 获取元素的 CSS Selector
 * @param element HTML 元素
 * @returns CSS Selector 字符串
 */
function getCssSelector(element: HTMLElement): string {
  if (element.id) {
    return `#${element.id}`;
  }

  const path: string[] = [];
  let current: HTMLElement | null = element;

  while (current && current !== document.body) {
    let selector = current.tagName.toLowerCase();

    if (current.id) {
      selector += `#${current.id}`;
      path.unshift(selector);
      break;
    } else if (current.classList.length > 0) {
      selector += `.${Array.from(current.classList).join('.')}`;
    }

    const parent: HTMLElement | null = current.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (el) => el.tagName === current?.tagName
      );
      const index = siblings.indexOf(current);
      if (siblings.length > 1) {
        selector += `:nth-of-type(${index + 1})`;
      }
    }

    path.unshift(selector);
    current = parent;
  }

  return path.join(' > ');
}
