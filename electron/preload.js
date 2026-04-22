const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktop", {
  platform: process.platform,
  openTextFile: () => ipcRenderer.invoke("notepad:open-file"),
  openRecentFile: (filePath) => ipcRenderer.invoke("notepad:open-recent-file", filePath),
  saveTextFile: (payload) => ipcRenderer.invoke("notepad:save-file", payload),
  saveTextFileAs: (payload) => ipcRenderer.invoke("notepad:save-file-as", payload),
  confirmDiscardChanges: () => ipcRenderer.invoke("notepad:confirm-discard"),
  openContainingFolder: (filePath) => ipcRenderer.invoke("notepad:open-containing-folder", filePath),
  getSettings: () => ipcRenderer.invoke("settings:get"),
  updateSettings: (patch) => ipcRenderer.invoke("settings:update", patch),
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize"),
  toggleAlwaysOnTop: (shouldPin) => ipcRenderer.invoke("window:toggle-always-on-top", shouldPin),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  onMenuAction: (callback) => {
    const listener = (_unusedEvent, action) => callback(action);
    ipcRenderer.on("menu-action", listener);
    return () => ipcRenderer.removeListener("menu-action", listener);
  },
  onWindowState: (callback) => {
    const listener = (_unusedEvent, state) => callback(state);
    ipcRenderer.on("window-state", listener);
    return () => ipcRenderer.removeListener("window-state", listener);
  },
});
