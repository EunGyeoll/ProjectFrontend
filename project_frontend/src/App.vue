<template>
  <div id="app">
    <!-- 공통 헤더 -->
    <Header />

    <!-- 공통 네비게이션 바 -->
    <NavBar />

    <!-- 라우터 뷰 -->
    <main class="main-content">
      <router-view />
    </main>

    <!-- 공통 푸터 -->
    <Footer />
  </div>
</template>

<script>
import Header from './components/common/Header.vue';
import Footer from './components/common/Footer.vue';
import NavBar from './components/common/NavBar.vue';

export default {
  name: 'App',
  components: {
    Header,
    Footer,
    NavBar, // NavBar 컴포넌트 추가
  },
};
</script>
