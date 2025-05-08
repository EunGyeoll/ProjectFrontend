<template>
  <footer class="footer mt-auto py-4 bg-light text-center">
    <div class="container">
      <p class="mb-1">© 2025 Hatchie. All rights reserved.</p>
      <div>
        <router-link to="/about">서비스 소개</router-link> ·
        <router-link to="/terms">이용약관</router-link> ·
        <router-link to="/privacy">개인정보처리방침</router-link>
      </div>
    </div>
  </footer>
</template>

<script>
export default {
  name: 'Footer',
};
</script>

<style scoped>
.footer {
  font-family: 'Pretendard', sans-serif;
  font-size: 14px;
  color: #999;
  background-color: #fffefc;
}
.footer a {
  text-decoration: none;
  color: #999;
  margin: 0 4px;
}
.footer a:hover {
  color: #ff84a2;
}
</style>
