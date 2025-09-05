<template>
  <div class="settings-page">
    <div class="settings-header">
      <h1 class="settings-title">设置</h1>
      <p class="settings-subtitle">管理您的应用偏好设置</p>
    </div>
    
    <div class="settings-content">
      <div class="settings-placeholder">
        <div class="placeholder-icon">⚙️</div>
        <h2 class="placeholder-title">设置功能开发中</h2>
        <p class="placeholder-description">
          我们正在努力开发设置功能，敬请期待...
        </p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SettingsPage',
  data() {
    return {
      
    }
  },
  methods: {
    
  }
}
</script>

<style scoped>
.settings-page {
  height: 100%;
  background-color: #FBFBFA;
  display: flex;
  flex-direction: column;
}

.settings-header {
  padding: 32px 40px 24px 40px;
  border-bottom: 1px solid #e8eaec;
  background: white;
}

.settings-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 8px 0;
}

.settings-subtitle {
  font-size: 16px;
  color: #909399;
  margin: 0;
}

.settings-content {
  flex: 1;
  padding: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-placeholder {
  text-align: center;
  max-width: 400px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

.placeholder-title {
  font-size: 24px;
  font-weight: 500;
  color: #303133;
  margin: 0 0 16px 0;
}

.placeholder-description {
  font-size: 16px;
  color: #909399;
  line-height: 1.5;
  margin: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-header {
    padding: 20px 24px 16px 24px;
  }
  
  .settings-title {
    font-size: 24px;
  }
  
  .settings-subtitle {
    font-size: 14px;
  }
  
  .settings-content {
    padding: 32px 24px;
  }
  
  .placeholder-icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  .placeholder-title {
    font-size: 20px;
  }
  
  .placeholder-description {
    font-size: 14px;
  }
}
</style>