<template>
  <aside class="leaderboard-card">
    <div class="card-head">
      <div>
        <p class="eyebrow">Live Rankings</p>
        <h3>Explorer Board</h3>
      </div>
      <button class="refresh-link" type="button" @click="refresh">Refresh</button>
    </div>

    <div v-if="loading" class="list-state">
      <div v-for="item in 5" :key="item" class="skeleton-row"></div>
    </div>

    <ul v-else-if="players.length" class="rank-list">
      <li v-for="(player, index) in players" :key="player.player_id" class="rank-row">
        <span class="rank-chip">{{ index + 1 }}</span>
        <div class="player-line">
          <strong>{{ player.player_name }}</strong>
          <span>Room #{{ player.player_room_id ?? '-' }}</span>
        </div>
        <span class="score-value">{{ player.player_score }}</span>
      </li>
    </ul>

    <div v-else class="empty-state">
      <p>No ranking data available.</p>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getMessage, getPayload, isSuccess, playerApi, type PlayerProfile } from '@/api'

const players = ref<PlayerProfile[]>([])
const loading = ref(false)
let timer: ReturnType<typeof setInterval> | null = null

async function refresh() {
  loading.value = true
  try {
    const response = await playerApi.getList()
    if (!isSuccess(response)) {
      ElMessage.error(getMessage(response, 'Failed to load leaderboard'))
      return
    }

    players.value = [...getPayload(response)].sort((left, right) => right.player_score - left.player_score)
  } catch {
    ElMessage.error('Failed to load leaderboard')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  refresh()
  timer = setInterval(refresh, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.leaderboard-card {
  padding: 22px;
  border-radius: 26px;
  background: linear-gradient(180deg, rgba(12, 18, 31, 0.94), rgba(18, 28, 46, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #eef2e9;
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.eyebrow {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #c2ff72;
}

.card-head h3 {
  margin: 0;
  font-size: 24px;
}

.refresh-link {
  border: none;
  background: transparent;
  color: #c2ff72;
  cursor: pointer;
}

.rank-list {
  margin: 22px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 10px;
}

.rank-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.05);
}

.rank-chip {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: rgba(194, 255, 114, 0.14);
  color: #f4f8e8;
  font-weight: 700;
}

.player-line {
  min-width: 0;
}

.player-line strong,
.player-line span,
.score-value {
  display: block;
}

.player-line strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-line span {
  margin-top: 4px;
  color: #98a7b3;
  font-size: 13px;
  border-radius: 6px;
  transition: all 0.25s ease;
  animation: fadeIn 0.4s ease both;
}

li:nth-child(1) { animation-delay: 0.05s; }
li:nth-child(2) { animation-delay: 0.1s; }
li:nth-child(3) { animation-delay: 0.15s; }
li:nth-child(4) { animation-delay: 0.2s; }
li:nth-child(5) { animation-delay: 0.25s; }

li:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateX(-2px);
}

/* 前三名特殊行背景 */
li:nth-child(1) {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.12), transparent);
}
li:nth-child(2) {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.1), transparent);
}
li:nth-child(3) {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.1), transparent);
}

li:nth-child(1):hover {
  background: linear-gradient(90deg, rgba(255, 215, 0, 0.2), rgba(255, 255, 255, 0.04));
}
li:nth-child(2):hover {
  background: linear-gradient(90deg, rgba(192, 192, 192, 0.18), rgba(255, 255, 255, 0.04));
}
li:nth-child(3):hover {
  background: linear-gradient(90deg, rgba(205, 127, 50, 0.18), rgba(255, 255, 255, 0.04));
}

.score-value {
  color: #f0cb84;
  font-size: 20px;
  font-weight: 700;
}

.list-state {
  margin-top: 22px;
  display: grid;
  gap: 10px;
}

.skeleton-row {
  height: 62px;
  border-radius: 18px;
  background: linear-gradient(90deg, rgba(72, 87, 112, 0.7), rgba(123, 140, 160, 0.35), rgba(72, 87, 112, 0.7));
  background-size: 200% 100%;
  animation: shimmer 1.3s infinite linear;
}

.empty-state {
  margin-top: 22px;
  min-height: 120px;
  display: grid;
  place-items: center;
  color: #b9c5cb;
}

@keyframes shimmer {
  from {
    background-position: 200% 0;
  }
  to {
    background-position: -200% 0;
  }
}
</style>
