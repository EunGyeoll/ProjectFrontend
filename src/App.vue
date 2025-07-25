<template>
  <div id="app">
    <!-- 공통 헤더 -->
    <Header />

    <NavBar/>

    <!-- 메인 콘텐츠 -->
    <main class="main-content">
      <router-view />
      <globalAlert />
    </main>

    <!-- 공통 푸터 -->
    <Footer />
  </div>
</template>

<script setup>
import Header from './components/common/Header.vue';
import Footer from './components/common/Footer.vue';
import NavBar from "@/components/common/NavBar.vue";
import { onMounted } from "vue";
import { useAuthStore } from "@/stores/authStore";
import globalAlert from './components/alert/globalAlert.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.restoreAuth(); // ✨ 자동 로그인 복구
});
</script>

<style scoped>
#app {
  font-family: 'Arial', sans-serif;
  color: #333;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}
</style>
