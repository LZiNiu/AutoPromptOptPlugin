/**
 * API 模块类型定义
 */

/**
 * 优化结果接口
 */
export interface OptimizeResult {
  success: boolean;
  optimizedPrompt?: string;
  error?: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

/**
 * 优化选项
 */
export interface OptimizeOptions {
  timeout?: number;
  retryCount?: number;
}

/**
 * API 调用参数
 */
export interface ApiCallParams {
  endpoint: string;
  apiKey: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature: number;
  maxTokens: number;
  signal: AbortSignal;
}
