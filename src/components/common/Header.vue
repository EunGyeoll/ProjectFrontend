<template>
  <header class="site-header">
    <div class="inner-container">
      <div class="logo-img">
        <router-link to="/">
          <img src="@/assets/logo/modi_logo_transparent.webp" alt="로고" />
        </router-link>
      </div>

<div class="search-bar">
  <input
    v-model="searchQuery"
    type="text"
    placeholder="관심 있는 아이템이나 게시글을 검색해보세요"
    @keyup.enter="search"
  />

  <button @click="search" aria-label="검색">
    <font-awesome-icon icon="magnifying-glass" />
  </button>
</div>

<nav class="navigation">
  <template v-if="isLoggedIn">
    <router-link
      :to="`/mypage/${userId}`"
      class="icon-link"
      aria-label="마이페이지"
    >
      <font-awesome-icon :icon="['far', 'user']" />
    </router-link>

    <router-link
      to="/chat"
      class="icon-link"
      aria-label="채팅"
    >
      <font-awesome-icon :icon="['far', 'comment']" />
    </router-link>

    <button
      @click="handleLogout"
      class="logout-btn"
    >
      로그아웃
    </button>
  </template>

  <template v-else>
    <router-link to="/login">로그인</router-link>

    <router-link to="/join" class="join-link">
      회원가입
    </router-link>
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
    query: { keyword },
  });
};

const handleLogout = () => {
  authStore.clearAuth();
  localStorage.removeItem("token");
  router.push("/login");
};
</script>

<style scoped>
.icon-link {
  width: 36px;
  height: 36px;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  color: #555;
  font-size: 16px;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.icon-link:hover {
  background: #f3f3f5;
  color: #111;

  transform: translateY(-1px);
}
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;

  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(14px);

  border-bottom: 1px solid #ececf3;
}

/* =========================
   INNER LAYOUT
========================= */
.inner-container {
  max-width: 1200px;
  height: 72px;

  margin: 0 auto;
  padding: 0 20px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 24px;
}

/* =========================
   LOGO
========================= */
.logo-img {
  flex-shrink: 0;
}

.logo-img img {
  height: 48px;
  max-width: 150px;
  display: block;
}

/* =========================
   SEARCH BAR
========================= */
.search-bar {
  flex: 1;
  max-width: 520px;
  height: 44px;

  display: flex;
  align-items: center;

  padding-left: 16px;

  border-radius: 999px;
  background: #f6f6f6;
  border: 1px solid transparent;

  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.search-bar:focus-within {
  background: #fff;
  border-color: #ddd;

  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.04);
}

.search-bar input {
  flex: 1;
  min-width: 0;

  border: none;
  outline: none;
  background: transparent;

  font-size: 14px;
  color: #222;
}

.search-bar input::placeholder {
  color: #999;
}

.search-bar button {
  width: 44px;
  height: 44px;

  border: none;
  border-radius: 50%;

  background: transparent;
  color: #666;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.search-bar button:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #111;
  transform: translateY(-1px);
}

/* =========================
   NAVIGATION
========================= */
.navigation {
  display: flex;
  align-items: center;
  gap: 14px;

  flex-shrink: 0;
  white-space: nowrap;
}

.navigation a,
.navigation button {
  text-decoration: none;
  border: none;
  background: none;

  cursor: pointer;

  color: #555;
  font-size: 14px;
  font-weight: 600;

  transition:
    color 0.2s ease,
    opacity 0.2s ease;
}

.navigation a:hover,
.navigation button:hover {
  color: #111;
}

/* =========================
   WELCOME TEXT
========================= */
.welcome-text {
  color: #666;
  font-size: 14px;
}

.welcome-text strong {
  color: #222;
  font-weight: 700;
}

/* =========================
   JOIN BUTTON
========================= */
.join-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  height: 36px;
  padding: 0 16px;

  border-radius: 999px;

  background: #7c6cff;
  color: white !important;

  font-weight: 700;

  transition:
    background 0.2s ease,
    transform 0.2s ease;
}

.join-link:hover {
  background: #6d5df3;
  color: white !important;

  transform: translateY(-1px);
}

/* =========================
   LOGOUT BUTTON
========================= */
.logout-btn {
  height: 34px;
  padding: 0 12px;

  border: 1px solid #ececf3 !important;
  border-radius: 999px !important;

  background: white !important;
  color: #666 !important;

  font-size: 13px;
  font-weight: 600;

  transition: 0.2s ease;
}

.logout-btn:hover {
  background: #f7f7f9 !important;
  color: #111 !important;
}

/* =========================
   TABLET
========================= */
@media (max-width: 900px) {
  .inner-container {
    gap: 16px;
  }

  .search-bar {
    max-width: 420px;
  }
}

/* =========================
   MOBILE
========================= */
@media (max-width: 768px) {
  .inner-container {
    height: auto;

    padding: 10px 16px 12px;

    display: grid;
    grid-template-columns: auto 1fr;

    gap: 10px 12px;
  }

  .logo-img {
    grid-column: 1;
  }

  .logo-img img {
    height: 42px;
  }

  .navigation {
    grid-column: 2;

    justify-self: end;

    gap: 10px;
  }

  .search-bar {
    grid-column: 1 / -1;

    width: 100%;
    max-width: none;
    height: 42px;
  }

  .welcome-text {
    display: none;
  }

  .navigation a,
  .navigation button {
    font-size: 13px;
  }

  .join-link,
  .logout-btn {
    height: 32px;
    padding: 0 12px;
    font-size: 12px;
  }

  .search-bar button {
    width: 42px;
    height: 42px;
  }
}
</style>