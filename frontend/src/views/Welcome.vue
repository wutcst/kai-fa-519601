<template>
  <div class="welcome-shell">
    <div class="welcome-backdrop"></div>
    <div class="welcome-grid"></div>
    <div class="glow glow-left"></div>
    <div class="glow glow-right"></div>

    <section class="hero-panel">
      <p class="eyebrow">Terminal Expedition</p>
      <h1>Zuulventurers</h1>
      <p class="hero-copy">
        Enter the labyrinth, register your explorer, and step into a playable game shell that can
        evolve with the backend.
      </p>
      <div class="hero-meta">
        <span>100 Rooms</span>
        <span>Player System Online</span>
        <span>Adventure UI Refresh</span>
      </div>
    </section>

    <section class="auth-stage">
      <router-view />
    </section>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.welcome-shell {
  --panel-border: rgba(150, 180, 120, 0.18);
  --text: #f4f1de;
  --muted: #9fb0aa;
  --accent: #c2ff72;
  --accent-soft: rgba(194, 255, 114, 0.18);
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 32px;
  display: grid;
  grid-template-columns: minmax(260px, 520px) minmax(320px, 460px);
  align-items: center;
  justify-content: center;
  gap: 36px;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(120, 169, 96, 0.18), transparent 32%),
    radial-gradient(circle at 80% 20%, rgba(220, 133, 74, 0.16), transparent 22%),
    linear-gradient(145deg, #0d1321 0%, #151f35 42%, #1e2c44 100%);
}

.welcome-backdrop,
.welcome-grid,
.glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.welcome-backdrop {
  background:
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 72px 72px;
  mask-image: linear-gradient(to bottom, transparent, rgba(0, 0, 0, 0.8) 18%, rgba(0, 0, 0, 0.8));
}

.welcome-grid {
  inset: 18px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 28px;
}

.glow {
  filter: blur(70px);
  opacity: 0.55;
}

.glow-left {
  top: -10%;
  left: -8%;
  width: 340px;
  height: 340px;
  background: rgba(194, 255, 114, 0.22);
}

.glow-right {
  right: -4%;
  bottom: -8%;
  width: 280px;
  height: 280px;
  background: rgba(228, 137, 71, 0.18);
}

.hero-panel,
.auth-stage {
  position: relative;
  z-index: 1;
}

.hero-panel {
  padding: 40px;
  border-radius: 28px;
  background: linear-gradient(180deg, rgba(17, 24, 39, 0.78), rgba(11, 18, 30, 0.92));
  border: 1px solid var(--panel-border);
  box-shadow:
    0 24px 80px rgba(0, 0, 0, 0.34),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  color: var(--text);
}

.eyebrow {
  margin: 0 0 14px;
  font-size: 13px;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--accent);
}

h1 {
  margin: 0;
  font-size: clamp(42px, 5vw, 70px);
  line-height: 0.94;
  letter-spacing: -0.04em;
}

.hero-copy {
  margin: 22px 0 0;
  max-width: 28ch;
  font-size: 17px;
  line-height: 1.7;
  color: var(--muted);
}

.hero-meta {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hero-meta span {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid rgba(194, 255, 114, 0.14);
  background: var(--accent-soft);
  color: var(--text);
  font-size: 13px;
}

.auth-stage {
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 980px) {
  .welcome-shell {
    grid-template-columns: 1fr;
    padding: 24px;
  }

  .hero-panel {
    padding: 28px;
  }

  .hero-copy {
    max-width: none;
  }
}

@media (max-width: 640px) {
  .welcome-shell {
    padding: 18px;
    gap: 18px;
  }

  .hero-panel {
    padding: 22px;
    border-radius: 20px;
  }

  .hero-meta {
    gap: 8px;
  }

  .hero-meta span {
    width: 100%;
    text-align: center;
  }
}
</style>
