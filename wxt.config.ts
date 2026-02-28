import { defineConfig, type WxtViteConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
  manifest: {
    permissions: ['storage', 'activeTab', 'scripting'],
  },
  vite: () => ({
    ssr: {
      noExternal: ['vue'],
    },
    plugins: [tailwindcss()],
  } as WxtViteConfig),
});
