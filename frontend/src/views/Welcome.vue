<template>
  <div class="welcome-root">
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
import { ref, onMounted, onBeforeUnmount } from 'vue'

const slideImages = [
  'images/image-1.jpg',
  'images/image-2.jpg',
  'images/image-3.jpg',
  'images/image-4.png',
]

const currentSlide = ref(0)
let slideTimer: ReturnType<typeof setInterval>

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

onMounted(() => {
  preloadImages()
  startSlideshow()
})

onBeforeUnmount(() => {
  clearInterval(slideTimer)
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
  from { transform: scale(1); }
  to   { transform: scale(1.04); }
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

.shape:nth-child(1) { width: 80px;  height: 80px;  top: 20%; left: 10%; animation-delay: 0s; }
.shape:nth-child(2) { width: 120px; height: 120px; top: 60%; left: 80%; animation-delay: -5s; }
.shape:nth-child(3) { width: 60px;  height: 60px;  top: 80%; left: 20%; animation-delay: -10s; }
.shape:nth-child(4) { width: 100px; height: 100px; top: 10%; left: 70%; animation-delay: -15s; }

@keyframes float {
  0%   { transform: translateY(0) rotate(0);    opacity: 1; }
  50%  { transform: translateY(-100px) rotate(180deg); opacity: 0.5; }
  100% { transform: translateY(0) rotate(360deg); opacity: 1; }
}
</style>