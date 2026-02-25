/**
 * 优化预览模态框
 * 用于显示优化前后的提示词对比，并提供应用、复制、取消操作
 */

import { replaceInputText } from '@/utils/text-replacer';

/**
 * 模态框选项
 */
export interface OptimizeModalOptions {
  originalText: string;
  optimizedText: string;
  onApply?: () => void;
  onCancel?: () => void;
}

/**
 * 模态框实例
 */
export interface OptimizeModalInstance {
  close: () => void;
}

// 样式常量
const MODAL_STYLES = `
  .apo-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }
  .apo-modal {
    background: #fff;
    border-radius: 12px;
    width: 90%;
    max-width: 800px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  .apo-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .apo-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  .apo-modal-close {
    background: none;
    border: none;
    font-size: 24px;
    color: #6b7280;
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s;
  }
  .apo-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-modal-body {
    padding: 24px;
    overflow-y: auto;
    flex: 1;
  }
  .apo-comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
  .apo-comparison-panel {
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow: hidden;
  }
  .apo-panel-header {
    padding: 12px 16px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .apo-panel-badge {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
  }
  .apo-badge-original {
    background: #fee2e2;
    color: #991b1b;
  }
  .apo-badge-optimized {
    background: #d1fae5;
    color: #065f46;
  }
  .apo-panel-content {
    padding: 16px;
    min-height: 200px;
    max-height: 400px;
    overflow-y: auto;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.6;
    color: #1f2937;
    background: #fff;
  }
  .apo-panel-content-original {
    background: #fef2f2;
  }
  .apo-panel-content-optimized {
    background: #f0fdf4;
  }
  .apo-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .apo-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  .apo-btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-btn-secondary:hover {
    background: #e5e7eb;
  }
  .apo-btn-primary {
    background: #3b82f6;
    color: #fff;
  }
  .apo-btn-primary:hover {
    background: #2563eb;
  }
  .apo-btn-success {
    background: #10b981;
    color: #fff;
  }
  .apo-btn-success:hover {
    background: #059669;
  }
  .apo-diff-highlight {
    background: #fef3c7;
    padding: 2px 4px;
    border-radius: 3px;
  }
  .apo-diff-added {
    background: #d1fae5;
    color: #065f46;
  }
  .apo-diff-removed {
    background: #fee2e2;
    color: #991b1b;
    text-decoration: line-through;
  }
  @media (max-width: 640px) {
    .apo-comparison {
      grid-template-columns: 1fr;
    }
  }
`;

let styleInjected = false;

/**
 * 注入模态框样式
 */
function injectStyles(): void {
  if (styleInjected) return;

  const style = document.createElement('style');
  style.textContent = MODAL_STYLES;
  style.id = 'apo-modal-styles';
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * 创建优化预览模态框
 * @param options 模态框选项
 * @param targetElement 目标输入元素（用于应用优化结果）
 * @returns 模态框实例
 */
export function createOptimizeModal(
  options: OptimizeModalOptions,
  targetElement?: HTMLElement
): OptimizeModalInstance {
  injectStyles();

  const { originalText, optimizedText, onApply, onCancel } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'apo-modal-overlay';

  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'apo-modal';

  // 创建头部
  const header = document.createElement('div');
  header.className = 'apo-modal-header';

  const title = document.createElement('h3');
  title.className = 'apo-modal-title';
  title.textContent = '提示词优化结果';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'apo-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', '关闭');

  header.appendChild(title);
  header.appendChild(closeBtn);

  // 创建内容区
  const body = document.createElement('div');
  body.className = 'apo-modal-body';

  const comparison = document.createElement('div');
  comparison.className = 'apo-comparison';

  // 原始内容面板
  const originalPanel = createPanel(
    '原始提示词',
    'original',
    originalText,
    'apo-badge-original'
  );

  // 优化后内容面板
  const optimizedPanel = createPanel(
    '优化后提示词',
    'optimized',
    optimizedText,
    'apo-badge-optimized'
  );

  comparison.appendChild(originalPanel);
  comparison.appendChild(optimizedPanel);
  body.appendChild(comparison);

  // 创建底部按钮区
  const footer = document.createElement('div');
  footer.className = 'apo-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'apo-btn apo-btn-secondary';
  cancelBtn.textContent = '取消';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'apo-btn apo-btn-secondary';
  copyBtn.innerHTML = '📋 复制';

  const applyBtn = document.createElement('button');
  applyBtn.className = 'apo-btn apo-btn-success';
  applyBtn.innerHTML = '✓ 应用';

  footer.appendChild(cancelBtn);
  footer.appendChild(copyBtn);
  footer.appendChild(applyBtn);

  // 组装模态框
  modal.appendChild(header);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // 添加到页面
  document.body.appendChild(overlay);

  // 关闭函数
  const close = () => {
    overlay.remove();
  };

  // 事件绑定
  closeBtn.addEventListener('click', () => {
    close();
    onCancel?.();
  });

  cancelBtn.addEventListener('click', () => {
    close();
    onCancel?.();
  });

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(optimizedText);
      copyBtn.textContent = '✓ 已复制';
      setTimeout(() => {
        copyBtn.innerHTML = '📋 复制';
      }, 2000);
    } catch {
      copyBtn.textContent = '复制失败';
      setTimeout(() => {
        copyBtn.innerHTML = '📋 复制';
      }, 2000);
    }
  });

  applyBtn.addEventListener('click', () => {
    if (targetElement) {
      const result = replaceInputText(targetElement, optimizedText);
      if (result.success) {
        close();
        onApply?.();
      } else {
        alert(result.error || '应用失败');
      }
    } else {
      close();
      onApply?.();
    }
  });

  // 点击遮罩层关闭
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      close();
      onCancel?.();
    }
  });

  // ESC 键关闭
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      close();
      onCancel?.();
      document.removeEventListener('keydown', handleKeyDown);
    }
  };
  document.addEventListener('keydown', handleKeyDown);

  return { close };
}

/**
 * 创建对比面板
 * @param title 标题
 * @param type 类型
 * @param content 内容
 * @param badgeClass 标签样式类
 * @returns 面板元素
 */
function createPanel(
  title: string,
  type: 'original' | 'optimized',
  content: string,
  badgeClass: string
): HTMLElement {
  const panel = document.createElement('div');
  panel.className = 'apo-comparison-panel';

  const panelHeader = document.createElement('div');
  panelHeader.className = 'apo-panel-header';

  const badge = document.createElement('span');
  badge.className = `apo-panel-badge ${badgeClass}`;
  badge.textContent = type === 'original' ? '原始' : '优化后';

  const panelTitle = document.createElement('span');
  panelTitle.textContent = title;

  panelHeader.appendChild(badge);
  panelHeader.appendChild(panelTitle);

  const panelContent = document.createElement('div');
  panelContent.className = `apo-panel-content apo-panel-content-${type}`;
  panelContent.textContent = content;

  panel.appendChild(panelHeader);
  panel.appendChild(panelContent);

  return panel;
}

/**
 * 显示优化预览模态框
 * @param originalText 原始文本
 * @param optimizedText 优化后文本
 * @param targetElement 目标输入元素
 * @returns Promise，用户选择应用时 resolve，取消时 reject
 */
export function showOptimizeModal(
  originalText: string,
  optimizedText: string,
  targetElement?: HTMLElement
): Promise<void> {
  return new Promise((resolve, reject) => {
    createOptimizeModal(
      {
        originalText,
        optimizedText,
        onApply: () => resolve(),
        onCancel: () => reject(new Error('用户取消')),
      },
      targetElement
    );
  });
}
