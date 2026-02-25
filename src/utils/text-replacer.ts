/**
 * 文本替换工具
 * 用于在 textarea 和 contenteditable 元素中安全地替换文本内容
 */

/**
 * 替换结果
 */
export interface ReplaceResult {
  success: boolean;
  error?: string;
}

/**
 * 获取输入框的当前文本内容
 * @param element 输入元素
 * @returns 当前文本内容
 */
export function getInputValue(element: HTMLElement): string {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    return element.value;
  }

  if (element.isContentEditable) {
    return element.innerText || element.textContent || '';
  }

  return '';
}

/**
 * 替换输入框的文本内容
 * @param element 输入元素
 * @param newText 新文本
 * @returns 替换结果
 */
export function replaceInputText(element: HTMLElement, newText: string): ReplaceResult {
  try {
    // 处理 textarea 和 input 元素
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return replaceTextareaText(element, newText);
    }

    // 处理 contenteditable 元素
    if (element.isContentEditable) {
      return replaceContentEditableText(element, newText);
    }

    return { success: false, error: '不支持的输入元素类型' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '替换文本时发生错误',
    };
  }
}

/**
 * 替换 textarea 或 input 的文本
 * @param element textarea 或 input 元素
 * @param newText 新文本
 * @returns 替换结果
 */
function replaceTextareaText(
  element: HTMLTextAreaElement | HTMLInputElement,
  newText: string
): ReplaceResult {
  const originalValue = element.value;
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;

  // 记录原始滚动位置
  const scrollTop = element.scrollTop;
  const scrollLeft = element.scrollLeft;

  // 替换文本
  element.value = newText;

  // 恢复滚动位置
  element.scrollTop = scrollTop;
  element.scrollLeft = scrollLeft;

  // 触发 input 事件，通知页面内容已更改
  triggerInputEvent(element);

  // 尝试恢复光标位置（如果新文本包含原始选中的内容）
  const newStart = newText.indexOf(originalValue.substring(start, end));
  if (newStart !== -1) {
    element.setSelectionRange(newStart, newStart + (end - start));
  } else {
    // 将光标放在末尾
    element.setSelectionRange(newText.length, newText.length);
  }

  return { success: true };
}

/**
 * 替换 contenteditable 元素的文本
 * @param element contenteditable 元素
 * @param newText 新文本
 * @returns 替换结果
 */
function replaceContentEditableText(element: HTMLElement, newText: string): ReplaceResult {
  // 保存当前选区
  const selection = window.getSelection();
  const range = selection?.rangeCount ? selection.getRangeAt(0) : null;

  // 检查选区是否在当前元素内
  const isSelectionInElement = range && element.contains(range.commonAncestorContainer);

  // 替换内容
  element.innerText = newText;

  // 触发 input 事件
  triggerInputEvent(element);

  // 尝试恢复选区
  if (isSelectionInElement && selection) {
    // 简单的光标恢复：将光标放在文本末尾
    const textNode = element.firstChild;
    if (textNode) {
      const newRange = document.createRange();
      newRange.setStart(textNode, Math.min(newText.length, textNode.textContent?.length || 0));
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
  }

  return { success: true };
}

/**
 * 在光标位置插入文本
 * @param element 输入元素
 * @param text 要插入的文本
 * @returns 插入结果
 */
export function insertTextAtCursor(element: HTMLElement, text: string): ReplaceResult {
  try {
    // 处理 textarea 和 input 元素
    if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
      return insertTextInTextarea(element, text);
    }

    // 处理 contenteditable 元素
    if (element.isContentEditable) {
      return insertTextInContentEditable(element, text);
    }

    return { success: false, error: '不支持的输入元素类型' };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '插入文本时发生错误',
    };
  }
}

/**
 * 在 textarea 或 input 的光标位置插入文本
 * @param element textarea 或 input 元素
 * @param text 要插入的文本
 * @returns 插入结果
 */
function insertTextInTextarea(
  element: HTMLTextAreaElement | HTMLInputElement,
  text: string
): ReplaceResult {
  const start = element.selectionStart || 0;
  const end = element.selectionEnd || 0;
  const value = element.value;

  // 在光标位置插入文本
  element.value = value.substring(0, start) + text + value.substring(end);

  // 更新光标位置
  const newCursorPos = start + text.length;
  element.setSelectionRange(newCursorPos, newCursorPos);

  // 触发 input 事件
  triggerInputEvent(element);

  return { success: true };
}

/**
 * 在 contenteditable 元素的光标位置插入文本
 * @param element contenteditable 元素
 * @param text 要插入的文本
 * @returns 插入结果
 */
function insertTextInContentEditable(element: HTMLElement, text: string): ReplaceResult {
  const selection = window.getSelection();

  if (!selection || selection.rangeCount === 0) {
    // 没有选区，追加到末尾
    element.innerText += text;
    triggerInputEvent(element);
    return { success: true };
  }

  const range = selection.getRangeAt(0);

  // 检查选区是否在当前元素内
  if (!element.contains(range.commonAncestorContainer)) {
    // 选区不在当前元素内，追加到末尾
    element.innerText += text;
    triggerInputEvent(element);
    return { success: true };
  }

  // 删除选中的内容
  range.deleteContents();

  // 插入新文本
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  // 移动光标到插入文本之后
  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  // 触发 input 事件
  triggerInputEvent(element);

  return { success: true };
}

/**
 * 触发 input 事件
 * @param element 目标元素
 */
function triggerInputEvent(element: HTMLElement): void {
  const event = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);

  // 同时触发 change 事件
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(changeEvent);
}

/**
 * 检查元素是否支持文本输入
 * @param element 要检查的元素
 * @returns 是否支持文本输入
 */
export function isTextInputElement(element: HTMLElement): boolean {
  if (element instanceof HTMLTextAreaElement) {
    return true;
  }

  if (element instanceof HTMLInputElement) {
    const validTypes = ['text', 'search', 'url', 'tel', 'email', 'password'];
    return validTypes.includes(element.type);
  }

  if (element.isContentEditable) {
    return true;
  }

  return false;
}

/**
 * 获取输入框的当前光标位置
 * @param element 输入元素
 * @returns 光标位置（相对于文本开头）
 */
export function getCursorPosition(element: HTMLElement): number {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    return element.selectionStart || 0;
  }

  if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return 0;
    }

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();
    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    return preCaretRange.toString().length;
  }

  return 0;
}

/**
 * 设置输入框的光标位置
 * @param element 输入元素
 * @param position 光标位置
 */
export function setCursorPosition(element: HTMLElement, position: number): void {
  if (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement) {
    const maxPos = element.value.length;
    element.setSelectionRange(Math.min(position, maxPos), Math.min(position, maxPos));
    return;
  }

  if (element.isContentEditable) {
    const selection = window.getSelection();
    if (!selection) return;

    let charCount = 0;
    let node: Node | null = element;

    const treeWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

    while (treeWalker.nextNode()) {
      const textNode = treeWalker.currentNode;
      const textLength = textNode.textContent?.length || 0;

      if (charCount + textLength >= position) {
        const range = document.createRange();
        range.setStart(textNode, position - charCount);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        return;
      }

      charCount += textLength;
    }

    // 如果位置超出文本长度，将光标放在末尾
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}
