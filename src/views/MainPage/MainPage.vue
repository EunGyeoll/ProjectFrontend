<template>
  <main class="main-page">
    <!-- Hero / Banner -->
    <section class="hero-section">
      <Banner />
    </section>

    <!-- 인기 상품 -->
    <section class="section-block">
      <div class="section-header">
        <p class="section-label">POPULAR</p>
        <h2>많은 사람들이 찜한 인기 작품</h2>
        <p class="section-desc">사용자들이 가장 많이 관심을 보인 상품이에요.</p>
      </div>
      <ItemSwiper sortOption="popular" />
    </section>

    <!-- 최근 상품 -->
    <section class="section-block">
      <div class="section-header">
        <p class="section-label">NEW ITEMS</p>
        <h2>방금 올라온 크리에이터 작품</h2>
        <p class="section-desc">템플릿, 디자인 소스, 디지털 아이템을 둘러보세요.</p>
      </div>
      <ItemSwiper sortOption="latest" />
    </section>


    <!-- 커뮤니티 -->
    <section class="section-block">
      <div class="section-header">
        <p class="section-label">COMMUNITY</p>
        <h2>지금 MODI에서 나누는 이야기</h2>
        <p class="section-desc">
          크리에이터들의 고민, 작업 과정, 아이디어를 함께 나눠보세요.
        </p>
      </div>

      <PostSwiper sortOption="latest" />
    </section>
  </main>
</template>

<script setup>
import Banner from "@/views/MainPage/Banner.vue";
import ItemSwiper from "@/views/MainPage/ItemSwiper.vue";
import PostSwiper from "@/views/MainPage/PostList.vue";
</script>

<style scoped>
.main-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px 60px;
}

.hero-section {
  margin-bottom: 64px;
}

.section-block {
  margin-bottom: 72px;
}

.section-header {
  margin-bottom: 22px;
}

.section-label {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 700;
  color: #8e7cff;
  letter-spacing: 0.08em;
}

.section-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  color: #222;
}

.section-desc {
  margin-top: 8px;
  font-size: 15px;
  color: #777;
}
</style>