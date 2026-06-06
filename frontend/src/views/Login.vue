<template>
  <div class="login-page">
    <!-- ========== Start Screen ========== -->
    <transition
      name="screen-fade"
      mode="out-in"
    >
      <div
        v-if="showStartScreen"
        key="start"
        class="start-screen"
        @click="enterWelcome"
      >
        <div class="start-content">
          <div class="start-text">
            <h1 class="start-title">
              Zuulventurers
            </h1>
            <p class="start-prompt">
              点击屏幕开始
            </p>
            <div class="click-indicator">
              <div class="ripple" />
              <div class="ripple" />
              <div class="ripple" />
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- ========== Welcome Screen ========== -->
    <transition
      name="screen-fade"
      mode="out-in"
    >
      <div
        v-if="showWelcome"
        key="welcome"
        class="welcome-screen"
      >
        <div class="welcome-content">
          <h1 class="game-title">
            Zuulventurers
          </h1>
          <p class="game-subtitle">
            开启你的史诗冒险之旅
          </p>

          <div class="welcome-buttons">
            <button
              class="welcome-btn start-btn"
              @click="startAuth"
              @mouseenter="addGlowEffect"
              @mouseleave="removeGlowEffect"
            >
              <span>登录 / 注册</span>
            </button>

            <button
              class="welcome-btn intro-btn"
              @click="showGameIntro"
              @mouseenter="addGlowEffect"
              @mouseleave="removeGlowEffect"
            >
              <span>游戏介绍</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- ========== Auth Card ========== -->
    <transition
      name="screen-fade"
      mode="out-in"
    >
      <div
        v-if="showAuth"
        key="auth"
        class="auth-container"
        :class="{ 'register-mode': isRegisterMode }"
      >
        <!-- 关闭按钮 -->
        <button
          class="close-button"
          :disabled="loading"
          title="返回主页"
          @click="backToWelcome"
        >
          ×
        </button>

        <!-- 左侧视觉面板 -->
        <div class="auth-image">
          <!-- 登录模式：显示背景图 -->
          <template v-if="!isRegisterMode">
            <img
              src="/images/login-bg.png"
              class="login-bg"
              alt="login splash"
            >
          </template>
          <!-- 注册模式：显示默认头像说明 -->
          <template v-else>
            <div class="default-avatar-panel">
              <div class="default-avatar-card">
                <div class="default-avatar-circle">
                  Z
                </div>
                <p class="default-avatar-title">
                  默认头像
                </p>
                <p class="default-avatar-text">
                  当前版本注册后将统一分配系统默认头像，无需手动上传。
                </p>
              </div>
            </div>
          </template>
        </div>

        <!-- 右侧表单面板 -->
        <transition
          name="fade-slide"
          mode="out-in"
        >
          <!-- ===== 登录表单 ===== -->
          <div
            v-if="!isRegisterMode"
            key="login"
            class="auth-form"
          >
            <h2 class="form-title">
              登录游戏
            </h2>

            <form @submit.prevent="handleLogin">
              <div class="form-group">
                <label for="login-username">用户名</label>
                <input
                  id="login-username"
                  v-model.trim="loginData.username"
                  type="text"
                  placeholder="请输入用户名"
                  required
                >
              </div>

              <div class="form-group">
                <label for="login-password">密码</label>
                <input
                  id="login-password"
                  v-model="loginData.password"
                  type="password"
                  placeholder="请输入密码"
                  required
                >
              </div>

              <div class="checkbox-group">
                <input
                  id="remember"
                  v-model="loginData.rememberMe"
                  type="checkbox"
                >
                <label for="remember">记住我</label>
                <a
                  class="forgot-password"
                  href="#"
                >忘记密码?</a>
              </div>

              <button
                class="submit-button"
                type="submit"
                :disabled="loading"
              >
                {{ loading ? '登录中…' : '开始冒险吧！' }}
              </button>
            </form>

            <button
              class="switch-button"
              :disabled="loading"
              @click="toggleMode"
            >
              注册新账号
            </button>
          </div>

          <!-- ===== 注册表单 ===== -->
          <div
            v-else
            key="register"
            class="auth-form"
          >
            <h2 class="form-title">
              创建新账号
            </h2>

            <div class="default-avatar-tip">
              <span class="default-avatar-badge">默认头像</span>
              <p>注册成功后系统会自动分配头像，当前页面不再提供上传入口。</p>
            </div>

            <form @submit.prevent="handleRegister">
              <div class="form-group">
                <label for="reg-username">用户名</label>
                <input
                  id="reg-username"
                  v-model.trim="registerData.username"
                  type="text"
                  placeholder="请输入用户名"
                  required
                >
              </div>

              <div class="form-group">
                <label for="reg-password">密码</label>
                <input
                  id="reg-password"
                  v-model="registerData.password"
                  type="password"
                  placeholder="请输入密码"
                  required
                >
              </div>

              <div class="form-group">
                <label for="reg-confirm">确认密码</label>
                <input
                  id="reg-confirm"
                  v-model="registerData.confirm"
                  type="password"
                  placeholder="请再次输入密码"
                  required
                >
              </div>

              <button
                class="submit-button"
                type="submit"
                :disabled="loading"
              >
                {{ loading ? '注册中…' : '立即注册' }}
              </button>
            </form>

            <button
              class="switch-button"
              :disabled="loading"
              @click="toggleMode"
            >
              返回登录
            </button>
          </div>
        </transition>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { playerApi } from '@/api'

const router = useRouter()

// ==================== 屏幕状态 ====================
const showStartScreen = ref(true)
const showWelcome = ref(false)
const showAuth = ref(false)

function enterWelcome() {
  showStartScreen.value = false
  showWelcome.value = true
}

function startAuth() {
  showWelcome.value = false
  setTimeout(() => {
    showAuth.value = true
  }, 900)
}

function backToWelcome() {
  showAuth.value = false
  isRegisterMode.value = false
  setTimeout(() => {
    showWelcome.value = true
  }, 900)
}

function showGameIntro() {
  ElMessage.info(
    '《Zuulventurers》是一款沉浸式2D密室冒险解谜游戏，玩家扮演一名迷失在古代遗迹中的探险者，需要穿越连绵相扣的房间，破解机关，收集线索，最终在"最终祭坛"揭开遗迹背后的秘密。'
  )
}

function addGlowEffect(event: MouseEvent) {
  (event.target as HTMLElement).classList.add('glow-effect')
}

function removeGlowEffect(event: MouseEvent) {
  (event.target as HTMLElement).classList.remove('glow-effect')
}

// ==================== 认证逻辑 ====================
const loading = ref(false)
const isRegisterMode = ref(false)

const loginData = reactive({ username: '', password: '', rememberMe: false })
const registerData = reactive({
  username: '',
  password: '',
  confirm: '',
})

function toggleMode() {
  isRegisterMode.value = !isRegisterMode.value
}

// ==================== 登录 ====================
async function handleLogin() {
  if (!loginData.username || !loginData.password) {
    ElMessage.warning('请完整填写表单')
    return
  }

  loading.value = true
  try {
    const res = await playerApi.login({
      username: loginData.username,
      password: loginData.password,
    })

    if (res.data.code === 200) {
      const playerId = res.data.data.playerId
      const token = res.data.data.token

      localStorage.setItem('playerId', String(playerId))
      localStorage.setItem('roomId', '1')
      if (typeof token === 'string' && token) {
        localStorage.setItem('token', token)
      } else {
        localStorage.removeItem('token')
      }

      ElMessage.success('登录成功！')
      router.push('/welcome/archive')
    } else {
      ElMessage.error(res.data.message || '登录失败')
    }
  } catch (err: any) {
    if (err.message?.includes('CORS')) {
      ElMessage.error('跨域请求被阻止，请检查后端 CORS 配置')
    } else if (err.response?.status === 401) {
      ElMessage.error('用户名或密码错误')
    } else if (!err.response) {
      ElMessage.error('无法连接到服务器，请检查网络连接')
    } else {
      ElMessage.error(err.response?.data?.message || '服务器错误，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// ==================== 注册 ====================
async function handleRegister() {
  if (!registerData.username || !registerData.password) {
    ElMessage.warning('请完整填写表单')
    return
  }
  if (registerData.password !== registerData.confirm) {
    ElMessage.warning('两次输入的密码不一致')
    return
  }

  loading.value = true
  try {
    const fd = new FormData()
    fd.append('playerName', registerData.username)
    fd.append('password', registerData.password)

    await playerApi.register(fd)

    ElMessage.success('注册成功！请登录')
    registerData.username = ''
    registerData.password = ''
    registerData.confirm = ''
    toggleMode()
  } catch (err: any) {
    if (err.response?.status === 409) {
      ElMessage.error('用户名已存在，请更换其他用户名')
    } else {
      ElMessage.error(err.response?.data?.message || '注册失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ==================== Start Screen ==================== */
.start-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
}

.start-screen:hover {
  background: rgba(0, 0, 0, 0.4);
}

.start-content {
  text-align: center;
  color: white;
  user-select: none;
}

.start-title {
  font-size: 4rem;
  font-weight: 700;
  margin-bottom: 2rem;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
    0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2);
  letter-spacing: 0.1em;
  animation: titleGlow 3s ease-in-out infinite alternate;
}

.start-prompt {
  font-size: 1.5rem;
  font-weight: 300;
  margin-bottom: 3rem;
  opacity: 0.9;
  animation: promptPulse 2s ease-in-out infinite;
}

.click-indicator {
  position: relative;
  width: 60px;
  height: 60px;
  margin: 0 auto;
}

.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  animation: rippleEffect 2s infinite;
}

.ripple:nth-child(2) { animation-delay: 0.5s; }
.ripple:nth-child(3) { animation-delay: 1s; }

@keyframes titleGlow {
  0% {
    text-shadow: 0 0 20px rgba(255, 255, 255, 0.5),
      0 0 40px rgba(255, 255, 255, 0.3), 0 0 60px rgba(255, 255, 255, 0.2);
  }
  100% {
    text-shadow: 0 0 30px rgba(255, 255, 255, 0.8),
      0 0 60px rgba(255, 255, 255, 0.5), 0 0 90px rgba(255, 255, 255, 0.3);
  }
}

@keyframes promptPulse {
  0%, 100% { opacity: 0.7; transform: translateY(0); }
  50%      { opacity: 1;   transform: translateY(-5px); }
}

@keyframes rippleEffect {
  0%   { width: 20px; height: 20px; opacity: 1; }
  100% { width: 60px; height: 60px; opacity: 0; }
}

/* ==================== Welcome Screen ==================== */
.welcome-screen {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  z-index: 1;
}

.welcome-content {
  text-align: center;
  color: white;
  padding: 40px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 20px;
  width: 400px;
}

.game-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 15px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background: linear-gradient(45deg, #fff, #e0e0e0);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.game-subtitle {
  font-size: 1.3rem;
  margin-bottom: 50px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.welcome-buttons {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.welcome-btn {
  padding: 18px 50px;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 15px;
  cursor: pointer;
  transition: all 0.4s ease;
  backdrop-filter: blur(10px);
  position: relative;
  overflow: hidden;
  min-width: 200px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.welcome-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.welcome-btn:hover::before {
  left: 100%;
}

.welcome-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  border-color: rgba(255, 255, 255, 1);
  background: rgba(255, 255, 255, 0.2);
}

.welcome-btn.glow-effect {
  border-color: #4a90e2;
  background: rgba(74, 144, 226, 0.3);
  box-shadow: 0 0 20px rgba(74, 144, 226, 0.5), 0 10px 25px rgba(0, 0, 0, 0.3);
  transform: translateY(-3px) scale(1.05);
}

.start-btn:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.3), rgba(118, 75, 162, 0.3));
}

.intro-btn:hover {
  background: linear-gradient(135deg, rgba(52, 152, 219, 0.3), rgba(155, 89, 182, 0.3));
}

/* ==================== Auth Container ==================== */
.auth-container {
  display: flex;
  width: 900px;
  height: 700px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
  animation: slideIn 0.8s ease-out;
}

@keyframes slideIn {
  from { opacity: 0; transform: translateY(50px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---- 关闭按钮 ---- */
.close-button {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  font-size: 48px;
  font-weight: 500;
  color: #000;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
  line-height: 1;
  padding: 0;
  border: none;
  background-color: transparent;
}

.close-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- 左侧面板 ---- */
.auth-image {
  flex: 0 0 50%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #000;
  overflow: hidden;
  z-index: 2;
  box-sizing: border-box;
}

.login-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ---- 默认头像说明 ---- */
.default-avatar-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 36px;
  box-sizing: border-box;
  background:
    radial-gradient(circle at top, rgba(79, 70, 229, 0.32), transparent 45%),
    linear-gradient(160deg, rgba(15, 23, 42, 0.96), rgba(49, 46, 129, 0.92));
}

.default-avatar-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
  max-width: 280px;
  padding: 36px 28px;
  border-radius: 28px;
  text-align: center;
  color: #e2e8f0;
  background: rgba(15, 23, 42, 0.46);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(18px);
}

.default-avatar-circle {
  width: 128px;
  height: 128px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 52px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #fff;
  background: linear-gradient(135deg, #4338ca, #0ea5e9);
  box-shadow:
    0 14px 30px rgba(37, 99, 235, 0.3),
    inset 0 1px 10px rgba(255, 255, 255, 0.2);
}

.default-avatar-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.default-avatar-text {
  margin: 0;
  line-height: 1.7;
  font-size: 14px;
  color: rgba(226, 232, 240, 0.86);
}

.default-avatar-tip {
  margin-bottom: 20px;
  padding: 16px 18px;
  border-radius: 16px;
  background: rgba(79, 70, 229, 0.08);
  border: 1px solid rgba(79, 70, 229, 0.16);
}

.default-avatar-tip p {
  margin: 10px 0 0;
  color: #4b5563;
  line-height: 1.6;
  font-size: 13px;
}

.default-avatar-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #4338ca;
  background: rgba(79, 70, 229, 0.12);
}

/* ---- 右侧表单 ---- */
.auth-form {
  flex: 0 0 50%;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.form-title {
  margin: 0 0 24px;
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  text-align: center;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #6b7280;
}

.checkbox-group input[type='checkbox'] {
  width: auto;
}

.forgot-password {
  margin-left: auto;
  color: #4f46e5;
  text-decoration: none;
  font-size: 13px;
}

.forgot-password:hover {
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  margin-bottom: 14px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.switch-button {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background: transparent;
  cursor: pointer;
  transition: background 0.2s;
}

.switch-button:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.04);
}

.switch-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 过渡动画 ==================== */
.screen-fade-enter-active,
.screen-fade-leave-active {
  transition: opacity 0.8s ease, transform 0.8s ease;
}
.screen-fade-enter-from,
.screen-fade-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(50px);
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.fade-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}
.fade-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* ==================== 响应式 ==================== */
@media (max-width: 768px) {
  .start-title { font-size: 2.5rem; }
  .start-prompt { font-size: 1.2rem; }

  .auth-container {
    width: 100%;
    height: 100%;
    flex-direction: column;
  }

  .auth-image {
    display: none;
  }

  .auth-form {
    flex: 1;
    padding: 30px 24px;
  }
}
</style>
