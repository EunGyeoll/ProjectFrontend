<template>
  <header class="site-header">
    <div class="logo">
      <router-link to="/">중고거래</router-link>
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
      <router-link to="/login">로그인</router-link>
      <router-link to="/register">회원가입</router-link>
      <router-link to="/create">상품 등록</router-link>
    </nav>
  </header>
</template>

<script>
export default {
  data() {
    return {
      searchQuery: '',
    };
  },
  methods: {
    search() {
      console.log('검색 요청:', this.searchQuery);
      // 검색 기능 구현 가능
    },
  },
};
</script>

<style scoped>
.site-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
}
.logo {
  font-size: 24px;
  font-weight: bold;
  color: #333;
}
.logo a {
  text-decoration: none;
  color: inherit;
}
.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
}
.search-bar input {
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
}
.search-bar button:hover {
  background-color: #0056b3;
}
.navigation a {
  margin-left: 16px;
  text-decoration: none;
  color: #007bff;
}
.navigation a:hover {
  text-decoration: underline;
}
</style>
