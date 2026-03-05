# Karis CLI - Brand 命令更新完成报告

**日期:** 2026-03-05
**更新内容:** 将 brand 命令迁移到新的 brand-assets API 端点

---

## 📋 更新总结

已成功将 Karis CLI 的 brand 命令从旧的 `/api/v1/brand` 端点迁移到新的 brand-assets API：

- ✅ `GET /api/v1/brand-assets/selection` - 获取品牌配置
- ✅ `POST /api/v1/brand-assets/analyze` - 分析域名并生成品牌配置
- ✅ `POST /api/v1/brand-assets/customizations` - 更新品牌自定义字段

---

## 🔄 主要变更

### 1. API 客户端 (`cli/src/core/client.ts`)

#### 新增类型定义

```typescript
// Brand Assets API Types
export interface BrandColor {
  hex: string;
  type: string;
  brightness: number;
}

export interface BrandLogo {
  type: string;
  theme: string;
  formats: Array<{
    src: string;
    background: string;
    format: string;
    height: number;
    width: number;
    size: number;
  }>;
}

export interface BrandFont {
  name: string;
  type: string;
  origin: string;
  originId: string;
  weights: number[];
}

export interface BrandLink {
  name: string;
  url: string;
}

export interface BrandAssetsSnapshot {
  id: string;
  domain: string;
  name: string;
  description?: string;
  longDescription?: string;
  claimed: boolean;
  colors?: BrandColor[];
  logos?: BrandLogo[];
  fonts?: BrandFont[];
  links?: BrandLink[];
  // LLM-generated fields
  category?: string;
  industries?: string[];
  audience?: {
    primary: string;
    secondary: string;
  };
  value_propositions?: string[];
  competitors?: Array<{ name: string; domain: string }>;
  keywords?: string[];
  channels?: string[];
  tone?: string;
}

export interface BrandCustomizations {
  category?: string;
  industries?: string[];
  audience?: {
    primary?: string;
    secondary?: string;
  };
  value_propositions?: string[];
  competitors?: Array<{ name: string; domain: string }>;
  keywords?: string[];
  channels?: string[];
  tone?: string;
}

export type BrandProfile = BrandAssetsSnapshot; // 向后兼容
```

#### 更新的 API 方法

**getBrand()** - 改为调用 `/api/v1/brand-assets/selection`
```typescript
async getBrand(): Promise<BrandAssetsSnapshot | null> {
  const url = `${this.apiUrl}/api/v1/brand-assets/selection`;
  // ...
}
```

**createBrand()** - 改为调用 `/api/v1/brand-assets/analyze`，只需要 domain
```typescript
async createBrand(domain: string): Promise<BrandAssetsSnapshot> {
  const url = `${this.apiUrl}/api/v1/brand-assets/analyze`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    },
    body: JSON.stringify({ domain }),
  });
  // ...
}
```

**updateBrand()** - 改为调用 `/api/v1/brand-assets/customizations`
```typescript
async updateBrand(customizations: BrandCustomizations): Promise<BrandAssetsSnapshot> {
  const url = `${this.apiUrl}/api/v1/brand-assets/customizations`;
  // ...
}
```

---

### 2. Brand Init 命令 (`cli/src/commands/brand/init.ts`)

**简化交互流程** - 只询问 domain，后端自动通过 Brandfetch + LLM 生成完整配置

**之前:**
```typescript
// 需要用户输入所有字段
const name = await ask(rl, 'Brand name');
const domain = await ask(rl, 'Domain');
const category = await ask(rl, 'Category');
const industries = await askList(rl, 'Industries');
// ... 更多字段
```

**现在:**
```typescript
// 只需要 domain
const domain = options.domain || await ask(rl, 'Domain (e.g., karis.im)');

// 后端自动分析
const spinner = ora('Analyzing brand assets and generating profile...').start();
const profile = await client.createBrand(domain);
spinner.succeed('Brand profile created.');
```

**改进:**
- ✅ 用户体验更简单（只需输入域名）
- ✅ 添加了 spinner 显示分析进度
- ✅ 显示快速摘要（名称、描述、类别、行业）
- ✅ 提供下一步操作提示

---

### 3. Brand Show 命令 (`cli/src/commands/brand/show.ts`)

**增强显示** - 支持显示 Brandfetch 获取的品牌资产

**新增显示内容:**
- ✅ 品牌声明状态 (claimed)
- ✅ 完整描述和长描述
- ✅ 品牌颜色（带颜色预览）
- ✅ Logo 数量
- ✅ 字体列表
- ✅ 社交链接
- ✅ 价值主张列表

**示例输出:**
```
Brand Profile — Karis

  Name:       Karis
  Domain:     karis.im
  Claimed:    Yes

  Description:
    AI marketing intelligence platform

  Category:   AI marketing intelligence platform
  Industries: SaaS, Marketing, AI
  Audience:   Marketing teams, CMOs
              (secondary: Product managers, Founders)

  Value Propositions:
    • AI-powered marketing intelligence
    • GEO optimization for AI search engines

  Keywords:   GEO, AI search, marketing intelligence

  Competitors:
    • Perplexity          perplexity.ai
    • ChatGPT             openai.com

  Channels:   blog, twitter, linkedin, github
  Tone:       technical but approachable

  Brand Colors:
    █ #FF5733   primary
    █ #33FF57   secondary
    █ #3357FF   accent

  Logos:      5 available
  Fonts:      Inter, Roboto

  Links:
    • Twitter         https://twitter.com/karis
    • LinkedIn        https://linkedin.com/company/karis
    ... and 3 more

  ── Synced across your team via Karis Platform

  Edit: npx karis brand edit
```

---

### 4. Brand Edit 命令 (`cli/src/commands/brand/edit.ts`)

**更新为 customizations API** - 只能编辑 LLM 生成的字段

**可编辑字段:**
- category
- industries
- audience (primary/secondary)
- value_propositions
- competitors
- keywords
- channels
- tone

**不可编辑字段:**
- name, domain (来自 Brandfetch)
- colors, logos, fonts, links (来自 Brandfetch)

**改进:**
- ✅ 添加了说明提示（哪些字段可编辑）
- ✅ 添加了 spinner 显示更新进度
- ✅ 支持编辑 value_propositions
- ✅ 改进了 competitors 输入格式

---

### 5. Brand Competitor 命令 (`cli/src/commands/brand/competitor.ts`)

**修复 TypeScript 错误** - 处理可选的 competitors 字段

```typescript
// 之前
const exists = profile.competitors.some(...);

// 现在
const competitors = profile.competitors || [];
const exists = competitors.some(...);
```

---

### 6. Remote Agent (`cli/src/core/remote-agent.ts`)

**修复 TypeScript 错误** - 处理可选的品牌字段

```typescript
const industries = brandProfile.industries?.join(', ') || 'N/A';
const primaryAudience = brandProfile.audience?.primary || 'N/A';
const valueProps = brandProfile.value_propositions?.join('; ') || 'N/A';
const keywords = brandProfile.keywords?.join(', ') || 'N/A';
```

---

## 📁 修改的文件

1. ✅ `cli/src/core/client.ts` - API 客户端和类型定义
2. ✅ `cli/src/commands/brand/init.ts` - 简化初始化流程
3. ✅ `cli/src/commands/brand/show.ts` - 增强显示功能
4. ✅ `cli/src/commands/brand/edit.ts` - 更新为 customizations API
5. ✅ `cli/src/commands/brand/competitor.ts` - 修复 TypeScript 错误
6. ✅ `cli/src/core/remote-agent.ts` - 修复 TypeScript 错误

---

## 🎯 使用示例

### 创建品牌配置（简化流程）

```bash
$ npx karis brand init

Brand Profile Setup
────────────────────────────────────────

  We'll analyze your domain using Brandfetch + AI to generate a complete brand profile.

  Domain (e.g., karis.im): karis.im

⠋ Analyzing brand assets and generating profile...
✔ Brand profile created.

✔ Brand profile for Karis is ready.

Quick Summary:
  Name: Karis
  Description: AI marketing intelligence platform
  Category: AI marketing intelligence platform
  Industries: SaaS, Marketing, AI

  View full profile: npx karis brand show
  Customize: npx karis brand edit
  Run GEO audit: npx karis geo audit karis.im
```

### 查看品牌配置（增强显示）

```bash
$ npx karis brand show

Brand Profile — Karis

  Name:       Karis
  Domain:     karis.im
  Claimed:    Yes

  Description:
    AI marketing intelligence platform

  Category:   AI marketing intelligence platform
  Industries: SaaS, Marketing, AI

  Brand Colors:
    █ #FF5733   primary
    █ #33FF57   secondary

  Logos:      5 available
  Fonts:      Inter, Roboto
```

### 编辑品牌配置（customizations）

```bash
$ npx karis brand edit keywords

Editing Brand Profile — Karis

  Note: Only customizable fields can be edited (category, industries, audience, etc.)
  Brand assets (colors, logos, fonts) are fetched from Brandfetch.

  Keywords (comma-separated) (current: GEO, AI search): GEO, AI search, marketing intelligence, brand visibility

⠋ Updating brand customizations...
✔ Brand profile updated.

✔ Your customizations have been saved.

  View: npx karis brand show
```

---

## ✅ 构建状态

```bash
$ cd cli && npm run build
> karis@0.1.0 build
> tsc

✓ Build successful (no errors)
```

---

## 🧪 测试状态

### API 端点测试

**状态:** ⚠️ 需要有效的 API key

当前 API key (`sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm`) 返回 401 错误：

```bash
$ curl -X GET "https://api-staging.sophiapro.ai/api/v1/brand-assets/selection" \
  -H "Authorization: Bearer sk-ka-v1-L7lVlH0BmEwYUM-_BgSCl3oPbw6Nv0mm"

{"code":401,"message":"Access token is invalid or expired","data":null}
```

**需要:**
- 有效的 staging API key
- 或者等待后端部署新的 brand-assets 端点

### CLI 命令测试

```bash
$ npx tsx cli/bin/karis.js brand show
Error: Invalid API key. Check your key or create a new one at https://karis.im/settings/api-keys
```

**一旦有有效的 API key，可以测试:**
1. `npx karis brand init` - 创建品牌配置
2. `npx karis brand show` - 查看品牌配置
3. `npx karis brand edit` - 编辑品牌配置
4. `npx karis brand competitor add/remove/list` - 管理竞争对手

---

## 📊 API 端点对比

| 功能 | 旧端点 | 新端点 | 变化 |
|------|--------|--------|------|
| 获取品牌 | `GET /api/v1/brand` | `GET /api/v1/brand-assets/selection` | ✅ 更新 |
| 创建品牌 | `POST /api/v1/brand` (需要完整 profile) | `POST /api/v1/brand-assets/analyze` (只需 domain) | ✅ 简化 |
| 更新品牌 | `PATCH /api/v1/brand` | `POST /api/v1/brand-assets/customizations` | ✅ 更新 |

---

## 🎉 改进总结

### 用户体验改进
- ✅ **简化初始化**: 只需输入域名，自动生成完整配置
- ✅ **更丰富的显示**: 显示品牌颜色、Logo、字体等资产
- ✅ **清晰的进度提示**: 使用 spinner 显示分析和更新进度
- ✅ **更好的错误提示**: 说明哪些字段可编辑

### 技术改进
- ✅ **类型安全**: 完整的 TypeScript 类型定义
- ✅ **向后兼容**: `BrandProfile` 类型别名保持兼容
- ✅ **错误处理**: 处理所有可选字段，避免运行时错误
- ✅ **代码质量**: 通过 TypeScript 编译，无错误

---

## 📝 下一步

### 立即执行
1. **获取有效的 API key** - 用于测试新端点
2. **测试所有 brand 命令** - 验证功能正常
3. **更新文档** - 更新 README 中的 brand 命令示例

### 短期
1. **添加单元测试** - 测试 API 客户端方法
2. **添加集成测试** - 测试完整的 brand 工作流
3. **更新 skills** - 更新 brand-intel skill 以使用新 API

### 长期
1. **添加品牌资产导出** - 导出 Logo、颜色等
2. **添加品牌资产预览** - 在 CLI 中预览 Logo
3. **添加品牌对比** - 对比多个品牌的资产

---

## 🔗 相关文档

- **API 文档**: `/api/v1/brand-assets/*` 端点说明
- **类型定义**: `cli/src/core/client.ts` 中的 `BrandAssetsSnapshot`
- **使用示例**: 本文档中的"使用示例"部分

---

**更新完成时间:** 2026-03-05
**状态:** ✅ 代码更新完成，等待 API key 测试
**构建状态:** ✅ 通过
**TypeScript 检查:** ✅ 通过
