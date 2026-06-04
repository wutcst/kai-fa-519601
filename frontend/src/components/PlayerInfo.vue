<template>
  <section class="player-panel">
    <div v-if="loading" class="player-panel loading">
      <div class="avatar-skeleton"></div>
      <div class="copy-skeleton">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>

    <div v-else-if="player" class="panel-content">
      <div class="avatar-shell">
        <img v-if="player.player_avatar_url" :src="player.player_avatar_url" alt="avatar" />
        <span v-else>{{ playerInitial }}</span>
      </div>

      <div class="player-copy">
        <div class="player-topline">
          <p class="eyebrow">Current Explorer</p>
          <button class="refresh-link" type="button" @click="refresh">Refresh</button>
        </div>
        <h3>{{ player.player_name }}</h3>

        <div class="stat-grid">
          <div>
            <span class="label">Score</span>
            <strong>{{ player.player_score }}</strong>
          </div>
          <div>
            <span class="label">Room</span>
            <strong>#{{ player.player_room_id ?? '-' }}</strong>
          </div>
        </div>

        <div class="stamina-block">
          <div class="stamina-head">
            <span class="label">Stamina</span>
            <strong>{{ player.player_stamina }}/200</strong>
          </div>
          <el-progress
            :percentage="Math.min(100, Math.max(0, (player.player_stamina / 200) * 100))"
            :stroke-width="10"
            :show-text="false"
            color="#c2ff72"
          />
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>No player profile available. Return to login and try again.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { PlayerProfile } from '@/api'
import { loadStoredPlayerProfile } from '@/utils/current-player'

const router = useRouter()
const player = ref<PlayerProfile | null>(null)
const loading = ref(false)

const playerInitial = computed(() => {
  const value = player.value?.player_name?.trim()
  return value ? value.charAt(0).toUpperCase() : 'Z'
})

async function refresh() {
  loading.value = true
  try {
    const result = await loadStoredPlayerProfile()
    if (result.invalidSession) {
      player.value = null
      ElMessage.warning('Stored explorer session is no longer valid. Please sign in again.')
      await router.replace('/welcome/login')
      return
    }

    if (!result.profile) {
      if (result.message) {
        ElMessage.error(result.message)
      }
      player.value = null
      return
    }

    player.value = result.profile
  } finally {
    loading.value = false
  }
}

onMounted(refresh)

defineExpose({ refresh })
</script>

<style scoped>
.player-panel {
  min-height: 168px;
  padding: 22px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(14, 22, 37, 0.94), rgba(21, 34, 55, 0.92));
  border: 1px solid rgba(194, 255, 114, 0.12);
  box-shadow:
    0 20px 50px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: #eef3df;
}

.panel-content {
  display: flex;
  gap: 18px;
}

.avatar-shell {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  border-radius: 24px;
  overflow: hidden;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(194, 255, 114, 0.28), rgba(228, 137, 71, 0.26));
  color: #fff7e8;
  font-size: 30px;
  font-weight: 700;
}

.avatar-shell img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.player-copy {
  flex: 1;
  display: grid;
  gap: 16px;
}

.player-topline,
.stamina-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.eyebrow,
.label {
  font-size: 12px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #9fb0aa;
}

.refresh-link {
  border: none;
  background: transparent;
  color: #c2ff72;
  cursor: pointer;
  font-size: 13px;
}

.player-copy h3 {
  margin: 0;
  font-size: 28px;
  line-height: 1;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.stat-grid div,
.stamina-block {
  padding: 14px 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.stat-grid strong,
.stamina-block strong {
  display: block;
  margin-top: 8px;
  font-size: 24px;
  color: #f6f1df;
}

.loading {
  display: flex;
  gap: 18px;
  align-items: center;
}

.avatar-skeleton,
.copy-skeleton span {
  background: linear-gradient(90deg, rgba(72, 87, 112, 0.7), rgba(123, 140, 160, 0.4), rgba(72, 87, 112, 0.7));
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite linear;
}

.avatar-skeleton {
  width: 84px;
  height: 84px;
  border-radius: 24px;
}

.copy-skeleton {
  flex: 1;
  display: grid;
  gap: 12px;
}

.copy-skeleton span {
  height: 18px;
  border-radius: 999px;
}

.copy-skeleton span:nth-child(2) {
  width: 72%;
}

.copy-skeleton span:nth-child(3) {
  width: 54%;
}

.empty-state {
  min-height: 124px;
  display: grid;
  place-items: center;
  color: #c5d0d4;
  text-align: center;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}

@media (max-width: 640px) {
  .panel-content {
    flex-direction: column;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
