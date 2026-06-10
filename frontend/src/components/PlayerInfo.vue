<template>
  <div class="player-info">
    <div class="avatar">
      <img v-if="player.player_avatar_url" :src="player.player_avatar_url" alt="avatar" />
      <div v-else class="avatar-placeholder">{{ player.player_name?.charAt(0) }}</div>
    </div>
    <div class="info">
      <div class="name">{{ player.player_name }}</div>
      <div class="stat">分数：{{ player.player_score }}</div>
      <div class="stat">
        体力：{{ player.player_stamina }}
        <el-progress
          :percentage="Math.min(100, (player.player_stamina / 200) * 100)"
          :stroke-width="8"
          :show-text="false"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { playerApi } from '@/api'

const player = ref<any>({})

async function refresh() {
  const res = await playerApi.getInfo()
  if (res.data.code === 200) player.value = res.data.data
}

onMounted(refresh)
defineExpose({ refresh })
</script>

<style scoped>
.player-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.avatar img,
.avatar-placeholder {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4a4a8a;
  font-size: 20px;
  color: #fff;
}

.name {
  font-size: 16px;
  font-weight: bold;
}

.stat {
  font-size: 13px;
  color: #aaa;
  margin-top: 2px;
}
</style>