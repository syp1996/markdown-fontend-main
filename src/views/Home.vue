<template>
  <div class="home">
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>用户登录</span>
          </template>
          <el-form :model="loginForm" :rules="loginRules" ref="loginForm" label-width="80px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="loginForm.username" placeholder="请输入用户名"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="loginForm.password" type="password" placeholder="请输入密码"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleLogin" :loading="loading">登录</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card>
          <template #header>
            <span>项目信息</span>
          </template>
          <p>这是一个基于Vue2 + Vue CLI的前端项目，集成了以下功能：</p>
          <ul>
            <li>Vue Router 路由管理</li>
            <li>Vuex 状态管理</li>
            <li>Element UI 组件库</li>
            <li>Axios HTTP请求库</li>
            <li>请求/响应拦截器</li>
            <li>API接口封装</li>
          </ul>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { login } from '@/api/user'
import authManager from '@/utils/auth'

export default {
  name: 'HomePage',
  data() {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ]
      },
      loading: false
    }
  },
  methods: {
    handleLogin() {
      this.$refs.loginForm.validate(async (valid) => {
        if (valid) {
          this.loading = true
          try {
            console.log('开始登录请求...')
            const response = await login(this.loginForm)
            console.log('登录响应完整数据:', response)
            
            this.$message.success('登录成功！')
            
            // 保存token到本地存储
            let token = null
            let userInfo = {}
            
            // 尝试从不同字段获取token
            if (response.token) {
              token = response.token
            } else if (response.data && response.data.token) {
              token = response.data.token
            } else if (response.access_token) {
              token = response.access_token
            }
            
            // 尝试从不同字段获取用户信息
            if (response.user) {
              userInfo = response.user
            } else if (response.data && response.data.user) {
              userInfo = response.data.user
            } else if (response.username) {
              userInfo = { username: response.username }
            }
            
            console.log('提取的token:', token)
            console.log('提取的用户信息:', userInfo)
            
            if (token) {
              authManager.setToken(token)
              authManager.setUserInfo(userInfo)
              console.log('Token和用户信息已保存到安全存储')
              
              // 跳转到Dashboard页面
              console.log('准备跳转到Dashboard...')
              this.$router.push('/dashboard')
            } else {
              console.warn('未找到token，但登录成功')
              this.$message.warning('登录成功，但未获取到token')
            }
          } catch (error) {
            console.error('登录失败:', error)
            this.$message.error('登录失败：' + (error.message || '未知错误'))
          } finally {
            this.loading = false
          }
        }
      })
    },
    resetForm() {
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.el-card {
  margin-bottom: 20px;
}

ul {
  margin: 10px 0;
  padding-left: 20px;
}

li {
  margin: 5px 0;
}
</style>
