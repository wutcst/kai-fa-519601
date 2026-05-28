<template>
  <div class="game-container">
    <div class="game-header">
      <PlayerInfo />
    </div>
    <div class="game-scene">
      <div class="nav-arrows">
        <button class="arrow up" @click="move('up')">W</button>
        <div class="arrow-row">
          <button class="arrow left" @click="move('left')">A</button>
          <button class="arrow down" @click="move('down')">S</button>
          <button class="arrow right" @click="move('right')">D</button>
        </div>
      </div>
      <div class="room-info">
        <h3>{{ currentRoom.room_name }}</h3>
        <p>房间物品：</p>
        <ul>
          <li v-for="item in currentRoom.item_list" :key="item.item_id">
            {{ item.item_name }} (重量:{{ item.item_size }} 价值:{{ item.item_value }})
            <el-button size="small" @click="pickItem(item.item_id)">拾取</el-button>
          </li>
        </ul>
      </div>
    </div>
    <LeaderBoard />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { playerApi, roomApi, backpackApi } from '@/api'
import PlayerInfo from '@/components/PlayerInfo.vue'
import LeaderBoard from '@/components/LeaderBoard.vue'

const currentRoom = ref<any>({ room_name: '', item_list: [] })

async function loadRoom() {
  const infoRes = await playerApi.getInfo()
  if (infoRes.data.code === 200) {
    const roomId = infoRes.data.data.player_room_id
    const roomRes = await roomApi.getInfo(roomId)
    if (roomRes.data.code === 200) currentRoom.value = roomRes.data.data
  }
}

async function move(direction: string) {
  const res = await playerApi.move(direction)
  if (res.data.code === 200) await loadRoom()
}

async function pickItem(itemId: number) {
  await backpackApi.pickItem(itemId)
  await loadRoom()
}

function handleKeydown(e: KeyboardEvent) {
  const map: Record<string, string> = { w: 'up', s: 'down', a: 'left', d: 'right' }
  const dir = map[e.key.toLowerCase()]
  if (dir) move(dir)
  if (e.key.toLowerCase() === 'r') playerApi.back().then(loadRoom)
  if (e.key.toLowerCase() === 'h') playerApi.home().then(loadRoom)
}

onMounted(() => {
  loadRoom()
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.game-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1a1a2e;
  color: #fff;
  padding: 16px;
}

.game-header {
  display: flex;
  justify-content: space-between;
}

.game-scene {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.nav-arrows {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.arrow-row {
  display: flex;
  gap: 4px;
}

.arrow {
  width: 48px;
  height: 48px;
  font-size: 18px;
  cursor: pointer;
  border: 1px solid #555;
  background: #2a2a4a;
  color: #fff;
  border-radius: 6px;
}

.room-info {
  max-width: 400px;
}

.room-info ul {
  list-style: none;
  padding: 0;
}

.room-info li {
  margin: 8px 0;
}
</style>