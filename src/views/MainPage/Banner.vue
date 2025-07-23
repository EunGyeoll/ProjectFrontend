<template>
<Swiper
  :modules="[Autoplay, Pagination, Navigation]"
  :slides-per-view="3"
  :space-between="20"  
  :loop="true"
  :autoplay="{ delay: 3000 }"
  :pagination="{ clickable: true }"
  :navigation="true"
  class="banner-carousel"
>
    <SwiperSlide v-for="(image, index) in images" :key="index">
      <img :src="image" class="carousel-image" alt="배너 이미지" />
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'

// 스타일 import
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

const images = [
  new URL('@/assets/banner/modisero.png', import.meta.url).href,
  new URL('@/assets/banner/handmodi.png', import.meta.url).href,
    new URL('@/assets/banner/airplanemodi.png', import.meta.url).href,
  new URL('@/assets/banner/nightmzz.jpg', import.meta.url).href,
  new URL('@/assets/banner/airplane.png', import.meta.url).href
]
</script>

<style >
.banner-carousel {
  width: 100%;
  height: 400px;
  position: relative;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
}

/* ✅ 화살표 스타일 수정 */
.swiper-button-prev,
.swiper-button-next {
  color: white;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.8);
  width: 44px;
  height: 44px;
}

/* 화살표 크기 및 hover 스타일 개선 */
.swiper-button-prev::after,
.swiper-button-next::after {
  font-size: 24px;
}
</style>
