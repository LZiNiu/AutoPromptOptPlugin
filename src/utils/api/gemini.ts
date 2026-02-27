import type { OptimizeResult } from './types';
import type { ApiCallParams } from './types';

/**
 * Google Gemini API 调用
 * 使用 Gemini generateContent API 格式
 */

/**
 * 调用 Google Gemini API
 * @param params API 调用参数
 * @returns 优化结果
 */
export async function callGeminiAPI(params: ApiCallParams): Promise<OptimizeResult> {
  const { endpoint, apiKey, model, systemPrompt, userPrompt, temperature, maxTokens, signal } = params;

  // Gemini API 端点
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes(':generateContent')
    ? baseUrl
    : `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            { text: `${systemPrompt}\n\n${userPrompt}` },
          ],
        },
      ],
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    }),
    signal,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
    throw new Error(`API 请求失败: ${errorMessage}`);
  }

  const data = await response.json();

  // 解析 Gemini 响应
  const optimizedPrompt = extractContent(data);

  if (!optimizedPrompt) {
    throw new Error('API 返回内容为空');
  }

  return {
    success: true,
    optimizedPrompt: optimizedPrompt.trim(),
  };
}

/**
 * 从 Gemini 响应中提取内容
 * @param response API 响应
 * @returns 内容字符串
 */
function extractContent(response: unknown): string | undefined {
  if (!response || typeof response !== 'object') {
    return undefined;
  }

  const resp = response as Record<string, unknown>;

  if (Array.isArray(resp.candidates) && resp.candidates.length > 0) {
    const candidate = resp.candidates[0] as Record<string, unknown>;
    if (candidate.content && typeof candidate.content === 'object') {
      const content = candidate.content as Record<string, unknown>;
      if (Array.isArray(content.parts) && content.parts.length > 0) {
        const part = content.parts[0] as Record<string, unknown>;
        if (typeof part.text === 'string') {
          return part.text;
        }
      }
    }
  }

  return undefined;
}

/**
 * 测试 Gemini API 连接
 * @param endpoint 端点 URL
 * @param apiKey API 密钥
 * @param model 模型名称
 * @param signal 取消信号
 * @returns 响应对象
 */
export async function testGeminiConnection(
  endpoint: string,
  apiKey: string,
  model: string,
  signal: AbortSignal
): Promise<Response> {
  const baseUrl = endpoint.replace(/\/$/, '');
  const apiUrl = baseUrl.includes(':generateContent')
    ? baseUrl
    : `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

  return fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Hi' }] }],
      generationConfig: { maxOutputTokens: 5 },
    }),
    signal,
  });
}
