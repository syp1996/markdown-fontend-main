<template>
  <div class="editor-container">
    <div class="editor-content">
      <textarea
        ref="editorRef"
        v-model="localValue"
        class="fallback-editor"
        placeholder="在这里编写内容..."
        @input="onInput"
        @blur="onBlur"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlockNoteEditor',
  props: {
    modelValue: {
      type: [String, Array, Object],
      default: ''
    }
  },
  data() {
    return {
      localValue: ''
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newValue) {
        this.updateLocalValue(newValue)
      }
    }
  },
  methods: {
    updateLocalValue(value) {
      if (typeof value === 'string') {
        this.localValue = value
      } else if (Array.isArray(value)) {
        // 如果是数组，尝试转换为文本
        try {
          this.localValue = this.blocksToText(value)
        } catch (error) {
          this.localValue = JSON.stringify(value, null, 2)
        }
      } else if (value && typeof value === 'object') {
        // 如果是对象，转换为文本
        this.localValue = JSON.stringify(value, null, 2)
      } else {
        this.localValue = ''
      }
    },
    
    blocksToText(blocks) {
      if (!Array.isArray(blocks)) return ''
      
      return blocks.map(block => {
        if (block.type === 'paragraph' && block.content) {
          return block.content.map(item => item.text || '').join('')
        }
        return block.text || ''
      }).join('\n\n')
    },
    
    textToBlocks(text) {
      if (!text || typeof text !== 'string') return []
      
      const lines = text.split('\n').filter(line => line.trim())
      return lines.map(line => ({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      }))
    },
    
    onInput() {
      // 发送输入事件
      this.$emit('input', this.localValue)
      this.$emit('update:modelValue', this.localValue)
    },
    
    onBlur() {
      // 发送失焦事件，可以在这里进行格式转换
      const blocks = this.textToBlocks(this.localValue)
      this.$emit('input', blocks)
      this.$emit('update:modelValue', blocks)
    }
  }
}
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

.fallback-editor {
  width: 100%;
  height: 300px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  outline: none;
}

.fallback-editor:focus {
  border-color: #409EFF;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}
</style>
