<template>
  <div class="welcome-shell">
    <div class="welcome-backdrop"></div>
    <div class="welcome-grid"></div>
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <section class="hero-panel">
      <p class="eyebrow">Terminal Expedition</p>
      <h1>Zuulventurers</h1>
      <p class="hero-copy">
        Enter the labyrinth, register your explorer, and step into a player-aware game shell that
        now respects the real backend boundary.
      </p>

      <div class="hero-meta">
        <span>100 Rooms Planned</span>
        <span>Player APIs Online</span>
        <span>Session-Aware Entry</span>
      </div>

      <div class="hero-actions">
        <template v-if="hasSession">
          <button class="hero-button primary" type="button" @click="goArchive">Continue Session</button>
          <button class="hero-button secondary" type="button" @click="goGame">Open Game Shell</button>
          <button class="hero-link" type="button" @click="switchAccount">Switch Account</button>
        </template>
        <template v-else>
          <button class="hero-button primary" type="button" @click="goLogin">Open Login</button>
          <button class="hero-button secondary" type="button" @click="goRegister">Create Explorer</button>
        </template>
      </div>

      <div class="session-panel" :class="{ active: hasSession }">
        <template v-if="hasSession">
          <p class="session-kicker">Local Session</p>
          <strong>Explorer access card detected</strong>
          <p>
            A local `playerId` is present on this machine. You can resume at the character gate,
            jump straight into the current game shell, or switch to another account.
          </p>
        </template>
        <template v-else>
          <p class="session-kicker">Guest State</p>
          <strong>No active explorer session</strong>
          <p>
            Start from login if you already have an account, or open registration to create a new
            explorer profile with an optional avatar.
          </p>
        </template>
      </div>

      <div class="feature-list">
        <article>
          <span>Live now</span>
          <strong>Login, register, profile lookup, leaderboard</strong>
        </article>
        <article>
          <span>Staged next</span>
          <strong>Room details, movement, backpack, save system</strong>
        </article>
      </div>
    </section>

    <section class="auth-stage">
      <router-view />
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { clearStoredPlayerId, getStoredPlayerId } from '@/utils/session'

const route = useRoute()
const router = useRouter()
const hasSession = ref(false)

function syncSessionState() {
  hasSession.value = getStoredPlayerId() !== null
}

async function goLogin() {
  await router.push('/welcome/login')
}

async function goRegister() {
  await router.push({
    path: '/welcome/login',
    query: { mode: 'register' },
  })
}

async function goArchive() {
  await router.push('/welcome/archive')
}

async function goGame() {
  await router.push('/game')
}

async function switchAccount() {
  clearStoredPlayerId()
  syncSessionState()
  await router.push('/welcome/login')
}

watch(
  () => route.fullPath,
  () => {
    syncSessionState()
  },
  { immediate: true },
)
</script>

<style scoped>
.welcome-shell {
  --panel-border: rgba(150, 180, 120, 0.18);
  --text: #f4f1de;
  --muted: #9fb0aa;
  --accent: #c2ff72;
  --accent-soft: rgba(194, 255, 114, 0.18);
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(280px, 560px) minmax(320px, 460px);
  align-items: center;
  justify-content: center;
  gap: 36px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(120, 169, 96, 0.18), transparent 32%),
    radial-gradient(circle at 80% 20%, rgba(220, 133, 74, 0.16), transparent 22%),
    linear-gradient(145deg, #0d1321 0%, #151f35 42%, #1e2c44 100%);
}

.welcome-backdrop,
.welcome-grid,
.glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.welcome-backdrop {
  background:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8) 18%, rgba(0, 0, 0, 0.8));
}

.welcome-grid {
  inset: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
}

.glow {
  filter: blur(70px);
  opacity: 0.55;
}

.glow-left {
  top: -10%;
  left: -8%;
  width: 340px;
  height: 340px;
  background: rgba(194, 255, 114, 0.22);
}

.glow-right {
  right: -4%;
  bottom: -8%;
  width: 280px;
  height: 280px;
  background: rgba(228, 137, 71, 0.18);
}

.hero-panel,
.auth-stage {
  position: relative;
  z-index: 1;
}

.hero-panel {
  padding: 40px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.78), rgba(11, 18, 30, 0.92));
  border: 1px solid var(--panel-border);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: var(--text);
  display: grid;
  gap: 24px;
}

.eyebrow {
  margin: 0;
  font-size: 13px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent);
}

h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 70px);
  line-height: 0.94;
  letter-spacing: -0.04em;
}

.hero-copy {
  margin: 0;
  max-width: 28ch;
  font-size: 17px;
  line-height: 1.7;
  color: var(--muted);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-meta span {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(194, 255, 114, 0.14);
  background: var(--accent-soft);
  color: var(--text);
  font-size: 13px;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.hero-button,
.hero-link {
  min-height: 46px;
  border-radius: 999px;
  cursor: pointer;
}

.hero-button {
  padding: 0 18px;
  border: 1px solid transparent;
  font-weight: 600;
}

.hero-button.primary {
  background: linear-gradient(135deg, #c2ff72, #dfbd7e);
  color: #172131;
}

.hero-button.secondary {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.hero-link {
  padding: 0 6px;
  border: none;
  background: transparent;
  color: var(--accent);
}

.session-panel {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.session-panel.active {
  border-color: rgba(194, 255, 114, 0.18);
  background: rgba(194, 255, 114, 0.08);
}

.session-kicker,
.feature-list span {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

.session-panel strong,
.feature-list strong {
  display: block;
  margin-top: 8px;
}

.session-panel p:last-child {
  margin: 10px 0 0;
  color: var(--muted);
  line-height: 1.7;
}

.feature-list {
  display: grid;
  gap: 12px;
}

.feature-list article {
  padding: 16px 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.auth-stage {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 980px) {
  .welcome-shell {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .hero-panel {
    padding: 28px;
  }

  .hero-copy {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .welcome-shell {
    padding: 18px;
    gap: 18px;
  }

  .hero-panel {
    padding: 22px;
    border-radius: 20px;
  }

  .hero-meta,
  .hero-actions {
    gap: 8px;
  }

  .hero-meta span,
  .hero-button,
  .hero-link {
    width: 100%;
    text-align: center;
  }
}
</style>
