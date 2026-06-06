<template>
  <div class="archive-page">
    <div class="archive-panel">
      <div class="panel-header">
        <button class="close-btn" title="返回登录" @click="backToLogin">×</button>
        <h2 class="panel-title">
          <span class="title-icon">存</span>
          游戏存档
        </h2>
        <p class="panel-subtitle">选择你的冒险旅程</p>
      </div>

      <div class="panel-actions">
        <button class="action-btn new-btn" @click="startNewGame">新建游戏</button>
        <button class="action-btn refresh-btn" @click="fetchSaves">刷新列表</button>
      </div>

      <div class="save-table-wrapper">
        <el-table
          :data="saves"
          class="save-table"
          empty-text="暂无存档，点击上方按钮开始新游戏"
          @row-click="handleRowClick"
        >
          <el-table-column label="#" width="72">
            <template #default="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="saveId" label="存档ID" min-width="110" />
          <el-table-column label="保存时间" min-width="180">
            <template #default="{ row }">
              {{ formatTime(row.saveTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="playerScore" label="分数" min-width="100" />
          <el-table-column prop="playerStamina" label="体力" min-width="100" />
          <el-table-column label="操作" width="140" align="center">
            <template #default="{ row, $index }">
              <div class="table-actions">
                <el-button type="primary" link @click.stop="readSave(row.saveId, $index)">
                  读取
                </el-button>
                <el-button type="danger" link @click.stop="deleteSave(row.saveId)">
                  删除
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

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
      const encoded = encodeURIComponent(JSON.stringify(res.data.data))
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

function handleRowClick(row: SaveRecord) {
  const idx = saves.value.findIndex((save) => save.saveId === row.saveId)
  if (idx >= 0) {
    readSave(row.saveId, idx)
  }
}

function backToLogin() {
  router.push('/welcome/login')
}

function formatTime(time: string): string {
  return dayjs(time).format('YYYY-MM-DD HH:mm')
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
  max-width: 860px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  animation: slideInUp 0.6s ease-out;
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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
  background: transparent;
  color: #6b7280;
  font-size: 24px;
  cursor: pointer;
}

.close-btn:hover {
  color: #1f2937;
}

.panel-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.title-icon {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #4f46e5;
  color: #fff;
  font-size: 16px;
}

.panel-subtitle {
  margin: 0;
  color: #6b7280;
  font-size: 16px;
}

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

.save-table-wrapper {
  padding: 20px 30px;
}

:deep(.save-table) {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
}

:deep(.save-table .el-table__row) {
  cursor: pointer;
}

:deep(.save-table .el-table__row:hover > td) {
  background: rgba(79, 70, 229, 0.06) !important;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

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

  .save-table-wrapper {
    padding: 15px 20px;
  }
}
</style>
