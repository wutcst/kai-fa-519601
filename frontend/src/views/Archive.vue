<template>
  <div class="archive-container">
    <h2>存档管理</h2>
    <div class="actions">
      <el-button type="success" @click="startNewGame">新建游戏</el-button>
      <el-button @click="loadSaves">刷新列表</el-button>
    </div>
    <el-table :data="saves" style="width: 100%; margin-top: 16px">
      <el-table-column prop="save_id" label="存档ID" width="80" />
      <el-table-column prop="save_time" label="保存时间" />
      <el-table-column prop="player_score" label="分数" width="80" />
      <el-table-column prop="player_stamina" label="体力" width="80" />
      <el-table-column label="操作" width="160">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="readSave(row.save_id)">读取</el-button>
          <el-button size="small" type="danger" @click="deleteSave(row.save_id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { gameApi } from '@/api'

const router = useRouter()
const saves = ref<any[]>([])

async function loadSaves() {
  const res = await gameApi.getList()
  if (res.data.code === 200) saves.value = res.data.data || []
}

async function startNewGame() {
  const res = await gameApi.new()
  if (res.data.code === 200) router.push('/game')
  else ElMessage.error(res.data.message)
}

async function readSave(saveId: number) {
  const res = await gameApi.read(saveId)
  if (res.data.code === 200) router.push('/game')
  else ElMessage.error(res.data.message)
}

async function deleteSave(saveId: number) {
  await gameApi.delete(saveId)
  await loadSaves()
}

onMounted(loadSaves)
</script>

<style scoped>
.archive-container {
  width: 600px;
  padding: 32px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
}

h2 {
  margin-bottom: 16px;
}

.actions {
  display: flex;
  gap: 8px;
}
</style>