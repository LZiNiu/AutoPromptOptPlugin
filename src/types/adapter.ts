/**
 * 输入框类型枚举
 */
export enum InputType {
  TEXTAREA = 'textarea',
  CONTENTEDITABLE = 'contenteditable',
}

/**
 * 网站配置接口
 */
export interface SiteConfig {
  siteId: string;
  siteName: string;
  inputSelector: string;
  buttonContainerSelector: string;
  inputType: InputType;
}

/**
 * 网站适配器接口
 */
export interface SiteAdapter {
  siteId: string;
  siteName: string;

  getInputSelector(): string;
  getButtonContainerSelector(): string;
  getInputType(): InputType;

  getInputValue(): string;
  setInputValue(value: string): void;
  isInputAvailable(): boolean;
}
