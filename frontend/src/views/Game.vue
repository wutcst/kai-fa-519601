<template>
  <div class="game-container">
    <div class="game-header">
      <PlayerInfo />
      <el-button type="primary" @click="openBackpack">背包 (B)</el-button>
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
        <h3>{{ currentRoom.roomName }}</h3>
        <p>房间物品：</p>
        <ul>
          <li v-for="item in currentRoom.itemList" :key="item.itemId">
            {{ item.itemName }} (重量:{{ item.itemSize }} 价值:{{ item.itemValue }})
            <el-button size="small" @click="pickItem(item.itemId)">拾取</el-button>
          </li>
        </ul>
      </div>
    </div>
    <LeaderBoard />
    <Backpack ref="backpackRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { playerApi, roomApi, backpackApi } from '@/api'
import PlayerInfo from '@/components/PlayerInfo.vue'
import LeaderBoard from '@/components/LeaderBoard.vue'
import Backpack from '@/components/Backpack.vue'

const currentRoom = ref<any>({ roomName: '', itemList: [] })
const backpackRef = ref<InstanceType<typeof Backpack> | null>(null)

async function loadRoom() {
  const playerId = Number(localStorage.getItem('playerId'))
  const infoRes = await playerApi.getInfo(playerId)
  if (infoRes.data.code === 200) {
    const roomId = infoRes.data.data.playerRoomId
    const roomRes = await roomApi.getInfo(roomId)
    if (roomRes.data.code === 200) currentRoom.value = roomRes.data.data
  }
}

async function move(direction: string) {
  const playerId = Number(localStorage.getItem('playerId'))
  const res = await playerApi.move(playerId, direction)
  if (res.data.code === 200) await loadRoom()
}

async function pickItem(itemId: number) {
  const playerId = Number(localStorage.getItem('playerId'))
  await backpackApi.pickItem(playerId, itemId)
  await loadRoom()
}

function openBackpack() {
  backpackRef.value?.open()
}

function handleKeydown(e: KeyboardEvent) {
  const map: Record<string, string> = { w: 'up', s: 'down', a: 'left', d: 'right' }
  const dir = map[e.key.toLowerCase()]
  if (dir) move(dir)
  if (e.key.toLowerCase() === 'r') {
    const playerId = Number(localStorage.getItem('playerId'))
    playerApi.back(playerId).then(loadRoom)
  }
  if (e.key.toLowerCase() === 'h') {
    const playerId = Number(localStorage.getItem('playerId'))
    playerApi.home(playerId).then(loadRoom)
  }
  if (e.key.toLowerCase() === 'b') {
    openBackpack()
  }
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