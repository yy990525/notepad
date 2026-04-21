<template>
  <div class="window-shell">
    <TitleBar
      :current-file-name="currentFileName"
      :is-maximized="isMaximized"
      @minimize="handleMinimize"
      @toggle-maximize="handleToggleMaximize"
      @close="handleClose"
    />

    <div class="notepad-shell">
      <NotepadSidebar />
      <EditorPanel
        :current-file-name="currentFileName"
        :file-path="filePath"
        :is-dirty="isDirty"
        :is-busy="isBusy"
        :text="text"
        :shortcut-hint="shortcutHint"
        @open="handleOpen"
        @save="handleSave"
        @save-as="handleSaveAs"
        @update:text="handleTextUpdate"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import TitleBar from "./components/TitleBar.vue";
import NotepadSidebar from "./components/NotepadSidebar.vue";
import EditorPanel from "./components/EditorPanel.vue";

const text = ref("");
const filePath = ref("");
const isDirty = ref(false);
const isBusy = ref(false);
const isMaximized = ref(false);

const isMac = window.desktop.platform === "darwin";

const currentFileName = computed(() => {
  if (!filePath.value) return "untitled.txt";
  return filePath.value.split(/[/\\]/).pop() || "untitled.txt";
});

const shortcutHint = computed(() => (isMac ? "⌘O / ⌘S / ⇧⌘S" : "Ctrl+O / Ctrl+S / Ctrl+Shift+S"));

async function handleOpen() {
  try {
    isBusy.value = true;
    const result = await window.desktop.openTextFile();
    if (result?.canceled) {
      return;
    }

    text.value = result?.content ?? "";
    filePath.value = result?.filePath ?? "";
    isDirty.value = false;
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
  } finally {
    isBusy.value = false;
  }
}

async function handleMinimize() {
  await window.desktop.minimizeWindow();
}

async function handleToggleMaximize() {
  const state = await window.desktop.toggleMaximizeWindow();
  isMaximized.value = Boolean(state?.isMaximized);
}

async function handleClose() {
  await window.desktop.closeWindow();
}

function handleTextUpdate(value) {
  text.value = value;
  isDirty.value = true;
}

function handleKeydown(event) {
  const modifierPressed = isMac ? event.metaKey : event.ctrlKey;
  if (!modifierPressed) return;

  const key = event.key.toLowerCase();

  if (key === "o") {
    event.preventDefault();
    handleOpen();
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

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);

  disposeMenuAction = window.desktop.onMenuAction((action) => {
    if (action === "open-file") {
      handleOpen();
    }

    if (action === "save-file") {
      handleSave();
    }

    if (action === "save-file-as") {
      handleSaveAs();
    }
  });

  disposeWindowState = window.desktop.onWindowState((state) => {
    isMaximized.value = Boolean(state?.isMaximized);
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeydown);
  disposeMenuAction?.();
  disposeWindowState?.();
});
</script>
