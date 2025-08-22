<template>
  <div class="editor-container">
    <div ref="editorRef" class="editor-content"></div>
  </div>
</template>

<script setup lang="ts">
import type { PartialBlock } from '@blocknote/core';
import { BlockNoteEditor, BlockNoteView } from '@blocknote/core';
import '@blocknote/style/dist/style.css';
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

// 定义 Props
const props = defineProps<{
  modelValue?: PartialBlock[];
}>();

// 定义 Emits
const emit = defineEmits<{
  (e: 'update:modelValue', content: PartialBlock[]): void;
}>();

// 编辑器引用
const editorRef = ref<HTMLElement>();
let editor: BlockNoteEditor | null = null;

// 初始化编辑器
const initEditor = async () => {
  if (!editorRef.value) return;

  // 创建编辑器实例
  editor = new BlockNoteEditor({
    initialContent: props.modelValue || undefined,
    onEditorContentChange: (editorInstance) => {
      // 当内容变化时，发送更新事件
      const content = editorInstance.topLevelBlocks;
      emit('update:modelValue', content);
    },
  });

  // 渲染编辑器到 DOM
  const view = new BlockNoteView(editor, editorRef.value);
  
  // 等待编辑器完全初始化
  await nextTick();
};

// 监听外部内容变化
watch(() => props.modelValue, (newContent) => {
  if (editor && newContent) {
    // 检查内容是否真的不同
    const currentContent = JSON.stringify(editor.topLevelBlocks);
    const newContentStr = JSON.stringify(newContent);
    
    if (currentContent !== newContentStr) {
      // 更新编辑器内容
      editor.replaceBlocks(editor.topLevelBlocks, newContent);
    }
  }
});

// 组件挂载时初始化编辑器
onMounted(() => {
  initEditor();
});

// 组件卸载时清理编辑器
onUnmounted(() => {
  if (editor) {
    editor.destroy();
    editor = null;
  }
});
</script>

<style scoped>
.editor-container {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.editor-content {
  min-height: 300px;
}
</style>
