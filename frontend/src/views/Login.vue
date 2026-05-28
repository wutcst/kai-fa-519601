<template>
  <div class="login-card">
    <h2>Zuulventurers</h2>
    <el-form :model="form" label-width="0">
      <el-form-item>
        <el-input v-model="form.username" placeholder="用户名" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.password" type="password" placeholder="密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" class="full-btn" @click="handleLogin">登录</el-button>
      </el-form-item>
      <el-form-item>
        <el-button class="full-btn" @click="handleRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { playerApi } from '@/api'

const router = useRouter()
const form = reactive({ username: '', password: '' })

async function handleLogin() {
  const res = await playerApi.login({ username: form.username, password: form.password })
  if (res.data.code === 200) {
    localStorage.setItem('playerId', res.data.data.player_id)
    router.push('/welcome/archive')
  } else {
    ElMessage.error(res.data.message)
  }
}

async function handleRegister() {
  const fd = new FormData()
  fd.append('playerName', form.username)
  fd.append('password', form.password)
  const res = await playerApi.register(fd)
  if (res.data.code === 200) {
    ElMessage.success('注册成功，请登录')
  } else {
    ElMessage.error(res.data.message)
  }
}
</script>

<style scoped>
.login-card {
  width: 360px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

h2 {
  text-align: center;
  color: #fff;
  margin-bottom: 24px;
}

.full-btn {
  width: 100%;
}
</style>