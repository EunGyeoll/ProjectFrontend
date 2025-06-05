<template>
    <Swiper
      :modules="[Navigation]"
      :slides-per-view="3"
      :space-between="20"
      :navigation="true"
      class="item-swiper"
    >
      <SwiperSlide v-for="item in items" :key="item.id">
        <router-link :to="`/items/${item.itemId}`" class="card-link">
          <div class="card">
            <img :src="item.representativeImagePath" alt="상품 이미지" />
            <div class="card-body">
              <h5>{{ item.itemName }}</h5>
              <p>{{ item.price.toLocaleString() }}원</p>
            </div>
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
      items.value = res.data.content
    } catch (error) {
      console.error('❌ 상품 가져오기 실패:', error)
    }
  })
  </script>
  
  <style scoped>
  .item-swiper {
    padding: 10px 0;
  }
  
  .card-link {
    text-decoration: none;
    color: inherit;
  }
  
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    background: white;
    transition: box-shadow 0.2s;
  }
  
  .card:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  
  .card img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .card-body {
    padding: 10px;
  }
  </style>
  