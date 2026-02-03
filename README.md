<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 秋水伊人 AI Studio (Qiushui Yiren AI Studio)

适用于高端时尚品牌的 AI 视觉生成与管理工作台。基于 Google Gemini 3 Pro 视觉模型，旨在实现“知性优雅 (Intellectual Elegance)”与“松弛高级感 (Relaxed Luxury)”的自动化视觉生产。

---

## 📅 版本历史与更新记录 (Changelog)

| 版本号 | 日期 | 更新类型 | 更新内容详情 |
| :--- | :--- | :--- | :--- |
| **v1.0.0** | 2026-01-30 | 🚀 **Visual Tuning** | **视觉风格大改版 (Visual Tuning)**:<br>1. **光影重塑**: 全面引入 "Art Gallery Lighting" (画廊光) 与 "Sculpted Shadows" (雕塑感)，告别电商平光。<br>2. **场景分流**: 实现 `Lookbook_Studio` (极简内景) 与 `Lookbook_Outdoor` (城市建筑) 的**物理分层**，指令自动适配。<br>3. **自动化架构**: 全新 `ai_test_runner.ts` 脚本及重试机制。 |
| v0.9.0 | 2026-01-28 | ✨ Feature | 初步集成 Supabase 鉴权与用户管理系统。 |
| v0.8.0 | 2026-01-25 | 🏗️ Init | 项目初始化，搭建 Next.js + Tailwind v4 + Google GenAI 基础架构。 |

---

## 🌟 核心功能 (Core Features)

### 1. AI 自动化摄影棚 (AI Photography Suite)

- **脚本引擎**: `scripts/ai_test_runner.ts`
- **批量生产**: 支持一键生成全套 SKU 视觉资产。
- **三大模块**:
  - **Lookbook (画册)**: 自动区分“画廊内景”与“建筑外景”。
  - **Campaign (大片)**: 电影感叙事，主打 "Golden Hour" 与 "Emotion"。
  - **Still Life (静物)**: 极致的面料微距与白底挂拍标准化。

### 2. 视觉风格调优 (Visual Tuning)

- **Prompt 动态注入**: 告别硬编码，根据场景变量自动组装 Prompt。
- **审美对齐**: 严格遵循 `docs/visual_style_tuning.md` 标准，确保每一张生成图都符合“知性优雅”的品牌 DNA。

### 3. 双模架构 (Dual-Mode Architecture)

- **Web 探索模式 (Retail)**: 所见即所得，设计师用于微调指令寻找灵感。
- **脚本量产模式 (Wholesale)**: 后台无人值守，用于工业化批量出图。

---

## 🛠️ 快速开始 (Quick Start)

### 环境要求

- Node.js v24.x (LTS)
- Google Gemini API Key

### 1. 安装依赖

```bash
npm install
```

### 2. 配置密钥

在项目根目录创建 `.env.local` 文件，并填入：

```env
GEMINI_API_KEY=your_api_key_here
```

### 3. 运行项目

**启动本地 Web 预览**:

```bash
npm run dev
# 访问: http://localhost:3000
```

**运行自动化批量出图脚本**:

```bash
npx tsx scripts/ai_test_runner.ts
# 产物目录: _ai_test_suite/03_outputs/
```

---

## 📂 项目结构说明

- `scripts/`: 自动化脚本核心目录。
- `data/shotDefinitions.ts`: 视觉指令集定义文件 (核心资产)。
- `_ai_test_suite/`: 自动化测试产物输出目录 (已在 .gitignore 中配置排除)。
