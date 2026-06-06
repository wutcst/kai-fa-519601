<template>
  <el-dialog
    v-model="visible"
    title="背包"
    width="520px"
    :close-on-click-modal="false"
    @open="onOpen"
  >
    <!-- 背包容量信息 -->
    <div class="backpack-header">
      <span class="capacity"> 容量：{{ items.length }} / {{ backpackSize }} </span>
    </div>

    <!-- 物品列表 -->
    <div v-if="items.length === 0" class="empty-tip">背包空空如也</div>
    <div v-else class="item-list">
      <div v-for="item in items" :key="item.itemId" class="item-row">
        <span class="item-icon">{{ ITEM_ICON_MAP[item.itemName] || '🎒' }}</span>
        <div class="item-info">
          <span class="item-name">{{ item.itemName }}</span>
          <span class="item-meta">重量: {{ item.itemSize }} | 价值: {{ item.itemValue }}</span>
        </div>
        <div class="item-actions">
          <el-button
            v-if="isUsableItem(item.itemName)"
            size="small"
            type="success"
            :disabled="loading"
            @click="useItem(item.itemId)"
          >
            使用
          </el-button>
          <el-button size="small" type="danger" :disabled="loading" @click="dropItem(item.itemId)">
            丢弃
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { backpackApi } from '@/api'
import { ITEM_ICON_MAP, isUsableItem } from '@/constants'

// ==================== 弹窗状态 ====================
const visible = ref(false)
const loading = ref(false)
const items = ref<any[]>([])
const backpackSize = ref(0)

function open() {
  visible.value = true
}

function close() {
  visible.value = false
}

defineExpose({ open, close })

// ==================== 数据加载 ====================
async function onOpen() {
  await refresh()
}

async function refresh() {
  const playerId = Number(localStorage.getItem('playerId'))
  if (!playerId) return
  try {
    const res = await backpackApi.getList(playerId)
    if (res.data.code === 200) {
      const data = res.data.data
      items.value = data.itemList || []
      backpackSize.value = data.backpackSize || 0
    }
  } catch (err: any) {
    console.error('[Backpack] 获取背包列表失败:', err)
  }
}

// ==================== 操作 ====================
async function dropItem(itemId: number) {
  const playerId = Number(localStorage.getItem('playerId'))
  if (!playerId) return
  loading.value = true
  try {
    const res = await backpackApi.dropItem(playerId, itemId)
    if (res.data.code === 200) {
      ElMessage.success('已丢弃')
      await refresh()
    } else {
      ElMessage.error(res.data.message || '丢弃失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '丢弃失败')
  } finally {
    loading.value = false
  }
}

async function useItem(itemId: number) {
  const playerId = Number(localStorage.getItem('playerId'))
  if (!playerId) return
  loading.value = true
  try {
    const res = await backpackApi.useItem(playerId, itemId)
    if (res.data.code === 200) {
      ElMessage.success('使用成功！')
      await refresh()
    } else {
      ElMessage.error(res.data.message || '使用失败')
    }
  } catch (err: any) {
    ElMessage.error(err.response?.data?.message || '使用失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.backpack-header {
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}

.capacity {
  font-weight: 600;
}

.empty-tip {
  text-align: center;
  color: #999;
  padding: 40px 0;
  font-size: 15px;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: background 0.2s;
}

.item-row:hover {
  background: #e9ecef;
}

.item-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.item-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.item-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.item-meta {
  font-size: 12px;
  color: #888;
}

.item-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
</style>
