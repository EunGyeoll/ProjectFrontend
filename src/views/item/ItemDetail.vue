<template>
    <div class="item-detail-container" v-if="item">
      <div class="item-header">
        <img class="item-image" :src="item.representativeImagePath" alt="대표 이미지" />
        <div class="info">
          <h1 class="title">{{ item.itemName }}</h1>
          <p class="price">{{ formatPrice(item.price) }}원</p>
          <!-- <p class="stock">재고: {{ item.stockQuantity }}개</p> -->
          <p class="category">카테고리: {{ item.categoryName }}</p>
        </div>
      </div>
  
      <div class="description">
        <h2>상품 설명</h2>
        <p v-html="item.description"></p>
      </div>
  
      <div class="gallery" v-if="item.imagePaths && item.imagePaths.length">
        <h2>추가 이미지</h2>
        <div class="image-list">
          <img v-for="(img, i) in item.imagePaths" :key="i" :src="img" class="gallery-image" />
        </div>
      </div>
    </div>
    <div v-else class="loading">상품 정보를 불러오는 중입니다...</div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axiosInstance from '@/plugin/axiosInstance';
  
  const item = ref(null);
  const route = useRoute();
  
  const fetchItem = async () => {
    try {
      const id = route.params.id;
      const res = await axiosInstance.get(`/api/items/${id}`);
      item.value = res.data;
    } catch (err) {
      console.error('상품 조회 실패:', err);
    }
  };
  
  const formatPrice = (price) => {
    return price?.toLocaleString() || 0;
  };
  
  onMounted(fetchItem);
  </script>
  
  <style scoped>
  .item-detail-container {
    max-width: 800px;
    margin: auto;
    padding: 24px;
  }
  
  .item-header {
    display: flex;
    gap: 24px;
    align-items: flex-start;
  }
  
  .item-image {
    width: 200px;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #ccc;
  }
  
  .info {
    flex: 1;
  }
  
  .title {
    font-size: 24px;
    font-weight: bold;
    margin-bottom: 12px;
  }
  
  .price {
    font-size: 18px;
    color: #e46d8c;
    margin-bottom: 8px;
  }
  
  .stock,
  .category {
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
  }
  
  .description {
    margin-top: 32px;
  }
  
  .description h2 {
    font-size: 18px;
    margin-bottom: 12px;
  }
  
  .description p {
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  .gallery {
    margin-top: 32px;
  }
  
  .image-list {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }
  
  .gallery-image {
    width: 120px;
    height: 120px;
    object-fit: cover;
    border-radius: 6px;
    border: 1px solid #ddd;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
  </style>
  