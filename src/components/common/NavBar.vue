<template>
  <nav class="navbar">
    <div class="nav-container">
      <button class="menu-toggle" @click="isOpen = !isOpen">☰ 메뉴</button>

      <div class="nav-items" :class="{ open: isOpen }">
        <!-- 홈 -->
        <router-link class="nav-item" to="/">홈</router-link>

        <!-- 커뮤니티 -->
        <div class="nav-item dropdown" @mouseenter="openDropdown('community')" @mouseleave="closeDropdown">
          <span class="dropdown-toggle">커뮤니티</span>
          <div class="dropdown-menu" v-if="openMenu === 'community'">
            <router-link
              class="dropdown-item"
              :to="{ path: '/posts, query: { categoryId: cat.categoryId }' }"
            >전체</router-link>
            <router-link
              v-for="cat in postCategories"
              :key="cat.categoryId"
              class="dropdown-item"
              :to="{ path: '/posts', query: { categoryId: cat.categoryId } }"
            >
              {{ cat.categoryName }}
            </router-link>
          </div>
        </div>

        <!-- 아이템 -->
        <div class="nav-item dropdown" @mouseenter="openDropdown('item')" @mouseleave="closeDropdown">
          <span class="dropdown-toggle">아이템</span>
          <div class="dropdown-menu" v-if="openMenu === 'item'">
            <router-link
              class="dropdown-item"
              :to="{ path: '/items' }"
            >전체</router-link>
            <template v-for="cat in itemCategoryTree" :key="cat.categoryId">
              <router-link
                class="dropdown-item"
                :to="{ path: '/items', query: { category: cat.categoryName } }"
              >
                {{ cat.categoryName }}
              </router-link>
              <router-link
                v-for="child in cat.children"
                :key="child.categoryId"
                class="dropdown-item child-item"
                :to="{ path: '/items', query: { category: child.categoryName } }"
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
const openMenu = ref(null); // 드롭다운 메뉴 상태
const postCategories = ref([]);
const itemCategoryTree = ref([]);

// 드롭다운 제어
const openDropdown = (menuName) => {
  openMenu.value = menuName;
};
const closeDropdown = () => {
  openMenu.value = null;
};

// 게시글 카테고리 불러오기
const fetchPostCategories = async () => {
  try {
    const res = await axiosInstance.get('/api/post-categories');
    postCategories.value = res.data;
  } catch (err) {
    console.error('📛 게시판 카테고리 불러오기 실패:', err);
  }
};

// 아이템 카테고리 트리 불러오기
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
  position: absolute;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  top: 100%;
  left: 0;
  z-index: 10;
  min-width: 160px;
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

/* 모바일 */
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
</style>
