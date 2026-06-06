<template>
  <div class="leaderboard">
    <h4>排行榜</h4>
    <ul>
      <li
        v-for="(p, idx) in players"
        :key="p.playerId"
      >
        <span class="rank">{{ idx + 1 }}</span>
        <span class="name">{{ p.playerName }}</span>
        <span class="score">{{ p.playerScore }}</span>
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
      (a: any, b: any) => b.playerScore - a.playerScore,
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
  width: 100%;
  height: 100%;
  min-height: 0;
  padding: 18px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(30, 20, 60, 0.75), rgba(15, 10, 40, 0.8));
  backdrop-filter: blur(12px);
  border-radius: 28px;
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 0 20px rgba(120, 80, 255, 0.15),
    0 0 40px rgba(120, 80, 255, 0.05),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

h4 {
  margin: 0 0 10px;
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 2px;
  background: linear-gradient(180deg, #ffd700 0%, #ff8c00 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
  filter: drop-shadow(0 0 6px rgba(255, 215, 0, 0.4));
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 6px;
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

.rank {
  width: 24px;
  font-weight: 700;
  text-align: center;
}

/* 前三名排名颜色 + 光晕 */
li:nth-child(1) .rank {
  color: #ffd700;
  text-shadow: 0 0 8px rgba(255, 215, 0, 0.6);
}
li:nth-child(2) .rank {
  color: #c0c0c0;
  text-shadow: 0 0 6px rgba(192, 192, 192, 0.5);
}
li:nth-child(3) .rank {
  color: #cd7f32;
  text-shadow: 0 0 6px rgba(205, 127, 50, 0.5);
}
li:nth-child(n+4) .rank {
  color: rgba(255, 255, 255, 0.4);
}

.name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0 6px;
}

.score {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  background: linear-gradient(135deg, #00e5ff, #76ff03);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 4px rgba(0, 229, 255, 0.3));
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .leaderboard {
    border-radius: 22px;
  }
}
</style>
