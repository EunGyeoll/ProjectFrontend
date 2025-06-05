<template>
  <div class="container">
    <!-- 배너 -->
    <section class="banner mb-4">
      <Banner />
    </section>

    <!-- 🔽 최근 등록된 상품 -->
    <section class="latest-items mb-5">
      <h3>🆕 최근 등록된 상품</h3>
      <ItemSwiper sortOption="latest" />
    </section>

    <!-- 🔽 찜 많은 인기 상품 -->
    <section class="popular-items mb-5">
      <h3>🔥 인기 상품</h3>
      <ItemSwiper sortOption="popular" />
    </section>
  </div>
</template>

<script setup>
import Banner from "@/views/MainPage/Banner.vue";
import ItemSwiper from "@/views/MainPage/ItemSwiper.vue"; // 경로는 실제 위치에 맞게 조정하세요
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px 0;
}

h3 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 16px;
}
</style>

  
  
 