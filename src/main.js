import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

// 手动导入 Element Plus 组件
import {
    ElButton,
    ElCard,
    ElCol,
    ElForm,
    ElFormItem,
    ElInput,
    ElMenu,
    ElMenuItem,
    ElMessage,
    ElMessageBox,
    ElRow,
    ElSubmenu
} from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

// 手动注册 Element Plus 组件
app.component('ElMenu', ElMenu)
app.component('ElMenuItem', ElMenuItem) 
app.component('ElSubmenu', ElSubmenu)
app.component('ElRow', ElRow)
app.component('ElCol', ElCol)
app.component('ElCard', ElCard)
app.component('ElForm', ElForm)
app.component('ElFormItem', ElFormItem)
app.component('ElInput', ElInput)
app.component('ElButton', ElButton)

// 全局配置 ElMessage 和 ElMessageBox
app.config.globalProperties.$message = ElMessage
app.config.globalProperties.$confirm = ElMessageBox.confirm

app.use(router)
app.use(store)

app.mount('#app')
