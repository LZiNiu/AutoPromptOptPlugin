import type { OptimizeResult } from './types';
import type { ApiCallParams } from './types';

/**
 * Anthropic API 调用
 * 使用 Claude Messages API 格式
 */

/**
 * 调用 Anthropic API
 * @param params API 调用参数
 * @returns 优化结果
 */
export async function callAnthropicAPI(params: ApiCallParams): Promise<OptimizeResult> {
  const { endpoint, apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, signal } = params;

  // Anthropic API 端点
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes('/messages')
    ? baseUrl
    : `${baseUrl}/messages`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt,
      messages: [
        { role: 'user', content: userPrompt },
      ],
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
    throw new Error(`API 请求失败: ${errorMessage}`);
  }

  const data = await response.json();

  // 解析 Anthropic 响应
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
 * 从 Anthropic 响应中提取内容
 * @param response API 响应
 * @returns 内容字符串
 */
function extractContent(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const resp = response as Record<string, unknown>;

  if (Array.isArray(resp.content) && resp.content.length > 0) {
    const content = resp.content[0] as Record<string, unknown>;
    if (typeof content.text === 'string') {
      return content.text;
    }
  }

  return undefined;
}

/**
 * 从 Anthropic 响应中提取使用量信息
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
      promptTokens: typeof usage.input_tokens === 'number' ? usage.input_tokens : undefined,
      completionTokens: typeof usage.output_tokens === 'number' ? usage.output_tokens : undefined,
    };
  }

  return undefined;
}

/**
 * 测试 Anthropic API 连接
 * @param endpoint 端点 URL
 * @param apiKey API 密钥
 * @param model 模型名称
 * @param signal 取消信号
 * @returns 响应对象
 */
export async function testAnthropicConnection(
  endpoint: string,
  apiKey: string,
  model: string,
  signal: AbortSignal
): Promise<Response> {
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes('/messages')
    ? baseUrl
    : `${baseUrl}/messages`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 5,
      messages: [{ role: 'user', content: 'Hi' }],
    }),
    signal,
  });
}
