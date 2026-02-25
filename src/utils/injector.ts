/**
 * 注入器模块
 * 用于在目标网站输入框旁注入优化按钮和策略选择器
 */

import type { PromptConfig, UserPromptConfig, LLMConfig, PromptTemplate } from '@/types/storage';
import { optimizePrompt } from './api';
import { getInputValue, isTextInputElement } from './text-replacer';
import { createOptimizeModal } from '@/components/content/OptimizeModal';
import { createTemplateModal } from '@/components/content/TemplateModal';
import { getAllPrompts, getSelectedPrompt } from './prompts';

/**
 * 注入按钮配置
 */
export interface InjectorConfig {
  inputSelector: string;
  buttonContainerSelector?: string;
  position?: 'before' | 'after';
}

/**
 * 注入上下文
 */
export interface InjectContext {
  llmConfig: LLMConfig;
  userPromptConfig: UserPromptConfig;
  templates: PromptTemplate[];
  skipPreview: boolean;
}

/**
 * 注入实例接口
 */
export interface InjectInstance {
  updateContext: (newContext: InjectContext) => void;
  cleanup: () => void;
}

// 样式常量
const BUTTON_STYLES = `
  .apo-container {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-left: 8px;
  }
  .apo-btn {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    outline: none;
    white-space: nowrap;
  }
  .apo-btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
  }
  .apo-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
  }
  .apo-btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
  .apo-btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-btn-secondary:hover {
    background: #e5e7eb;
  }
  .apo-btn-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: #fff;
    border-radius: 50%;
    animation: apo-spin 0.8s linear infinite;
  }
  @keyframes apo-spin {
    to { transform: rotate(360deg); }
  }
  .apo-strategy-select {
    padding: 5px 10px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 12px;
    background: #fff;
    cursor: pointer;
    outline: none;
    color: #374151;
  }
  .apo-strategy-select:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.1);
  }
  .apo-strategy-select option {
    padding: 4px;
  }
  .apo-tooltip {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    padding: 6px 10px;
    background: #1f2937;
    color: #fff;
    font-size: 12px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all 0.2s;
    margin-bottom: 6px;
    z-index: 10000;
  }
  .apo-btn:hover .apo-tooltip {
    opacity: 1;
    visibility: visible;
  }
  .apo-error-toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    background: #ef4444;
    color: #fff;
    border-radius: 8px;
    font-size: 14px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 2147483647;
    animation: apo-slide-in 0.3s ease;
  }
  @keyframes apo-slide-in {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

let styleInjected = false;
let currentAbortController: AbortController | null = null;

/**
 * 注入样式
 */
function injectStyles(): void {
  if (styleInjected) return;

  const style = document.createElement('style');
  style.textContent = BUTTON_STYLES;
  style.id = 'apo-injector-styles';
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * 在输入框旁注入优化按钮组
 * @param inputElement 输入框元素
 * @param config 注入配置
 * @param context 注入上下文
 * @returns 注入实例，包含更新上下文和清理函数
 */
export function injectOptimizeButton(
  inputElement: HTMLElement,
  config: InjectorConfig,
  context: InjectContext
): InjectInstance {
  injectStyles();

  // 使用可变引用存储上下文，支持动态更新
  let currentContext = { ...context };

  // 创建按钮容器
  const container = document.createElement('div');
  container.className = 'apo-container';

  // 创建策略选择器
  let strategySelect = createStrategySelector(currentContext.userPromptConfig);
  container.appendChild(strategySelect);

  // 创建优化按钮
  const optimizeBtn = document.createElement('button');
  optimizeBtn.className = 'apo-btn apo-btn-primary';
  optimizeBtn.innerHTML = '✨ 优化';
  optimizeBtn.title = '优化当前提示词';

  // 创建模板按钮
  const templateBtn = document.createElement('button');
  templateBtn.className = 'apo-btn apo-btn-secondary';
  templateBtn.innerHTML = '📋 模板';
  templateBtn.title = '插入提示词模板';

  container.appendChild(optimizeBtn);
  container.appendChild(templateBtn);

  // 查找插入位置
  let insertTarget: HTMLElement | null = null;

  if (config.buttonContainerSelector) {
    insertTarget = inputElement.closest(config.buttonContainerSelector) as HTMLElement;
  }

  if (!insertTarget) {
    // 如果没有找到容器，尝试在输入框的父元素中插入
    insertTarget = inputElement.parentElement;
  }

  if (insertTarget) {
    if (config.position === 'before') {
      insertTarget.insertBefore(container, insertTarget.firstChild);
    } else {
      insertTarget.appendChild(container);
    }
  }

  // 优化按钮点击事件
  const handleOptimize = async () => {
    const inputText = getInputValue(inputElement);

    if (!inputText.trim()) {
      showErrorToast('请输入要优化的提示词');
      return;
    }

    // 验证 API 配置
    if (!currentContext.llmConfig.apiKey) {
      showErrorToast('请先配置 API Key');
      return;
    }

    // 取消之前的请求
    if (currentAbortController) {
      currentAbortController.abort();
    }
    currentAbortController = new AbortController();

    // 设置加载状态
    setLoadingState(optimizeBtn, true);

    try {
      const result = await optimizePrompt(
        inputText,
        currentContext.llmConfig,
        currentContext.userPromptConfig,
        { timeout: 60000, retryCount: 2 },
        currentAbortController.signal
      );

      if (result.success && result.optimizedPrompt) {
        if (currentContext.skipPreview) {
          // 直接替换
          const { replaceInputText } = await import('./text-replacer');
          const replaceResult = replaceInputText(inputElement, result.optimizedPrompt);
          if (!replaceResult.success) {
            showErrorToast(replaceResult.error || '替换失败');
          }
        } else {
          // 显示预览模态框
          createOptimizeModal(
            {
              originalText: inputText,
              optimizedText: result.optimizedPrompt,
              onApply: () => {
                // 应用后关闭
              },
              onCancel: () => {
                // 取消
              },
            },
            inputElement
          );
        }
      } else {
        showErrorToast(result.error || '优化失败');
      }
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        showErrorToast(error.message || '优化失败');
      }
    } finally {
      setLoadingState(optimizeBtn, false);
      currentAbortController = null;
    }
  };

  optimizeBtn.addEventListener('click', handleOptimize);

  // 模板按钮点击事件
  const handleTemplate = () => {
    if (currentContext.templates.length === 0) {
      showErrorToast('暂无保存的模板，请在选项页添加');
      return;
    }

    createTemplateModal(
      {
        templates: currentContext.templates,
        onSelect: () => {
          // 模板已插入
        },
        onCancel: () => {
          // 取消
        },
      },
      inputElement
    );
  };

  templateBtn.addEventListener('click', handleTemplate);

  // 更新上下文函数
  const updateContext = (newContext: InjectContext) => {
    currentContext = { ...newContext };

    // 更新策略选择器
    const newSelect = createStrategySelector(currentContext.userPromptConfig);
    container.replaceChild(newSelect, strategySelect);
    strategySelect = newSelect;
  };

  // 清理函数
  const cleanup = () => {
    container.remove();
    if (currentAbortController) {
      currentAbortController.abort();
    }
  };

  // 返回注入实例
  return {
    updateContext,
    cleanup,
  };
}

/**
 * 创建策略选择器
 * @param userPromptConfig 用户提示词配置
 * @returns 选择器元素
 */
function createStrategySelector(userPromptConfig: UserPromptConfig): HTMLSelectElement {
  const select = document.createElement('select');
  select.className = 'apo-strategy-select';

  const prompts = getAllPrompts(userPromptConfig);
  const currentPrompt = getSelectedPrompt(userPromptConfig);

  prompts.forEach(prompt => {
    const option = document.createElement('option');
    option.value = prompt.id;
    option.textContent = prompt.name;
    option.selected = prompt.id === currentPrompt.id;
    select.appendChild(option);
  });

  // 策略切换事件
  select.addEventListener('change', async () => {
    const selectedId = select.value;
    const { userPromptConfig: storage } = await import('./storage');
    const currentConfig = await storage.get();
    const { setSelectedPrompt } = await import('./prompts');
    const newConfig = setSelectedPrompt(currentConfig, selectedId);
    await storage.set(newConfig);
  });

  return select;
}

/**
 * 设置按钮加载状态
 * @param btn 按钮元素
 * @param loading 是否加载中
 */
function setLoadingState(btn: HTMLButtonElement, loading: boolean): void {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="apo-btn-spinner"></span> 优化中...';
  } else {
    btn.disabled = false;
    btn.innerHTML = '✨ 优化';
  }
}

/**
 * 显示错误提示
 * @param message 错误消息
 */
function showErrorToast(message: string): void {
  // 移除已有的错误提示
  const existingToast = document.querySelector('.apo-error-toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = 'apo-error-toast';
  toast.textContent = message;

  document.body.appendChild(toast);

  // 3秒后自动移除
  setTimeout(() => {
    toast.style.animation = 'apo-slide-in 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 查找页面上的输入框
 * @param selector CSS 选择器
 * @returns 输入框元素数组
 */
export function findInputElements(selector: string): HTMLElement[] {
  const elements = document.querySelectorAll<HTMLElement>(selector);
  return Array.from(elements).filter(isTextInputElement);
}

/**
 * 查找选择器指定的第一个有效输入框
 * @param selector CSS 选择器
 * @returns 输入框元素或 null
 */
export function findSingleInputElement(selector: string): HTMLElement | null {
  const elements = document.querySelectorAll<HTMLElement>(selector);

  for (const element of Array.from(elements)) {
    if (isTextInputElement(element)) {
      return element;
    }
  }

  return null;
}

/**
 * 检查元素是否已注入按钮
 * @param element 输入框元素
 * @returns 是否已注入
 */
export function isInjected(element: HTMLElement): boolean {
  const parent = element.parentElement;
  if (!parent) return false;

  return parent.querySelector('.apo-container') !== null;
}

/**
 * 移除所有注入的按钮
 */
export function removeAllInjectedButtons(): void {
  const containers = document.querySelectorAll('.apo-container');
  containers.forEach(container => container.remove());
}
