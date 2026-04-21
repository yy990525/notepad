<template>
  <section class="editor-panel">
    <header class="editor-toolbar">
      <div class="toolbar-top">
        <div class="toolbar-meta">
          <p class="toolbar-title">文本编辑器</p>
          <p class="toolbar-subtitle">{{ currentFileName }}<span class="toolbar-sep">·</span>{{ filePath || '未打开文件' }}</p>
        </div>

        <div class="toolbar-status">
          <span class="status-key">状态</span>
          <span :class="['status-badge', isDirty ? 'dirty' : 'saved']">
            {{ isDirty ? '未保存' : '已保存' }}
          </span>
        </div>
      </div>

      <div class="toolbar-actions">
        <div class="action-group">
          <button class="action-btn primary" type="button" :disabled="isBusy" @click="$emit('open')">打开</button>
          <button class="action-btn" type="button" :disabled="isBusy" @click="$emit('save')">保存</button>
          <button class="action-btn" type="button" :disabled="isBusy" @click="$emit('save-as')">另存为</button>
        </div>
        <p class="shortcut-hint">快捷键：{{ shortcutHint }}</p>
      </div>
    </header>

    <div class="editor-wrap">
      <textarea
        :value="text"
        class="editor"
        spellcheck="false"
        placeholder="在这里输入内容，或先打开一个 txt 文件。"
        @input="$emit('update:text', $event.target.value)"
      />

      <div class="editor-count">字符 {{ text.length }}</div>
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
});

defineEmits(["open", "save", "save-as", "update:text"]);
</script>
