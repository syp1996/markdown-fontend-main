<template>
    <div class="top-bar">
        <div class="top-bar-content">
            <div class="user-section">
                <!-- <el-dropdown @command="handleCommand">
                    <span class="user-info">
                        <i class="user-avatar">👤</i>
                        <span class="username">{{ username }}</span>
                        <i class="el-icon-arrow-down"></i>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item command="profile">个人信息</el-dropdown-item>
                            <el-dropdown-item command="settings">设置</el-dropdown-item>
                            <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown> -->
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'AppTopbar',
    data() {
        return {
            username: '用户'
        }
    },
    created() {
        this.getUserInfo()
    },
    methods: {
        getUserInfo() {
            try {
                const userInfoStr = localStorage.getItem('userInfo')
                if (userInfoStr) {
                    const userInfo = JSON.parse(userInfoStr)
                    this.username = userInfo.username || userInfo.name || '用户'
                }
            } catch (error) {
                console.error('获取用户信息失败：', error)
            }
        },
        handleCommand(command) {
            this.$emit('command', command)
        }
    }
}
</script>

<style scoped>
.top-bar {
    width: 100%;
    height: 48px;
    background-color: #ffffff;
    border-bottom: 1px solid #e8e8e8;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    z-index: 1000;
}

.top-bar-content {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
}

.logo-section .logo {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: rgba(64, 158, 255, 0.95);
}

.user-section .user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 8px 12px;
    border-radius: 6px;
    transition: background-color 0.2s;
}

.user-section .user-info:hover {
    background-color: #f5f5f5;
}

.user-avatar {
    font-size: 20px;
    margin-right: 8px;
}

.username {
    margin-right: 8px;
    color: rgba(64, 158, 255, 0.95);
    font-size: 14px;
}
</style>