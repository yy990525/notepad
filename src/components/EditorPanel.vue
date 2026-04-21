<template>
  <section class="editor-panel">
    <header class="editor-toolbar">
      <div class="toolbar-top">
        <div class="toolbar-meta">
          <p class="toolbar-title">文本编辑器</p>
          <p class="toolbar-subtitle">{{ currentFileName }}<span class="toolbar-sep">·</span>{{ filePath || '未打开文件' }}</p>
        </div>

        <div class="toolbar-side-tools">
          <label class="theme-select-group">
            <span class="theme-select-label">主题</span>
            <select class="theme-select" :value="activeThemeId" @change="$emit('theme-change', $event.target.value)">
              <option v-for="theme in themes" :key="theme.id" :value="theme.id">
                {{ theme.name }}
              </option>
            </select>
          </label>

          <div class="toolbar-status">
            <span class="status-key">状态</span>
            <span :class="['status-badge', isDirty ? 'dirty' : 'saved']">
              {{ isDirty ? '未保存' : '已保存' }}
            </span>
          </div>
        </div>
      </div>

      <div class="toolbar-actions">
        <div class="action-group">
          <button class="action-btn" type="button" :disabled="isBusy" @click="$emit('new-file')">新建</button>
          <button class="action-btn primary" type="button" :disabled="isBusy" @click="$emit('open')">打开</button>
          <button class="action-btn" type="button" :disabled="isBusy" @click="$emit('save')">保存</button>
          <button class="action-btn" type="button" :disabled="isBusy" @click="$emit('save-as')">另存为</button>
          <button class="action-btn" type="button" :disabled="!filePath" @click="$emit('open-folder')">所在目录</button>
          <button class="action-btn" type="button" @click="$emit('toggle-find')">查找 / 替换</button>
        </div>
        <p class="shortcut-hint">快捷键：{{ shortcutHint }}</p>
      </div>

      <div v-if="showFindPanel" class="find-panel">
        <input
          :value="searchQuery"
          class="find-input"
          type="text"
          placeholder="查找内容"
          @input="$emit('update:search-query', $event.target.value)"
        />
        <input
          :value="replaceQuery"
          class="find-input"
          type="text"
          placeholder="替换为"
          @input="$emit('update:replace-query', $event.target.value)"
        />
        <div class="find-actions">
          <button class="action-btn compact" type="button" @click="$emit('find-next')">查找</button>
          <button class="action-btn compact" type="button" @click="$emit('replace-next')">替换</button>
          <button class="action-btn compact" type="button" @click="$emit('replace-all')">全部替换</button>
          <button class="action-btn compact" type="button" @click="$emit('close-find')">关闭</button>
        </div>
      </div>
    </header>

    <div class="editor-wrap">
      <textarea
        :value="text"
        :style="editorStyle"
        :class="['editor', { nowrap: !wordWrap }]"
        spellcheck="false"
        placeholder="在这里输入内容，或先打开一个 txt 文件。支持拖拽文件到窗口直接打开。"
        @input="$emit('update:text', $event.target.value)"
      />

      <div class="editor-stats">
        <span>字符 {{ stats.characters }}</span>
        <span>行数 {{ stats.lines }}</span>
        <span>单词 {{ stats.words }}</span>
      </div>
    </div>
  </section>
</template>

<script setup>
defineProps({
  currentFileName: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  isDirty: {
    type: Boolean,
    required: true,
  },
  isBusy: {
    type: Boolean,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  shortcutHint: {
    type: String,
    required: true,
  },
  searchQuery: {
    type: String,
    required: true,
  },
  replaceQuery: {
    type: String,
    required: true,
  },
  showFindPanel: {
    type: Boolean,
    required: true,
  },
  stats: {
    type: Object,
    required: true,
  },
  editorStyle: {
    type: Object,
    required: true,
  },
  wordWrap: {
    type: Boolean,
    required: true,
  },
  themes: {
    type: Array,
    required: true,
  },
  activeThemeId: {
    type: String,
    required: true,
  },
});

defineEmits([
  "new-file",
  "open",
  "save",
  "save-as",
  "open-folder",
  "update:text",
  "toggle-find",
  "close-find",
  "update:search-query",
  "update:replace-query",
  "find-next",
  "replace-next",
  "replace-all",
  "theme-change",
]);
</script>
