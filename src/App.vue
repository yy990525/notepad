<template>
  <div class="window-shell" :data-theme="activeTheme.id" @drop.prevent="handleDrop" @dragover.prevent>
    <TitleBar
      :current-file-name="currentFileName"
      :is-maximized="isMaximized"
      :is-always-on-top="editorSettings.alwaysOnTop"
      @minimize="handleMinimize"
      @toggle-maximize="handleToggleMaximize"
      @toggle-pin="handleToggleAlwaysOnTop"
      @close="handleClose"
    />

    <div class="notepad-shell">
      <NotepadSidebar
        :recent-files="recentFiles"
        :editor-settings="editorSettings"
        @open-recent="handleOpenRecent"
        @toggle-auto-save="handleToggleAutoSave"
        @toggle-wrap="handleToggleWordWrap"
        @font-size-change="handleFontSizeChange"
        @line-height-change="handleLineHeightChange"
      />
      <EditorPanel
        :current-file-name="currentFileName"
        :file-path="filePath"
        :is-dirty="isDirty"
        :is-busy="isBusy"
        :text="text"
        :shortcut-hint="shortcutHint"
        :search-query="searchQuery"
        :replace-query="replaceQuery"
        :show-find-panel="showFindPanel"
        :stats="stats"
        :editor-style="editorStyle"
        :word-wrap="editorSettings.wordWrap"
        :themes="themes"
        :active-theme-id="activeThemeId"
        @new-file="handleNewFile"
        @open="handleOpen"
        @save="handleSave"
        @save-as="handleSaveAs"
        @open-folder="handleOpenContainingFolder"
        @update:text="handleTextUpdate"
        @toggle-find="handleToggleFind"
        @close-find="showFindPanel = false"
        @update:search-query="searchQuery = $event"
        @update:replace-query="replaceQuery = $event"
        @find-next="handleFindNext"
        @replace-next="handleReplaceNext"
        @replace-all="handleReplaceAll"
        @theme-change="handleThemeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import TitleBar from "./components/TitleBar.vue";
import NotepadSidebar from "./components/NotepadSidebar.vue";
import EditorPanel from "./components/EditorPanel.vue";

const themes = [
  { id: "amber", name: "琥珀金", accent: "#f4c56a", accentSoft: "#ffd98f" },
  { id: "ocean", name: "深海蓝", accent: "#69b7ff", accentSoft: "#9cd3ff" },
  { id: "forest", name: "森林绿", accent: "#6dd7a1", accentSoft: "#a0efc8" },
  { id: "rose", name: "玫瑰粉", accent: "#ff8fb1", accentSoft: "#ffc0d1" },
  { id: "violet", name: "紫罗兰", accent: "#a78bfa", accentSoft: "#cdc1ff" },
];

const text = ref("");
const filePath = ref("");
const isDirty = ref(false);
const isBusy = ref(false);
const isMaximized = ref(false);
const activeThemeId = ref(themes[0].id);
const recentFiles = ref([]);
const showFindPanel = ref(false);
const searchQuery = ref("");
const replaceQuery = ref("");
const autoSaveTimer = ref(null);
const editorSettings = ref({
  autoSave: false,
  autoSaveInterval: 3000,
  fontSize: 14,
  lineHeight: 1.65,
  wordWrap: true,
  alwaysOnTop: false,
});

const isMac = window.desktop.platform === "darwin";
const activeTheme = computed(() => themes.find((theme) => theme.id === activeThemeId.value) ?? themes[0]);

const currentFileName = computed(() => {
  if (!filePath.value) return "untitled.txt";
  return filePath.value.split(/[/\\]/).pop() || "untitled.txt";
});

const shortcutHint = computed(() =>
  isMac ? "⌘N / ⌘O / ⌘S / ⇧⌘S / ⌘F / ⌘H" : "Ctrl+N / Ctrl+O / Ctrl+S / Ctrl+Shift+S / Ctrl+F / Ctrl+H"
);

const stats = computed(() => {
  const content = text.value || "";
  const lines = content.length ? content.split(/\r?\n/).length : 1;
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return {
    characters: content.length,
    lines,
    words,
  };
});

const editorStyle = computed(() => ({
  fontSize: `${editorSettings.value.fontSize}px`,
  lineHeight: String(editorSettings.value.lineHeight),
  whiteSpace: editorSettings.value.wordWrap ? "pre-wrap" : "pre",
  overflowWrap: editorSettings.value.wordWrap ? "anywhere" : "normal",
}));

async function loadSettings() {
  const settings = await window.desktop.getSettings();
  activeThemeId.value = settings?.themeId || themes[0].id;
  recentFiles.value = settings?.recentFiles || [];
  editorSettings.value = {
    ...editorSettings.value,
    ...(settings?.editorSettings || {}),
  };
}

async function syncSettings(patch) {
  const settings = await window.desktop.updateSettings(patch);
  recentFiles.value = settings?.recentFiles || recentFiles.value;
  editorSettings.value = {
    ...editorSettings.value,
    ...(settings?.editorSettings || {}),
  };
}

async function maybeHandleUnsavedChanges() {
  if (!isDirty.value) {
    return true;
  }

  const result = await window.desktop.confirmDiscardChanges();
  if (result?.action === "cancel") {
    return false;
  }

  if (result?.action === "save") {
    await handleSave();
    return !isDirty.value;
  }

  return true;
}

function applyOpenResult(result) {
  if (!result || result.canceled) {
    return;
  }

  text.value = result.content ?? "";
  filePath.value = result.filePath ?? "";
  isDirty.value = false;
}

async function handleNewFile() {
  const canContinue = await maybeHandleUnsavedChanges();
  if (!canContinue) {
    return;
  }

  text.value = "";
  filePath.value = "";
  isDirty.value = false;
}

async function handleOpen() {
  const canContinue = await maybeHandleUnsavedChanges();
  if (!canContinue) {
    return;
  }

  try {
    isBusy.value = true;
    const result = await window.desktop.openTextFile();
    applyOpenResult(result);
    await loadSettings();
  } finally {
    isBusy.value = false;
  }
}

async function handleOpenRecent(targetPath) {
  const canContinue = await maybeHandleUnsavedChanges();
  if (!canContinue) {
    return;
  }

  try {
    isBusy.value = true;
    const result = await window.desktop.openRecentFile(targetPath);
    applyOpenResult(result);
    await loadSettings();
  } finally {
    isBusy.value = false;
  }
}

async function handleSave() {
  try {
    isBusy.value = true;
    const result = await window.desktop.saveTextFile({
      filePath: filePath.value,
      content: text.value,
    });

    if (result?.canceled) {
      return;
    }

    filePath.value = result?.filePath ?? filePath.value;
    isDirty.value = false;
    await loadSettings();
  } finally {
    isBusy.value = false;
  }
}

async function handleSaveAs() {
  try {
    isBusy.value = true;
    const result = await window.desktop.saveTextFileAs({
      filePath: filePath.value,
      content: text.value,
    });

    if (result?.canceled) {
      return;
    }

    filePath.value = result?.filePath ?? filePath.value;
    isDirty.value = false;
    await loadSettings();
  } finally {
    isBusy.value = false;
  }
}

async function handleOpenContainingFolder() {
  if (!filePath.value) {
    return;
  }
  await window.desktop.openContainingFolder(filePath.value);
}

async function handleMinimize() {
  await window.desktop.minimizeWindow();
}

async function handleToggleMaximize() {
  const state = await window.desktop.toggleMaximizeWindow();
  isMaximized.value = Boolean(state?.isMaximized);
}

async function handleToggleAlwaysOnTop() {
  const state = await window.desktop.toggleAlwaysOnTop(!editorSettings.value.alwaysOnTop);
  editorSettings.value = {
    ...editorSettings.value,
    alwaysOnTop: Boolean(state?.isAlwaysOnTop),
  };
}

async function handleClose() {
  const canContinue = await maybeHandleUnsavedChanges();
  if (!canContinue) {
    return;
  }
  await window.desktop.closeWindow();
}

function handleTextUpdate(value) {
  text.value = value;
  isDirty.value = true;
}

async function handleThemeChange(themeId) {
  activeThemeId.value = themeId;
  await syncSettings({ themeId });
}

async function handleToggleAutoSave(enabled) {
  editorSettings.value = {
    ...editorSettings.value,
    autoSave: enabled,
  };
  await syncSettings({
    editorSettings: {
      ...editorSettings.value,
      autoSave: enabled,
    },
  });
}

async function handleToggleWordWrap(enabled) {
  editorSettings.value = {
    ...editorSettings.value,
    wordWrap: enabled,
  };
  await syncSettings({
    editorSettings: {
      ...editorSettings.value,
      wordWrap: enabled,
    },
  });
}

async function handleFontSizeChange(size) {
  editorSettings.value = {
    ...editorSettings.value,
    fontSize: size,
  };
  await syncSettings({ editorSettings: { ...editorSettings.value, fontSize: size } });
}

async function handleLineHeightChange(lineHeight) {
  editorSettings.value = {
    ...editorSettings.value,
    lineHeight,
  };
  await syncSettings({ editorSettings: { ...editorSettings.value, lineHeight } });
}

function handleToggleFind(mode = "find") {
  showFindPanel.value = true;
  if (mode === "replace") {
    replaceQuery.value = replaceQuery.value || "";
  }
}

function handleFindNext() {
  if (!searchQuery.value) {
    return;
  }
  const source = text.value || "";
  const startIndex = source.indexOf(searchQuery.value);
  if (startIndex >= 0) {
    const endIndex = startIndex + searchQuery.value.length;
    requestAnimationFrame(() => {
      const textarea = document.querySelector(".editor");
      textarea?.focus();
      textarea?.setSelectionRange(startIndex, endIndex);
    });
  }
}

function handleReplaceNext() {
  if (!searchQuery.value) {
    return;
  }
  const index = text.value.indexOf(searchQuery.value);
  if (index < 0) {
    return;
  }
  text.value = `${text.value.slice(0, index)}${replaceQuery.value}${text.value.slice(index + searchQuery.value.length)}`;
  isDirty.value = true;
}

function handleReplaceAll() {
  if (!searchQuery.value) {
    return;
  }
  text.value = text.value.split(searchQuery.value).join(replaceQuery.value);
  isDirty.value = true;
}

async function handleDrop(event) {
  const droppedFile = event.dataTransfer?.files?.[0];
  if (!droppedFile?.path) {
    return;
  }

  const canContinue = await maybeHandleUnsavedChanges();
  if (!canContinue) {
    return;
  }

  try {
    isBusy.value = true;
    const result = await window.desktop.openRecentFile(droppedFile.path);
    applyOpenResult(result);
    await loadSettings();
  } finally {
    isBusy.value = false;
  }
}

function setupAutoSave() {
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value);
    autoSaveTimer.value = null;
  }

  if (!editorSettings.value.autoSave) {
    return;
  }

  autoSaveTimer.value = setInterval(() => {
    if (!filePath.value || !isDirty.value || isBusy.value) {
      return;
    }
    handleSave();
  }, editorSettings.value.autoSaveInterval);
}

function handleKeydown(event) {
  const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
  if (!modifierPressed) return;

  const key = event.key.toLowerCase();

  if (key === "n") {
    event.preventDefault();
    handleNewFile();
    return;
  }

  if (key === "o" && event.shiftKey) {
    event.preventDefault();
    handleOpenContainingFolder();
    return;
  }

  if (key === "o") {
    event.preventDefault();
    handleOpen();
    return;
  }

  if (key === "f") {
    event.preventDefault();
    handleToggleFind("find");
    return;
  }

  if (key === "h") {
    event.preventDefault();
    handleToggleFind("replace");
    return;
  }

  if (key === "s" && event.shiftKey) {
    event.preventDefault();
    handleSaveAs();
    return;
  }

  if (key === "s") {
    event.preventDefault();
    handleSave();
  }
}

let disposeMenuAction = null;
let disposeWindowState = null;

watch(
  () => [editorSettings.value.autoSave, editorSettings.value.autoSaveInterval, filePath.value, isDirty.value],
  () => {
    setupAutoSave();
  },
  { deep: true }
);

onMounted(async () => {
  await loadSettings();
  window.addEventListener("keydown", handleKeydown);
  setupAutoSave();

  disposeMenuAction = window.desktop.onMenuAction((action) => {
    if (action === "new-file") handleNewFile();
    if (action === "open-file") handleOpen();
    if (action === "save-file") handleSave();
    if (action === "save-file-as") handleSaveAs();
    if (action === "open-containing-folder") handleOpenContainingFolder();
    if (action === "find-text") handleToggleFind("find");
    if (action === "replace-text") handleToggleFind("replace");
    if (action === "toggle-always-on-top") handleToggleAlwaysOnTop();
  });

  disposeWindowState = window.desktop.onWindowState((state) => {
    isMaximized.value = Boolean(state?.isMaximized);
    editorSettings.value = {
      ...editorSettings.value,
      ...(state?.settings?.editorSettings || {}),
      alwaysOnTop: Boolean(state?.isAlwaysOnTop ?? editorSettings.value.alwaysOnTop),
    };
    recentFiles.value = state?.settings?.recentFiles || recentFiles.value;
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  disposeMenuAction?.();
  disposeWindowState?.();
  if (autoSaveTimer.value) {
    clearInterval(autoSaveTimer.value);
  }
});
</script>
