import type { OptimizeResult } from './types';
import type { ApiCallParams } from './types';

/**
 * OpenAI 兼容格式 API 调用
 * 适用于：OpenAI、阿里云百炼、ModelScope、SiliconFlow、Deepseek、智谱AI、火山引擎、自定义
 */

/**
 * 调用 OpenAI 兼容格式的 API
 * @param params API 调用参数
 * @returns 优化结果
 */
export async function callOpenAICompatibleAPI(params: ApiCallParams): Promise<OptimizeResult> {
  const { endpoint, apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, signal } = params;

  // 构建完整的 API 端点 URL
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
    throw new Error(`API 请求失败: ${errorMessage}`);
  }

  const data = await response.json();

  // 解析响应
  const optimizedPrompt = extractContent(data);
  const usage = extractUsage(data);

  if (!optimizedPrompt) {
    throw new Error('API 返回内容为空');
  }

  return {
    success: true,
    optimizedPrompt: optimizedPrompt.trim(),
    usage,
  };
}

/**
 * 从响应中提取内容
 * @param response API 响应
 * @returns 内容字符串
 */
function extractContent(response: unknown): string | undefined {
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

  return undefined;
}

/**
 * 从响应中提取使用量信息
 * @param response API 响应
 * @returns 使用量信息
 */
function extractUsage(response: unknown): OptimizeResult['usage'] {
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
 * 测试 OpenAI 兼容 API 连接
 * @param endpoint 端点 URL
 * @param apiKey API 密钥
 * @param model 模型名称
 * @param signal 取消信号
 * @returns 响应对象
 */
export async function testOpenAIConnection(
  endpoint: string,
  apiKey: string,
  model: string,
  signal: AbortSignal
): Promise<Response> {
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes('/chat/completions')
    ? baseUrl
    : `${baseUrl}/chat/completions`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 5,
    }),
    signal,
  });
}
