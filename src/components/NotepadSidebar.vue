<template>
  <aside class="sidebar">
    <p class="eyebrow">记事本</p>
    <h1>记事本</h1>
    <p class="lede">打开 `.txt` 文件，直接编辑，并保存回本地磁盘。使用菜单栏或快捷键完成打开、保存和另存为。</p>

    <section class="sidebar-card">
      <div class="sidebar-card-head">
        <p class="sidebar-card-title">最近文件</p>
        <p class="sidebar-card-subtitle">点击可快速重新打开</p>
      </div>
      <div class="recent-list" v-if="recentFiles.length">
        <button
          v-for="item in recentFiles"
          :key="item.path"
          type="button"
          class="recent-file"
          @click="$emit('open-recent', item.path)"
        >
          <span class="recent-file-name">{{ item.name }}</span>
          <span class="recent-file-path">{{ item.path }}</span>
        </button>
      </div>
      <p v-else class="empty-copy">还没有最近打开记录</p>
    </section>

    <section class="sidebar-card">
      <div class="sidebar-card-head">
        <p class="sidebar-card-title">编辑设置</p>
        <p class="sidebar-card-subtitle">常用行为开关和排版参数</p>
      </div>

      <label class="setting-row toggle-row">
        <span>自动保存</span>
        <input :checked="editorSettings.autoSave" type="checkbox" @change="$emit('toggle-auto-save', $event.target.checked)" />
      </label>

      <label class="setting-row toggle-row">
        <span>自动换行</span>
        <input :checked="editorSettings.wordWrap" type="checkbox" @change="$emit('toggle-wrap', $event.target.checked)" />
      </label>

      <label class="setting-row number-row">
        <span>字号</span>
        <input
          class="setting-number"
          :value="editorSettings.fontSize"
          type="number"
          min="12"
          max="22"
          step="1"
          @input="$emit('font-size-change', Number($event.target.value))"
        />
      </label>

      <label class="setting-row number-row">
        <span>行高</span>
        <input
          class="setting-number"
          :value="editorSettings.lineHeight"
          type="number"
          min="1.3"
          max="2.2"
          step="0.05"
          @input="$emit('line-height-change', Number($event.target.value))"
        />
      </label>

    </section>
  </aside>
</template>

<script setup>
defineProps({
  recentFiles: {
    type: Array,
    required: true,
  },
  editorSettings: {
    type: Object,
    required: true,
  },
});

defineEmits(["open-recent", "toggle-auto-save", "toggle-wrap", "font-size-change", "line-height-change"]);
</script>
