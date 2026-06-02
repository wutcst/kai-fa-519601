<template>
  <div class="auth-card">
    <div class="auth-copy">
      <p class="section-label">{{ mode === 'login' ? 'Explorer Sign In' : 'New Explorer' }}</p>
      <h2>{{ mode === 'login' ? 'Resume Your Run' : 'Create Your Access Card' }}</h2>
      <p>
        {{
          mode === 'login'
            ? 'Use an existing explorer profile to enter the current adventure shell.'
            : 'Register a new explorer. The backend currently stores username, password, and an optional avatar.'
        }}
      </p>
    </div>

    <el-form :model="form" label-width="0" class="auth-form" @submit.prevent>
      <el-form-item>
        <el-input v-model="form.username" placeholder="用户名" size="large" />
      </el-form-item>
      <el-form-item>
        <el-input v-model="form.password" type="password" placeholder="密码" size="large" show-password />
      </el-form-item>
      <el-form-item v-if="mode === 'register'">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="确认密码"
          size="large"
          show-password
        />
      </el-form-item>
      <el-form-item v-if="mode === 'register'">
        <el-upload
          class="avatar-uploader"
          :auto-upload="false"
          :show-file-list="false"
          accept="image/*"
          :on-change="handleAvatarChange"
        >
          <div class="upload-box">
            <template v-if="form.avatarName">
              <span class="upload-title">已选择头像</span>
              <span class="upload-file">{{ form.avatarName }}</span>
            </template>
            <template v-else>
              <span class="upload-title">可选头像</span>
              <span class="upload-file">点击选择图片文件</span>
            </template>
          </div>
        </el-upload>
      </el-form-item>

      <div class="action-group">
        <el-button
          type="primary"
          class="submit-btn"
          :loading="submitting"
          @click="mode === 'login' ? handleLogin() : handleRegister()"
        >
          {{ mode === 'login' ? '登录并进入' : '注册新账号' }}
        </el-button>
        <button class="mode-switch" type="button" @click="toggleMode">
          {{ mode === 'login' ? '没有账号？切换到注册' : '已有账号？切换到登录' }}
        </button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { playerApi } from '@/api'

type Mode = 'login' | 'register'

const router = useRouter()
const mode = ref<Mode>('login')
const submitting = ref(false)
const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  avatarFile: null as File | null,
  avatarName: '',
})

function resetRegisterFields() {
  form.confirmPassword = ''
  form.avatarFile = null
  form.avatarName = ''
}

function toggleMode() {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  resetRegisterFields()
}

function handleAvatarChange(file: UploadFile, _files: UploadFiles) {
  form.avatarFile = file.raw ?? null
  form.avatarName = file.name
}

async function handleLogin() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }

  submitting.value = true
  try {
    const res = await playerApi.login({ username: form.username, password: form.password })
    if (res.data.code === 200) {
      localStorage.setItem('playerId', String(res.data.data.player_id))
      ElMessage.success('登录成功')
      router.push('/welcome/archive')
      return
    }
    ElMessage.error(res.data.message)
  } catch {
    ElMessage.error('登录失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}

async function handleRegister() {
  if (!form.username || !form.password) {
    ElMessage.warning('请输入用户名和密码')
    return
  }
  if (form.password !== form.confirmPassword) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  const fd = new FormData()
  fd.append('playerName', form.username)
  fd.append('password', form.password)
  if (form.avatarFile) {
    fd.append('avatar', form.avatarFile)
  }

  submitting.value = true
  try {
    const res = await playerApi.register(fd)
    if (res.data.code === 200) {
      ElMessage.success('注册成功，请使用新账号登录')
      mode.value = 'login'
      resetRegisterFields()
      return
    }
    ElMessage.error(res.data.message)
  } catch {
    ElMessage.error('注册失败，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.auth-card {
  width: min(100%, 430px);
  padding: 28px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(245, 241, 222, 0.96), rgba(235, 231, 214, 0.92));
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.7);
  color: #1d2432;
}

.auth-copy {
  margin-bottom: 24px;
}

.section-label {
  margin: 0 0 10px;
  color: #5d7040;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

h2 {
  margin: 0;
  font-size: 34px;
  line-height: 1;
}

.auth-copy p:last-child {
  margin: 14px 0 0;
  font-size: 14px;
  line-height: 1.7;
  color: #53616d;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 48px;
  border-radius: 14px;
  box-shadow: 0 0 0 1px rgba(29, 36, 50, 0.08) inset;
  background: rgba(255, 255, 255, 0.75);
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(93, 112, 64, 0.5) inset,
    0 0 0 4px rgba(194, 255, 114, 0.14);
}

.avatar-uploader {
  width: 100%;
}

.upload-box {
  width: 100%;
  padding: 14px 16px;
  border: 1px dashed rgba(29, 36, 50, 0.2);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.56);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.upload-title {
  font-size: 13px;
  font-weight: 700;
  color: #243140;
}

.upload-file {
  font-size: 13px;
  color: #66727a;
}

.action-group {
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.submit-btn {
  width: 100%;
  min-height: 48px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #566b2f, #7f5b35);
  box-shadow: 0 14px 30px rgba(86, 107, 47, 0.24);
}

.submit-btn:hover {
  filter: brightness(1.04);
}

.mode-switch {
  border: none;
  background: transparent;
  color: #465767;
  font-size: 14px;
  cursor: pointer;
}

.mode-switch:hover {
  color: #1d2432;
}

@media (max-width: 640px) {
  .auth-card {
    padding: 22px;
    border-radius: 20px;
  }

  h2 {
    font-size: 28px;
  }
}
</style>
