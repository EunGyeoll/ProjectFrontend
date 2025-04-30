<template>
  <header class="site-header">
    <div class="inner-container">
      <div class="logo-img">
        <router-link to="/">
          <img src="@/assets/logo/launchie_white_bg.png" alt="로고" class="logo-img" />
        </router-link>
      </div>

      <div class="search-bar">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="검색어를 입력하세요"
        />
        <button @click="search">검색</button>
      </div>

      <nav class="navigation">
        <template v-if="isLoggedIn">
          <span class="welcome-text">
            안녕하세요, <strong>{{ userId }}</strong>님
          </span>
          <!-- ✨ 마이페이지 버튼 -->
          <router-link :to="`/mypage/${userId}`">마이페이지</router-link>
          <button @click="handleLogout">로그아웃</button>
          <router-link to="/create" class="highlight">상품 등록</router-link>
        </template>
        <template v-else>
          <router-link to="/login">로그인</router-link>
          <router-link to="/join">회원가입</router-link>
          <router-link to="/create" class="highlight">상품 등록</router-link>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/authStore";

const searchQuery = ref("");
const authStore = useAuthStore();
const router = useRouter();

const isLoggedIn = computed(() => authStore.isLoggedIn);
const userId = computed(() => authStore.user.id); 
const search = () => {
  console.log("검색 요청:", searchQuery.value);
};

const handleLogout = () => {
  authStore.clearAuth();
  localStorage.removeItem("token");
  router.push("/login");
};
</script>


<style scoped>
.site-header {
  padding: 16px 0;
}

.inner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.logo-img {
  height: 100px;
  object-fit: contain;
}

.search-bar {
  display: flex;
  align-items: center;
  flex-grow: 1;
  max-width: 600px;
  gap: 8px;
}

.search-bar input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.search-bar button {
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.search-bar button:hover {
  background-color: #0056b3;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 16px;
}

.navigation a {
  text-decoration: none;
  color: #007bff;
  font-weight: 500;
  transition: color 0.3s ease;
}

.navigation a:hover {
  text-decoration: underline;
  color: #0056b3;
}

.navigation .highlight {
  color: #28a745;
  font-weight: bold;
}

.welcome-text {
  font-weight: 500;
  color: #333;
}
</style>
