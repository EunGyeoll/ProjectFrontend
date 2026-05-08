<template>
  <Swiper
    :modules="[Autoplay, Pagination, Navigation]"
    :slides-per-view="1"
    :loop="true"
    :autoplay="{ delay: 4000 }"
    :pagination="{ clickable: true }"
    :navigation="true"
    class="banner-carousel"
  >
    <SwiperSlide v-for="(banner, index) in banners" :key="index">
      <div class="slide">
        <img :src="banner.image" class="carousel-image" />

        <!-- 🔥 overlay -->
        <div class="overlay">
          <h1>{{ banner.title }}</h1>
          <p>{{ banner.desc }}</p>
          <button class="cta">시작하기</button>
        </div>
      </div>
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Autoplay, Pagination, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const banners = [
  {
    image: new URL('@/assets/banner/modisero.png', import.meta.url).href,
    title: "모든 아이디어가 시작되는 곳, MODI",
    desc: "당신의 창작을 공유하고 수익으로 연결해보세요"
  },
  {
    image: new URL('@/assets/banner/hands_notext.png', import.meta.url).href,
    title: "당신의 작품을 세상에 보여주세요",
    desc: "디자인, 템플릿, 아이디어까지"
  },
  {
    image: new URL('@/assets/banner/airplane_notext.png', import.meta.url).href,
    title: "사람들과 연결되고 성장하세요",
    desc: "커뮤니티와 채팅으로 더 가까워집니다"
  }
];
</script>

<style scoped>
.banner-carousel {
  width: 100%;
  height: 400px;

  border-radius: 24px;
  overflow: hidden;
}

.slide {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 이미지 위 그라데이션 */
.slide::after {
  content: "";
  position: absolute;
  inset: 0;

  background: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.58) 0%,
    rgba(0, 0, 0, 0.34) 42%,
    rgba(0, 0, 0, 0.08) 100%
  );
}

/* 텍스트 영역 */
.overlay {
  position: absolute;
  z-index: 2;

  left: 90px;
  top: 50%;
  transform: translateY(-46%);

  color: white;
  max-width: 720px; /* 기존 520px → 720px */
}
.overlay h1 {
  margin: 0 0 14px;

  font-size: clamp(30px, 4vw, 36px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -0.04em;
}

.overlay p {
  margin: 0 0 28px;

  font-size: 17px;
  font-weight: 400;
  line-height: 1.6;

  color: rgba(255, 255, 255, 0.82);
}

/* 버튼 */
.cta {
  height: 46px;
  padding: 0 22px;

  border: none;
  border-radius: 10px;

  background: rgba(142, 124, 255, 0.95);
  color: white;

  font-size: 15px;
  font-weight: 700;

  cursor: pointer;
  transition: 0.2s ease;
}

.cta:hover {
  background: #7a6ce6;
  transform: translateY(-2px);
}

.cta:hover {
  background: #f3f3f3;
  transform: translateY(-2px);
}

/* Swiper pagination */
:deep(.swiper-pagination-bullet) {
  width: 7px;
  height: 7px;
  background: rgba(255, 255, 255, 0.7);
  opacity: 1;
}

:deep(.swiper-pagination-bullet-active) {
  width: 22px;
  border-radius: 999px;
  background: white;
}

/* Swiper navigation */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  width: 42px;
  height: 42px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(10px);

  color: white;
}

:deep(.swiper-button-prev::after),
:deep(.swiper-button-next::after) {
  font-size: 14px;
  font-weight: 800;
}

/* 모바일 */
/* 모바일 */
@media (max-width: 768px) {
  .banner-carousel {
    height: 340px;
    border-radius: 0 0 22px 22px;
  }

  .slide::after {
    background: linear-gradient(
      180deg,
      rgba(0, 0, 0, 0.18) 0%,
      rgba(0, 0, 0, 0.62) 100%
    );
  }

  .overlay {
    left: 24px;
    right: 24px;

    top: 50%;
    transform: translateY(-50%);

    max-width: none;
  }

  .overlay h1 {
    margin: 0 0 12px;

    font-size: clamp(24px, 6vw, 34px);
    line-height: 1.25;

    word-break: keep-all;
    white-space: normal;
  }

  .overlay p {
    font-size: 14px;
    line-height: 1.5;

    margin-bottom: 20px;

    color: rgba(255, 255, 255, 0.82);
  }

  .cta {
    height: 40px;
    padding: 0 18px;
    font-size: 13px;
  }

  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    display: none;
  }
}
</style>