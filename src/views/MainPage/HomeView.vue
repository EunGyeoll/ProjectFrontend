<template>
    <div class="home">
      <HeroSection />
      <!-- <CategorySection />
      <ProductList />
      <CreatorGuide />
      <CommunityFeed />
      <TestimonialSection /> -->
    </div>
  </template>
  
  <script setup>
  import HeroSection from "@/components/home/HeroSection.vue";
//   import CategorySection from "@/components/home/CategorySection.vue";
//   import ProductList from "@/components/home/ProductList.vue";
//   import CreatorGuide from "@/components/home/CreatorGuide.vue";
//   import CommunityFeed from "@/components/home/CommunityFeed.vue";
//   import TestimonialSection from "@/components/home/TestimonialSection.vue";
  </script>
  
  <style scoped>
  .home {
    display: flex;
    flex-direction: column;
    gap: 80px;
  }
  </style>
  