import type { LLMConfig, UserPromptConfig } from '@/types/storage';
import { getSelectedPrompt, buildOptimizationParams } from '../prompts';
import type { OptimizeResult, OptimizeOptions } from './types';
import { callOpenAICompatibleAPI, testOpenAIConnection } from './openai-compatible';
import { callAnthropicAPI, testAnthropicConnection } from './anthropic';
import { callGeminiAPI, testGeminiConnection } from './gemini';

export type { OptimizeResult, OptimizeOptions } from './types';

const DEFAULT_TIMEOUT = 60000;
const DEFAULT_RETRY_COUNT = 2;

/**
 * 调用优化 API 获取重写后的提示词
 * @param prompt 原始提示词
 * @param config LLM 配置
 * @param userPromptConfig 用户提示词配置
 * @param options 优化选项
 * @param abortSignal 用于取消请求的 AbortSignal
 * @returns 优化结果
 */
export async function optimizePrompt(
  prompt: string,
  config: LLMConfig,
  userPromptConfig: UserPromptConfig,
  options: OptimizeOptions = {},
  abortSignal?: AbortSignal
): Promise<OptimizeResult> {
  const { timeout = DEFAULT_TIMEOUT, retryCount = DEFAULT_RETRY_COUNT } = options;

  // 获取当前选中的提示词配置
  const promptConfig = getSelectedPrompt(userPromptConfig);

  // 构建请求参数
  const { systemPrompt, userPrompt } = buildOptimizationParams(prompt, promptConfig);

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= retryCount; attempt++) {
    try {
      const result = await callProviderAPI(
        config,
        systemPrompt,
        userPrompt,
        promptConfig.temperature,
        promptConfig.maxTokens,
        timeout,
        abortSignal
      );
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // 如果是用户取消，直接返回
      if (lastError.name === 'AbortError') {
        return {
          success: false,
          error: '请求已取消',
        };
      }

      // 如果是最后一次尝试，返回错误
      if (attempt === retryCount) {
        break;
      }

      // 等待后重试
      await delay(1000 * (attempt + 1));
    }
  }

  return {
    success: false,
    error: lastError?.message || '优化失败，请稍后重试',
  };
}

/**
 * 根据提供商调用对应的 API
 */
async function callProviderAPI(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxTokens: number,
  timeout: number,
  abortSignal?: AbortSignal
): Promise<OptimizeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // 如果有外部 abortSignal，监听它
  if (abortSignal) {
    abortSignal.addEventListener('abort', () => controller.abort());
  }

  const params = {
    endpoint: config.endpoint,
    apiKey: config.apiKey,
    model: config.model,
    systemPrompt,
    userPrompt,
    temperature,
    maxTokens,
    signal: controller.signal,
  };

  try {
    // 根据提供商选择对应的调用方式
    switch (config.providerId) {
      case 'anthropic':
        return await callAnthropicAPI(params);
      case 'gemini':
        return await callGeminiAPI(params);
      case 'openai':
      case 'aliyun-bailian':
      case 'modelscope':
      case 'siliconflow':
      case 'deepseek':
      case 'zhipu':
      case 'volcengine':
      case 'custom':
      default:
        // 使用 OpenAI 兼容格式
        return await callOpenAICompatibleAPI(params);
    }
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * 延迟函数
 * @param ms 毫秒数
 * @returns Promise
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 验证 API 配置是否有效
 * @param config LLM 配置
 * @returns 验证结果
 */
export function validateApiConfig(config: LLMConfig): { valid: boolean; error?: string } {
  if (!config.apiKey || config.apiKey.trim() === '') {
    return { valid: false, error: 'API Key 不能为空' };
  }

  if (!config.endpoint || config.endpoint.trim() === '') {
    return { valid: false, error: 'API 端点不能为空' };
  }

  if (!config.model || config.model.trim() === '') {
    return { valid: false, error: '模型名称不能为空' };
  }

  // 验证端点 URL 格式
  try {
    new URL(config.endpoint);
  } catch {
    return { valid: false, error: 'API 端点 URL 格式无效' };
  }

  return { valid: true };
}

/**
 * 测试 API 连接
 * @param config LLM 配置
 * @returns 测试结果
 */
export async function testApiConnection(config: LLMConfig): Promise<{ success: boolean; message: string }> {
  const validation = validateApiConfig(config);
  if (!validation.valid) {
    return { success: false, message: validation.error || '配置无效' };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response: Response;

    // 根据提供商选择测试方式
    switch (config.providerId) {
      case 'anthropic':
        response = await testAnthropicConnection(
          config.endpoint,
          config.apiKey,
          config.model,
          controller.signal
        );
        break;

      case 'gemini':
        response = await testGeminiConnection(
          config.endpoint,
          config.apiKey,
          config.model,
          controller.signal
        );
        break;

      default:
        // OpenAI 兼容格式
        response = await testOpenAIConnection(
          config.endpoint,
          config.apiKey,
          config.model,
          controller.signal
        );
    }

    clearTimeout(timeoutId);

    if (response.ok) {
      return { success: true, message: '连接成功' };
    } else {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      return { success: false, message: `连接失败: ${errorMessage}` };
    }
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return { success: false, message: '连接超时' };
      }
      return { success: false, message: `连接错误: ${error.message}` };
    }
    return { success: false, message: '未知错误' };
  }
}
