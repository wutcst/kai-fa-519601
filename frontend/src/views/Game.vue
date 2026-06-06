<template>
  <div class="game-container" :style="backgroundStyle">
    <div class="game-layout">
      <aside class="side-panel player-panel">
        <div class="player-shell">
          <div class="panel-heading">
            <span class="panel-kicker">Player</span>
            <h2 class="panel-title">冒险者状态</h2>
          </div>
          <PlayerInfo class="player-card" />
          <el-button class="backpack-trigger" type="primary" @click="openBackpack">
            背包 (B)
          </el-button>
        </div>
      </aside>

      <main class="scene-panel">
        <div class="scene-shell">
          <div class="scene-meta">
            <span class="scene-kicker">当前场景</span>
            <span class="scene-room">{{ currentRoom.roomName || '正在探索未知区域' }}</span>
          </div>
          <GameKeyHints />
          <div class="game-scene">
            <div class="nav-arrows">
              <button class="arrow up" :disabled="!canMove('up') || isMoving" @click="move('up')">W</button>
              <div class="arrow-row">
                <button class="arrow left" :disabled="!canMove('left') || isMoving" @click="move('left')">A</button>
                <button class="arrow down" :disabled="!canMove('down') || isMoving" @click="move('down')">S</button>
                <button class="arrow right" :disabled="!canMove('right') || isMoving" @click="move('right')">D</button>
              </div>
            </div>
            <div class="room-info">
              <h3>{{ currentRoom.roomName }}</h3>
              <p class="room-desc">{{ getRoomDescription(currentRoom.roomName) }}</p>
              <div class="scene-objects">
                <div class="scene-object crate" @click="openCrate">
                  <span class="object-icon">📦</span>
                  <span class="object-label">木箱</span>
                </div>
                <div
                  v-for="item in currentRoom.itemList"
                  :key="item.itemId"
                  class="scene-object room-item"
                  @click="pickItem(item.itemId)"
                >
                  <span class="object-icon">{{ getItemIcon(item.itemName) }}</span>
                  <span class="object-label">{{ item.itemName }}</span>
                </div>
              </div>
              <div class="room-item-panel">
                <div class="room-item-panel-header">
                  <span>房间物品</span>
                  <span class="room-item-count">{{ currentRoom.itemList.length }} 件</span>
                </div>
                <div v-if="currentRoom.itemList.length === 0" class="room-item-empty">
                  当前房间暂无可拾取物品
                </div>
                <ul v-else class="room-item-list">
                  <li
                    v-for="item in currentRoom.itemList"
                    :key="`room-item-${item.itemId}`"
                    class="room-item-row"
                  >
                    <span class="room-item-name">{{ item.itemName }}</span>
                    <span class="room-item-meta">重量 {{ item.itemSize }}</span>
                    <span class="room-item-meta">价值 {{ item.itemValue }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <aside class="side-panel leaderboard-panel">
        <LeaderBoard />
      </aside>
    </div>

    <!-- 木箱弹窗 -->
    <div v-if="showCrate" class="crate-overlay" @click.self="showCrate = false">
      <div class="crate-modal">
        <div class="crate-header">
          <h3>📦 木箱中的物品</h3>
          <button class="close-btn" @click="showCrate = false">✕</button>
        </div>
        <div class="crate-items">
          <div
            v-for="item in currentRoom.itemList"
            :key="item.itemId"
            class="crate-item"
            :class="{ disabled: backpackCount >= backpackSize }"
            @click="pickItemFromCrate(item.itemId)"
          >
            <span class="object-icon">{{ getItemIcon(item.itemName) }}</span>
            <div class="crate-item-info">
              <span class="crate-item-name">{{ item.itemName }}</span>
              <span class="crate-item-meta">重量: {{ item.itemSize }} | 价值: {{ item.itemValue }}</span>
            </div>
          </div>
          <div v-if="currentRoom.itemList.length === 0" class="crate-empty">箱子里空空如也…</div>
        </div>
        <div class="crate-footer">
          <p v-if="backpackCount >= backpackSize" class="inventory-full-warning">背包已满！请先清理背包空间。</p>
          <el-button type="primary" :disabled="backpackCount >= backpackSize || currentRoom.itemList.length === 0" @click="takeAllItems">
            全部拾取
          </el-button>
        </div>
      </div>
    </div>
    <Backpack ref="backpackRef" />

    <!-- 操作消息提示 -->
    <transition name="msg-fade">
      <div v-if="actionMessage" class="action-message">{{ actionMessage }}</div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { playerApi, roomApi, backpackApi } from '@/api'
import PlayerInfo from '@/components/PlayerInfo.vue'
import LeaderBoard from '@/components/LeaderBoard.vue'
import Backpack from '@/components/Backpack.vue'
import GameKeyHints from '@/components/GameKeyHints.vue'

type Direction = 'up' | 'down' | 'left' | 'right'

interface RoomDoors {
  up: boolean
  down: boolean
  left: boolean
  right: boolean
}

interface RoomItem {
  itemId: number
  itemName: string
  itemSize: number
  itemValue: number
}

interface RoomState {
  roomName: string
  itemList: RoomItem[]
  doors?: Partial<RoomDoors>
}

const currentRoom = ref<RoomState>({ roomName: '', itemList: [] })
const backpackRef = ref<InstanceType<typeof Backpack> | null>(null)
const actionMessage = ref('')
const backpackSize = ref(0)
const backpackCount = ref(0)
const isMoving = ref(false)
const countdown = ref<number | null>(null)
const showCrate = ref(false)
const isMobile = ref(window.matchMedia('(max-width: 768px)').matches)

function normalizeDoors(doors: unknown): Partial<RoomDoors> | undefined {
  if (!doors || typeof doors !== 'object') {
    return undefined
  }

  const rawDoors = doors as Partial<Record<Direction, unknown>>

  return {
    up: rawDoors.up === true,
    down: rawDoors.down === true,
    left: rawDoors.left === true,
    right: rawDoors.right === true,
  }
}

function normalizeRoomData(data: any): RoomState {
  return {
    ...data,
    roomName: data?.roomName ?? '',
    itemList: data?.itemList ?? data?.items ?? [],
    doors: normalizeDoors(data?.doors),
  }
}

function canMove(direction: Direction): boolean {
  const doors = currentRoom.value.doors

  if (!doors) {
    return true
  }

  return doors[direction] ?? true
}

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

const roomBackgroundMap: Record<string, string> = {
  主城: 'linear-gradient(135deg, #f5d78c 0%, #e8b86d 30%, #c9a05a 60%, #8b6914 100%)',
  森林: 'linear-gradient(180deg, #2d5a27 0%, #1a3a15 40%, #0d2608 80%, #1a0f00 100%)',
  沙漠: 'linear-gradient(180deg, #f4a460 0%, #e8953a 30%, #d4a574 60%, #c4956a 100%)',
  沼泽: 'linear-gradient(180deg, #3b5323 0%, #2d3d1a 30%, #1a2a0f 60%, #0d1a08 100%)',
  洞穴: 'linear-gradient(180deg, #4a3728 0%, #3a2a1a 30%, #2a1a0f 60%, #1a0f08 100%)',
  雪山: 'linear-gradient(180deg, #e8f0f8 0%, #c8d8e8 30%, #a0b8d0 60%, #7898b0 100%)',
  城堡: 'linear-gradient(180deg, #6b5b4f 0%, #5a4a3f 30%, #4a3a2f 60%, #3a2a1f 100%)',
  地牢: 'linear-gradient(180deg, #2a1a1a 0%, #1a0f0f 40%, #0f0808 70%, #080404 100%)',
  村庄: 'linear-gradient(180deg, #7ec850 0%, #5a9e3a 30%, #8bc34a 60%, #4a7a2a 100%)',
  废墟: 'linear-gradient(180deg, #6b5b4f 0%, #5a4a3a 30%, #4a3a2a 60%, #3a2a1a 100%)',
  海滩: 'linear-gradient(180deg, #87ceeb 0%, #5ba3c9 30%, #f4d58c 60%, #e8c878 100%)',
  火山: 'linear-gradient(180deg, #4a1a0a 0%, #8b2500 30%, #ff4500 50%, #2a0a00 100%)',
  花园: 'linear-gradient(135deg, #90c850 0%, #e898c8 30%, #f0d0e0 50%, #a0d860 100%)',
  塔楼: 'linear-gradient(180deg, #4a4a6a 0%, #3a3a5a 30%, #2a2a4a 60%, #1a1a3a 100%)',
  墓地: 'linear-gradient(180deg, #2a3a2a 0%, #1a2a1a 30%, #0f1a0f 60%, #080f08 100%)',
  市场: 'linear-gradient(135deg, #d4a574 0%, #c49464 30%, #e8c878 60%, #b88454 100%)',
  图书馆: 'linear-gradient(180deg, #5a4a3a 0%, #4a3a2a 30%, #3a2a1a 60%, #2a1a0f 100%)',
  实验室: 'linear-gradient(135deg, #3a4a5a 0%, #2a3a4a 30%, #1a2a3a 60%, #0f1a2a 100%)',
  神庙: 'linear-gradient(180deg, #f0e8d0 0%, #e0d8c0 30%, #d0c8b0 60%, #c0b8a0 100%)',
  港口: 'linear-gradient(180deg, #5b8fa8 0%, #4a7a90 30%, #3a6a80 60%, #2a5a70 100%)',
}

const backgroundStyle = computed(() => {
  const name = currentRoom.value.roomName
  for (const [key, gradient] of Object.entries(roomBackgroundMap)) {
    if (name.includes(key)) return { background: gradient }
  }
  return { background: '#1a1a2e' }
})

async function loadRoom() {
  const playerId = Number(localStorage.getItem('playerId'))
  const infoRes = await playerApi.getInfo(playerId)
  if (infoRes.data.code === 200) {
    const roomId = infoRes.data.data.playerRoomId
    const roomRes = await roomApi.getInfo(roomId)
    if (roomRes.data.code === 200) currentRoom.value = normalizeRoomData(roomRes.data.data)
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

async function move(direction: Direction) {
  if (!canMove(direction)) {
    actionMessage.value = '这个方向没有门'
    setTimeout(() => { actionMessage.value = '' }, 2000)
    return
  }

  if (isMoving.value) return
  isMoving.value = true
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    const res = await playerApi.move(playerId, direction)
    if (res.data.code === 200) {
      await loadRoom()
      actionMessage.value = `成功移动到 ${currentRoom.value.roomName}`
      checkTeleport()
    } else {
      actionMessage.value = '这个方向没有门'
    }
  } catch {
    actionMessage.value = '这个方向没有门'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
  isMoving.value = false
}

async function back() {
  if (isMoving.value) return
  isMoving.value = true
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    const res = await playerApi.back(playerId)
    if (res.data.code === 200) {
      await loadRoom()
      actionMessage.value = `你回到了 ${currentRoom.value.roomName}`
      checkTeleport()
    } else {
      actionMessage.value = '已在最初房间，无法再后退'
    }
  } catch {
    actionMessage.value = '已在最初房间，无法再后退'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
  isMoving.value = false
}

async function goHome() {
  if (isMoving.value) return
  isMoving.value = true
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    const res = await playerApi.home(playerId)
    if (res.data.code === 200) {
      await loadRoom()
      actionMessage.value = `你已回到 ${currentRoom.value.roomName}`
      checkTeleport()
    }
  } catch {
    actionMessage.value = '回城失败，请重试'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
  isMoving.value = false
}

function checkTeleport() {
  if (currentRoom.value.roomName.includes('传送')) {
    actionMessage.value = '你已进入传送房间，即将传送…'
    setTimeout(() => handleTeleport(), 1000)
  }
}

async function handleTeleport() {
  if (isMoving.value) return
  isMoving.value = true
  let timeLeft = 3
  countdown.value = timeLeft
  actionMessage.value = `传送倒计时：${timeLeft} 秒`

  const timerId = setInterval(() => {
    timeLeft--
    if (timeLeft > 0) {
      countdown.value = timeLeft
      actionMessage.value = `传送倒计时：${timeLeft} 秒`
    } else {
      clearInterval(timerId)
      countdown.value = null
      actionMessage.value = '传送中…'
      doTeleport()
    }
  }, 1000)
}

async function doTeleport() {
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    const res = await playerApi.trans(playerId)
    if (res.data.code === 200) {
      await loadRoom()
      actionMessage.value = `已传送到 ${currentRoom.value.roomName}`
    }
  } catch {
    actionMessage.value = '传送失败，请稍后重试'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
  isMoving.value = false
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

function openCrate() {
  showCrate.value = true
}

async function pickItemFromCrate(itemId: number) {
  if (backpackCount.value >= backpackSize.value) {
    actionMessage.value = '背包已满，无法拾取'
    setTimeout(() => { actionMessage.value = '' }, 2000)
    return
  }
  const playerId = Number(localStorage.getItem('playerId'))
  try {
    await backpackApi.pickItem(playerId, itemId)
    await loadRoom()
    await loadBackpack()
    actionMessage.value = '拾取成功'
    if (currentRoom.value.itemList.length === 0) showCrate.value = false
  } catch {
    actionMessage.value = '拾取失败，请重试'
  }
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

async function takeAllItems() {
  const playerId = Number(localStorage.getItem('playerId'))
  const items = [...currentRoom.value.itemList]
  let picked = 0
  for (const item of items) {
    if (backpackCount.value + picked >= backpackSize.value) break
    try {
      await backpackApi.pickItem(playerId, item.itemId)
      picked++
    } catch {
      break
    }
  }
  await loadRoom()
  await loadBackpack()
  actionMessage.value = `共拾取 ${picked} 件物品`
  if (currentRoom.value.itemList.length === 0) showCrate.value = false
  setTimeout(() => { actionMessage.value = '' }, 2000)
}

function handleKeydown(e: KeyboardEvent) {
  const map: Record<string, Direction> = { w: 'up', s: 'down', a: 'left', d: 'right' }
  const dir = map[e.key.toLowerCase()]
  if (dir) move(dir)
  if (e.key.toLowerCase() === 'r') {
    back()
  }
  if (e.key.toLowerCase() === 'h') {
    goHome()
  }
  if (e.key.toLowerCase() === 'b') {
    openBackpack()
  }
}

onMounted(() => {
  loadRoom()
  loadBackpack()
  window.addEventListener('keydown', handleKeydown)
  const mq = window.matchMedia('(max-width: 768px)')
  const onMediaChange = (e: MediaQueryListEvent) => { isMobile.value = e.matches }
  mq.addEventListener('change', onMediaChange)
  onUnmounted(() => mq.removeEventListener('change', onMediaChange))
})
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<style scoped>
.game-container {
  width: 100%;
  min-height: 100%;
  display: flex;
  transition: background 0.6s ease;
  color: #fff;
  padding: 24px;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

.game-layout {
  flex: 1;
  display: grid;
  grid-template-columns: minmax(240px, 280px) minmax(0, 1fr) minmax(220px, 260px);
  gap: 24px;
  min-height: 0;
}

.side-panel,
.scene-panel {
  min-height: 0;
}

.player-shell,
.scene-shell {
  position: relative;
  height: 100%;
  min-height: 0;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background:
    linear-gradient(180deg, rgba(5, 12, 34, 0.78), rgba(15, 23, 42, 0.62)),
    radial-gradient(circle at top, rgba(59, 130, 246, 0.16), transparent 48%);
  backdrop-filter: blur(18px);
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

.player-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 22px;
}

.panel-heading,
.scene-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel-kicker,
.scene-kicker {
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: rgba(191, 219, 254, 0.76);
}

.panel-title,
.scene-room {
  margin: 0;
  color: #f8fafc;
  font-size: 24px;
  font-weight: 700;
}

.player-card {
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.38);
  box-shadow: none;
}

.backpack-trigger {
  margin-top: auto;
  width: 100%;
  height: 44px;
}

.scene-shell {
  padding: 24px 28px 28px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.game-scene {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 40px;
  min-height: 0;
  position: relative;
  z-index: 1;
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

.arrow:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.room-info {
  max-width: 420px;
  padding: 22px 24px;
  border-radius: 22px;
  background: rgba(15, 23, 42, 0.34);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.room-info h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #f8fafc;
}

.room-desc {
  font-size: 13px;
  color: rgba(226, 232, 240, 0.78);
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

.scene-objects {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.room-item-panel {
  margin-top: 18px;
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.room-item-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
}

.room-item-count {
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(79, 70, 229, 0.18);
  color: #c4b5fd;
  font-size: 12px;
}

.room-item-empty {
  padding: 14px 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.28);
  color: rgba(226, 232, 240, 0.66);
  font-size: 13px;
}

.room-item-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.room-item-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 12px;
  align-items: center;
  padding: 10px 12px;
  border-radius: 14px;
  background: rgba(15, 23, 42, 0.26);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.room-item-name {
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: #f8fafc;
}

.room-item-meta {
  font-size: 12px;
  color: rgba(191, 219, 254, 0.8);
  white-space: nowrap;
}

.scene-object {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.scene-object:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.object-icon {
  font-size: 28px;
}

.object-label {
  font-size: 12px;
  color: #ccc;
}

.crate {
  border-color: rgba(255, 200, 100, 0.4);
  background: rgba(255, 200, 100, 0.1);
}

.crate:hover {
  border-color: rgba(255, 200, 100, 0.6);
  background: rgba(255, 200, 100, 0.2);
}

.crate-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.crate-modal {
  background: #2a2a3e;
  border: 1px solid #444;
  border-radius: 12px;
  width: 420px;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.crate-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #444;
}

.crate-header h3 {
  margin: 0;
  font-size: 18px;
}

.close-btn {
  background: none;
  border: none;
  color: #aaa;
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover {
  color: #fff;
}

.crate-items {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
}

.crate-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.crate-item:hover:not(.disabled) {
  background: rgba(255, 255, 255, 0.08);
}

.crate-item.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.crate-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.crate-item-name {
  font-size: 14px;
  font-weight: 500;
}

.crate-item-meta {
  font-size: 12px;
  color: #999;
}

.crate-empty {
  text-align: center;
  color: #666;
  padding: 24px;
}

.crate-footer {
  padding: 16px 20px;
  border-top: 1px solid #444;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.inventory-full-warning {
  color: #f56c6c;
  font-size: 13px;
  margin: 0;
}

@media (max-width: 1120px) {
  .game-layout {
    grid-template-columns: minmax(220px, 260px) minmax(0, 1fr);
  }

  .leaderboard-panel {
    grid-column: 1 / -1;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .game-container {
    padding: 10px;
  }

  .game-layout {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .player-shell,
  .scene-shell {
    border-radius: 22px;
  }

  .scene-shell {
    padding: 18px;
  }

  .game-scene {
    flex-direction: column;
    justify-content: flex-start;
    gap: 20px;
  }

  .nav-arrows {
    flex-direction: row;
    gap: 8px;
  }

  .arrow-row {
    gap: 8px;
  }

  .arrow {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }

  .room-info {
    max-width: 100%;
    text-align: center;
    padding: 18px;
  }

  .scene-objects {
    justify-content: center;
  }

  .room-item-row {
    grid-template-columns: 1fr;
    text-align: left;
  }

  .crate-modal {
    width: 90vw;
    max-height: 60vh;
  }
}
</style>
