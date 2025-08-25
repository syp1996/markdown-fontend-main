<template>
    <div class="lexical-editor-container">
        <div class="toolbar" v-if="showToolbar">
            <button @click="formatText('bold')" :class="{ active: isBold }" class="format-btn" title="加粗">
                <strong>B</strong>
            </button>
            <button @click="formatText('italic')" :class="{ active: isItalic }" class="format-btn" title="斜体">
                <em>I</em>
            </button>
            <button @click="undo" :disabled="!canUndo" class="format-btn" title="撤销">
                ↶ 撤销
            </button>
            <button @click="redo" :disabled="!canRedo" class="format-btn" title="重做">
                ↷ 重做
            </button>
            <button @click="clearEditor" class="format-btn" title="清空">
                🗑️ 清空
            </button>
        </div>
        <div ref="editorRef" class="editor-content" :style="{ height: height }" contenteditable="true"
            :placeholder="placeholder" @input="handleInput" @focus="handleFocus" @blur="handleBlur"
            @keydown="handleKeydown" @paste="handlePaste"></div>
    </div>
</template>

<script>
export default {
    name: 'LexicalEditor',
    props: {
        modelValue: {
            type: String,
            default: ''
        },
        placeholder: {
            type: String,
            default: '开始输入...'
        },
        height: {
            type: String,
            default: '400px'
        },
        showToolbar: {
            type: Boolean,
            default: true
        },
        format: {
            type: String,
            default: 'text',
            validator: value => ['markdown', 'html', 'text'].includes(value)
        }
    },
    emits: ['update:modelValue', 'change', 'focus', 'blur'],
    data() {
        return {
            editor: null,
            isBold: false,
            isItalic: false,
            canUndo: false,
            canRedo: false,
            isInitialized: false
        };
    },
    mounted() {
        this.initEditor();
    },
    beforeUnmount() {
        if (this.editor) {
            try {
                this.editor.setRootElement(null);
            } catch (e) {
                console.warn('编辑器清理时出现错误:', e);
            }
        }
    },
    watch: {
        modelValue(newValue) {
            if (this.editor && this.isInitialized && newValue !== this.getCurrentValue()) {
                this.setContent(newValue);
            }
        }
    },
    methods: {
        handleKeydown(event) {
            // 处理快捷键
            if (event.ctrlKey || event.metaKey) {
                switch (event.key.toLowerCase()) {
                    case 'b':
                        event.preventDefault();
                        this.execCommand('bold');
                        break;
                    case 'i':
                        event.preventDefault();
                        this.execCommand('italic');
                        break;
                    case 'u':
                        event.preventDefault();
                        this.execCommand('underline');
                        break;
                    case 'z':
                        if (event.shiftKey) {
                            event.preventDefault();
                            this.redo();
                        } else {
                            event.preventDefault();
                            this.undo();
                        }
                        break;
                }
            }

            // 处理 Enter 键
            if (event.key === 'Enter' && !event.shiftKey) {
                // 让浏览器自然处理换行
            }
        },

        handlePaste(event) {
            // 简单的粘贴处理
            event.preventDefault();
            const text = event.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
        },

        updateFormatStates() {
            try {
                this.formatStates.bold = document.queryCommandState('bold');
                this.formatStates.italic = document.queryCommandState('italic');
                this.formatStates.underline = document.queryCommandState('underline');
            } catch (error) {
                // 忽略查询状态错误
            }
        },
        handleInput() {
            const content = this.getCurrentValue();
            this.$emit('update:modelValue', content);
            this.$emit('change', content);
            this.updateFormatStates();
            this.updatePlaceholder();
        },

        updatePlaceholder() {
            const editor = this.$refs.editorRef;
            if (!editor) return;

            const isEmpty = !editor.textContent || editor.textContent.trim() === '';

            if (isEmpty) {
                editor.classList.add('empty');
            } else {
                editor.classList.remove('empty');
            }
        },
        handleFocus() {
            this.$emit('focus');
            this.updateFormatStates();
        },

        handleBlur() {
            this.$emit('blur');
        },

        async initEditor() {
            try {
                // 动态导入 Lexical
                const lexical = await import('lexical');
                const richText = await import('@lexical/rich-text');
                const history = await import('@lexical/history');

                const { createEditor, $getRoot, $createParagraphNode, $createTextNode, $getSelection, FORMAT_TEXT_COMMAND, UNDO_COMMAND, REDO_COMMAND, CAN_UNDO_COMMAND, CAN_REDO_COMMAND } = lexical;
                const { registerRichText } = richText;
                const { registerHistory, createEmptyHistoryState } = history;

                // 创建编辑器配置
                const config = {
                    namespace: 'LexicalEditor',
                    onError: (error) => {
                        console.error('Lexical编辑器错误:', error);
                    },
                    theme: {
                        text: {
                            bold: 'lexical-text-bold',
                            italic: 'lexical-text-italic'
                        },
                        paragraph: 'lexical-paragraph'
                    }
                };

                // 创建编辑器实例
                this.editor = createEditor(config);

                // 注册插件
                registerRichText(this.editor);
                registerHistory(this.editor, createEmptyHistoryState(), 1000);

                // 设置编辑器容器
                this.editor.setRootElement(this.$refs.editorRef);

                // 设置初始内容
                this.editor.update(() => {
                    const root = $getRoot();
                    if (root.isEmpty()) {
                        const paragraph = $createParagraphNode();
                        if (this.modelValue) {
                            paragraph.append($createTextNode(this.modelValue));
                        } else {
                            paragraph.append($createTextNode(''));
                        }
                        root.append(paragraph);
                    }
                });

                // 监听编辑器变化
                this.editor.registerUpdateListener(({ editorState }) => {
                    editorState.read(() => {
                        const content = this.getCurrentValue();
                        this.$emit('update:modelValue', content);
                        this.$emit('change', content);
                        this.updateFormatState();
                    });
                });

                // 监听撤销/重做状态
                this.editor.registerCommand(
                    CAN_UNDO_COMMAND,
                    (canUndo) => {
                        this.canUndo = canUndo;
                        return false;
                    },
                    1
                );

                this.editor.registerCommand(
                    CAN_REDO_COMMAND,
                    (canRedo) => {
                        this.canRedo = canRedo;
                        return false;
                    },
                    1
                );

                // 监听焦点事件
                this.$refs.editorRef.addEventListener('focus', () => {
                    this.$emit('focus');
                });

                this.$refs.editorRef.addEventListener('blur', () => {
                    this.$emit('blur');
                });

                this.isInitialized = true;

                // 存储常用的命令
                this.FORMAT_TEXT_COMMAND = FORMAT_TEXT_COMMAND;
                this.UNDO_COMMAND = UNDO_COMMAND;
                this.REDO_COMMAND = REDO_COMMAND;
                this.$getRoot = $getRoot;
                this.$createParagraphNode = $createParagraphNode;
                this.$createTextNode = $createTextNode;
                this.$getSelection = $getSelection;

            } catch (error) {
                console.error('初始化编辑器失败:', error);
                this.$emit('change', 'Lexical编辑器加载失败，请检查依赖是否正确安装。');
            }
        },

        getCurrentValue() {
            if (!this.editor || !this.isInitialized) return '';

            let content = '';
            this.editor.getEditorState().read(() => {
                content = this.$getRoot().getTextContent();
            });
            return content;
        },

        setContent(content) {
            if (!this.editor || !this.isInitialized) return;

            this.editor.update(() => {
                const root = this.$getRoot();
                root.clear();
                const paragraph = this.$createParagraphNode();
                paragraph.append(this.$createTextNode(content || ''));
                root.append(paragraph);
            });
        },

        updateFormatState() {
            if (!this.editor || !this.isInitialized) return;

            try {
                const selection = this.$getSelection();
                if (selection) {
                    this.isBold = selection.hasFormat && selection.hasFormat('bold');
                    this.isItalic = selection.hasFormat && selection.hasFormat('italic');
                }
            } catch (e) {
                // 忽略格式检查错误
            }
        },

        formatText(format) {
            if (!this.editor || !this.isInitialized) return;

            try {
                this.editor.dispatchCommand(this.FORMAT_TEXT_COMMAND, format);
            } catch (e) {
                console.warn('格式化文本失败:', e);
            }
        },

        undo() {
            if (!this.editor || !this.isInitialized) return;

            try {
                this.editor.dispatchCommand(this.UNDO_COMMAND, undefined);
            } catch (e) {
                console.warn('撤销失败:', e);
            }
        },

        redo() {
            if (!this.editor || !this.isInitialized) return;

            try {
                this.editor.dispatchCommand(this.REDO_COMMAND, undefined);
            } catch (e) {
                console.warn('重做失败:', e);
            }
        },

        clearEditor() {
            if (!this.editor || !this.isInitialized) return;

            this.editor.update(() => {
                const root = this.$getRoot();
                root.clear();
                const paragraph = this.$createParagraphNode();
                paragraph.append(this.$createTextNode(''));
                root.append(paragraph);
            });
        },

        focus() {
            if (this.editor && this.isInitialized) {
                this.editor.focus();
            }
        },

        blur() {
            if (this.editor && this.isInitialized) {
                this.editor.blur();
            }
        }
    }
};
</script>

<style scoped>
.editor-content {
    padding: 12px;
    min-height: 100px;
    outline: none;
    font-size: 14px;
    line-height: 1.6;
    overflow-y: auto;
    background: white;
    word-wrap: break-word;
    white-space: pre-wrap;
}

.editor-content:focus {
    box-shadow: inset 0 0 0 2px rgba(0, 122, 204, 0.2);
}

.lexical-editor-container {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    background: white;
}

.toolbar {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #ddd;
    gap: 4px;
}

.format-btn {
    padding: 6px 10px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.2s;
    color: #333;
}

.format-btn:hover {
    background: #e9e9e9;
}

.format-btn.active {
    background: #007acc;
    color: white;
    border-color: #007acc;
}

.format-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.lexical-editor {
    padding: 12px;
    min-height: 100px;
    outline: none;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    line-height: 1.6;
    overflow-y: auto;
    background: white;
}

/* Lexical样式 */
:deep(.lexical-text-bold) {
    font-weight: bold;
}

:deep(.lexical-text-italic) {
    font-style: italic;
}

:deep(.lexical-paragraph) {
    margin: 0 0 8px 0;
}

.lexical-editor:focus {
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
}
</style>