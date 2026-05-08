<template>
  <Swiper
    :modules="[Navigation]"
    :slides-per-view="5"
    :space-between="12"
    :navigation="true"
    :prevent-clicks="true"
    :breakpoints="{
      320: { slidesPerView: 2, spaceBetween: 8 },
      480: { slidesPerView: 2.5, spaceBetween: 10 },
      768: { slidesPerView: 3.5, spaceBetween: 12 },
      1024: { slidesPerView: 5, spaceBetween: 12 },
    }"
      class="item-swiper"
    >
    <SwiperSlide v-for="item in items" :key="item.itemId">
      <router-link :to="`/items/${item.itemId}`" class="card-link">
  
        <div class="item-image">
          <img
            :src="item.representativeImagePath || defaultItemImage"
            alt="상품 이미지"
          />
        </div>

        <div class="item-info">
          <h3 class="item-title">{{ item.itemName }}</h3>

          <strong class="price">
            {{ item.price.toLocaleString() }}원
          </strong>
        </div>

      </router-link>
    </SwiperSlide>
  </Swiper>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { Swiper, SwiperSlide } from 'swiper/vue'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

import { fetchAllItems } from '@/apis/itemApi'

const defaultItemImage =
  'https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png'

const props = defineProps({
  sortOption: { type: String, default: 'latest' }
})

const items = ref([])

onMounted(async () => {
  try {
    const res = await fetchAllItems({
      sortOption: props.sortOption,
      page: 0,
      size: 10
    })
    items.value = res.data.content || []
  } catch (error) {
    console.error('❌ 상품 가져오기 실패:', error)
  }
})
</script>

<style scoped>
.item-swiper {
  padding: 4px 2px 28px;
}

.card-link {
  display: block;
  text-decoration: none;
  color: inherit;
}

.item-image {
  width: 100%;
  aspect-ratio: 1 / 1;

  overflow: hidden;
  border-radius: 16px;

  background: #f5f5f5;
  border: 1px solid #f0f0f0;

  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.item-image img {
  width: 100%;
  height: 100%;

  object-fit: cover;

  transition: transform 0.35s ease;
}

.card-link:hover .item-image {
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.card-link:hover .item-image img {
  transform: scale(1.04);
}

.item-info {
  margin-top: 12px;
  padding: 0 2px;
}

.item-title {
  margin: 0;
  letter-spacing: -0.01em;

  font-size: 13px;
  font-weight: 500;
  color: #444;

  line-height: 1.5;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.price {
  display: block;
  margin-top: 4px;

  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.02em;

  color: #111;
}

/* Swiper 기본 화살표 커스텀 */
:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
  width: 36px;
  height: 36px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ececf3;

  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);

  color: #222;

  transition:
    background 0.2s ease,
    transform 0.2s ease,
    opacity 0.2s ease;
}

:deep(.swiper-button-prev:hover),
:deep(.swiper-button-next:hover) {
  background: #fff;
  transform: translateY(-1px);
}

:deep(.swiper-button-prev::after),
:deep(.swiper-button-next::after) {
  font-size: 13px;
  font-weight: 800;
}

:deep(.swiper-button-disabled) {
  opacity: 0;
  pointer-events: none;
}

/* 모바일에서는 화살표 숨기고 스와이프 중심 */
@media (max-width: 768px) {
  .item-swiper {
    padding-bottom: 18px;
  }

  :deep(.swiper-button-prev),
  :deep(.swiper-button-next) {
    display: none;
  }

  .item-image {
    border-radius: 14px;
  }

  .item-title {
    font-size: 12px;
  }

  .price {
    font-size: 13px;
  }
}
</style>