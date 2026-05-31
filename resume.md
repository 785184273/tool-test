# 罗伟 - 高级前端工程师 / 全栈工程师

**电话**：13056509307 | **邮箱**：[lw785184273@163.com](mailto:your.email@example.com)

## 求职意向

- 高级前端工程师 / 全栈开发工程师
- 期望城市：成都
- 期望薪资：面议

## 技术栈

### 前端

- **核心框架**：Vue 3 、TypeScript、Pinia、Vue Router 4、React、Dva、Umi
- **构建工具**：Vite、Webpack、Rollup
- **UI 与样式**：Nubes UI (Element Plus 定制)、UnoCSS、SCSS、PostCSS (px-to-viewport)
- **工程化与质量**：ESLint (Flat Config)、Prettier、Husky、lint-staged、TypeScript 严格模式
- **性能与 PWA**：Service Worker (vite-plugin-pwa)、AVIF/WebP 图片优化、LCP优化、FCP优化
- **Hybrid 开发**：JSBridge 封装、WebView 适配、离线缓存策略
- **AI 与大模型集成**：LangChain.js、OpenAI SDK、MCP (Model Context Protocol)、AI Agent、Tool Calling 与 Function Calling
- **AI 协议**：Model Context Protocol (MCP)、MCP Server 开发
- **Agent 开发**：AI Agent 构建、Function Calling、RAG 基础
- **集成能力**：Node.js + LangChain 生态，AI 工具化封装

### 后端 & 基础设施

- **Node.js 生态**：Egg.js、Redis (队列、分布式锁、缓存)、MySQL
- **导出 & 数据**：ExcelJS (流式生成)、AWS SDK、OCS 对象存储
- **分布式**：HTTP 协议对接、分布式任务调度

## 项目经历

### 通用业务支撑系统 - 基础能力模块 (Node.js)

**前端开发工程师** | 2021-2025

该项目是OPPO公司 BOSS 系统的核心基础能力模块，针对大数据量导出场景，构建了一套通用的异步导出框架，解决了接口超时、内存溢出和服务器压力等问题。

**核心贡献：**

- 设计并实现了基于 **Redis 队列 + 分布式锁 (setnx)** 的高可用异步导出架构，确保多实例部署下任务不重复执行，提升系统并发能力和稳定性。
- 构建通用任务生命周期管理，支持“准备中、执行中、成功/失败、文件过期”全状态流转；使用 Redis 缓存临时下载链接 + 定时任务清理过期文件，优化存储利用率。
- 封装多协议三方能力接入层，支持 Dubbo 和 HTTP 协议对接第三方导出服务，通过回调机制实现业务逻辑与导出能力的解耦。
- 实现精细化限流与权限控制：基于环境变量配置接口每日下载频次，结合工号白名单实现数据可见性隔离，保障敏感数据安全。
- 采用 **ExcelJS 流式处理** ，实现大文件生成与下载，显著降低 Node.js 进程内存占用。

**技术栈**：Node.js、Egg.js、Redis、MySQL (Sequelize)、Dubbo、ExcelJS、AWS SDK

---

### 互动桌面运营管理系统

**前端开发工程师** | 2025-现在

面向后台运营人员的资源管理平台，支持宠物/角色素材上传、状态配置、装扮组合及玩法资源发布，处理复杂资源引用关系和版本发布机制。

**核心贡献：**

- 搭建模块化分层架构 (Pages/Layouts、Composables/Domains、API/Request、基础设施层)，提升代码可维护性。
- 引入 **unplugin-vue-router** 实现文件式路由 + 强类型路由定义，消除手动维护路由表的成本。
- 基于 Axios 封装支持“洋葱模型”的高性能请求栈，通过拦截器和中间件实现鉴权、Loading、埋点等全局/请求级行为，解耦业务逻辑。
- 使用 Vue 3 Composition API 封装高复用逻辑 (usePagination、useUploadPreview 等)，降低 UI 组件复杂度。
- 实现角色状态、场景包、玩法资源的复杂配置逻辑
- 工程化建设：TypeScript 严格模式、ESLint + Prettier、Husky + lint-staged 自动化检查；UnoCSS 原子化 CSS 减少体积。
- **PWA 与部署优化**：集成 `vite-plugin-pwa` 实现 Service Worker，解决模块动态加载 404 问题；通过 Workbox 配置精准的静态资源缓存策略（precache + runtime caching），支持离线访问和版本更新提示，提升管理后台在弱网环境下的稳定性和用户体验。

**技术栈**：Vue 3.5、TypeScript、Vite 6、Pinia 3、UnoCSS、Nubes UI、unplugin-vue-router

---

### 交互式桌面宠物系统（H5）

**前端开发工程师** | 2025-现在

基于 Vue 3 + TypeScript 开发的高性能交互式桌面宠物应用，运行于 OPPO Android WebView 环境，包含喂食、商城、抽卡、图鉴、排行榜等功能。

**核心贡献：**

- 负责宠物主界面 (Pet Home) 开发，使用 Composition API 管理复杂状态流转 (喂食动画、随机互动、心情值)。
- 实现 CSS3 粒子与飞行特效 ，提升交互视觉反馈。
- 深度集成 JSBridge，封装 20+ 原生接口 (Toast、DeepLink、数据持久化等)，通过 try-catch 装饰器和统一错误处理确保调用健壮性；编写 env.d.ts 提供类型安全。
- **性能优化**：针对 OPPO Android WebView 环境，重点优化 Core Web Vitals。通过关键资源预加载、骨架屏和字体 display:swap，将 **LCP 降低约 45%**，**FCP 控制在 500ms 以内**。
- 实现图片格式智能降级：采用 `<picture>` + AVIF → WebP → JPEG 策略，结合 Vite 构建插件自动转换图片格式，图片体积平均减少 **60% 以上**，显著提升加载速度。
- 对图鉴、商城等长列表采用**虚拟滚动 (Virtual Scrolling)** + 图片懒加载 (`IntersectionObserver`)，大幅降低首屏 DOM 节点数和内存占用。
- 动画性能优化：粒子与飞行特效全部使用 `transform` + `opacity`，配合 `will-change` 和 `requestAnimationFrame`，避免触发布局重绘，提升 60fps 流畅度。
- 构建 Pinia 模块化状态管理解决多页面数据同步；制定 Git Commit 规范和代码评审流程。
- 独立完成抽卡中心与图鉴系统，包含概率计算、多维度筛选及埋点上报 (Tracker)。
- **PWA 与部署稳定性**：集成 Service Worker（基于 `vite-plugin-pwa`），解决生产环境模块动态加载 404 问题；实现静态资源预缓存和运行时缓存策略，支持资源版本管理和更新提示，提升 WebView 下的加载稳定性和离线体验。

**技术栈**：Vue 3、TypeScript、Vite 5、Pinia、SCSS、JSBridge、Service Worker (vite-plugin-pwa)

**项目亮点：**

- 跨端通信健壮性：在 WebView 环境下通过装饰器和错误处理机制确保 JSBridge 稳定。
- 复杂状态机管理：利用 Vue 3 响应式系统优雅管理宠物多状态切换。
- 自定义构建脚本：支持多版本资源保留和智能合并，适用于 Hybrid 项目增量更新。

## 教育背景

**成都东软学院** | 计算机科学与技术 | 2014-2017

---

