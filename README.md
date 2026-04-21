# world-time-web（Electron + Vue 桌面应用骨架）

这个项目已经升级为 **Electron + Vue** 的开发骨架。  
你可以把它理解为：

- Vue：负责页面界面（你看到的 UI）
- Electron：负责把网页包装成桌面应用（Windows/macOS/Linux 可运行）

---

## 1. 你现在能做什么

- 一条命令同时启动 Vue 开发服务器 + Electron 桌面窗口
- 在 `src/` 里写页面代码，保存后基本可实时看到更新
- 未来可以继续加路由、状态管理、接口请求、打包发布

---

## 2. 如何运行（小白版）

### 第一步：安装依赖

在项目根目录执行：

```bash
npm install
```

### 第二步：启动开发环境

```bash
npm run dev
```

运行后会自动打开桌面窗口。

### Linux 运行说明（Ubuntu / Debian）

1. 先安装 Node.js（建议 22 LTS）和 npm。  
2. 安装 Electron 运行所需系统库（首次运行缺库时常见）：

```bash
sudo apt update
sudo apt install -y libgtk-3-0 libnss3 libxss1 libasound2t64 libgbm1 libxshmfence1
```

3. 在项目目录运行：

```bash
npm install
npm run dev
```

---

## 3. 常用命令

- `npm run dev`：开发模式（推荐，前后端一键启动）
- `npm run build:web`：只构建 Vue 前端到 `dist/`
- `npm run preview:web`：本地预览前端构建结果
- `npm run pack:linux`：打 Linux AppImage 包（需在 Linux 环境执行）
- `npm run start`：直接启动 Electron（默认读取 `dist/`）

---

## 4. 项目结构说明

- `package.json`：项目依赖和命令入口
- `electron/main.js`：Electron 主进程（创建桌面窗口）
- `electron/preload.js`：预加载脚本（安全地给前端暴露少量能力）
- `src/main.js`：Vue 前端启动入口
- `src/App.vue`：页面装配层（负责组合子组件）
- `src/components/`：界面组件（头部、表单区、城市卡片区）
- `src/composables/useWorldTime.js`：世界时间核心状态与交互逻辑
- `src/modules/worldTime.js`：时区数据与通用工具函数
- `src/style.css`：当前页面样式
- `vite.config.js`：Vite 配置（开发端口等）
- `index.html`：Vite 挂载入口页面

---

## 5. 关键参数说明

### `electron/main.js`

- `width` / `height`：窗口初始宽高
- `minWidth` / `minHeight`：窗口最小宽高
- `contextIsolation: true`：安全隔离，推荐保持开启
- `nodeIntegration: false`：禁止渲染进程直接访问 Node，提升安全性

### `package.json` scripts

- `dev:web`：启动 Vue 开发服务器（端口 `5173`）
- `dev:electron`：等待端口就绪后启动 Electron
- `dev`：并行启动上面两个命令

---

## 6. 返回值/结果说明

这是前端桌面项目，主要“返回值”不是函数数值，而是运行结果：

- 执行 `npm run dev` 后：会出现桌面窗口并加载 Vue 页面
- 执行 `npm run build:web` 后：会在 `dist/` 生成前端构建产物

---

## 7. 兼容旧文件说明

你原来的纯静态版本文件仍在仓库中：

- `app.js`
- `styles.css`

目前这些文件作为历史参考保留，新版功能已经迁移到 Vue（`src/App.vue` + `src/style.css`）。

---

## 8. 反思与下一步改进建议

当前已完成最小可用骨架，优点是简单、稳定、容易继续开发。  
建议下一步按优先级做：

1. 把时区数据和工具函数拆到 `src/modules`，降低 `App.vue` 体积
2. 加入 ESLint + Prettier，降低语法错误概率
3. 加入 Pinia 管理状态，方便后续扩展设置页
4. 接入 Electron Builder，生成可安装包（`.exe`）
