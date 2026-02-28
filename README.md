# AutoPromptOpt

<p align="center">
  <img src="public/icon/128.png" alt="AutoPromptOpt Logo" width="128" height="128">
</p>

<p align="center">
  <strong>AI 提示词优化助手</strong>
</p>

<p align="center">
  <a href="#功能特性">功能特性</a> •
  <a href="#安装指南">安装指南</a> •
  <a href="#使用说明">使用说明</a> •
  <a href="#支持的网站">支持的网站</a> •
  <a href="#常见问题">常见问题</a>
</p>

---

## 📖 项目概述

**AutoPromptOpt** 是一款浏览器扩展插件，专为提升 AI 对话体验而设计。它能够在多个主流 AI 对话平台（如 ChatGPT、Claude、通义千问等）的输入框旁注入优化按钮，帮助用户一键优化提示词，让 AI 更准确地理解您的需求。

### 核心特性

- 🚀 **一键优化**：在 AI 对话网站输入框旁注入优化按钮，一键优化提示词
- 📝 **模板管理**：支持自定义模板，快速填入常用提示词
- 📜 **会话历史**：记录本次会话的优化历史，支持复制和应用
- 🔄 **迭代优化**：应用优化后自动切换迭代策略，便于进一步优化
- 🔐 **安全存储**：API Key 使用 AES-256-GCM 加密存储
- 🌍 **多语言支持**：支持中英文界面切换
- ⚡ **跳过预览**：可设置直接替换，无需预览弹窗

---

## 🎯 功能特性

### 1. 提示词优化

在支持的 AI 对话网站中，输入框旁会自动出现「✨ 优化」按钮。点击后，插件会调用您配置的 AI API 对当前输入的提示词进行优化，并显示优化前后的对比。

**支持的优化策略：**
- **通用优化**：适用于大多数场景
- **代码优化**：针对编程和技术问题
- **写作优化**：针对写作和内容创作
- **翻译优化**：针对翻译任务
- **分析优化**：针对数据分析和逻辑推理
- **创意优化**：针对创意生成和头脑风暴
- **迭代优化**：针对已优化的提示词进行进一步优化

### 2. 模板管理

点击「📋 模板」按钮，可以快速选择并填入预设的提示词模板。您可以在选项页中：
- 创建自定义模板
- 按分类管理模板
- 搜索模板
- 导入/导出模板（JSON 格式）

### 3. 会话历史

点击「📜 历史」按钮，可以查看本次浏览器会话中的优化记录：
- 查看原始提示词和优化后的提示词
- 一键复制优化结果
- 一键应用到输入框
- 自动清理（浏览器关闭后历史记录自动清除）

### 4. 安全存储

您的 API Key 使用 **AES-256-GCM** 算法加密存储，确保密钥安全。加密密钥由浏览器自动生成和管理。

---

## 📦 安装指南

### 方式一：Chrome Web Store 安装（推荐）

1. 访问 [Chrome Web Store](https://chrome.google.com/webstore)（链接待添加）
2. 点击「添加至 Chrome」
3. 确认安装权限

### 方式二：手动安装（开发者模式）

1. 下载最新版本的 `.zip` 文件
2. 解压到本地文件夹
3. 打开 Chrome 浏览器，访问 `chrome://extensions/`
4. 开启右上角的「开发者模式」
5. 点击「加载已解压的扩展程序」
6. 选择解压后的文件夹

### 方式三：从源码构建

```bash
# 克隆仓库
git clone https://github.com/yourusername/AutoPromptOpt.git
cd AutoPromptOpt

# 安装依赖
pnpm install

# 开发模式
pnpm dev

# 构建生产版本
pnpm wxt build

# 打包为 zip
pnpm wxt zip
```

---

## 🚀 使用说明

### 首次使用

1. 安装插件后，点击浏览器工具栏的 AutoPromptOpt 图标
2. 在弹出的选项页中，阅读并同意隐私声明
3. 配置您的 API Key（支持 OpenAI、Claude、Gemini 等 10+ 提供商）
4. 选择默认的优化策略

### 日常使用

1. **访问支持的 AI 对话网站**（如 ChatGPT、Claude、通义千问等）
2. **在输入框中输入您的提示词**
3. **点击「✨ 优化」按钮**，等待优化完成
4. **在弹出的对比窗口中**：
   - 点击「应用」替换输入框内容
   - 点击「复制」复制优化结果
   - 点击「取消」关闭窗口
5. **或开启「跳过预览」模式**，优化后直接替换输入框内容

### 配置选项

在选项页中，您可以：
- **API 设置**：配置 API 提供商、API Key、模型等
- **模板管理**：创建、编辑、删除提示词模板
- **提示词管理**：查看和修改内置优化策略，创建自定义策略
- **历史记录**：查看和清除优化历史
- **应用设置**：配置语言、历史记录数量、跳过预览等

---

## 🌐 支持的网站

| 网站 | 域名 | 状态 |
|------|------|------|
| 通义千问 | qwen.ai, z.ai | ✅ 已支持 |
| 通义千问 | qianwen.aliyun.com | ✅ 已支持 |
| 通义千问 | tongyi.aliyun.com | ✅ 已支持 |
| ChatGPT | chatgpt.com, chat.openai.com | ✅ 已支持 |
| Claude | claude.ai | ✅ 已支持 |
| ChatGLM | chatglm.cn | ✅ 已支持 |

---

## 🔧 支持的 API 提供商

| 提供商 | 官网 | 备注 |
|--------|------|------|
| OpenAI | https://openai.com | GPT-4, GPT-3.5 |
| Anthropic | https://anthropic.com | Claude 系列 |
| Google Gemini | https://ai.google.dev | Gemini Pro |
| 阿里云百炼 | https://bailian.aliyun.com | 通义系列 |
| Deepseek | https://deepseek.com | Deepseek Chat |
| 智谱AI | https://zhipu.ai | ChatGLM |
| SiliconFlow | https://siliconflow.com | 多种模型 |
| 火山引擎 | https://volcengine.com | 豆包系列 |
| ModelScope | https://modelscope.cn | 魔搭社区 |
| 自定义 | - | 支持任意 OpenAI 兼容 API |

---

## ❓ 常见问题

### Q1: 为什么点击优化后没有反应？

**可能原因：**
1. API Key 未配置或配置错误
2. API Key 余额不足
3. 网络连接问题
4. 当前网站不在支持列表中

**解决方案：**
1. 检查选项页中的 API Key 配置
2. 确认 API Key 有效且有足够余额
3. 检查网络连接
4. 确认访问的是支持的网站

### Q2: 如何获取 API Key？

不同提供商的获取方式：
- **OpenAI**: 访问 https://platform.openai.com/api-keys
- **Anthropic**: 访问 https://console.anthropic.com/settings/keys
- **阿里云百炼**: 访问 https://bailian.aliyun.com/
- **Deepseek**: 访问 https://platform.deepseek.com/
- **智谱AI**: 访问 https://open.bigmodel.cn/

### Q3: API Key 安全吗？

**安全。** 您的 API Key 使用 **AES-256-GCM** 算法加密存储在本地浏览器中：
- 加密密钥由浏览器自动生成
- 密钥不会上传到任何服务器
- API Key 仅用于调用您配置的 AI 服务

### Q4: 支持哪些浏览器？

目前支持所有基于 Chromium 内核的浏览器：
- Google Chrome
- Microsoft Edge
- 360 安全浏览器
- 搜狗浏览器
- 其他 Chromium 内核浏览器

Firefox 版本正在开发中。

### Q5: 如何导入/导出模板？

在选项页的「模板管理」中：
1. 点击「导出」按钮，将所有模板导出为 JSON 文件
2. 点击「导入」按钮，选择之前导出的 JSON 文件

### Q6: 会话历史会保存多久？

会话历史使用浏览器的 Session Storage 存储：
- **跨标签页共享**：同一浏览器的所有标签页共享历史记录
- **浏览器关闭后清除**：关闭浏览器后历史记录自动清除
- **可配置数量**：在设置中可配置最多保存多少条记录（默认 50 条）

### Q7: 如何修改内置的优化策略？

在选项页的「提示词管理」中：
1. 选择要修改的内置策略
2. 点击「编辑」按钮
3. 修改系统提示词或用户提示词模板
4. 点击「保存」

如需恢复默认，点击「重置」按钮。

---

## 🔒 隐私声明

1. **数据本地存储**：所有数据（API Key、模板、设置等）仅存储在您的本地浏览器中
2. **API Key 加密**：API Key 使用 AES-256-GCM 加密存储
3. **无数据上传**：插件不会将您的任何数据上传到第三方服务器
4. **API 调用**：仅向您配置的 AI 服务提供商发送优化请求

---

## 🤝 贡献指南

我们欢迎社区贡献！如果您想参与项目开发：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

### 开发环境

```bash
# 安装依赖
pnpm install

# 开发模式（带热重载）
pnpm dev

# 构建生产版本
pnpm wxt build

# 运行类型检查
pnpm typecheck

# 运行代码检查
pnpm lint
```

---

## 📄 许可证

本项目采用 [MIT](LICENSE) 许可证。

---

## 🙏 致谢

感谢以下开源项目和工具：
- [WXT](https://wxt.dev/) - Web Extension Toolkit
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Pinia](https://pinia.vuejs.org/) - Vue 状态管理
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的 CSS 框架

---

<p align="center">
  Made with ❤️ by AutoPromptOpt Team
</p>
