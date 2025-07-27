<template>
  <nav class="navbar">
    <div class="nav-container">
      <button class="menu-toggle" @click="isOpen = !isOpen">☰ 메뉴</button>

      <div class="nav-items" :class="{ open: isOpen }">
        <router-link class="nav-item" to="/">홈</router-link>

        <!-- 커뮤니티 -->
        <div class="nav-item dropdown">
          <router-link class="dropdown-toggle" to="/posts">커뮤니티</router-link>
          <div class="dropdown-menu">
          <router-link
            v-for="cat in postCategories"
            :key="cat.categoryId"
            class="dropdown-item"
                :to="`/posts?category=${cat.categoryName}`">
            {{ cat.categoryName }}
          </router-link>
          </div>
        </div>

        <!-- 아이템 -->
        <div class="nav-item dropdown">
          <router-link class="dropdown-toggle" to="/items">아이템</router-link>
          <div class="dropdown-menu">
            <template v-for="cat in itemCategoryTree" :key="cat.categoryId">
              <router-link
                class="dropdown-item"
                :to="`/items?category=${cat.categoryName}`"
              >
                {{ cat.categoryName }}
              </router-link>
              <router-link
                v-for="child in cat.children"
                :key="child.categoryId"
                class="dropdown-item child-item"
                :to="`/items?category=${child.categoryName}`"
              >
                └ {{ child.categoryName }}
              </router-link>
            </template>
          </div>
        </div>

      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosInstance from '@/plugin/axiosInstance';

const isOpen = ref(false);
const postCategories = ref([]);
const itemCategoryTree = ref([]);

const fetchPostCategories = async () => {
  try {
    const res = await axiosInstance.get('/api/post-categories');
    postCategories.value = res.data;
  } catch (err) {
    console.error('📛 게시판 카테고리 불러오기 실패:', err);
  }
};

const fetchItemCategoryTree = async () => {
  try {
    const res = await axiosInstance.get('/api/item-categories/tree');
    itemCategoryTree.value = res.data;
  } catch (err) {
    console.error('📛 아이템 카테고리 트리 불러오기 실패:', err);
  }
};

onMounted(() => {
  fetchPostCategories();
  fetchItemCategoryTree();
});
</script>

<style scoped>
.navbar {
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  padding: 12px 0;
  font-weight: 500;
  font-size: 16px;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
}

.nav-items {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
  position: relative;
}

.nav-item {
  color: #333;
  text-decoration: none;
  transition: color 0.3s;
  position: relative;
}

.nav-item:hover {
  color: #ff84a2;
}

.router-link-active {
  color: #ff84a2;
}

.dropdown {
  position: relative;
}

.dropdown-toggle {
  cursor: pointer;
}

.dropdown-menu {
  display: none;
  position: absolute;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  top: 100%;
  left: 0;
  z-index: 10;
  flex-direction: column;
  min-width: 120px;
}

.dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-item {
  padding: 8px 12px;
  text-decoration: none;
  color: #333;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f9f9f9;
  color: #8E7CFF;
}

.dropdown-item.child-item {
  padding-left: 24px;
  font-size: 14px;
  color: #666;
}

/* 모바일 반응형 */
@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .nav-items {
    display: none;
    flex-direction: column;
    gap: 12px;
  }

  .nav-items.open {
    display: flex;
  }

  .dropdown-menu {
    position: static;
    border: none;
    padding-left: 12px;
  }
}

.nav-item,
.dropdown-toggle {
  color: #333;
  text-decoration: none;
}

</style>
