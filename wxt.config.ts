import { defineConfig } from 'wxt';

export default defineConfig({
  modules: ['@wxt-dev/module-vue'],
  srcDir: 'src',
  manifest: {
    permissions: ['storage', 'activeTab', 'scripting'],
  },
});
