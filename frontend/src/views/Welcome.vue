<template>
  <div class="welcome-root">
    <!-- 音乐 -->
    <audio
      ref="bgm"
      preload="auto"
      @ended="onTrackEnded"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @error="onAudioError"
    ></audio>

    <!-- 音乐开关按钮 -->
    <button class="music-toggle" @click="toggleMusic" :title="isPlaying ? '暂停音乐' : '播放音乐'">
      <!-- 播放状态：喇叭图标 -->
      <svg v-if="isPlaying" class="music-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      </svg>
      <!-- 暂停状态：静音喇叭图标 -->
      <svg v-else class="music-icon muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor"/>
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
      <!-- 播放时显示音波跳动条 -->
      <span v-if="isPlaying" class="sound-bars">
        <span class="bar" v-for="i in 4" :key="i" />
      </span>
    </button>

    <!-- 背景渐变 -->
    <div class="bg-gradient" />

    <!-- 背景轮播 -->
    <div class="bg-slideshow">
      <div
        v-for="(img, index) in slideImages"
        :key="index"
        class="slide"
        :class="{ active: currentSlide === index }"
        :style="{ backgroundImage: `url(${img})` }"
      />
    </div>

    <!-- 浮动形状 -->
    <div class="floating-shapes">
      <div v-for="n in 4" :key="`shape-${n}`" class="shape" />
    </div>

    <!-- 子路由 -->
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'

// Import music files
import bgm1 from '@/assets/bgm.mp3'
import bgm2 from '@/assets/bgm1.mp3'
import bgm3 from '@/assets/bgm3.mp3'

const playlist = [bgm1, bgm2, bgm3]

const slideImages = [
  '/images/image-1.jpg',
  '/images/image-2.jpg',
  '/images/image-3.jpg',
  '/images/image-4.png',
]

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval>

// Audio refs and state
const currentTrackIndex = ref(0)
const bgm = ref<HTMLAudioElement | null>(null)
const isPlaying = ref(false)
const audioEnabled = ref(false)

function preloadImages() {
  slideImages.forEach((src) => {
    const img = new Image()
    img.src = src
  })
}

function startSlideshow() {
  slideTimer = setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % slideImages.length
  }, 8000)
}

// ---- Audio functions ----

function enableAudioIfNeeded() {
  if (!audioEnabled.value && bgm.value && playlist.length > 0) {
    try {
      bgm.value.muted = false
      bgm.value.src = playlist[currentTrackIndex.value]
      bgm.value.play()
      isPlaying.value = true
      audioEnabled.value = true
    } catch {
      // Auto-play blocked
    }
  }
}

async function initializeMusic() {
  await nextTick()
  if (bgm.value && playlist.length > 0) {
    bgm.value.src = playlist[currentTrackIndex.value]
    bgm.value.volume = 0.3
    bgm.value.loop = false

    try {
      await bgm.value.play()
      isPlaying.value = true
      audioEnabled.value = true
    } catch {
      bgm.value.muted = true
      addUserInteractionListeners()
    }
  }
}

function onTrackEnded() {
  playNextTrack()
}

function onAudioError() {
  isPlaying.value = false
}

function playNextTrack() {
  if (playlist.length === 0) return
  currentTrackIndex.value = (currentTrackIndex.value + 1) % playlist.length
  if (bgm.value) {
    bgm.value.src = playlist[currentTrackIndex.value]
    if (audioEnabled.value) {
      bgm.value.play().catch(() => {
        isPlaying.value = false
      })
    }
  }
}

function addUserInteractionListeners() {
  const events = ['click', 'touchstart', 'keydown']
  const handleUserInteraction = () => {
    enableAudioIfNeeded()
    events.forEach((event) => {
      document.removeEventListener(event, handleUserInteraction)
    })
  }
  events.forEach((event) => {
    document.addEventListener(event, handleUserInteraction, { once: true })
  })
}

async function toggleMusic() {
  if (!bgm.value || playlist.length === 0) return
  try {
    if (isPlaying.value) {
      bgm.value.pause()
      isPlaying.value = false
    } else {
      if (bgm.value.src !== playlist[currentTrackIndex.value]) {
        bgm.value.src = playlist[currentTrackIndex.value]
      }
      await bgm.value.play()
      isPlaying.value = true
      audioEnabled.value = true
    }
  } catch {
    // Failed to toggle
  }
}

function stopMusic() {
  if (bgm.value) {
    bgm.value.pause()
    bgm.value.currentTime = 0
    isPlaying.value = false
  }
}

onMounted(() => {
  preloadImages()
  startSlideshow()
  initializeMusic()
})

onBeforeUnmount(() => {
  clearInterval(slideTimer)
  stopMusic()
})
</script>

<style scoped>
.welcome-root {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  font-family: 'Arial', sans-serif;
}

/* ---- 背景渐变 ---- */
.bg-gradient {
  position: fixed;
  inset: 0;
  z-index: -3;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
}

/* ---- 背景轮播 ---- */
.bg-slideshow {
  position: fixed;
  inset: 0;
  z-index: -2;
}

.slide {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transform: scale(1);
  transition: opacity 2s ease-in-out;
}

.slide.active {
  opacity: 1;
  animation: zoomIn 8s linear forwards;
}

@keyframes zoomIn {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.04);
  }
}

/* ---- 浮动形状 ---- */
.floating-shapes {
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.shape {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  animation: float 20s infinite linear;
}

.shape:nth-child(1) {
  width: 80px;
  height: 80px;
  top: 20%;
  left: 10%;
  animation-delay: 0s;
}
.shape:nth-child(2) {
  width: 120px;
  height: 120px;
  top: 60%;
  left: 80%;
  animation-delay: -5s;
}
.shape:nth-child(3) {
  width: 60px;
  height: 60px;
  top: 80%;
  left: 20%;
  animation-delay: -10s;
}
.shape:nth-child(4) {
  width: 100px;
  height: 100px;
  top: 10%;
  left: 70%;
  animation-delay: -15s;
}

@keyframes float {
  0% {
    transform: translateY(0) rotate(0);
    opacity: 1;
  }
  50% {
    transform: translateY(-100px) rotate(180deg);
    opacity: 0.5;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
}

/* ---- 音乐开关按钮 ---- */
.music-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 14px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 24px;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(8px);
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

.music-toggle:hover {
  background: rgba(0, 0, 0, 0.55);
  border-color: rgba(255, 255, 255, 0.6);
  transform: scale(1.05);
}

.music-icon {
  width: 22px;
  height: 22px;
  flex-shrink: 0;
}

.music-icon.muted {
  opacity: 0.6;
}

.sound-bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.bar {
  width: 3px;
  background: #fff;
  border-radius: 2px;
  animation: barBounce 0.8s ease-in-out infinite;
}

.bar:nth-child(1) {
  height: 8px;
  animation-delay: 0s;
}
.bar:nth-child(2) {
  height: 14px;
  animation-delay: 0.15s;
}
.bar:nth-child(3) {
  height: 10px;
  animation-delay: 0.3s;
}
.bar:nth-child(4) {
  height: 12px;
  animation-delay: 0.45s;
}

@keyframes barBounce {
  0%,
  100% {
    transform: scaleY(0.5);
  }
  50% {
    transform: scaleY(1);
  }
}
</style>
