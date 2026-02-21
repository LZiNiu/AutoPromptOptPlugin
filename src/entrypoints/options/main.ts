import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import zhCN from '@/assets/locales/zh-CN.json';
import en from '@/assets/locales/en.json';

const pinia = createPinia();

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'en',
  messages: {
    'zh-CN': zhCN,
    en,
  },
});

const app = createApp(App);

app.use(pinia);
app.use(i18n);

app.mount('#app');
