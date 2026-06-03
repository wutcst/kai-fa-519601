<template>
  <div class="auth-card">
    <aside class="auth-aside">
      <p class="section-label">{{ mode === 'login' ? 'Explorer Sign In' : 'New Explorer' }}</p>
      <h2>{{ mode === 'login' ? 'Resume Your Run' : 'Create Your Access Card' }}</h2>
      <p class="aside-copy">
        {{
          mode === 'login'
            ? 'Use an existing explorer profile to reach the character entry screen and continue into the current game shell.'
            : 'Create a new explorer with username, password, and an optional avatar upload supported by the backend.'
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
          <strong>Player endpoints are live</strong>
          <p>Login, register, profile lookup, and leaderboard are available now. Room and inventory actions remain disabled until the backend adds those routes.</p>
        </template>
        <template v-else>
          <div class="avatar-preview-shell">
            <div class="avatar-orb">
              <img v-if="avatarPreviewUrl" :src="avatarPreviewUrl" alt="avatar preview" />
              <span v-else>{{ previewInitial }}</span>
            </div>
            <div class="avatar-copy">
              <strong>{{ form.avatarName || 'No avatar selected' }}</strong>
              <p>{{ form.avatarName ? 'The image will be uploaded with the registration form.' : 'Avatar is optional. You can register without uploading a file.' }}</p>
            </div>
          </div>
        </template>
      </div>
    </aside>

    <section class="auth-main">
      <div class="main-head">
        <div>
          <p class="main-kicker">{{ mode === 'login' ? 'Account Access' : 'Explorer Setup' }}</p>
          <h3>{{ mode === 'login' ? 'Enter your account credentials' : 'Fill in the new explorer profile' }}</h3>
        </div>
        <button class="ghost-switch" type="button" @click="toggleMode">
          {{ mode === 'login' ? 'Switch To Register' : 'Switch To Login' }}
        </button>
      </div>

      <el-form :model="form" label-width="0" class="auth-form" @submit.prevent>
        <el-form-item>
          <div class="field-stack">
            <label>Username</label>
            <el-input v-model="form.username" placeholder="Enter username" size="large" />
          </div>
        </el-form-item>

        <el-form-item>
          <div class="field-stack">
            <label>Password</label>
            <el-input v-model="form.password" type="password" placeholder="Enter password" size="large" show-password />
          </div>
        </el-form-item>

        <el-form-item v-if="mode === 'register'">
          <div class="field-stack">
            <label>Confirm Password</label>
            <el-input
              v-model="form.confirmPassword"
              type="password"
              placeholder="Enter password again"
              size="large"
              show-password
            />
          </div>
        </el-form-item>

        <el-form-item v-if="mode === 'register'">
          <div class="field-stack">
            <label>Avatar File</label>
            <el-upload
              class="avatar-uploader"
              :auto-upload="false"
              :show-file-list="false"
              accept="image/*"
              :on-change="handleAvatarChange"
            >
              <div class="upload-box">
                <div class="upload-icon">{{ form.avatarName ? 'OK' : '+' }}</div>
                <div class="upload-meta">
                  <span class="upload-title">{{ form.avatarName ? 'Avatar selected' : 'Choose avatar file' }}</span>
                  <span class="upload-file">
                    {{ form.avatarName || 'Common image formats are supported. You can leave this empty.' }}
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
            {{ mode === 'login' ? 'Login And Continue' : 'Create Account' }}
          </el-button>
          <p class="action-note">
            {{ mode === 'login' ? 'A successful login takes you to the character entry screen.' : 'A successful registration switches you back to login mode.' }}
          </p>
        </div>
      </el-form>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
import type { UploadFile, UploadFiles } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMessage, getPayload, isSuccess, playerApi } from '@/api'
import { setStoredPlayerId } from '@/utils/session'

type Mode = 'login' | 'register'

const route = useRoute()
const router = useRouter()
const mode = ref<Mode>('login')
const submitting = ref(false)
const avatarPreviewUrl = ref('')

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  avatarFile: null as File | null,
  avatarName: '',
})

const previewInitial = computed(() => {
  const source = form.username.trim() || 'Z'
  return source.charAt(0).toUpperCase()
})

function revokeAvatarPreview() {
  if (avatarPreviewUrl.value) {
    URL.revokeObjectURL(avatarPreviewUrl.value)
    avatarPreviewUrl.value = ''
  }
}

function resetRegisterFields() {
  form.confirmPassword = ''
  form.avatarFile = null
  form.avatarName = ''
  revokeAvatarPreview()
}

function setMode(nextMode: Mode) {
  if (mode.value === nextMode) return
  mode.value = nextMode
  resetRegisterFields()
  void router.replace({
    path: '/welcome/login',
    query: nextMode === 'register' ? { mode: 'register' } : {},
  })
}

function toggleMode() {
  setMode(mode.value === 'login' ? 'register' : 'login')
}

function handleAvatarChange(file: UploadFile, _files: UploadFiles) {
  form.avatarFile = file.raw ?? null
  form.avatarName = file.name
  revokeAvatarPreview()
  if (file.raw) {
    avatarPreviewUrl.value = URL.createObjectURL(file.raw)
  }
}

async function handleLogin() {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('Please enter a username and password')
    return
  }

  submitting.value = true
  try {
    const response = await playerApi.login({
      username: form.username.trim(),
      password: form.password,
    })

    if (!isSuccess(response)) {
      ElMessage.error(getMessage(response, 'Login failed'))
      return
    }

    const payload = getPayload(response)
    setStoredPlayerId(payload.player_id)
    ElMessage.success('Login successful')
    await router.push('/welcome/archive')
  } catch {
    ElMessage.error('Login failed, please try again later')
  } finally {
    submitting.value = false
  }
}

async function handleRegister() {
  if (!form.username.trim() || !form.password) {
    ElMessage.warning('Please enter a username and password')
    return
  }

  if (form.password !== form.confirmPassword) {
    ElMessage.warning('The two passwords do not match')
    return
  }

  const formData = new FormData()
  formData.append('playerName', form.username.trim())
  formData.append('password', form.password)
  if (form.avatarFile) {
    formData.append('avatar', form.avatarFile)
  }

  submitting.value = true
  try {
    const response = await playerApi.register(formData)
    if (!isSuccess(response)) {
      ElMessage.error(getMessage(response, 'Registration failed'))
      return
    }

    ElMessage.success('Registration successful, please sign in with the new account')
    form.password = ''
    resetRegisterFields()
    setMode('login')
  } catch {
    ElMessage.error('Registration failed, please try again later')
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(() => {
  revokeAvatarPreview()
})

watch(
  () => route.query.mode,
  (queryMode) => {
    const nextMode: Mode = queryMode === 'register' ? 'register' : 'login'
    if (mode.value !== nextMode) {
      mode.value = nextMode
      resetRegisterFields()
    }
  },
  { immediate: true },
)
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
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.main-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.main-kicker {
  margin: 0 0 10px;
  color: #6f7a4d;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.main-head h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1.1;
}

.ghost-switch {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid rgba(29, 36, 50, 0.12);
  background: rgba(255, 255, 255, 0.7);
  color: #39424d;
  cursor: pointer;
}

.auth-form {
  display: grid;
  gap: 8px;
}

.field-stack {
  width: 100%;
  display: grid;
  gap: 10px;
}

.field-stack label {
  font-size: 13px;
  font-weight: 600;
  color: #4a5560;
}

.avatar-uploader {
  width: 100%;
}

.upload-box {
  width: 100%;
  min-height: 82px;
  padding: 16px;
  border-radius: 18px;
  border: 1px dashed rgba(29, 36, 50, 0.18);
  background: rgba(255, 255, 255, 0.56);
  display: flex;
  align-items: center;
  gap: 14px;
}

.upload-icon {
  width: 42px;
  height: 42px;
  border-radius: 14px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(94, 109, 64, 0.9), rgba(143, 98, 56, 0.9));
  color: #f8f3e4;
  font-weight: 700;
}

.upload-meta {
  display: grid;
  gap: 6px;
}

.upload-title {
  font-size: 15px;
  font-weight: 600;
}

.upload-file {
  color: #6b7177;
  font-size: 13px;
}

.action-group {
  margin-top: 8px;
  display: grid;
  gap: 12px;
}

.submit-btn {
  min-height: 48px;
  border-radius: 16px;
  font-weight: 600;
}

.action-note {
  color: #6d7379;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 860px) {
  .auth-card {
    grid-template-columns: 1fr;
  }

  .auth-main {
    padding: 26px;
  }
}

@media (max-width: 640px) {
  .auth-aside,
  .auth-main {
    padding: 22px;
  }

  .main-head {
    flex-direction: column;
  }

  .ghost-switch {
    width: 100%;
  }
}
</style>
