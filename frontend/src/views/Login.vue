<template>
  <div class="login-page">
    <div class="login-card">
      <!-- 标题区 -->
      <div class="card-header">
        <h2 class="card-title">
          <span class="title-icon">⚔️</span> Zuulventurers
        </h2>
        <p class="card-subtitle">{{ isRegisterMode ? '创建你的冒险者身份' : '欢迎回来，冒险者' }}</p>
      </div>

      <!-- 头像上传（仅注册模式） -->
      <div v-if="isRegisterMode" class="avatar-section">
        <div class="avatar-upload" @click="triggerFileInput">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileChange"
          />
          <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" alt="头像预览" />
          <div v-else class="avatar-placeholder">
            <span class="plus">+</span>
            <span>上传头像</span>
          </div>
        </div>
      </div>

      <!-- 表单区 -->
      <div class="card-form">
        <div class="form-group">
          <label>用户名</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="请输入用户名"
            class="form-input"
            @keyup.enter="handleSubmit"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            class="form-input"
            @keyup.enter="handleSubmit"
          />
        </div>

        <button class="submit-btn" :disabled="loading" @click="handleSubmit">
          {{ loading ? '处理中...' : isRegisterMode ? '注册' : '登录' }}
        </button>

        <div class="switch-row">
          <span>{{ isRegisterMode ? '已有账号？' : '没有账号？' }}</span>
          <a class="switch-link" @click="toggleMode">
            {{ isRegisterMode ? '去登录' : '去注册' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { playerApi } from '@/api'

const router = useRouter()

const isRegisterMode = ref(false)
const loading = ref(false)
const form = reactive({ username: '', password: '' })

// 头像相关
const fileInputRef = ref<HTMLInputElement | null>(null)
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string | null>(null)

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
  form.username = ''
  form.password = ''
  avatarFile.value = null
  avatarPreview.value = null
}

function triggerFileInput() {
  fileInputRef.value?.click()
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    avatarFile.value = input.files[0]
    avatarPreview.value = URL.createObjectURL(input.files[0])
  }
}

async function handleSubmit() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    if (isRegisterMode.value) {
      await doRegister()
    } else {
      await doLogin()
    }
  } finally {
    loading.value = false
  }
}

async function doLogin() {
  try {
    const res = await playerApi.login({ username: form.username, password: form.password })
    if (res.data.code === 200) {
      localStorage.setItem('playerId', String(res.data.data.playerId))
      router.push('/welcome/archive')
    } else {
      ElMessage.error(res.data.message || '登录失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || err.message || '登录请求失败')
  }
}

async function doRegister() {
  try {
    const fd = new FormData()
    fd.append('playerName', form.username)
    fd.append('password', form.password)
    if (avatarFile.value) {
      fd.append('avatar', avatarFile.value)
    }

    const res = await playerApi.register(fd)
    if (res.data.code === 200) {
      ElMessage.success('注册成功，请登录')
      toggleMode()
    } else {
      ElMessage.error(res.data.message || '注册失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || err.message || '注册请求失败')
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 400px;
  max-width: 90vw;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- 标题区 ---- */
.card-header {
  padding: 36px 36px 0;
  text-align: center;
}

.card-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 30px;
}

.card-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.55);
  font-size: 14px;
}

/* ---- 头像上传 ---- */
.avatar-section {
  display: flex;
  justify-content: center;
  padding: 24px 36px 0;
}

.avatar-upload {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 2px dashed rgba(255, 255, 255, 0.3);
  cursor: pointer;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s, background 0.3s;
}

.avatar-upload:hover {
  border-color: rgba(102, 126, 234, 0.7);
  background: rgba(102, 126, 234, 0.1);
}

.avatar-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255, 255, 255, 0.5);
}

.avatar-placeholder .plus {
  font-size: 28px;
  line-height: 1;
}

.avatar-placeholder span {
  font-size: 11px;
}

.avatar-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- 表单 ---- */
.card-form {
  padding: 28px 36px 36px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.7);
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  font-size: 15px;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  transition: border-color 0.3s, box-shadow 0.3s;
  outline: none;
  box-sizing: border-box;
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.form-input:focus {
  border-color: rgba(102, 126, 234, 0.6);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.15);
}

/* ---- 按钮 ---- */
.submit-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 18px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.35);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ---- 切换 ---- */
.switch-row {
  text-align: center;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.5);
}

.switch-link {
  color: #667eea;
  font-weight: 600;
  cursor: pointer;
  margin-left: 4px;
  transition: color 0.2s;
}

.switch-link:hover {
  color: #8b9cf7;
}

/* ---- 响应式 ---- */
@media (max-width: 480px) {
  .login-card {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .card-header {
    padding: 28px 24px 0;
  }

  .card-form {
    padding: 24px 24px 28px;
  }
}
</style>