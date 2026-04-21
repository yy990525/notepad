# notepad（Electron + Vue 桌面记事本）

这是一个基于 **Electron + Vue 3 + Vite** 的桌面记事本应用。

当前项目已经从基础文本编辑器扩展为更完整的桌面编辑工具，支持本地文件编辑、主题切换、最近文件、查找替换、自动保存、窗口状态记忆等常用能力。

---

## 功能特性

### 文件与编辑

- 新建文件
- 打开本地文本文件
- 保存当前文件
- 另存为新文件
- 打开文件所在目录
- 拖拽文件到窗口直接打开
- 未保存内容关闭 / 切换前确认
- 最近打开文件列表

### 编辑体验

- 查找 / 替换
- 字符数、行数、单词数统计
- 自动保存开关
- 自动换行开关
- 字号调节
- 行高调节

### 界面与桌面能力

- 5 组主题色切换
- 自定义桌面标题栏
- 支持窗口最小化、最大化 / 还原、关闭
- 支持窗口置顶
- 记住窗口大小与位置
- 记住上次主题和编辑设置
- 支持菜单栏动作联动

### 快捷键

- Windows / Linux：
  - `Ctrl+N`：新建
  - `Ctrl+O`：打开
  - `Ctrl+S`：保存
  - `Ctrl+Shift+S`：另存为
  - `Ctrl+Shift+O`：打开所在目录
  - `Ctrl+F`：查找
  - `Ctrl+H`：替换
- macOS：
  - `⌘N`、`⌘O`、`⌘S`、`⇧⌘S`、`⇧⌘O`、`⌘F`、`⌘H`

---

## 技术栈

- `Electron`：桌面应用壳
- `Vue 3`：界面开发
- `Vite`：前端开发与构建
- `electron-builder`：打包发布
- `electronmon`：开发时自动重启 Electron

---

## 安装依赖

在项目根目录执行：

```bash
npm install
```

---

## 开发运行

```bash
npm run dev
```

这个命令会同时启动：

- Vite 前端开发服务器
- Electron 桌面窗口

启动后会自动打开桌面应用窗口。

---

## 常用命令

- `npm run dev`：启动开发环境
- `npm run build:web`：构建前端资源到 `dist/`
- `npm run preview:web`：预览前端构建结果
- `npm run start`：直接启动 Electron
- `npm run pack:linux`：在 Linux 环境下打包 AppImage

---

## 项目结构

- `electron/main.js`：Electron 主进程，负责窗口创建、菜单、文件系统、设置持久化
- `electron/preload.js`：预加载脚本，向渲染进程安全暴露桌面能力
- `src/main.js`：Vue 应用入口
- `src/App.vue`：主状态管理与应用交互逻辑
- `src/components/TitleBar.vue`：自定义标题栏与窗口控制
- `src/components/NotepadSidebar.vue`：主题、最近文件、编辑设置侧边栏
- `src/components/EditorPanel.vue`：编辑器面板、工具栏、查找替换区
- `src/style.css`：应用样式
- `vite.config.js`：Vite 配置
- `package.json`：依赖、脚本、打包配置

---

## 当前交互说明

应用启动后，你可以：

1. 新建空白文本
2. 打开本地 `.txt` / `.md` / `.log` 文件
3. 直接在编辑区修改内容
4. 用保存或另存为写回本地磁盘
5. 使用左侧栏切换主题、查看最近文件、调整编辑器参数
6. 使用查找 / 替换快速处理文本
7. 通过拖拽方式把文件丢到窗口中直接打开
8. 在存在未保存改动时收到确认提醒

---

## 设置持久化

当前版本会自动保存以下信息：

- 当前主题色
- 最近打开文件列表
- 自动保存开关
- 自动换行开关
- 字号
- 行高
- 窗口置顶状态
- 窗口大小和位置

这些配置会写入 Electron 用户数据目录中的 `settings.json`。

---

## 打包说明

当前 `package.json` 中已经配置了 Linux AppImage 打包：

```bash
npm run pack:linux
```

打包输出目录为：

- `release/`

如果后续需要支持 Windows 安装包，可以继续补充 `electron-builder` 的 Windows 配置。

---

## 兼容说明

仓库中仍保留了一些旧版静态文件：

- `app.js`
- `styles.css`

这些文件不是当前主应用入口。当前实际运行的是：

- `electron/`
- `src/`

---

## 后续还可以继续增强的方向

- 多标签编辑
- Markdown 预览
- 编码格式切换
- 打印能力
- 全局设置页
- 文件历史版本 / 草稿恢复
- Windows / macOS 打包配置
- ESLint / Prettier 规范化代码风格
