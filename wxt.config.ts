import { defineConfig, type WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
  manifest: {
    permissions: ['storage', 'activeTab', 'scripting'],
    name: '提示词自动优化',
    description: '自动优化提示词，提高模型响应质量',
  },
  vite: () => ({
    ssr: {
      noExternal: ['vue'],
    },
    plugins: [tailwindcss()],
  } as WxtViteConfig),
});
