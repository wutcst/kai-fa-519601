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
  background:
    linear-gradient(160deg, rgba(15, 23, 42, 0.92), rgba(30, 41, 59, 0.82)),
    radial-gradient(circle at top, rgba(59, 130, 246, 0.18), transparent 50%);
  backdrop-filter: blur(22px);
  border-radius: 24px;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(148, 163, 184, 0.18);
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
  background:
    linear-gradient(135deg, rgba(79, 70, 229, 0.22), rgba(14, 165, 233, 0.12));
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.42);
  color: #cbd5e1;
  font-size: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.close-btn:hover {
  color: #fff;
  background: rgba(79, 70, 229, 0.35);
  transform: translateY(-1px);
}

.panel-title {
  margin: 0 0 8px;
  font-size: 28px;
  font-weight: 700;
  color: #f8fafc;
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
  background: linear-gradient(135deg, #4338ca, #0ea5e9);
  color: #e0f2fe;
  font-size: 16px;
  box-shadow: 0 10px 25px rgba(37, 99, 235, 0.35);
}

.panel-subtitle {
  margin: 0;
  color: rgba(226, 232, 240, 0.8);
  font-size: 16px;
}

.panel-actions {
  display: flex;
  gap: 12px;
  padding: 20px 30px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.action-btn {
  flex: 1;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s, background 0.2s;
}

.action-btn:hover {
  transform: translateY(-1px);
}

.new-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border: 1px solid rgba(129, 140, 248, 0.28);
  color: #fff;
}

.new-btn:hover {
  box-shadow: 0 10px 30px rgba(79, 70, 229, 0.38);
}

.refresh-btn {
  background: rgba(15, 23, 42, 0.4);
  color: #e2e8f0;
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.refresh-btn:hover {
  background: rgba(30, 41, 59, 0.72);
  border-color: rgba(129, 140, 248, 0.3);
}

.save-table-wrapper {
  padding: 20px 30px;
}

:deep(.save-table) {
  width: 100%;
  border-radius: 14px;
  overflow: hidden;
  background: transparent;
  color: #e2e8f0;
  --el-table-border-color: rgba(148, 163, 184, 0.14);
  --el-table-row-hover-bg-color: rgba(79, 70, 229, 0.12);
  --el-table-header-bg-color: rgba(15, 23, 42, 0.9);
  --el-table-tr-bg-color: transparent;
  --el-table-bg-color: transparent;
  --el-fill-color-blank: transparent;
  --el-text-color-regular: #e2e8f0;
  --el-text-color-secondary: rgba(226, 232, 240, 0.72);
}

:deep(.save-table .el-table__row) {
  cursor: pointer;
}

:deep(.save-table .el-table__inner-wrapper::before) {
  display: none;
}

:deep(.save-table th.el-table__cell) {
  background: rgba(15, 23, 42, 0.9) !important;
  color: #cbd5e1;
  border-bottom: 1px solid rgba(148, 163, 184, 0.16);
  font-weight: 600;
}

:deep(.save-table td.el-table__cell) {
  background: transparent !important;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

:deep(.save-table .el-table__row:hover > td) {
  background: rgba(79, 70, 229, 0.12) !important;
}

:deep(.save-table .el-table__empty-block) {
  background: transparent;
}

:deep(.save-table .el-table__empty-text) {
  color: rgba(226, 232, 240, 0.72);
}

:deep(.table-actions .el-button--primary) {
  color: #93c5fd;
}

:deep(.table-actions .el-button--danger) {
  color: #fda4af;
}

.table-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.panel-footer {
  padding: 15px 30px;
  text-align: center;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  background: rgba(15, 23, 42, 0.4);
}

.footer-text {
  font-size: 12px;
  letter-spacing: 0.12em;
  color: rgba(148, 163, 184, 0.86);
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
