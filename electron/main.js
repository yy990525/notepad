const {
  app,
  BrowserWindow,
  Menu,
  shell,
  dialog,
  ipcMain,
} = require("electron");
const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

const isDev = !app.isPackaged;
const settingsPath = path.join(app.getPath("userData"), "settings.json");
const MAX_RECENT_FILES = 20;

const defaultSettings = {
  themeId: "dark",
  recentFiles: [],
  editorSettings: {
    autoSave: true,
    autoSaveInterval: 3000,
    fontSize: 14,
    lineHeight: 1.65,
    wordWrap: true,
    alwaysOnTop: false,
  },
};

function readSettings() {
  try {
    return JSON.parse(fs.readFileSync(settingsPath, "utf8"));
  } catch {
    return {};
  }
}

function writeSettings(settings) {
  fs.mkdirSync(path.dirname(settingsPath), { recursive: true });
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), "utf8");
}

function normalizeSettings(raw) {
  const settings = raw && typeof raw === "object" ? raw : {};
  const recentFiles = Array.isArray(settings.recentFiles)
    ? settings.recentFiles
        .filter((item) => item && typeof item === "object")
        .map((item) => ({
          path: String(item.path || ""),
          name: String(item.name || path.basename(String(item.path || ""))),
        }))
        .filter((item) => item.path)
        .slice(0, MAX_RECENT_FILES)
    : [];

  return {
    ...defaultSettings,
    ...settings,
    recentFiles,
    editorSettings: {
      ...defaultSettings.editorSettings,
      ...(settings.editorSettings || {}),
    },
  };
}

function getSettings() {
  return normalizeSettings(readSettings());
}

function updateSettings(patch) {
  const current = getSettings();
  const next = normalizeSettings({
    ...current,
    ...(patch || {}),
    editorSettings: {
      ...current.editorSettings,
      ...((patch && patch.editorSettings) || {}),
    },
  });
  writeSettings(next);
  return next;
}

function rememberRecentFile(filePath) {
  if (!filePath) return getSettings();
  const current = getSettings();
  const entry = { path: filePath, name: path.basename(filePath) };
  const recentFiles = [
    entry,
    ...current.recentFiles.filter((item) => item.path !== filePath),
  ].slice(0, MAX_RECENT_FILES);
  return updateSettings({ recentFiles });
}

function isExistingExecutable(targetPath) {
  return Boolean(targetPath) && fs.existsSync(targetPath);
}

function getWeChatCandidates() {
  return [
    process.env.WECHAT_PATH,
    "C:\\Program Files\\Tencent\\WeChat\\WeChat.exe",
    "C:\\Program Files (x86)\\Tencent\\WeChat\\WeChat.exe",
    path.join(
      process.env.LOCALAPPDATA || "",
      "Tencent",
      "WeChat",
      "WeChat.exe",
    ),
  ].filter(Boolean);
}

function readRegistryValue(key, valueName = "") {
  return new Promise((resolve) => {
    const args = ["query", key, valueName ? "/v" : "/ve"];
    if (valueName) {
      args.push(valueName);
    }

    const child = spawn("reg", args, {
      windowsHide: true,
    });

    let output = "";

    child.stdout.on("data", (chunk) => {
      output += chunk.toString();
    });

    child.on("error", () => resolve(""));
    child.on("close", () => {
      const match = output.match(/REG_\w+\s+(.+)/);
      resolve(match?.[1]?.trim() || "");
    });
  });
}

async function readRegistryWeChatPath() {
  const appPathKeys = [
    "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\WeChat.exe",
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\WeChat.exe",
  ];

  for (const key of appPathKeys) {
    const appPath = await readRegistryValue(key);
    if (isExistingExecutable(appPath)) {
      return appPath;
    }
  }

  const uninstallRoots = [
    "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
    "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall",
  ];

  for (const root of uninstallRoots) {
    const installLocation = await readRegistryValue(
      `${root}\\WeChat`,
      "InstallLocation",
    );
    const displayIcon = await readRegistryValue(
      `${root}\\WeChat`,
      "DisplayIcon",
    );

    const candidates = [
      installLocation ? path.join(installLocation, "WeChat.exe") : "",
      displayIcon.replace(/,\d+$/, ""),
    ].filter(Boolean);

    const match = candidates.find((candidate) =>
      isExistingExecutable(candidate),
    );
    if (match) {
      return match;
    }
  }

  return "";
}

async function pickWeChatPath() {
  const result = await dialog.showOpenDialog({
    title: "请选择 WeChat.exe",
    filters: [{ name: "Executable", extensions: ["exe"] }],
    properties: ["openFile"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return "";
  }

  return result.filePaths[0];
}

async function resolveWeChatPath() {
  const settings = readSettings();
  if (isExistingExecutable(settings.wechatPath)) {
    return settings.wechatPath;
  }

  const fileCandidate = getWeChatCandidates().find((candidate) =>
    isExistingExecutable(candidate),
  );
  if (fileCandidate) {
    writeSettings({ ...settings, wechatPath: fileCandidate });
    return fileCandidate;
  }

  const registryPath = await readRegistryWeChatPath();
  if (isExistingExecutable(registryPath)) {
    writeSettings({ ...settings, wechatPath: registryPath });
    return registryPath;
  }

  const pickedPath = await pickWeChatPath();
  if (isExistingExecutable(pickedPath)) {
    writeSettings({ ...settings, wechatPath: pickedPath });
    return pickedPath;
  }

  return "";
}

async function launchWeChat() {
  if (process.platform !== "win32") {
    await dialog.showMessageBox({
      type: "info",
      title: "暂不支持",
      message: "当前仅实现了 Windows 下直接启动微信。",
    });
    return;
  }

  const weChatPath = await resolveWeChatPath();

  if (!weChatPath) {
    await dialog.showMessageBox({
      type: "warning",
      title: "未找到微信",
      message: "没有检测到微信安装路径，请确认微信已安装。",
      detail: [
        "已尝试：本地配置、环境变量、注册表、常见安装路径，以及手动选择。",
        "如果你刚刚取消了选择，也可以稍后再次点击“打开微信”。",
      ].join("\n"),
    });
    return;
  }

  const child = spawn(weChatPath, [], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();
}

async function openTextFile() {
  const result = await dialog.showOpenDialog({
    title: "打开文本文件",
    filters: [
      { name: "Text Files", extensions: ["txt", "md", "log"] },
      { name: "All Files", extensions: ["*"] },
    ],
    properties: ["openFile"],
  });

  if (result.canceled || !result.filePaths[0]) {
    return { canceled: true };
  }

  const filePath = result.filePaths[0];
  const content = await fs.promises.readFile(filePath, "utf8");
  rememberRecentFile(filePath);

  return {
    canceled: false,
    filePath,
    content,
  };
}

async function openRecentFile(targetPath) {
  if (!targetPath) return { canceled: true };
  const content = await fs.promises.readFile(targetPath, "utf8");
  rememberRecentFile(targetPath);
  return {
    canceled: false,
    filePath: targetPath,
    content,
  };
}

async function saveTextFile(payload) {
  const targetPath = payload.filePath || "";

  if (!targetPath) {
    return saveTextFileAs(payload);
  }

  await fs.promises.writeFile(targetPath, payload.content ?? "", "utf8");
  rememberRecentFile(targetPath);
  return { canceled: false, filePath: targetPath };
}

async function saveTextFileAs(payload) {
  const result = await dialog.showSaveDialog({
    title: "另存为",
    defaultPath: payload.filePath || "untitled.txt",
    filters: [
      { name: "Text Files", extensions: ["txt"] },
      { name: "Markdown", extensions: ["md"] },
      { name: "All Files", extensions: ["*"] },
    ],
  });

  if (result.canceled || !result.filePath) {
    return { canceled: true };
  }

  await fs.promises.writeFile(result.filePath, payload.content ?? "", "utf8");
  rememberRecentFile(result.filePath);
  return { canceled: false, filePath: result.filePath };
}

function createAppMenu() {
  /** @type {Electron.MenuItemConstructorOptions[]} */
  const template = [
    {
      label: "文件",
      submenu: [
        {
          label: "打开文本文件",
          accelerator: "CmdOrCtrl+O",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu-action", "open-file");
          },
        },
        {
          label: "保存",
          accelerator: "CmdOrCtrl+S",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu-action", "save-file");
          },
        },
        {
          label: "另存为",
          accelerator: "CmdOrCtrl+Shift+S",
          click: (_menuItem, browserWindow) => {
            browserWindow?.webContents.send("menu-action", "save-file-as");
          },
        },
        { type: "separator" },
        { role: "quit", label: "退出" },
      ],
    },
    {
      label: "编辑",
      submenu: [
        { role: "undo", label: "撤销", accelerator: "CmdOrCtrl+Z" },
        { role: "redo", label: "重做", accelerator: "CmdOrCtrl+Y" },
        { type: "separator" },
        { role: "cut", label: "剪切", accelerator: "CmdOrCtrl+X" },
        { role: "copy", label: "复制", accelerator: "CmdOrCtrl+C" },
        { role: "paste", label: "粘贴", accelerator: "CmdOrCtrl+V" },
        { role: "selectAll", label: "全选", accelerator: "CmdOrCtrl+A" },
      ],
    },
    {
      label: "帮助",
      submenu: [
        {
          label: "打开微信",
          click: () => {
            launchWeChat().catch((error) => {
              dialog.showMessageBox({
                type: "error",
                title: "启动失败",
                message: "微信启动失败。",
                detail: error instanceof Error ? error.message : String(error),
              });
            });
          },
        },
        {
          label: "打开百度",
          click: () => {
            shell.openExternal("https://www.baidu.com");
          },
        },
      ],
    },
  ];

  if (process.platform === "darwin") {
    template.unshift({
      label: app.name,
      submenu: [{ role: "about" }, { type: "separator" }, { role: "quit" }],
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function sendWindowState(mainWindow) {
  mainWindow.webContents.send("window-state", {
    isMaximized: mainWindow.isMaximized(),
    isAlwaysOnTop: mainWindow.isAlwaysOnTop(),
    settings: getSettings(),
  });
}

function createWindow() {
  const settings = getSettings();
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 780,
    minWidth: 980,
    minHeight: 640,
    frame: false,
    titleBarStyle: "hidden",
    backgroundColor: "#111111",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setAlwaysOnTop(Boolean(settings.editorSettings?.alwaysOnTop));

  mainWindow.on("maximize", () => sendWindowState(mainWindow));
  mainWindow.on("unmaximize", () => sendWindowState(mainWindow));
  mainWindow.webContents.on("did-finish-load", () =>
    sendWindowState(mainWindow),
  );

  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools({ mode: "detach" });
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(() => {
  ipcMain.handle("notepad:open-file", async () => openTextFile());
  ipcMain.handle("notepad:open-recent-file", async (_unusedEvent, targetPath) =>
    openRecentFile(targetPath),
  );
  ipcMain.handle("notepad:save-file", async (_unusedEvent, payload) =>
    saveTextFile(payload),
  );
  ipcMain.handle("notepad:save-file-as", async (_unusedEvent, payload) =>
    saveTextFileAs(payload),
  );
  ipcMain.handle("notepad:confirm-discard", async () => {
    const result = await dialog.showMessageBox({
      type: "warning",
      buttons: ["保存", "不保存", "取消"],
      defaultId: 0,
      cancelId: 2,
      title: "未保存改动",
      message: "当前文件有未保存内容，是否先保存？",
    });
    if (result.response === 0) return { action: "save" };
    if (result.response === 1) return { action: "discard" };
    return { action: "cancel" };
  });
  ipcMain.handle(
    "notepad:open-containing-folder",
    async (_unusedEvent, targetPath) => {
      if (!targetPath) return { ok: false };
      await shell.showItemInFolder(targetPath);
      return { ok: true };
    },
  );
  ipcMain.handle("settings:get", async () => getSettings());
  ipcMain.handle("settings:update", async (_unusedEvent, patch) =>
    updateSettings(patch),
  );
  ipcMain.handle("window:minimize", (event) =>
    BrowserWindow.fromWebContents(event.sender)?.minimize(),
  );
  ipcMain.handle("window:toggle-maximize", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return { isMaximized: false };
    if (window.isMaximized()) {
      window.unmaximize();
    } else {
      window.maximize();
    }
    return { isMaximized: window.isMaximized() };
  });
  ipcMain.handle("window:toggle-always-on-top", (event, shouldPin) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return { isAlwaysOnTop: false };
    window.setAlwaysOnTop(Boolean(shouldPin));
    const settings = updateSettings({
      editorSettings: {
        ...getSettings().editorSettings,
        alwaysOnTop: window.isAlwaysOnTop(),
      },
    });
    sendWindowState(window);
    return {
      isAlwaysOnTop: window.isAlwaysOnTop(),
      settings,
    };
  });
  ipcMain.handle("window:close", (event) =>
    BrowserWindow.fromWebContents(event.sender)?.close(),
  );

  createAppMenu();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
