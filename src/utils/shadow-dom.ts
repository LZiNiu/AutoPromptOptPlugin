/**
 * Shadow DOM 工具函数
 */

/**
 * 创建 Shadow DOM 容器
 * @param parentElement 父元素
 * @param id 容器 ID
 * @returns Shadow Root
 */
export function createShadowContainer(
  parentElement: HTMLElement,
  id: string
): ShadowRoot {
  const shadowHost = document.createElement('div');
  shadowHost.id = id;
  shadowHost.className = 'apo-shadow-host';

  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  parentElement.appendChild(shadowHost);

  return shadowRoot;
}

/**
 * 将样式注入到 Shadow DOM
 * @param shadowRoot Shadow Root
 * @param css CSS 样式字符串
 */
export function injectStyles(shadowRoot: ShadowRoot, css: string): void {
  const styleElement = document.createElement('style');
  styleElement.textContent = css;
  shadowRoot.appendChild(styleElement);
}

/**
 * 在 Shadow DOM 中创建元素
 * @param shadowRoot Shadow Root
 * @param tagName 标签名
 * @param attributes 属性对象
 * @param textContent 文本内容
 * @returns 创建的元素
 */
export function createElementInShadow(
  shadowRoot: ShadowRoot,
  tagName: string,
  attributes: Record<string, string> = {},
  textContent: string = ''
): HTMLElement {
  const element = document.createElement(tagName);

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  if (textContent) {
    element.textContent = textContent;
  }

  shadowRoot.appendChild(element);

  return element;
}
