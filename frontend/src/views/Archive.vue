<template>
  <div class="archive-page">
    <div class="archive-card">
      <!-- 标题区 -->
      <div class="card-header">
        <button class="back-btn" title="返回登录" @click="backToLogin">✖</button>
        <h2 class="card-title">
          <span class="title-icon">🎮</span> 游戏存档
        </h2>
        <p class="card-subtitle">选择你的冒险旅程</p>
      </div>

      <!-- 操作栏 -->
      <div class="card-actions">
        <button class="action-btn new-btn" @click="startNewGame">＋ 新建游戏</button>
        <button class="action-btn refresh-btn" @click="fetchSaves">↻ 刷新列表</button>
      </div>

      <!-- 存档表格 -->
      <div class="table-wrapper">
        <el-table
          :data="saves"
          style="width: 100%"
          row-class-name="save-row"
          header-row-class-name="table-header-row"
          @row-click="onRowClick"
        >
          <el-table-column prop="saveId" label="存档ID" width="80" align="center" />
          <el-table-column label="保存时间" min-width="160">
            <template #default="{ row }">
              {{ formatTime(row.saveTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="playerScore" label="分数" width="90" align="center" />
          <el-table-column prop="playerStamina" label="体力" width="80" align="center" />
          <el-table-column label="操作" width="160" align="center">
            <template #default="{ row }">
              <button class="row-btn load-btn" @click.stop="readSave(row.saveId)">读取</button>
              <button class="row-btn del-btn" @click.stop="deleteSave(row.saveId)">删除</button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 底部 -->
      <div class="card-footer">
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

async function readSave(saveId: number) {
  try {
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
      await fetchSaves()
    } else {
      ElMessage.error(res.data.message || '删除失败')
    }
  } catch (err: any) {
    if (err !== 'cancel' && err !== 'close') {
      ElMessage.error(err.response?.data?.message || err.message || '删除失败')
    }
  }
}

function onRowClick(row: SaveRecord) {
  readSave(row.saveId)
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
}

.archive-card {
  width: 680px;
  max-width: 95vw;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.4);
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ---- 标题区 ---- */
.card-header {
  position: relative;
  padding: 32px 36px 0;
  text-align: center;
}

.back-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
}

.back-btn:hover {
  color: rgba(255, 255, 255, 0.9);
}

.card-title {
  margin: 0 0 6px;
  font-size: 26px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  font-size: 28px;
}

.card-subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

/* ---- 操作栏 ---- */
.card-actions {
  display: flex;
  gap: 10px;
  padding: 24px 36px 0;
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
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
}

.new-btn:hover {
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.35);
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.refresh-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}

/* ---- 表格 ---- */
.table-wrapper {
  padding: 20px 36px;
}

/* 深色表格覆盖 */
:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: rgba(255, 255, 255, 0.06);
  --el-table-border-color: rgba(255, 255, 255, 0.08);
  --el-table-text-color: rgba(255, 255, 255, 0.85);
  --el-table-header-text-color: rgba(255, 255, 255, 0.7);
  --el-table-row-hover-bg-color: rgba(102, 126, 234, 0.12);
  border-radius: 10px;
  overflow: hidden;
}

:deep(.el-table th.el-table__cell) {
  background-color: rgba(255, 255, 255, 0.06);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  font-weight: 600;
  font-size: 13px;
}

:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

:deep(.save-row) {
  cursor: pointer;
}

/* 行内按钮 */
.row-btn {
  padding: 4px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
  margin: 0 3px;
}

.row-btn:hover {
  transform: scale(1.05);
}

.load-btn {
  background: rgba(102, 126, 234, 0.25);
  color: #a5b4fc;
}

.load-btn:hover {
  background: rgba(102, 126, 234, 0.4);
}

.del-btn {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
}

.del-btn:hover {
  background: rgba(239, 68, 68, 0.35);
}

/* ---- 底部 ---- */
.card-footer {
  padding: 16px 36px;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

.footer-text {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.3);
}

/* ---- 响应式 ---- */
@media (max-width: 768px) {
  .archive-card {
    width: 100%;
    max-width: 100%;
    border-radius: 0;
  }

  .card-header {
    padding: 24px 20px 0;
  }

  .card-actions {
    padding: 20px 20px 0;
    flex-direction: column;
  }

  .table-wrapper {
    padding: 16px 12px;
  }
}
</style>