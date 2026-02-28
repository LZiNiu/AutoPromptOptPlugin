/**
 * 历史记录弹窗组件
 * 用于显示本次会话的优化历史记录列表
 */

import type { OptimizeHistoryItem } from '@/types/storage';
import { insertTextAtCursor } from '@/utils/text-replacer';

/**
 * 历史弹窗选项
 */
export interface HistoryModalOptions {
  history: OptimizeHistoryItem[];
  onSelect?: (item: OptimizeHistoryItem) => void;
  onCancel?: () => void;
}

/**
 * 弹窗实例
 */
export interface HistoryModalInstance {
  close: () => void;
}

// 样式常量
const MODAL_STYLES = `
  .apo-history-modal-overlay {
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
  .apo-history-modal {
    background: #fff;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    overflow: hidden;
  }
  .apo-history-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .apo-history-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .apo-history-modal-close {
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
  .apo-history-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-history-modal-body {
    padding: 0;
    overflow-y: auto;
    flex: 1;
    max-height: 400px;
  }
  .apo-history-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .apo-history-item {
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.2s;
  }
  .apo-history-item:hover {
    background: #f9fafb;
  }
  .apo-history-item:last-child {
    border-bottom: none;
  }
  .apo-history-prompt {
    margin-bottom: 8px;
  }
  .apo-history-prompt-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 4px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .apo-history-prompt-text {
    font-size: 13px;
    color: #374151;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
  .apo-history-optimized {
    margin-bottom: 8px;
  }
  .apo-history-optimized-text {
    font-size: 13px;
    color: #059669;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-word;
  }
  .apo-history-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 12px;
  }
  .apo-history-time {
    font-size: 12px;
    color: #9ca3af;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .apo-history-actions {
    display: flex;
    gap: 8px;
  }
  .apo-history-btn {
    padding: 6px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .apo-history-btn-copy {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-history-btn-copy:hover {
    background: #e5e7eb;
  }
  .apo-history-btn-apply {
    background: #3b82f6;
    color: #fff;
  }
  .apo-history-btn-apply:hover {
    background: #2563eb;
  }
  .apo-history-empty {
    padding: 48px 24px;
    text-align: center;
    color: #6b7280;
  }
  .apo-history-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .apo-history-empty-text {
    font-size: 14px;
  }
  .apo-history-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  .apo-history-btn-close {
    padding: 10px 20px;
    background: #f3f4f6;
    color: #374151;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }
  .apo-history-btn-close:hover {
    background: #e5e7eb;
  }
  @media (max-width: 640px) {
    .apo-history-modal {
      width: 95%;
      max-height: 90vh;
    }
    .apo-history-item {
      padding: 12px 16px;
    }
    .apo-history-actions {
      flex-direction: column;
    }
  }
`;

let styleInjected = false;

/**
 * 注入样式
 */
function injectStyles(): void {
  if (styleInjected) return;

  const style = document.createElement('style');
  style.textContent = MODAL_STYLES;
  style.id = 'apo-history-modal-styles';
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * 格式化时间戳
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 创建历史记录弹窗
 * @param options 弹窗选项
 * @param targetElement 目标输入元素
 * @returns 弹窗实例
 */
export function createHistoryModal(
  options: HistoryModalOptions,
  targetElement?: HTMLElement
): HistoryModalInstance {
  injectStyles();

  const { history, onSelect, onCancel } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'apo-history-modal-overlay';

  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'apo-history-modal';

  // 创建头部
  const header = document.createElement('div');
  header.className = 'apo-history-modal-header';

  const title = document.createElement('h3');
  title.className = 'apo-history-modal-title';
  title.innerHTML = '📜 优化历史';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'apo-history-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', '关闭');

  header.appendChild(title);
  header.appendChild(closeBtn);

  // 创建内容区
  const body = document.createElement('div');
  body.className = 'apo-history-modal-body';

  const historyList = document.createElement('ul');
  historyList.className = 'apo-history-list';

  // 渲染历史记录列表
  if (history.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'apo-history-empty';
    emptyState.innerHTML = `
      <div class="apo-history-empty-icon">📭</div>
      <div class="apo-history-empty-text">暂无优化历史记录</div>
    `;
    historyList.appendChild(emptyState);
  } else {
    history.forEach(item => {
      const itemEl = document.createElement('li');
      itemEl.className = 'apo-history-item';

      // 原始提示词
      const originalDiv = document.createElement('div');
      originalDiv.className = 'apo-history-prompt';
      const originalLabel = document.createElement('div');
      originalLabel.className = 'apo-history-prompt-label';
      originalLabel.textContent = '📝 原始';
      const originalText = document.createElement('div');
      originalText.className = 'apo-history-prompt-text';
      originalText.textContent = item.originalPrompt;
      originalDiv.appendChild(originalLabel);
      originalDiv.appendChild(originalText);

      // 优化后提示词
      const optimizedDiv = document.createElement('div');
      optimizedDiv.className = 'apo-history-optimized';
      const optimizedLabel = document.createElement('div');
      optimizedLabel.className = 'apo-history-prompt-label';
      optimizedLabel.textContent = '✨ 优化';
      const optimizedText = document.createElement('div');
      optimizedText.className = 'apo-history-optimized-text';
      optimizedText.textContent = item.optimizedPrompt;
      optimizedDiv.appendChild(optimizedLabel);
      optimizedDiv.appendChild(optimizedText);

      // 元信息和操作按钮
      const metaDiv = document.createElement('div');
      metaDiv.className = 'apo-history-meta';

      const timeSpan = document.createElement('span');
      timeSpan.className = 'apo-history-time';
      timeSpan.innerHTML = `🕐 ${formatTime(item.timestamp)}`;

      const actionsDiv = document.createElement('div');
      actionsDiv.className = 'apo-history-actions';

      const copyBtn = document.createElement('button');
      copyBtn.className = 'apo-history-btn apo-history-btn-copy';
      copyBtn.textContent = '📋 复制';

      const applyBtn = document.createElement('button');
      applyBtn.className = 'apo-history-btn apo-history-btn-apply';
      applyBtn.textContent = '✓ 应用';

      actionsDiv.appendChild(copyBtn);
      actionsDiv.appendChild(applyBtn);
      metaDiv.appendChild(timeSpan);
      metaDiv.appendChild(actionsDiv);

      itemEl.appendChild(originalDiv);
      itemEl.appendChild(optimizedDiv);
      itemEl.appendChild(metaDiv);

      // 复制按钮事件
      copyBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(item.optimizedPrompt);
          copyBtn.textContent = '✓ 已复制';
          setTimeout(() => {
            copyBtn.textContent = '📋 复制';
          }, 2000);
        } catch {
          copyBtn.textContent = '复制失败';
          setTimeout(() => {
            copyBtn.textContent = '📋 复制';
          }, 2000);
        }
      });

      // 应用按钮事件
      applyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (targetElement) {
          const result = insertTextAtCursor(targetElement, item.optimizedPrompt);
          if (result.success) {
            close();
            onSelect?.(item);
          } else {
            alert(result.error || '应用失败');
          }
        } else {
          close();
          onSelect?.(item);
        }
      });

      historyList.appendChild(itemEl);
    });
  }

  body.appendChild(historyList);

  // 创建底部
  const footer = document.createElement('div');
  footer.className = 'apo-history-modal-footer';

  const closeBtnFooter = document.createElement('button');
  closeBtnFooter.className = 'apo-history-btn-close';
  closeBtnFooter.textContent = '关闭';

  footer.appendChild(closeBtnFooter);

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
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
    onCancel?.();
  });

  closeBtnFooter.addEventListener('click', (e) => {
    e.stopPropagation();
    close();
    onCancel?.();
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
