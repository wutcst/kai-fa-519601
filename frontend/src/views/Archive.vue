<template>
  <div class="archive-shell">
    <div class="profile-card">
      <div class="card-head">
        <div>
          <p class="section-label">Explorer Profile</p>
          <h2>Current Character Gate</h2>
        </div>
        <el-button text class="logout-btn" @click="logout">Sign Out</el-button>
      </div>

      <div v-if="loading" class="loading-state">
        <div class="pulse pulse-avatar"></div>
        <div class="pulse pulse-line"></div>
        <div class="pulse pulse-line short"></div>
      </div>

      <template v-else-if="profile">
        <div class="profile-hero">
          <div class="avatar-frame">
            <img v-if="profile.player_avatar_url" :src="profile.player_avatar_url" alt="avatar" />
            <span v-else>{{ profileInitial }}</span>
          </div>
          <div class="hero-copy">
            <h3>{{ profile.player_name }}</h3>
            <p>Your explorer profile is loaded. This version lets you enter the game shell and view live player data and rankings.</p>
          </div>
        </div>

        <div class="stats-grid">
          <article class="stat-card">
            <span class="stat-label">Score</span>
            <strong>{{ profile.player_score }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-label">Stamina</span>
            <strong>{{ profile.player_stamina }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-label">Room</span>
            <strong>#{{ profile.player_room_id ?? '-' }}</strong>
          </article>
          <article class="stat-card">
            <span class="stat-label">Backpack ID</span>
            <strong>{{ profile.player_backpack_id ?? 'Unassigned' }}</strong>
          </article>
        </div>

        <div class="status-panel">
          <div class="status-copy">
            <p class="status-title">Current Integration</p>
            <p class="status-text">
              Login, registration, profile lookup, and the player leaderboard are already connected. Room details, movement, inventory, and save flows still wait on backend routes, so the game page stays visible but intentionally non-interactive.
            </p>
          </div>
          <div class="status-badges">
            <span class="badge ready">player/login</span>
            <span class="badge ready">player/register</span>
            <span class="badge ready">player/info</span>
            <span class="badge ready">player/list</span>
            <span class="badge pending">room pending</span>
            <span class="badge pending">backpack pending</span>
            <span class="badge pending">game pending</span>
          </div>
        </div>

        <div class="action-row">
          <el-button type="primary" class="primary-action" @click="enterGame">
            Enter Adventure Shell
          </el-button>
          <el-button class="secondary-action" @click="loadProfile">Refresh Profile</el-button>
        </div>
      </template>

      <div v-else class="empty-state">
        <p>No character profile is available. Please sign in again.</p>
        <el-button type="primary" @click="logout">Back To Login</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getMessage, getPayload, isSuccess, playerApi, type PlayerProfile } from '@/api'
import { clearStoredPlayerId, getStoredPlayerId } from '@/utils/session'

const router = useRouter()
const loading = ref(true)
const profile = ref<PlayerProfile | null>(null)

const profileInitial = computed(() => {
  const name = profile.value?.player_name?.trim()
  return name ? name.charAt(0).toUpperCase() : 'Z'
})

async function loadProfile() {
  const playerId = getStoredPlayerId()
  if (!playerId) {
    ElMessage.warning('Please sign in first')
    await router.push('/welcome/login')
    return
  }

  loading.value = true
  try {
    const response = await playerApi.getInfo(playerId)
    if (!isSuccess(response)) {
      profile.value = null
      ElMessage.error(getMessage(response, 'Failed to load character profile'))
      return
    }

    profile.value = getPayload(response)
  } catch {
    profile.value = null
    ElMessage.error('Failed to load character profile, please try again later')
  } finally {
    loading.value = false
  }
}

async function enterGame() {
  await router.push('/game')
}

async function logout() {
  clearStoredPlayerId()
  await router.push('/welcome/login')
}

onMounted(loadProfile)
</script>

<style scoped>
.archive-shell {
  width: min(100%, 880px);
}

.profile-card {
  padding: 30px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(246, 242, 228, 0.96), rgba(234, 230, 217, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.38);
  box-shadow:
    0 22px 70px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  color: #1c2430;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
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

.logout-btn {
  color: #51606d;
}

.profile-hero {
  margin-top: 28px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-frame {
  width: 88px;
  height: 88px;
  flex-shrink: 0;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #5e6d40, #8f6238);
  color: #f4f1de;
  font-size: 34px;
  font-weight: 700;
  box-shadow: 0 16px 40px rgba(52, 61, 39, 0.28);
}

.avatar-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-copy h3 {
  margin: 0;
  font-size: 28px;
}

.hero-copy p {
  margin: 10px 0 0;
  color: #56626d;
  line-height: 1.7;
}

.stats-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.stat-card {
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.55);
  border: 1px solid rgba(29, 36, 50, 0.08);
}

.stat-label {
  display: block;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #6c7882;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  font-size: 28px;
  font-weight: 700;
}

.status-panel {
  margin-top: 24px;
  padding: 20px;
  border-radius: 22px;
  background: linear-gradient(135deg, rgba(17, 24, 39, 0.92), rgba(30, 44, 68, 0.9));
  color: #edf1e6;
  display: grid;
  grid-template-columns: 1.7fr 1fr;
  gap: 18px;
}

.status-title {
  margin: 0;
  font-size: 14px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #c2ff72;
}

.status-text {
  margin: 12px 0 0;
  line-height: 1.8;
  color: #c1ccd3;
}

.status-badges {
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 10px;
}

.badge {
  padding: 10px 12px;
  border-radius: 999px;
  font-size: 13px;
}

.badge.ready {
  background: rgba(194, 255, 114, 0.16);
  color: #e6f8c3;
}

.badge.pending {
  background: rgba(255, 255, 255, 0.08);
  color: #d3dce2;
}

.action-row {
  margin-top: 24px;
  display: flex;
  gap: 12px;
}

.primary-action,
.secondary-action {
  min-height: 46px;
  border-radius: 14px;
}

.primary-action {
  min-width: 220px;
}

.loading-state {
  margin-top: 28px;
  display: grid;
  gap: 14px;
}

.pulse {
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(213, 206, 190, 0.8), rgba(242, 238, 228, 0.95), rgba(213, 206, 190, 0.8));
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite linear;
}

.pulse-avatar {
  width: 88px;
  height: 88px;
}

.pulse-line {
  width: 100%;
  height: 22px;
}

.pulse-line.short {
  width: 62%;
}

.empty-state {
  margin-top: 28px;
  display: grid;
  gap: 14px;
  justify-items: start;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .status-panel {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-card {
    padding: 22px;
  }

  .profile-hero,
  .action-row,
  .card-head {
    flex-direction: column;
  }

  .action-row > * {
    width: 100%;
  }
}
</style>
