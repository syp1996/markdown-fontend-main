<template>
    <div class="left-side" :class="{ collapsed: isCollapsed }">
        <nav class="sidebar-menu" :class="{ collapsed: isCollapsed }">
            <!-- 展开/收缩控制按钮 -->
            <div class="menu-item collapse-control" @click="toggleSidebar">
                <img class="collapse-icon" src="@/icons/sidebar.png" alt="展开收缩" />
                <span class="menu-title"></span>
            </div>

            <!-- 搜索菜单 -->
            <div class="menu-item" @click="handleMenuSelect('search')">
                <img class="menu-icon" src="@/icons/search.png" alt="搜索图标" />
                <span class="menu-title" :class="{ 'fade-in': showText, 'fade-out': !showText }">搜索</span>
            </div>

            <!-- 首页菜单 -->
            <div class="menu-item" @click="handleMenuSelect('home')">
                <img class="menu-icon" src="@/icons/home.png" alt="首页图标" />
                <span class="menu-title" :class="{ 'fade-in': showText, 'fade-out': !showText }">主页</span>
            </div>

            <!-- 文件管理 -->
            <div class="menu-group">
                <div class="menu-header" @click="toggleSubmenu('files')">
                    <img class="menu-icon" src="@/icons/files.png" alt="文件管理图标" />
                    <span class="menu-title" :class="{ 'fade-in': showText, 'fade-out': !showText }">文件管理</span>
                    <img 
                        class="submenu-arrow" 
                        :class="{ 
                            'expanded': openSubmenus.includes('files'),
                            'fade-in': showText, 
                            'fade-out': !showText 
                        }"
                        src="@/icons/CaretDown.png" 
                        alt="展开箭头"
                    />
                </div>
                <div class="submenu" :class="{ 'expanded': openSubmenus.includes('files') && showText }">
                    <div 
                        v-for="item in documents" 
                        :key="item.id"
                        class="submenu-item" 
                        :class="{ 'has-active-popover': showPopover && popoverItem && popoverItem.id === item.id }"
                        :title="item.title"
                        @click="handleMenuSelect('file-list', item)"
                    >
                        <!-- 编辑状态显示输入框 -->
                        <input
                            v-if="editingItem && editingItem.id === item.id"
                            ref="editInput"
                            v-model="editingTitle"
                            class="edit-input"
                            @blur="saveEdit"
                            @keyup.enter="saveEdit"
                            @click.stop
                        />
                        <!-- 非编辑状态显示文本 -->
                        <span v-else>{{ item.title }}</span>
                        
                        <div class="dot-icon-wrapper" @click.stop="showDotPopover(item, $event)">
                            <img class="submenu-dot-icon" src="@/icons/dot.png" alt="更多操作" />
                            <!-- 弹窗 -->
                            <div 
                                v-if="showPopover && popoverItem && popoverItem.id === item.id" 
                                class="dot-popover"
                            >
                                <div class="popover-item" @click.stop="handleRename(item)">
                                    <img class="popover-icon" src="@/icons/edit.png" alt="重命名" />
                                    <span class="popover-text">重命名</span>
                                </div>
                                <div class="popover-divider"></div>
                                <div class="popover-item delete-item" @click.stop="handleDelete(item)">
                                    <img class="popover-icon" src="@/icons/trash.png" alt="删除" />
                                    <span class="popover-text">删除</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- 空状态提示 -->
                    <div v-if="documents.length === 0" class="submenu-empty">
                        暂无文件
                    </div>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
import { deleteDocument, getDocuments, updateDocument } from '@/api/documents';
import eventBus from '@/utils/eventBus';
import { toRaw } from 'vue';

export default {
    name: 'LeftSideBar',
    emits: ['menu-select', 'sidebar-toggle'],
    data() {
        return {
            activeMenu: 'home',
            documents: [],
            selectedFile: null,
            openSubmenus: ['files'], // 默认展开文件管理菜单
            loading: false,
            error: null,
            isCollapsed: false, // 新增：侧边栏收缩状态
            showText: true, // 新增：控制文字显示的状态（现在不再需要，但保留以避免报错）
            showPopover: false, // 控制弹窗显示
            popoverItem: null, // 当前弹窗关联的文档项
            editingItem: null, // 当前正在编辑的文档项
            editingTitle: '' // 编辑时的临时标题
        }
    },
    async created() {
        await this.loadDocuments();
    },
    mounted() {
        // 添加全局点击监听，点击外部关闭弹窗
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.dot-icon-wrapper')) {
                this.closePopover();
            }
        });
    },
    beforeUnmount() {
        // 组件销毁前移除监听器
        document.removeEventListener('click', this.closePopover);
    },
    methods: {
        async loadDocuments() {
            try {
                this.loading = true;
                this.error = null;
                const res = await getDocuments();
                this.documents = res?.items || [];
            } catch (error) {
                console.error('加载文档失败:', error);
                this.error = '文档加载失败';
                this.documents = [];
            } finally {
                this.loading = false;
            }
        },

        handleMenuSelect(index, item = null) {
            this.activeMenu = index;
            
            if (item) {
                this.selectedFile = item;
                // 使用 toRaw 获取原始对象
                const rawItem = toRaw(item);
                // 发射文件选择事件
                eventBus.emit('file-selected', { rawItem });
            } else {
                this.selectedFile = null;
            }

            // 向父组件发送菜单选择事件
            this.$emit('menu-select', index);
        },

        toggleSubmenu(menuKey) {
            const index = this.openSubmenus.indexOf(menuKey);
            if (index > -1) {
                this.openSubmenus.splice(index, 1);
            } else {
                this.openSubmenus.push(menuKey);
            }
        },

        // 刷新文档列表的方法
        async refreshDocuments() {
            await this.loadDocuments();
        },

        // 新增：切换侧边栏展开/收缩状态
        toggleSidebar() {
            if (this.isCollapsed) {
                // 展开：先展开容器，稍微延迟后显示文字
                this.isCollapsed = false;
                setTimeout(() => {
                    this.showText = true;
                }, 150); // 减少延迟时间，让文字更早出现
            } else {
                // 收缩：先隐藏文字，然后收缩容器
                this.showText = false;
                setTimeout(() => {
                    this.isCollapsed = true;
                }, 50);
            }
            
            console.log('侧边栏状态:', this.isCollapsed ? '收缩' : '展开');
            // 向父组件发送状态变化事件
            this.$emit('sidebar-toggle', this.isCollapsed);
        },

        // 新增：显示点图标弹窗
        showDotPopover(item) {
            if (this.showPopover && this.popoverItem?.id === item.id) {
                // 如果点击的是同一个item，关闭弹窗
                this.showPopover = false;
                this.popoverItem = null;
            } else {
                // 显示新的弹窗
                this.showPopover = true;
                this.popoverItem = item;
            }
        },

        // 新增：关闭弹窗
        closePopover() {
            this.showPopover = false;
            this.popoverItem = null;
        },

        // 新增：处理重命名
        handleRename(item) {
            // 关闭弹窗
            this.closePopover();
            
            // 进入编辑模式
            this.editingItem = item;
            this.editingTitle = item.title;
            
            // 在下一个tick中聚焦输入框
            this.$nextTick(() => {
                if (this.$refs.editInput && this.$refs.editInput.length > 0) {
                    const input = this.$refs.editInput.find(el => el);
                    if (input) {
                        input.focus();
                        input.select(); // 选中所有文本
                    }
                }
            });
        },

        // 新增：保存编辑
        async saveEdit() {
            if (!this.editingItem) return;

            // 如果标题没有改变，直接退出编辑模式
            if (this.editingTitle.trim() === this.editingItem.title) {
                this.exitEdit();
                return;
            }

            // 如果标题为空，不保存
            if (!this.editingTitle.trim()) {
                alert('文档标题不能为空');
                return;
            }

            try {
                // 调用更新API
                await updateDocument(this.editingItem.id, {
                    title: this.editingTitle.trim()
                });

                // 更新本地文档列表
                const index = this.documents.findIndex(doc => doc.id === this.editingItem.id);
                if (index > -1) {
                    this.documents[index].title = this.editingTitle.trim();
                }

                // 如果编辑的是当前选中文件，同步更新selectedFile
                if (this.selectedFile && this.selectedFile.id === this.editingItem.id) {
                    this.selectedFile.title = this.editingTitle.trim();
                    // 通知其他组件文件标题已更新
                    eventBus.emit('file-title-updated', {
                        item: this.selectedFile,
                        newTitle: this.editingTitle.trim()
                    });
                }

                console.log('文档重命名成功:', this.editingTitle.trim());
                this.exitEdit();

            } catch (error) {
                console.error('重命名文档失败:', error);
                alert('重命名失败，请重试。');
                // 不退出编辑模式，让用户可以重试
            }
        },

        // 新增：退出编辑模式
        exitEdit() {
            this.editingItem = null;
            this.editingTitle = '';
        },

        // 新增：处理删除
        async handleDelete(item) {
            try {
                // 显示确认对话框
                const confirmDelete = confirm(`确定要删除文档 "${item.title}" 吗？此操作不可撤销。`);
                if (!confirmDelete) {
                    this.closePopover();
                    return;
                }

                // 调用删除API
                await deleteDocument(item.id);
                
                // 删除成功后，从本地文档列表中移除
                const index = this.documents.findIndex(doc => doc.id === item.id);
                if (index > -1) {
                    this.documents.splice(index, 1);
                }

                // 如果删除的是当前选中的文件，清除选中状态
                if (this.selectedFile && this.selectedFile.id === item.id) {
                    this.selectedFile = null;
                    // 通知其他组件文件已被删除
                    eventBus.emit('file-deleted', { deletedItem: item });
                }

                console.log('文档删除成功:', item.title);
                this.closePopover();
                
            } catch (error) {
                console.error('删除文档失败:', error);
                alert('删除文档失败，请重试。');
                this.closePopover();
            }
        }
    }
}
</script>

<style scoped>
.left-side {
    width: 250px;
    height: 100%;
    background-color: #304156;
    box-shadow: 2px 0 6px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: width 0.3s ease;
}

/* 收缩状态的left-side */
.left-side.collapsed {
    width: 56px;
}

.sidebar-menu {
    width: 100%;
    background-color: #FFFFFF;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    transition: all 0.3s ease;
}

/* 收缩状态的sidebar-menu */
.sidebar-menu.collapsed {
    width: 56px;
    overflow: hidden;
}

/* 收缩状态下调整菜单项样式 */
.sidebar-menu.collapsed .menu-item {
    justify-content: center;
    padding: 0 16px;
}

.sidebar-menu.collapsed .menu-header {
    justify-content: center;
    padding: 0 16px;
}

.sidebar-menu.collapsed .menu-icon,
.sidebar-menu.collapsed .collapse-icon {
    margin-right: 0;
}

/* 收缩状态下确保所有图标都居中 */
.sidebar-menu.collapsed .collapse-control {
    justify-content: center;
}

/* 文字淡入淡出动画 */
.fade-in {
    opacity: 1;
    transition: opacity 0.3s ease;
}

.fade-out {
    opacity: 0;
    transition: opacity 0.2s ease;
}

/* 自定义侧边栏滚动条样式 */
.sidebar-menu::-webkit-scrollbar {
    width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
    background: #f5f5f5;
}

.sidebar-menu::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

/* 一级菜单项样式 */
.menu-item {
    height: 50px;
    line-height: 50px;
    padding: 0 24px;
    color: rgba(0, 0, 0, 0.75);
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    font-size: 16px;
    width: 200px; /* 固定宽度 */
    min-width: 200px; /* 防止压缩 */
    flex-shrink: 0; /* 不允许收缩 */
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.menu-item.active {
    background-color: rgba(64, 158, 255, 0.05);
    border-left-color: #409EFF;
    color: rgba(64, 158, 255, 0.95);
}

/* 展开/收缩控制按钮样式 */
.collapse-control {
    justify-content: flex-start;
}

.collapse-icon {
    width: 20px;
    height: 20px;
    margin-right: 10px; /* 与其他menu-icon保持一致的右边距 */
    transition: transform 0.3s ease;
}

.collapse-control:hover .collapse-icon {
    color: #409EFF;
}

/* 菜单组样式 */
.menu-header {
    height: 50px;
    line-height: 50px;
    padding: 0 24px;
    color: rgba(0, 0, 0, 0.75);
    cursor: pointer;
    border-left: 3px solid transparent;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 16px;
    width: 200px; /* 固定宽度 */
    min-width: 200px; /* 防止压缩 */
    flex-shrink: 0; /* 不允许收缩 */
}

.menu-header:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.menu-icon {
    width: 24px;
    height: 24px;
    margin-right: 10px;
}

.submenu-arrow {
    width: 12px;
    height: 12px;
    transition: transform 0.3s ease;
}

.submenu-arrow.expanded {
    transform: rotate(90deg);
}

/* 二级菜单样式 */
.submenu {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
    background-color: #ffffff;
}

.submenu.expanded {
    max-height: 60vh;
    overflow-y: auto;
}

/* 自定义子菜单滚动条样式 */
.submenu.expanded::-webkit-scrollbar {
    width: 6px;
}

.submenu.expanded::-webkit-scrollbar-track {
    background: #f5f5f5;
}

.submenu.expanded::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
}

.submenu.expanded::-webkit-scrollbar-thumb:hover {
    background: #909399;
}

.submenu-item {
    font-size: 14px;
    background-color: #FFFFFF;
    height: 45px;
    line-height: 45px;
    padding: 0 24px 0 56px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: space-between;
    white-space: nowrap;
    overflow: visible; /* 改为可见，让弹窗能够显示出来 */
    text-overflow: ellipsis;
    border-left: 3px solid transparent;
    width: 180px; /* 固定宽度 */
    min-width: 180px; /* 防止压缩 */
    flex-shrink: 0; /* 不允许收缩 */
    position: relative; /* 添加相对定位 */
}

.submenu-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.submenu-item.active {
    background-color: rgba(64, 158, 255, 0.05);
    border-left-color: #409EFF;
    color: #409EFF;
}

.submenu-item span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* 编辑输入框样式 */
.edit-input {
    flex: 1;
    border: 1px solid #409EFF;
    border-radius: 3px;
    padding: 2px 8px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.65);
    background-color: #fff;
    outline: none;
    margin-right: 8px;
}

.edit-input:focus {
    border-color: #409EFF;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
}

.submenu-dot-icon {
    width: 20px;
    height: 20px;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.dot-icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    z-index: 1500; /* 给包装器也设置z-index */
}

/* 确保有弹窗的submenu-item层级更高 */
.submenu-item:has(.dot-popover) {
    z-index: 1600;
}

/* 如果浏览器不支持:has，使用JavaScript类控制 */
.submenu-item.has-active-popover {
    z-index: 1600;
}

.submenu-item:hover .submenu-dot-icon {
    opacity: 1;
}

/* 弹窗样式 */
.dot-popover {
    position: absolute;
    top: 100%;
    right: 0;
    background: white;
    border: 1px solid #e4e7ed;
    border-radius: 6px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    min-width: 108px;
    padding: 6px 0;
}

.popover-item {
    height: 16px;
    display: flex;
    padding: 4px 16px;
    align-items: center;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.popover-item:hover {
    background-color: #f5f7fa;
}

.popover-item.delete-item {
    color: #f56c6c;
}

.popover-item.delete-item:hover {
    background-color: #fef0f0;
}

.popover-icon {
    width: 16px;
    height: 16px;
    margin-right: 12px;
    flex-shrink: 0;
}

.popover-text {
    font-size: 14px;
    font-weight: 400;
    flex: 1;
}

.popover-divider {
    height: 1px;
    background-color: #e4e7ed;
    margin: 4px 0;
}

.popover-content {
    padding: 8px 12px;
    font-size: 14px;
    color: rgba(0, 0, 0, 0.75);
    position: relative;
    z-index: 2001; /* 内容也设置高z-index */
}

.submenu-empty {
    padding: 20px 48px;
    color: rgba(0, 0, 0, 0.45);
    font-size: 14px;
    text-align: center;
}

.menu-title {
    flex: 1;
    font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .left-side {
        width: 200px;
    }
    
    .menu-item,
    .menu-header {
        padding: 0 16px;
        font-size: 14px;
    }
    
    .submenu-item {
        padding: 0 32px;
        font-size: 13px;
    }
}
</style>