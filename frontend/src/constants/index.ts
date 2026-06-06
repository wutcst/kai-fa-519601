// ==================== 物品图标映射 ====================
export const ITEM_ICON_MAP: Record<string, string> = {
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
  体力药水: '⚡',
}

export function getItemIcon(name: string): string {
  return ITEM_ICON_MAP[name] || '🎒'
}

// ==================== 可使用的物品 ====================
export const USABLE_ITEMS = ['魔法饼干', '体力药水']

export function isUsableItem(name: string): boolean {
  return USABLE_ITEMS.includes(name)
}

// ==================== 房间描述 ====================
export const ROOM_DESCRIPTIONS: Record<string, string> = {
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

export function getRoomDescription(name: string): string {
  for (const [key, desc] of Object.entries(ROOM_DESCRIPTIONS)) {
    if (name.includes(key)) return desc
  }
  return '🔍 一个充满未知的房间，等待着你去探索其中的秘密。'
}

// ==================== 房间背景渐变 ====================
export const ROOM_BACKGROUND_MAP: Record<string, string> = {
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

export function getRoomBackground(name: string): string {
  for (const [key, gradient] of Object.entries(ROOM_BACKGROUND_MAP)) {
    if (name.includes(key)) return gradient
  }
  return '#1a1a2e'
}
