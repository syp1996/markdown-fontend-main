<template>
  <div class="project-management">
    <div class="page-header">
      <h1>项目管理</h1>
    </div>
    <div class="page-content">
        <LexicalEditor/>
    </div>
  </div>
</template>

<script>
import LexicalEditor from '@/components/LexicalEditor.vue';
// import SimpleLexicalEditor from '@/components/SimpleLexicalEditor.vue';
export default {
    name: 'ProjectManagement',
    components: {
        // SimpleLexicalEditor,
        LexicalEditor
    },
  data() {
    return {
      
    }
  }
}
</script>

<style scoped>
.project-management {
  padding: 20px;
  height: 100%;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.page-content {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  min-height: 400px;
}
</style>
