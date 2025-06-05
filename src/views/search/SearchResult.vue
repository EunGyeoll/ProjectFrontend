<template>
  <div class="container">
    <h2>🔍 "{{ keyword }}" 검색 결과</h2>

    <!-- 탭 버튼 -->
    <div class="tab-buttons">
      <button :class="{ active: tab === 'items' }" @click="tab = 'items'">상품</button>
      <button :class="{ active: tab === 'posts' }" @click="tab = 'posts'">게시글</button>
    </div>

    <!-- 카테고리 필터 (상품일 때만) -->
    <select v-if="tab === 'items'" v-model="selectedCategory" @change="page = 0; fetchSearchResults()">
      <option value="">전체 카테고리</option>
      <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
    </select>

    <!-- 카테고리 필터 (게시글일 때만) -->
    <select v-else-if="tab === 'posts'" v-model="selectedPostCategory" @change="page = 0; fetchSearchResults()">
      <option value="">전체 카테고리</option>
      <option v-for="cat in postCategories" :key="cat" :value="cat">{{ cat }}</option>
    </select>

    <!-- 로딩 표시 -->
    <div v-if="isLoading" class="loading">검색 중입니다...</div>

    <!-- 상품 결과 -->
    <section v-if="!isLoading && tab === 'items'">
      <div v-if="items.length === 0" class="empty">상품 검색 결과가 없습니다.</div>
      <div v-else class="item-grid">
        <div v-for="item in items" :key="item.itemId" class="item-card" @click="goToItemDetail(item.itemId)">
          <img :src="item.representativeImagePath" alt="상품 이미지" />
          <p class="name" v-html="highlight(item.itemName, keyword)"></p>
          <p class="price">{{ item.price.toLocaleString() }}원</p>
        </div>
      </div>
    </section>

    <!-- 게시글 결과 -->
    <section v-if="!isLoading && tab === 'posts'">
      <div v-if="posts.length === 0" class="empty">게시글 검색 결과가 없습니다.</div>
      <div v-else class="post-list">
        <div v-for="post in posts" :key="post.postNo" class="post-card" @click="goToPostDetail(post.postNo)">
          <img v-if="post.representativeImagePath" :src="post.representativeImagePath" class="post-img" />
          <div class="post-info">
            <h4 class="post-title" v-html="highlight(post.title, keyword)"></h4>
            <p class="meta">{{ post.writerNickname }} · {{ formatDate(post.postDate) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 페이지네이션 -->
    <div class="pagination" v-if="!isLoading && (tab === 'items' ? items.length : posts.length)">
      <button @click="prevPage" :disabled="page === 0">이전</button>
      <span>{{ page + 1 }}</span>
      <button @click="nextPage" :disabled="!hasNext">다음</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { searchAll } from '@/apis/searchApi';
import axiosInstance from '@/plugin/axiosInstance';

const route = useRoute();
const router = useRouter();

const keyword = ref(route.query.keyword || '');
const tab = ref('items');
const page = ref(0);
const size = ref(5);
const hasNext = ref(false);
const isLoading = ref(false);
const items = ref([]);
const posts = ref([]);

const selectedCategory = ref('');
const categories = ref([]);
const selectedPostCategory = ref('');
const postCategories = ref([]);

const fetchSearchResults = async () => {
  if (!keyword.value) return;
  isLoading.value = true;
  try {
    const res = await searchAll(keyword.value, page.value, size.value, selectedCategory.value);
    items.value = res.data.items || [];
    posts.value = res.data.posts || [];
    hasNext.value = res.data.hasNext || false;
  } catch (e) {
    console.error('검색 실패:', e);
  } finally {
    isLoading.value = false;
  }
};

const highlight = (text, keyword) => {
  if (!keyword) return text;
  return text.replace(new RegExp(`(${keyword})`, 'gi'), '<mark>$1</mark>');
};

const goToItemDetail = (itemId) => router.push(`/items/${itemId}`);
const goToPostDetail = (postNo) => router.push(`/posts/${postNo}`);
const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('ko-KR');
const nextPage = () => { page.value++; fetchSearchResults(); };
const prevPage = () => { if (page.value > 0) page.value--; fetchSearchResults(); };

onMounted(async () => {
  try {
    const res = await axiosInstance.get('/api/item-categories');
    categories.value = Array.isArray(res.data)
      ? res.data.map(cat => cat.categoryName)
      : [];
  } catch (e) {
    console.error('item 카테고리 불러오기 실패:', e);
  }

  try {
    const res = await axiosInstance.get('/api/post-categories');
    postCategories.value = Array.isArray(res.data)
      ? res.data.map(cat => cat.categoryName)
      : [];
  } catch (e) {
    console.error('post 카테고리 불러오기 실패: ', e);
  }

  fetchSearchResults();
});

watch(() => route.query.keyword, (val) => {
  keyword.value = val;
  page.value = 0;
  fetchSearchResults();
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 40px auto;
  padding: 0 20px;
}
.tab-buttons {
  display: flex;
  gap: 12px;
  margin: 16px 0;
}
.tab-buttons button {
  padding: 8px 16px;
  font-weight: bold;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}
.tab-buttons button.active {
  background-color: #ff84a2;
  color: white;
  border-color: #ff84a2;
}
.loading {
  text-align: center;
  padding: 30px;
  font-weight: bold;
  color: #999;
}
.empty {
  margin-top: 40px;
  color: #888;
  font-style: italic;
}
.item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}
.item-card {
  width: 200px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  cursor: pointer;
}
.item-card img {
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
}
.name {
  font-weight: 600;
  margin-bottom: 4px;
}
.price {
  color: #555;
  font-size: 14px;
}
.post-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
  padding: 12px 0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
.post-card:hover {
  background-color: #f9f9f9;
}
.post-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}
.post-info {
  display: flex;
  flex-direction: column;
}
.post-title {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}
.meta {
  color: #888;
  font-size: 13px;
}
.pagination {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin: 20px 0;
}
.pagination button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
