<template>
    <div class="system-settings">
        <div class="page-header">
            <h1>系统设置</h1>
        </div>
        <div class="page-content">
            <TiptapEditor v-model="content" placeholder="开始输入..." height="400px" @change="handleChange" />
        </div>
    </div>
</template>

<script>
import TiptapEditor from '../../components/TiptapEditor.vue';
export default {
    name: 'SystemSettings',
    components: {
        TiptapEditor
    },
    data() {
        return {

        }
    }
}
</script>

<style scoped>
.system-settings {
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
