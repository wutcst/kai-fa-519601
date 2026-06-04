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
        <p class="room-desc">{{ getRoomDescription(currentRoom.roomName) }}</p>
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
const backpackSize = ref(0)
const backpackCount = ref(0)

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

const roomDescriptions: Record<string, string> = {
  主城: '🏰 冒险者聚集的中心城镇，温暖的阳光洒在石板路上，这里是所有旅程的起点。',
  森林: '🌲 茂密的原始森林，阳光透过层层树叶洒下斑驳的光影，空气中弥漫着泥土和松脂的清香。',
  沙漠: '🏜️ 一望无际的金色沙海，热浪翻滚，远处隐约可见古老的遗迹。',
  沼泽: '🕸️ 阴暗潮湿的沼泽地，泥泞中冒着气泡，四周弥漫着腐朽的气息。',
  洞穴: '⛏️ 幽深的洞穴中回荡着水滴声，岩壁上闪烁着神秘的矿石光芒。',
  雪山: '🏔️ 白雪皑皑的山峰，寒风凛冽，每一步都在松软的雪地上留下深深的足迹。',
  城堡: '🏯 古老的石砌城堡，高耸的塔楼和厚重的城墙诉说着昔日的辉煌。',
  地牢: '🔗 阴暗潮湿的地下牢房，铁链的碰撞声在空旷的走廊中回响。',
  村庄: '🏘️ 宁静的小村庄，炊烟袅袅，友善的村民在田间劳作。',
  废墟: '💀 被遗忘的古老废墟，断壁残垣间爬满了藤蔓，隐藏着不为人知的秘密。',
  海滩: '🏖️ 金色的沙滩与碧蓝的海水相接，海浪轻轻拍打着岸边，海风带来咸咸的味道。',
  火山: '🌋 炽热的火山口喷吐着浓烟，岩浆在裂缝中缓缓流淌，大地在脚下微微颤抖。',
  花园: '🌸 繁花似锦的魔法花园，五彩斑斓的花朵散发着迷人的芬芳，蝴蝶在花丛中翩翩起舞。',
  塔楼: '🗼 高耸入云的魔法塔，螺旋楼梯蜿蜒而上，塔顶可以俯瞰整片大陆。',
  墓地: '🪦 寂静的古老墓地，墓碑上刻满了岁月的痕迹，夜风中似乎能听到低语。',
  市场: '🛒 热闹的集市，商贩们的叫卖声此起彼伏，各种奇珍异宝琳琅满目。',
  图书馆: '📚 宏伟的古老图书馆，高耸的书架上摆满了泛黄的古籍，空气中弥漫着纸张和墨水的气息。',
  实验室: '⚗️ 炼金术士的秘密实验室，桌上摆满了五颜六色的药剂和奇形怪状的仪器。',
  神庙: '⛪ 庄严的神庙矗立在山巅，彩色的玻璃窗透出神圣的光芒，虔诚的祈祷声在殿堂中回荡。',
  港口: '⚓ 繁忙的港口码头，船只来来往往，海鸥在桅杆间盘旋鸣叫。',
}

function getRoomDescription(name: string): string {
  for (const [key, desc] of Object.entries(roomDescriptions)) {
    if (name.includes(key)) return desc
  }
  return '🔍 一个充满未知的房间，等待着你去探索其中的秘密。'
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

async function loadBackpack() {
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    const res = await backpackApi.getList(playerId)
    if (res.data.code === 200) {
      backpackSize.value = res.data.data.backpackSize || 0
      backpackCount.value = (res.data.data.itemList || []).length
    }
  } catch {
    // 静默失败
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
  if (backpackCount.value >= backpackSize.value) {
    actionMessage.value = '背包已满，无法拾取'
    setTimeout(() => { actionMessage.value = '' }, 2000)
    return
  }
  try {
    await backpackApi.pickItem(playerId, itemId)
    await loadRoom()
    await loadBackpack()
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
  loadBackpack()
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

.room-desc {
  font-size: 13px;
  color: #aaa;
  line-height: 1.6;
  margin: 8px 0 16px;
  font-style: italic;
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
