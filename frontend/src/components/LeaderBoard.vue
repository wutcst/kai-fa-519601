<template>
  <div class="leaderboard">
    <h4>排行榜</h4>
    <ul>
      <li v-for="(p, idx) in players" :key="p.player_id">
        <span class="rank">{{ idx + 1 }}</span>
        <span class="name">{{ p.player_name }}</span>
        <span class="score">{{ p.player_score }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { playerApi } from '@/api'

const players = ref<any[]>([])
let timer: ReturnType<typeof setInterval>

async function refresh() {
  const res = await playerApi.getList()
  if (res.data.code === 200) {
    players.value = (res.data.data || []).sort(
      (a: any, b: any) => b.player_score - a.player_score,
    )
  }
}

onMounted(() => {
  refresh()
  timer = setInterval(refresh, 5000)
})
onUnmounted(() => clearInterval(timer))
</script>

<style scoped>
.leaderboard {
  position: fixed;
  right: 16px;
  top: 16px;
  width: 200px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 8px;
  color: #fff;
}

h4 {
  margin-bottom: 8px;
  text-align: center;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  font-size: 13px;
}

.rank {
  width: 20px;
  color: #ffd700;
}

.name {
  flex: 1;
}

.score {
  color: #4fc3f7;
}
</style>