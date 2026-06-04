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
            {{ getItemIcon(item.itemName) }} {{ item.itemName }} (重量:{{ item.itemSize }} 价值:{{ item.itemValue }})
            <el-button size="small" @click="pickItem(item.itemId)">拾取</el-button>
          </li>
        </ul>
      </div>
    </div>
    <LeaderBoard />
    <Backpack ref="backpackRef" />

    <!-- 操作消息提示 -->
    <transition name="msg-fade">
      <div v-if="actionMessage" class="action-message">{{ actionMessage }}</div>
    </transition>
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
const actionMessage = ref('')

const iconMap: Record<string, string> = {
  火把: '🔥',
  '古书（密码书）': '📖',
  '炼金药水（小）': '🧪',
  炼金试剂包: '🧬',
  钥匙: '🔑',
  '武器（短剑）': '🗡️',
  盾牌: '🛡️',
  '金币（堆）': '💰',
  宝石: '💎',
  魔法饼干: '🍪',
  体力药水: '⚡'
}

function getItemIcon(name: string): string {
  return iconMap[name] || '🎒'
}

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
  try {
    const res = await playerApi.move(playerId, direction)
    if (res.data.code === 200) {
      await loadRoom()
      actionMessage.value = `成功移动到 ${currentRoom.value.roomName}`
    } else {
      actionMessage.value = '这个方向没有门'
    }
  } catch {
    actionMessage.value = '这个方向没有门'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

async function pickItem(itemId: number) {
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    await backpackApi.pickItem(playerId, itemId)
    await loadRoom()
    actionMessage.value = '拾取成功'
  } catch {
    actionMessage.value = '拾取失败，请重试'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
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

.action-message {
  position: fixed;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  padding: 10px 24px;
  background: rgba(0, 0, 0, 0.75);
  color: #fff;
  border-radius: 8px;
  font-size: 14px;
  z-index: 100;
  pointer-events: none;
}

.msg-fade-enter-active,
.msg-fade-leave-active {
  transition: opacity 0.3s ease;
}
.msg-fade-enter-from,
.msg-fade-leave-to {
  opacity: 0;
}
</style>
