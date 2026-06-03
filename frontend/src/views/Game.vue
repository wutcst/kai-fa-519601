<template>
  <div class="game-shell">
    <div class="game-backdrop"></div>
    <div class="grid-overlay"></div>

    <section class="top-row">
      <PlayerInfo ref="playerInfoRef" />
      <div class="hero-summary">
        <p class="section-label">Playable Shell</p>
        <h1>Adventure Command Deck</h1>
        <p>
          This screen now reflects the real backend boundary. Player data and rankings are live,
          while room movement, items, and save systems remain staged until their APIs exist.
        </p>
      </div>
    </section>

    <section class="main-grid">
      <div class="stage-card">
        <div class="stage-copy">
          <p class="section-label">World Status</p>
          <h2>Room exploration is staged</h2>
          <p>
            The backend currently exposes player profile and leaderboard endpoints only. This scene
            keeps the final layout visible without sending requests to missing routes.
          </p>
        </div>

        <div class="stage-center">
          <div class="room-badge">ROOM DATA PENDING</div>
          <div class="signal-lines">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>

        <div class="control-grid">
          <button v-for="control in controls" :key="control.key" class="control-key" type="button" disabled>
            <span>{{ control.key }}</span>
            <small>{{ control.label }}</small>
          </button>
        </div>
      </div>

      <LeaderBoard />
    </section>

    <section class="status-grid">
      <article class="status-card active">
        <p class="section-label">Live Data</p>
        <h3>Connected now</h3>
        <ul>
          <li>Player login and registration</li>
          <li>Profile fetch and role entry page</li>
          <li>Leaderboard polling every 5 seconds</li>
        </ul>
      </article>

      <article class="status-card">
        <p class="section-label">Awaiting Backend</p>
        <h3>Disabled intentionally</h3>
        <ul>
          <li>Movement and teleport controls</li>
          <li>Room details and item pickup</li>
          <li>Backpack and save/load operations</li>
        </ul>
      </article>

      <article class="status-card hint">
        <p class="section-label">Keyboard Hints</p>
        <h3>Reserved controls</h3>
        <p>W A S D for movement, R for backtracking, H for home. The layout is ready; the requests are not bound yet.</p>
        <el-button type="primary" plain @click="refreshProfile">Refresh Player Panel</el-button>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import LeaderBoard from '@/components/LeaderBoard.vue'
import PlayerInfo from '@/components/PlayerInfo.vue'

const playerInfoRef = ref<InstanceType<typeof PlayerInfo> | null>(null)

const controls = [
  { key: 'W', label: 'Move Up' },
  { key: 'A', label: 'Move Left' },
  { key: 'S', label: 'Move Down' },
  { key: 'D', label: 'Move Right' },
  { key: 'R', label: 'Back' },
  { key: 'H', label: 'Home' },
]

function refreshProfile() {
  playerInfoRef.value?.refresh()
}
</script>

<style scoped>
.game-shell {
  --text: #eef3df;
  --muted: #a2b1bd;
  --accent: #c2ff72;
  position: relative;
  min-height: 100%;
  padding: 28px;
  overflow: hidden;
  color: var(--text);
  background:
    radial-gradient(circle at top left, rgba(104, 156, 74, 0.14), transparent 28%),
    radial-gradient(circle at 80% 10%, rgba(226, 138, 71, 0.14), transparent 22%),
    linear-gradient(145deg, #09101d 0%, #111a2c 42%, #18243a 100%);
}

.game-backdrop,
.grid-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.game-backdrop {
  background:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.88) 16%, rgba(0, 0, 0, 0.88));
}

.grid-overlay {
  inset: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
}

.top-row,
.main-grid,
.status-grid {
  position: relative;
  z-index: 1;
}

.top-row {
  display: grid;
  grid-template-columns: minmax(320px, 440px) minmax(0, 1fr);
  gap: 22px;
  align-items: stretch;
}

.hero-summary {
  padding: 26px 28px;
  border-radius: 26px;
  background: rgba(12, 18, 31, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.section-label {
  margin: 0 0 10px;
  color: var(--accent);
  font-size: 12px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-summary h1,
.stage-copy h2,
.status-card h3 {
  margin: 0;
}

.hero-summary h1 {
  font-size: clamp(34px, 4vw, 52px);
  line-height: 0.95;
}

.hero-summary p:last-child,
.stage-copy p,
.status-card p,
.status-card li {
  color: var(--muted);
  line-height: 1.7;
}

.main-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 360px);
  gap: 22px;
}

.stage-card,
.status-card {
  border-radius: 28px;
  background: rgba(12, 18, 31, 0.74);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.24);
}

.stage-card {
  padding: 30px;
  display: grid;
  gap: 28px;
}

.stage-center {
  min-height: 240px;
  border-radius: 24px;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at center, rgba(194, 255, 114, 0.08), transparent 46%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px dashed rgba(194, 255, 114, 0.18);
}

.room-badge {
  padding: 14px 18px;
  border-radius: 999px;
  background: rgba(194, 255, 114, 0.12);
  color: #eff7d8;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.signal-lines {
  display: grid;
  gap: 12px;
  position: absolute;
}

.signal-lines span {
  width: 180px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(194, 255, 114, 0.08), rgba(255, 255, 255, 0.28), rgba(194, 255, 114, 0.08));
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.control-key {
  min-height: 76px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.04);
  color: #f1f5e8;
  opacity: 0.72;
  cursor: not-allowed;
}

.control-key span,
.control-key small {
  display: block;
}

.control-key span {
  font-size: 24px;
  font-weight: 700;
}

.control-key small {
  margin-top: 8px;
  color: var(--muted);
}

.status-grid {
  margin-top: 22px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.status-card {
  padding: 24px;
}

.status-card ul {
  margin: 16px 0 0;
  padding-left: 18px;
}

.status-card.active {
  border-color: rgba(194, 255, 114, 0.18);
}

.status-card.hint {
  display: grid;
  gap: 14px;
  align-content: start;
}

@media (max-width: 1080px) {
  .top-row,
  .main-grid,
  .status-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .game-shell {
    padding: 18px;
  }

  .stage-card,
  .status-card,
  .hero-summary {
    padding: 22px;
  }

  .control-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
