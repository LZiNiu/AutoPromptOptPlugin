import { createInjector } from '../utils/injector';

export default defineContentScript({
  matches: [
    '*://*.qwen.ai/*',
    '*://qwen.ai/*',
    '*://*.z.ai/*',
    '*://z.ai/*',
    '*://*.qianwen.com/*',
    '*://qianwen.com/*',
    '*://*.qianwen.aliyun.com/*',
    '*://qianwen.aliyun.com/*',
    '*://tongyi.aliyun.com/*',
    '*://chatgpt.com/*',
    '*://chat.openai.com/*',
    '*://claude.ai/*',
    '*://chatglm.cn/*',
  ],
  main() {
    console.log('[AutoPromptOpt] Content script loaded');
    console.log('[AutoPromptOpt] Current URL:', window.location.href);

    createInjector();
  },
});
