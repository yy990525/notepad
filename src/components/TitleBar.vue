<template>
  <header class="titlebar">
    <div class="titlebar-drag">
      <span class="titlebar-app">记事本</span>
      <span class="titlebar-file">{{ currentFileName }}</span>
    </div>

    <div class="titlebar-actions">
      <button class="titlebar-btn" type="button" aria-label="最小化" @click="$emit('minimize')">—</button>
      <button class="titlebar-btn" type="button" :aria-label="isMaximized ? '还原' : '最大化'" @click="$emit('toggle-maximize')">
        {{ isMaximized ? '❐' : '□' }}
      </button>
      <button class="titlebar-btn close" type="button" aria-label="关闭" @click="$emit('close')">✕</button>
    </div>
  </header>
</template>

<script setup>
defineProps({
  currentFileName: {
    type: String,
    required: true,
  },
  isMaximized: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["minimize", "toggle-maximize", "close"]);
</script>
