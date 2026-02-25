/**
 * 模板选择模态框
 * 用于显示用户保存的提示词模板列表，支持筛选和搜索
 */

import type { PromptTemplate } from '@/types/storage';
import { insertTextAtCursor } from '@/utils/text-replacer';

/**
 * 模板选择模态框选项
 */
export interface TemplateModalOptions {
  templates: PromptTemplate[];
  onSelect?: (template: PromptTemplate) => void;
  onCancel?: () => void;
}

/**
 * 模态框实例
 */
export interface TemplateModalInstance {
  close: () => void;
}

// 样式常量
const MODAL_STYLES = `
  .apo-template-modal-overlay {
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
  .apo-template-modal {
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
  .apo-template-modal-header {
    padding: 20px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .apo-template-modal-title {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    margin: 0;
  }
  .apo-template-modal-close {
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
  .apo-template-modal-close:hover {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-template-modal-toolbar {
    padding: 16px 24px;
    border-bottom: 1px solid #e5e7eb;
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }
  .apo-template-search {
    flex: 1;
    min-width: 200px;
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
  }
  .apo-template-search:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  .apo-template-filter {
    padding: 10px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    background: #fff;
    cursor: pointer;
    outline: none;
    min-width: 120px;
  }
  .apo-template-filter:focus {
    border-color: #3b82f6;
  }
  .apo-template-modal-body {
    padding: 0;
    overflow-y: auto;
    flex: 1;
    max-height: 400px;
  }
  .apo-template-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .apo-template-item {
    padding: 16px 24px;
    border-bottom: 1px solid #f3f4f6;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: flex-start;
    gap: 12px;
  }
  .apo-template-item:hover {
    background: #f9fafb;
  }
  .apo-template-item:last-child {
    border-bottom: none;
  }
  .apo-template-icon {
    width: 40px;
    height: 40px;
    background: #eff6ff;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    flex-shrink: 0;
  }
  .apo-template-content {
    flex: 1;
    min-width: 0;
  }
  .apo-template-title {
    font-size: 15px;
    font-weight: 500;
    color: #111827;
    margin: 0 0 4px 0;
  }
  .apo-template-category {
    display: inline-block;
    padding: 2px 8px;
    background: #e5e7eb;
    border-radius: 4px;
    font-size: 12px;
    color: #374151;
    margin-bottom: 8px;
  }
  .apo-template-preview {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .apo-template-action {
    padding: 8px 16px;
    background: #3b82f6;
    color: #fff;
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: background 0.2s;
    flex-shrink: 0;
  }
  .apo-template-action:hover {
    background: #2563eb;
  }
  .apo-template-empty {
    padding: 48px 24px;
    text-align: center;
    color: #6b7280;
  }
  .apo-template-empty-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }
  .apo-template-empty-text {
    font-size: 14px;
  }
  .apo-template-modal-footer {
    padding: 16px 24px;
    border-top: 1px solid #e5e7eb;
    display: flex;
    justify-content: flex-end;
  }
  .apo-template-btn {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }
  .apo-template-btn-secondary {
    background: #f3f4f6;
    color: #374151;
  }
  .apo-template-btn-secondary:hover {
    background: #e5e7eb;
  }
  @media (max-width: 640px) {
    .apo-template-modal-toolbar {
      flex-direction: column;
    }
    .apo-template-search,
    .apo-template-filter {
      width: 100%;
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
  style.id = 'apo-template-modal-styles';
  document.head.appendChild(style);
  styleInjected = true;
}

/**
 * 创建模板选择模态框
 * @param options 模态框选项
 * @param targetElement 目标输入元素
 * @returns 模态框实例
 */
export function createTemplateModal(
  options: TemplateModalOptions,
  targetElement?: HTMLElement
): TemplateModalInstance {
  injectStyles();

  const { templates, onSelect, onCancel } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.className = 'apo-template-modal-overlay';

  // 创建模态框
  const modal = document.createElement('div');
  modal.className = 'apo-template-modal';

  // 创建头部
  const header = document.createElement('div');
  header.className = 'apo-template-modal-header';

  const title = document.createElement('h3');
  title.className = 'apo-template-modal-title';
  title.textContent = '选择提示词模板';

  const closeBtn = document.createElement('button');
  closeBtn.className = 'apo-template-modal-close';
  closeBtn.innerHTML = '&times;';
  closeBtn.setAttribute('aria-label', '关闭');

  header.appendChild(title);
  header.appendChild(closeBtn);

  // 创建工具栏
  const toolbar = document.createElement('div');
  toolbar.className = 'apo-template-modal-toolbar';

  const searchInput = document.createElement('input');
  searchInput.className = 'apo-template-search';
  searchInput.type = 'text';
  searchInput.placeholder = '搜索模板...';

  const categoryFilter = document.createElement('select');
  categoryFilter.className = 'apo-template-filter';
  categoryFilter.innerHTML = '<option value="">所有分类</option>';

  // 提取所有分类
  const categories = [...new Set(templates.map(t => t.category))];
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  toolbar.appendChild(searchInput);
  toolbar.appendChild(categoryFilter);

  // 创建内容区
  const body = document.createElement('div');
  body.className = 'apo-template-modal-body';

  const templateList = document.createElement('ul');
  templateList.className = 'apo-template-list';

  // 渲染模板列表
  function renderTemplates(filteredTemplates: PromptTemplate[]) {
    templateList.innerHTML = '';

    if (filteredTemplates.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.className = 'apo-template-empty';
      emptyState.innerHTML = `
        <div class="apo-template-empty-icon">📭</div>
        <div class="apo-template-empty-text">没有找到匹配的模板</div>
      `;
      templateList.appendChild(emptyState);
      return;
    }

    filteredTemplates.forEach(template => {
      const item = document.createElement('li');
      item.className = 'apo-template-item';

      const icon = document.createElement('div');
      icon.className = 'apo-template-icon';
      icon.textContent = getCategoryIcon(template.category);

      const content = document.createElement('div');
      content.className = 'apo-template-content';

      const title = document.createElement('h4');
      title.className = 'apo-template-title';
      title.textContent = template.title;

      const category = document.createElement('span');
      category.className = 'apo-template-category';
      category.textContent = template.category;

      const preview = document.createElement('div');
      preview.className = 'apo-template-preview';
      preview.textContent = template.content;

      content.appendChild(title);
      content.appendChild(category);
      content.appendChild(preview);

      const actionBtn = document.createElement('button');
      actionBtn.className = 'apo-template-action';
      actionBtn.textContent = '使用';

      item.appendChild(icon);
      item.appendChild(content);
      item.appendChild(actionBtn);

      // 点击整个项目或按钮都触发选择
      const handleSelect = () => {
        if (targetElement) {
          // 处理模板内容中的占位符
          let contentToInsert = template.content;
          const placeholderMatch = contentToInsert.match(/\{([^}]+)\}/);
          if (placeholderMatch) {
            // 如果有占位符，将光标放在占位符位置
            contentToInsert = contentToInsert.replace(/\{([^}]+)\}/g, '$1');
          }

          const result = insertTextAtCursor(targetElement, contentToInsert);
          if (result.success) {
            close();
            onSelect?.(template);
          } else {
            alert(result.error || '插入失败');
          }
        } else {
          close();
          onSelect?.(template);
        }
      };

      item.addEventListener('click', handleSelect);
      actionBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleSelect();
      });

      templateList.appendChild(item);
    });
  }

  // 初始渲染
  renderTemplates(templates);

  body.appendChild(templateList);

  // 创建底部
  const footer = document.createElement('div');
  footer.className = 'apo-template-modal-footer';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'apo-template-btn apo-template-btn-secondary';
  cancelBtn.textContent = '取消';

  footer.appendChild(cancelBtn);

  // 组装模态框
  modal.appendChild(header);
  modal.appendChild(toolbar);
  modal.appendChild(body);
  modal.appendChild(footer);
  overlay.appendChild(modal);

  // 添加到页面
  document.body.appendChild(overlay);

  // 关闭函数
  const close = () => {
    overlay.remove();
  };

  // 搜索和筛选功能
  function filterTemplates() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    const filtered = templates.filter(template => {
      const matchesSearch =
        template.title.toLowerCase().includes(searchTerm) ||
        template.content.toLowerCase().includes(searchTerm);
      const matchesCategory = !selectedCategory || template.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    renderTemplates(filtered);
  }

  searchInput.addEventListener('input', filterTemplates);
  categoryFilter.addEventListener('change', filterTemplates);

  // 事件绑定
  closeBtn.addEventListener('click', () => {
    close();
    onCancel?.();
  });

  cancelBtn.addEventListener('click', () => {
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

/**
 * 根据分类获取图标
 * @param category 分类名称
 * @returns 图标字符
 */
function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    '通用': '📝',
    '代码': '💻',
    '写作': '✍️',
    '翻译': '🌐',
    '分析': '📊',
    '创意': '💡',
    '学习': '📚',
    '工作': '💼',
    '生活': '🏠',
  };

  return iconMap[category] || '📄';
}

/**
 * 显示模板选择模态框
 * @param templates 模板列表
 * @param targetElement 目标输入元素
 * @returns Promise，选择模板时 resolve，取消时 reject
 */
export function showTemplateModal(
  templates: PromptTemplate[],
  targetElement?: HTMLElement
): Promise<PromptTemplate> {
  return new Promise((resolve, reject) => {
    createTemplateModal(
      {
        templates,
        onSelect: (template) => resolve(template),
        onCancel: () => reject(new Error('用户取消')),
      },
      targetElement
    );
  });
}
