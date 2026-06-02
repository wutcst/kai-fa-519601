<template>
  <div class="auth-card">
    <aside class="auth-aside">
      <p class="section-label">{{ mode === 'login' ? 'Explorer Sign In' : 'New Explorer' }}</p>
      <h2>{{ mode === 'login' ? 'Resume Your Run' : 'Create Your Access Card' }}</h2>
      <p class="aside-copy">
        {{
          mode === 'login'
            ? 'Log in with an existing profile and continue from the current player shell.'
            : 'Register a fresh explorer profile. Username, password, and an optional avatar are already supported by the backend.'
        }}
      </p>

      <div class="mode-pills">
        <button class="mode-pill" :class="{ active: mode === 'login' }" type="button" @click="setMode('login')">
          登录
        </button>
        <button
          class="mode-pill"
          :class="{ active: mode === 'register' }"
          type="button"
          @click="setMode('register')"
        >
          注册
        </button>
      </div>

      <div class="aside-panel">
        <template v-if="mode === 'login'">
          <div class="panel-kicker">Current Access</div>
          <strong>玩家接口已接通</strong>
          <p>登录、注册、读取角色信息与排行榜已可用，后续页面会继续接主界面和占位交互。</p>
        </template>
        <template v-else>
          <div class="avatar-preview-shell">
            <div class="avatar-orb">
              <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="avatar preview" />
              <span v-else>{{ previewInitial }}</span>
            </div>
            <div class="avatar-copy">
              <strong>{{ form.avatarName || '未选择头像' }}</strong>
              <p>{{ form.avatarName ? '注册时将随表单上传头像文件。' : '头像可选，不上传也能完成注册。' }}</p>
            </div>
          </div>
        </template>
      </div>
    </aside>

    <section class="auth-main">
      <div class="main-head">
        <div>
          <p class="main-kicker">{{ mode === 'login' ? 'Account Access' : 'Explorer Setup' }}</p>
          <h3>{{ mode === 'login' ? '输入你的账号信息' : '填写角色注册信息' }}</h3>
        </div>
        <button class="ghost-switch" type="button" @click="toggleMode">
          {{ mode === 'login' ? '去注册' : '去登录' }}
        </button>
      </div>

      <el-form :model="form" label-width="0" class="auth-form" @submit.prevent>
        <el-form-item>
          <div class="field-stack">
            <label>用户名</label>
            <el-input v-model="form.username" placeholder="输入用户名" size="large" />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="field-stack">
            <label>密码</label>
            <el-input v-model="form.password" type="password" placeholder="输入密码" size="large" show-password />
          </div>
        </el-form-item>

        <el-form-item v-if="mode === 'register'">
          <div class="field-stack">
            <label>确认密码</label>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              size="large"
              show-password
            />
          </div>
        </el-form-item>

        <el-form-item v-if="mode === 'register'">
          <div class="field-stack">
            <label>头像文件</label>
            <el-upload
              class="avatar-uploader"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleAvatarChange"
            >
              <div class="upload-box">
                <div class="upload-icon">{{ form.avatarName ? '◎' : '+' }}</div>
                <div class="upload-meta">
                  <span class="upload-title">{{ form.avatarName ? '已选择头像文件' : '选择头像文件' }}</span>
                  <span class="upload-file">
                    {{ form.avatarName || '支持常见图片格式，可留空直接注册。' }}
                  </span>
                </div>
              </div>
            </el-upload>
          </div>
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
          <p class="action-note">
            {{ mode === 'login' ? '登录成功后会进入角色入口页。' : '注册成功后会自动切回登录模式。' }}
          </p>
        </div>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
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

const avatarPreviewUrl = ref('')

const previewInitial = computed(() => {
  const source = form.username.trim() || 'Z'
  return source.charAt(0).toUpperCase()
})

function resetRegisterFields() {
  form.confirmPassword = ''
  form.avatarFile = null
  form.avatarName = ''
  avatarPreviewUrl.value = ''
}

function setMode(nextMode: Mode) {
  if (mode.value === nextMode) return
  mode.value = nextMode
  resetRegisterFields()
}

function toggleMode() {
  setMode(mode.value === 'login' ? 'register' : 'login')
}

function handleAvatarChange(file: UploadFile, _files: UploadFiles) {
  form.avatarFile = file.raw ?? null
  form.avatarName = file.name
  if (file.raw) {
    avatarPreviewUrl.value = URL.createObjectURL(file.raw)
  } else {
    avatarPreviewUrl.value = ''
  }
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
      setMode('login')
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
  width: min(100%, 920px);
  display: grid;
  grid-template-columns: minmax(240px, 320px) minmax(0, 1fr);
  border-radius: 30px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(244, 240, 226, 0.96), rgba(230, 225, 209, 0.93));
  border: 1px solid rgba(255, 255, 255, 0.42);
  box-shadow:
    0 28px 80px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  color: #1d2432;
}

.auth-aside {
  padding: 32px 28px;
  background:
    radial-gradient(circle at top left, rgba(194, 255, 114, 0.2), transparent 36%),
    linear-gradient(180deg, rgba(16, 23, 35, 0.96), rgba(22, 33, 50, 0.96));
  color: #eef3df;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-label {
  margin: 0;
  color: #c2ff72;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.auth-aside h2 {
  margin: 0;
  font-size: 34px;
  line-height: 0.98;
}

.aside-copy {
  margin: 0;
  color: #bfcad1;
  line-height: 1.8;
}

.mode-pills {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  padding: 6px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
}

.mode-pill {
  min-height: 42px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #dbe3d9;
  cursor: pointer;
  transition: all 0.2s ease;
}

.mode-pill.active {
  background: rgba(194, 255, 114, 0.2);
  color: #f6faef;
  box-shadow: inset 0 0 0 1px rgba(194, 255, 114, 0.2);
}

.aside-panel {
  margin-top: auto;
  padding: 18px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.panel-kicker {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9fb39f;
}

.aside-panel strong,
.avatar-copy strong {
  display: block;
  margin-top: 8px;
  font-size: 18px;
}

.aside-panel p,
.avatar-copy p {
  margin: 10px 0 0;
  color: #b9c5cb;
  line-height: 1.7;
  font-size: 14px;
}

.avatar-preview-shell {
  display: grid;
  gap: 14px;
}

.avatar-orb {
  width: 84px;
  height: 84px;
  border-radius: 22px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(194, 255, 114, 0.22), rgba(228, 137, 71, 0.22));
  color: #f3f7eb;
  font-size: 32px;
  font-weight: 700;
}

.avatar-orb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.auth-main {
  padding: 30px;
}

.main-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 26px;
}

.main-kicker {
  margin: 0 0 8px;
  color: #718070;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.main-head h3 {
  margin: 0;
  font-size: 30px;
  line-height: 1;
}

.ghost-switch {
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid rgba(29, 36, 50, 0.12);
  background: rgba(255, 255, 255, 0.62);
  color: #324252;
  cursor: pointer;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 16px;
}

.field-stack {
  width: 100%;
  display: grid;
  gap: 8px;
}

.field-stack label {
  font-size: 13px;
  color: #576572;
}

.auth-form :deep(.el-input__wrapper) {
  min-height: 52px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 0 0 1px rgba(29, 36, 50, 0.08) inset;
}

.auth-form :deep(.el-input__wrapper.is-focus) {
  box-shadow:
    0 0 0 1px rgba(93, 112, 64, 0.52) inset,
    0 0 0 4px rgba(194, 255, 114, 0.12);
}

.avatar-uploader {
  width: 100%;
}

.upload-box {
  width: 100%;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  border-radius: 18px;
  border: 1px dashed rgba(29, 36, 50, 0.2);
  background: rgba(255, 255, 255, 0.6);
}

.upload-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #566b2f, #7f5b35);
  color: #f5f2e5;
  font-size: 18px;
}

.upload-meta {
  display: grid;
  gap: 3px;
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
  display: grid;
  gap: 10px;
}

.submit-btn {
  width: 100%;
  min-height: 52px;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #566b2f, #7f5b35);
  box-shadow: 0 16px 34px rgba(86, 107, 47, 0.24);
}

.submit-btn:hover {
  filter: brightness(1.04);
}

.action-note {
  margin: 0;
  font-size: 13px;
  color: #6b7680;
}

@media (max-width: 860px) {
  .auth-card {
    grid-template-columns: 1fr;
  }

  .auth-aside,
  .auth-main {
    padding: 24px;
  }

  .aside-panel {
    margin-top: 0;
  }
}

@media (max-width: 640px) {
  .auth-card {
    border-radius: 22px;
  }

  .auth-aside,
  .auth-main {
    padding: 20px;
  }

  .auth-aside h2,
  .main-head h3 {
    font-size: 28px;
  }

  .main-head {
    flex-direction: column;
    align-items: stretch;
  }

  .ghost-switch {
    width: 100%;
  }
}
</style>
