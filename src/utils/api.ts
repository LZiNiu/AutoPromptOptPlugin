import type { LLMConfig, UserPromptConfig } from '@/types/storage';
import { getSelectedPrompt, buildOptimizationParams } from './prompts';

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
      const result = await callLLMAPI(
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
 * 调用 LLM API
 * @param config LLM 配置
 * @param systemPrompt 系统提示词
 * @param userPrompt 用户提示词
 * @param temperature 温度参数
 * @param maxTokens 最大 token 数
 * @param timeout 超时时间
 * @param abortSignal 取消信号
 * @returns 优化结果
 */
async function callLLMAPI(
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

  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature,
        max_tokens: maxTokens,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`API 请求失败: ${errorMessage}`);
    }

    const data = await response.json();

    // 解析响应
    const optimizedPrompt = extractContentFromResponse(data);
    const usage = extractUsageFromResponse(data);

    if (!optimizedPrompt) {
      throw new Error('API 返回内容为空');
    }

    return {
      success: true,
      optimizedPrompt: optimizedPrompt.trim(),
      usage,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

/**
 * 从 API 响应中提取内容
 * @param response API 响应
 * @returns 内容字符串
 */
function extractContentFromResponse(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const resp = response as Record<string, unknown>;

  // OpenAI 格式
  if (Array.isArray(resp.choices) && resp.choices.length > 0) {
    const choice = resp.choices[0] as Record<string, unknown>;
    if (choice.message && typeof choice.message === 'object') {
      const message = choice.message as Record<string, unknown>;
      if (typeof message.content === 'string') {
        return message.content;
      }
    }
    // 兼容旧格式
    if (typeof choice.text === 'string') {
      return choice.text;
    }
  }

  // 其他可能的格式
  if (typeof resp.content === 'string') {
    return resp.content;
  }

  if (typeof resp.text === 'string') {
    return resp.text;
  }

  if (typeof resp.output === 'string') {
    return resp.output;
  }

  return undefined;
}

/**
 * 从 API 响应中提取使用量信息
 * @param response API 响应
 * @returns 使用量信息
 */
function extractUsageFromResponse(response: unknown): OptimizeResult['usage'] {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const resp = response as Record<string, unknown>;

  if (resp.usage && typeof resp.usage === 'object') {
    const usage = resp.usage as Record<string, unknown>;
    return {
      promptTokens: typeof usage.prompt_tokens === 'number' ? usage.prompt_tokens : undefined,
      completionTokens: typeof usage.completion_tokens === 'number' ? usage.completion_tokens : undefined,
      totalTokens: typeof usage.total_tokens === 'number' ? usage.total_tokens : undefined,
    };
  }

  return undefined;
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

    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'user', content: 'Hello' },
        ],
        max_tokens: 5,
      }),
      signal: controller.signal,
    });

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
