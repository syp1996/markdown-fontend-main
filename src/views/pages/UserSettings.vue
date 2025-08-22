<template>
  <div class="user-settings-page">
    <div class="page-header">
      <h2>⚙️ 系统设置</h2>
      <p>个性化您的使用体验</p>
    </div>
    
    <div class="settings-container">
      <div class="settings-section">
        <h3>🎨 主题设置</h3>
        <div class="setting-item">
          <label>主题模式：</label>
          <select v-model="selectedTheme" @change="changeTheme">
            <option value="light">浅色主题</option>
            <option value="dark">深色主题</option>
            <option value="auto">跟随系统</option>
          </select>
        </div>
        
        <div class="setting-item">
          <label>主色调：</label>
          <input 
            type="color" 
            v-model="primaryColor" 
            @change="changePrimaryColor"
            class="color-picker"
          >
        </div>
      </div>
      
      <div class="settings-section">
        <h3>📱 界面设置</h3>
        <div class="setting-item">
          <label>侧边栏宽度：</label>
          <input 
            type="range" 
            v-model="sidebarWidth" 
            min="200" 
            max="300" 
            step="10"
            @input="changeSidebarWidth"
          >
          <span class="range-value">{{ sidebarWidth }}px</span>
        </div>
        
        <div class="setting-item">
          <label>字体大小：</label>
          <select v-model="fontSize" @change="changeFontSize">
            <option value="12">12px</option>
            <option value="14" selected>14px</option>
            <option value="16">16px</option>
            <option value="18">18px</option>
          </select>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>🔔 通知设置</h3>
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="emailNotifications">
            邮件通知
          </label>
        </div>
        
        <div class="setting-item">
          <label>
            <input type="checkbox" v-model="browserNotifications">
            浏览器通知
          </label>
        </div>
      </div>
      
      <div class="settings-section">
        <h3>💾 数据设置</h3>
        <div class="setting-item">
          <button class="action-btn" @click="exportData">导出数据</button>
          <button class="action-btn" @click="importData">导入数据</button>
        </div>
        
        <div class="setting-item">
          <button class="action-btn danger" @click="clearData">清空数据</button>
        </div>
      </div>
      
      <div class="settings-actions">
        <button class="action-btn primary" @click="saveSettings">保存设置</button>
        <button class="action-btn" @click="resetSettings">重置设置</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UserSettings',
  data() {
    return {
      selectedTheme: 'light',
      primaryColor: '#409eff',
      sidebarWidth: 250,
      fontSize: '14',
      emailNotifications: true,
      browserNotifications: false
    }
  },
  methods: {
    changeTheme() {
      this.$message.info(`主题已切换到：${this.selectedTheme}`)
    },
    
    changePrimaryColor() {
      this.$message.info(`主色调已更改为：${this.primaryColor}`)
    },
    
    changeSidebarWidth() {
      this.$message.info(`侧边栏宽度已调整为：${this.sidebarWidth}px`)
    },
    
    changeFontSize() {
      this.$message.info(`字体大小已调整为：${this.fontSize}px`)
    },
    
    exportData() {
      this.$message.info('数据导出功能开发中...')
    },
    
    importData() {
      this.$message.info('数据导入功能开发中...')
    },
    
    clearData() {
      if (confirm('确定要清空所有数据吗？此操作不可恢复！')) {
        this.$message.success('数据已清空')
      }
    },
    
    saveSettings() {
      this.$message.success('设置已保存')
    },
    
    resetSettings() {
      if (confirm('确定要重置所有设置吗？')) {
        this.selectedTheme = 'light'
        this.primaryColor = '#409eff'
        this.sidebarWidth = 250
        this.fontSize = '14'
        this.emailNotifications = true
        this.browserNotifications = false
        this.$message.success('设置已重置')
      }
    }
  }
}
</script>

<style scoped>
.user-settings-page {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e8eaec;
}

.page-header h2 {
  margin: 0 0 8px 0;
  color: #17233d;
}

.page-header p {
  margin: 0;
  color: #808695;
}

.settings-container {
  max-width: 800px;
}

.settings-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: #17233d;
  font-size: 1.2em;
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 12px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item label {
  min-width: 120px;
  color: #606266;
  font-weight: 500;
}

.setting-item select,
.setting-item input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.setting-item input[type="checkbox"] {
  margin-right: 8px;
}

.color-picker {
  width: 40px;
  height: 36px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.range-value {
  min-width: 60px;
  text-align: right;
  color: #909399;
  font-size: 14px;
}

.settings-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 30px;
}

.action-btn {
  padding: 10px 20px;
  border: 1px solid #d9d9d9;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.action-btn:hover {
  border-color: #409eff;
  color: #409eff;
}

.action-btn.primary {
  background: #409eff;
  color: white;
  border-color: #409eff;
}

.action-btn.primary:hover {
  background: #66b1ff;
}

.action-btn.danger {
  border-color: #f56c6c;
  color: #f56c6c;
}

.action-btn.danger:hover {
  background: #f56c6c;
  color: white;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .setting-item label {
    min-width: auto;
  }
  
  .setting-item select,
  .setting-item input[type="range"] {
    max-width: none;
    width: 100%;
  }
  
  .settings-actions {
    flex-direction: column;
  }
}
</style>
