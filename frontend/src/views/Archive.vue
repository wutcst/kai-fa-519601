<template>
  <div class="archive-page">
    <div class="archive-panel">
      <!-- 标题区 -->
      <div class="panel-header">
        <button class="close-btn" title="返回登录" @click="backToLogin">✖</button>
        <h2 class="panel-title">
          <span class="title-icon">🎮</span> 游戏存档
        </h2>
        <p class="panel-subtitle">选择你的冒险旅程</p>
      </div>

      <!-- 操作栏 -->
      <div class="panel-actions">
        <button class="action-btn new-btn" @click="startNewGame">＋ 新建游戏</button>
        <button class="action-btn refresh-btn" @click="fetchSaves">↻ 刷新列表</button>
      </div>

      <!-- 存档槽列表 -->
      <div class="save-slots">
        <div
          v-for="(save, idx) in saves"
          :key="save.saveId"
          class="save-slot"
          :class="{ selected: selectedSave === idx }"
          @click="readSave(save.saveId, idx)"
        >
          <div class="slot-number">{{ idx + 1 }}</div>
          <div class="save-content">
            <div class="save-info">
              <h3 class="save-name">存档 #{{ save.saveId }}</h3>
              <div class="save-details">
                <span class="detail-item">分数 {{ save.playerScore }}</span>
                <span class="detail-item">体力 {{ save.playerStamina }}</span>
                <span class="detail-item">房间 {{ save.playerRoomId }}</span>
              </div>
              <div class="save-meta">
                <span class="save-time">{{ formatTime(save.saveTime) }}</span>
              </div>
            </div>
          </div>
          <div class="slot-actions">
            <button
              class="slot-btn delete-btn"
              title="删除存档"
              @click.stop="deleteSave(save.saveId)"
            >
              删除
            </button>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="saves.length === 0" class="empty-state">
          <span class="empty-text">暂无存档，点击上方按钮开始新游戏</span>
        </div>
      </div>

      <!-- 底部 -->
      <div class="panel-footer">
        <span class="footer-text">Zuulventurers</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { gameApi } from '@/api'
import dayjs from 'dayjs'

const router = useRouter()

interface SaveRecord {
  saveId: number
  playerId: number
  saveTime: string
  playerScore: number
  playerStamina: number
  playerRoomId: number
}

const saves = ref<SaveRecord[]>([])
const selectedSave = ref<number | null>(null)

function getPlayerId(): number {
  const id = localStorage.getItem('playerId')
  return id ? Number(id) : 0
}

async function fetchSaves() {
  try {
    const playerId = getPlayerId()
    if (!playerId) {
      ElMessage.warning('请先登录')
      router.push('/welcome/login')
      return
    }
    const res = await gameApi.getList(playerId)
    if (res.data.code === 200) {
      saves.value = res.data.data || []
      selectedSave.value = saves.value.length > 0 ? 0 : null
    } else {
      ElMessage.error(res.data.message || '获取存档列表失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || err.message || '获取存档列表失败')
  }
}

async function startNewGame() {
  try {
    const playerId = getPlayerId()
    if (!playerId) {
      ElMessage.warning('请先登录')
      return
    }
    const res = await gameApi.new(playerId)
    if (res.data.code === 200) {
      router.push('/game')
    } else {
      ElMessage.error(res.data.message || '创建游戏失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || err.message || '创建游戏失败')
  }
}

async function readSave(saveId: number, idx: number) {
  try {
    selectedSave.value = idx
    const res = await gameApi.read(saveId)
    if (res.data.code === 200 && res.data.data) {
      const saveData = res.data.data
      const encoded = encodeURIComponent(JSON.stringify(saveData))
      router.push({ path: '/game', query: { save: encoded } })
    } else {
      ElMessage.error(res.data.message || '读取存档失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || err.message || '读取存档失败')
  }
}

async function deleteSave(saveId: number) {
  try {
    await ElMessageBox.confirm('确认删除此存档？', '提示', {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      type: 'warning',
    })
    const res = await gameApi.delete(saveId)
    if (res.data.code === 200) {
      ElMessage.success('删除成功')
      saves.value = saves.value.filter((s) => s.saveId !== saveId)
      selectedSave.value = saves.value.length > 0 ? 0 : null
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err.response?.data?.message || err.message || '删除失败')
    }
  }
}

function backToLogin() {
  router.push('/welcome/login')
}

function formatTime(t: string): string {
  return dayjs(t).format('YYYY-MM-DD HH:mm')
}

onMounted(fetchSaves)
</script>

<style scoped>
.archive-page {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.archive-panel {
  width: 100%;
  max-width: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from { opacity: 0; transform: translateY(30px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ---- 标题区 ---- */
.panel-header {
  position: relative;
  padding: 30px 30px 20px;
  text-align: center;
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.1), rgba(124, 58, 237, 0.1));
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  border: none;
  background-color: transparent;
  font-size: 20px;
  cursor: pointer;
  color: #6b7280;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #1f2937;
}

.panel-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: bold;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 32px;
}

.panel-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

/* ---- 操作栏 ---- */
.panel-actions {
  display: flex;
  gap: 12px;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.action-btn {
  flex: 1;
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.new-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: #fff;
}

.new-btn:hover {
  box-shadow: 0 6px 20px rgba(79, 70, 229, 0.35);
}

.refresh-btn {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border: 1px solid rgba(107, 114, 128, 0.2);
}

.refresh-btn:hover {
  background: rgba(107, 114, 128, 0.2);
}

/* ---- 存档槽 ---- */
.save-slots {
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
}

.save-slot {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: rgba(249, 250, 251, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.save-slot:hover {
  background: rgba(243, 244, 246, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.save-slot.selected {
  border-color: #4f46e5;
  background: rgba(79, 70, 229, 0.1);
}

.slot-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4f46e5;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  margin-right: 16px;
}

.save-content {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 16px;
}

.save-info {
  flex: 1;
}

.save-name {
  margin: 0 0 4px;
  font-size: 18px;
  font-weight: bold;
  color: #1f2937;
}

.save-details {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.detail-item {
  font-size: 14px;
  color: #4f46e5;
  font-weight: 500;
}

.save-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

/* ---- 槽内操作按钮 ---- */
.slot-actions {
  position: absolute;
  top: 12px;
  right: 12px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.save-slot:hover .slot-actions {
  opacity: 1;
}

.slot-btn {
  background: #ef4444;
  color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.1);
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.05);
}

/* ---- 空状态 ---- */
.empty-state {
  text-align: center;
  padding: 40px 20px;
}

.empty-text {
  color: #9ca3af;
  font-size: 15px;
}

/* ---- 底部 ---- */
.panel-footer {
  padding: 15px 30px;
  text-align: center;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  background: rgba(249, 250, 251, 0.5);
}

.footer-text {
  font-size: 12px;
  color: #9ca3af;
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .archive-page {
    padding: 10px;
  }

  .panel-header {
    padding: 20px;
  }

  .panel-title {
    font-size: 22px;
  }

  .panel-subtitle {
    font-size: 14px;
  }

  .panel-actions {
    padding: 15px 20px;
    flex-direction: column;
  }

  .save-slots {
    padding: 15px 20px;
  }

  .save-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .save-details {
    flex-wrap: wrap;
  }

  .slot-actions {
    opacity: 1;
    position: static;
    margin-left: auto;
  }

  .slot-btn {
    padding: 4px 6px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .panel-header {
    padding: 15px;
  }

  .panel-title {
    font-size: 20px;
  }

  .save-slots {
    padding: 12px 16px;
    gap: 10px;
  }

  .slot-number {
    width: 28px;
    height: 28px;
    font-size: 12px;
    margin-right: 12px;
  }

  .save-name {
    font-size: 16px;
  }

  .detail-item {
    font-size: 12px;
  }

  .save-meta {
    font-size: 10px;
  }

  .close-btn {
    top: 16px;
    right: 16px;
  }
}
</style>