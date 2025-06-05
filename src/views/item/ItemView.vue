<template>
  <div class="item-view">
    <div class="item-view-header">
      <h1>전체 상품</h1>
      <button @click="goToForm" class="create-btn">상품 등록</button>
    </div>
    <select v-model="selectedCategory" @change="fetchItems">
      <option value="">전체</option>
      <option v-for="cat in categories" :key="cat" :value="cat">
        {{ cat }}
      </option>
    </select>

    <div v-if="items.length === 0" class="empty">상품이 없습니다.</div>

    <div v-else class="item-grid">
      <div v-for="item in items" :key="item.itemId" @click="goToDetail(item.itemId)" class="item-card">
        <img :src="item.representativeImagePath" alt="상품 이미지" />
        <p class="name">{{ item.itemName }}</p>
        <p class="price">{{ item.price.toLocaleString() }}원</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const items = ref([]);
const selectedCategory = ref(route.query.category || '');
const categories = ref(['배경화면', '폰꾸소품', '위젯']);

const fetchItems = async () => {
  try {
    const res = await axios.get('/api/items/list', {
      params: selectedCategory.value ? { category: selectedCategory.value } : {}
    });
    items.value = res.data.content || res.data;

    // URL 반영
    router.replace({ query: selectedCategory.value ? { category: selectedCategory.value } : {} });
  } catch (err) {
    console.error('상품 조회 실패:', err);
  }
};

const goToDetail = (itemId) => {
    router.push(`/items/${itemId}`);
  };
  

const goToForm = () => {
  console.log('폼 이동 시도'); 

  router.push('/items/new');
};

onMounted(fetchItems);

watch(
  () => route.query.category,
  (val) => {
    selectedCategory.value = val || '';
    fetchItems();
  }
);


</script>

<style scoped>
.item-view {
  max-width: 1200px;
  margin: auto;
  padding: 24px;
}

.item-view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.create-btn {
  background-color: #ff84a2;
  color: white;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 6px;
  border: none;
  text-decoration: none;
  transition: background 0.1  s;
}

.create-btn:hover {
  background-color: #e46d8c;
}


.create-btn:hover {
  background-color: #e46d8c;
}


select {
  padding: 8px;
  font-size: 14px;
  margin-bottom: 24px;
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

.empty {
  margin-top: 40px;
  color: #888;
}
</style>
