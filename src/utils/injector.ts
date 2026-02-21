import type { SiteAdapter } from '../types/adapter';
import { getAdapterForCurrentSite } from '../constants/sites';
import { createShadowContainer, injectStyles, createElementInShadow } from './shadow-dom';
import buttonStyles from '../assets/content-style.css?inline';

/**
 * 注入引擎类
 */
export class Injector {
  private adapter: SiteAdapter | null = null;
  private observer: MutationObserver | null = null;
  private buttonInjected: boolean = false;

  constructor() {
    this.adapter = getAdapterForCurrentSite();
    if (!this.adapter) {
      console.log('[AutoPromptOpt] No adapter found for current site');
      return;
    }

    console.log('[AutoPromptOpt] Injector initialized for:', this.adapter.siteName);
    this.start();
  }

  /**
   * 启动注入引擎
   */
  private start(): void {
    if (!this.adapter) return;

    console.log('[AutoPromptOpt] Starting injector...');

    if (this.adapter.isInputAvailable()) {
      console.log('[AutoPromptOpt] Input available, injecting button...');
      this.injectButton();
    } else {
      console.log('[AutoPromptOpt] Input not available, waiting for DOM...');
      this.observeDOM();
    }
  }

  /**
   * 观察 DOM 变化
   */
  private observeDOM(): void {
    if (!this.adapter) return;

    console.log('[AutoPromptOpt] Setting up DOM observer...');

    this.observer = new MutationObserver((mutations) => {
      if (this.buttonInjected) {
        this.stopObserving();
        return;
      }

      if (this.adapter && this.adapter.isInputAvailable()) {
        console.log('[AutoPromptOpt] Input detected via observer, injecting button...');
        this.injectButton();
        this.stopObserving();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * 停止观察 DOM
   */
  private stopObserving(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      console.log('[AutoPromptOpt] DOM observer stopped');
    }
  }

  /**
   * 注入优化按钮
   */
  private injectButton(): void {
    if (this.buttonInjected || !this.adapter) {
      console.log('[AutoPromptOpt] Button already injected or no adapter');
      return;
    }

    try {
      const container = document.querySelector(this.adapter.getButtonContainerSelector()) as HTMLElement;
      if (!container) {
        console.log('[AutoPromptOpt] Button container not found');
        return;
      }

      console.log('[AutoPromptOpt] Button container found, creating button with Shadow DOM...');

      const shadowRoot = createShadowContainer(container, 'apo-shadow-host');
      injectStyles(shadowRoot, buttonStyles);

      const button = this.createOptimizeButton(shadowRoot);

      this.buttonInjected = true;
      console.log('[AutoPromptOpt] Button injected successfully');
    } catch (error) {
      console.error('[AutoPromptOpt] Failed to inject button:', error);
    }
  }

  /**
   * 创建优化按钮元素
   */
  private createOptimizeButton(shadowRoot: ShadowRoot): HTMLElement {
    const button = createElementInShadow(
      shadowRoot,
      'button',
      {
        id: 'apo-optimize-button',
        class: 'apo-optimize-button',
        type: 'button',
      },
      '✨ 优化'
    );

    button.addEventListener('click', () => {
      console.log('[AutoPromptOpt] Optimize button clicked');
      this.handleOptimizeClick();
    });

    return button;
  }

  /**
   * 处理优化按钮点击事件
   */
  private handleOptimizeClick(): void {
    if (!this.adapter) return;

    const inputValue = this.adapter.getInputValue();
    console.log('[AutoPromptOpt] Current input value:', inputValue);

    if (!inputValue.trim()) {
      console.log('[AutoPromptOpt] Input is empty');
      alert('请先输入需要优化的提示词');
      return;
    }

    console.log('[AutoPromptOpt] Optimization feature is under development...');
    alert('优化功能开发中...');
  }

  /**
   * 销毁注入引擎
   */
  public destroy(): void {
    this.stopObserving();
    this.buttonInjected = false;
    console.log('[AutoPromptOpt] Injector destroyed');
  }
}

/**
 * 创建并启动注入引擎
 */
export function createInjector(): Injector | null {
  try {
    return new Injector();
  } catch (error) {
    console.error('[AutoPromptOpt] Failed to create injector:', error);
    return null;
  }
}
