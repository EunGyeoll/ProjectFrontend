<template>
  <header class="site-header">
    <div class="inner-container">
      <div class="logo-img">
        <router-link to="/">
          <img src="@/assets/logo/modi_logo_transparent.webp" alt="로고" />
        </router-link>
      </div>

      <div class="search-bar">
        <input v-model="searchQuery" type="text" placeholder="검색어를 입력하세요" />
        <button @click="search">검색</button>
      </div>

      <nav class="navigation">
        <template v-if="isLoggedIn">
          <span class="welcome-text">
            <strong>{{ userId }}</strong>님
          </span>
          <router-link :to="`/mypage/${userId}`">마이페이지</router-link>
          <button @click="handleLogout" class="btn btn-outline-secondary">로그아웃</button>        </template>
        <template v-else>
          <router-link to="/login">로그인</router-link>
          <router-link to="/join">회원가입</router-link>
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
  const keyword = searchQuery.value.trim();
  if (!keyword) return;

  router.push({
    path: "/search",
    query: {keyword}
  });
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
  /* background-color: #fffdf9; */
  border-bottom: 1px solid #eee;
}

.inner-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.logo-img img {
  height: 60px;
  max-width: 160px;
}

@media (max-width: 768px) {
  .search-bar {
    display: none;
  }
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
  border-radius: 8px;
}

.search-bar button {
  padding: 8px 16px;
  background-color: #8E7CFF;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

.search-bar button:hover {
  background-color: #7a6ce6;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.navigation a,
.navigation button {
  text-decoration: none;
  color: #8E7CFF;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
}

.navigation a:hover,
.navigation button:hover {
  color: #7a6ce6;
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
