<template>
    <div class="left-side">
        <nav class="sidebar-menu">
            <!-- 搜索菜单 -->
            <div class="menu-item" @click="handleMenuSelect('search')">
                <img class="menu-icon" src="@/icons/search.png" alt="搜索图标" />
                <span class="menu-title">搜索</span>
            </div>

            <!-- 首页菜单 -->
            <div class="menu-item" @click="handleMenuSelect('home')">
                <img class="menu-icon" src="@/icons/home.png" alt="首页图标" />
                <span class="menu-title">主页</span>
            </div>

            <!-- 文件管理 -->
            <div class="menu-group">
                <div class="menu-header" @click="toggleSubmenu('files')">
                    <img class="menu-icon" src="@/icons/files.png" alt="文件管理图标" />
                    <span class="menu-title">文件管理</span>
                    <img 
                        class="submenu-arrow" 
                        :class="{ 'expanded': openSubmenus.includes('files') }"
                        src="@/icons/CaretDown.png" 
                        alt="展开箭头"
                    />
                </div>
                <div class="submenu" :class="{ 'expanded': openSubmenus.includes('files') }">
                    <div 
                        v-for="item in documents" 
                        :key="item.id"
                        class="submenu-item" 
                        :title="item.title"
                        @click="handleMenuSelect('file-list', item)"
                    >
                        <span>{{ item.title }}</span>
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
import { getDocuments } from '@/api/documents';
import eventBus from '@/utils/eventBus';
import { toRaw } from 'vue';

export default {
    name: 'LeftSideBar',
    emits: ['menu-select'],
    data() {
        return {
            activeMenu: 'home',
            documents: [],
            selectedFile: null,
            openSubmenus: ['files'], // 默认展开文件管理菜单
            loading: false,
            error: null
        }
    },
    async created() {
        await this.loadDocuments();
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
}

.sidebar-menu {
    width: 100%;
    background-color: #FFFFFF;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
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
}

.menu-item:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

.menu-item.active {
    background-color: rgba(64, 158, 255, 0.05);
    border-left-color: #409EFF;
    color: rgba(64, 158, 255, 0.95);
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
    padding: 0 48px;
    color: rgba(0, 0, 0, 0.65);
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    border-left: 3px solid transparent;
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