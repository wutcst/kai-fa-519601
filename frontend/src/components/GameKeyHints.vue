<template>
  <div class="key-hint-wrapper">
    <div class="hint-row">
      <span class="hint-label">房间移动</span>
    </div>
    <div class="hint-row">
      <div class="dir-pad">
        <div class="key">W</div>
        <div class="key">A</div>
        <div class="key">S</div>
        <div class="key">D</div>
      </div>
    </div>
    <div class="hint-row">
      <div class="key key-single">R</div>
      <span class="hint-label">回到上一房间</span>
    </div>
    <div class="hint-row">
      <div class="key key-single">H</div>
      <span class="hint-label">回到初始房间</span>
    </div>
    <div class="hint-row">
      <div class="key key-single">B</div>
      <span class="hint-label">打开背包</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
.key-hint-wrapper {
  position: absolute;
  left: 1.5rem;
  top: 30%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
  user-select: none;
  pointer-events: none;
  z-index: 50;
}

.key {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(255, 255, 255, 0.7);
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.1rem;
  color: #fff;
  box-sizing: border-box;
}

.key-single {
  width: 48px;
  height: 48px;
}

.dir-pad {
  display: grid;
  grid-template-columns: repeat(3, 48px);
  grid-template-rows: repeat(3, 48px);
  gap: 0;
}

.dir-pad .key:nth-child(1) { grid-column: 2 / 3; grid-row: 1 / 2; }
.dir-pad .key:nth-child(2) { grid-column: 1 / 2; grid-row: 2 / 3; }
.dir-pad .key:nth-child(3) { grid-column: 2 / 3; grid-row: 2 / 3; }
.dir-pad .key:nth-child(4) { grid-column: 3 / 4; grid-row: 2 / 3; }

.hint-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  pointer-events: none;
}

.hint-label {
  font-size: 0.9rem;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  opacity: 0.85;
}

@media (max-width: 800px) {
  .key-hint-wrapper {
    display: none;
  }
}
</style>