<template>
  <nav class="navbar">
    <div class="nav-container">
      <router-link class="nav-link" to="/">홈</router-link>

      <!-- 커뮤니티 -->
      <div
        class="nav-dropdown"
        :class="{ open: openDropdown === 'community' }"
      >
        <button
          class="nav-link nav-button"
          @click="toggleDropdown('community')"
        >
          커뮤니티
        </button>

        <div class="dropdown-menu">
          <router-link
            v-for="cat in postCategories"
            :key="cat.categoryId"
            class="dropdown-item"
            :to="`/posts?category=${cat.categoryName}`"
            @click="openDropdown = null"
          >
            {{ cat.categoryName }}
          </router-link>
        </div>
      </div>

      <!-- 아이템 -->
      <div
        class="nav-dropdown"
        :class="{ open: openDropdown === 'item' }"
      >
        <button
          class="nav-link nav-button"
          @click="toggleDropdown('item')"
        >
          아이템
        </button>

        <div class="dropdown-menu">
          <template
            v-for="cat in itemCategoryTree"
            :key="cat.categoryId"
          >
            <router-link
              class="dropdown-item"
              :to="`/items?category=${cat.categoryName}`"
              @click="openDropdown = null"
            >
              {{ cat.categoryName }}
            </router-link>

            <router-link
              v-for="child in cat.children"
              :key="child.categoryId"
              class="dropdown-item child-item"
              :to="`/items?category=${child.categoryName}`"
              @click="openDropdown = null"
            >
              {{ child.categoryName }}
            </router-link>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axiosInstance from '@/plugin/axiosInstance';

const postCategories = ref([]);
const itemCategoryTree = ref([]);

const openDropdown = ref(null);

const toggleDropdown = (menu) => {
  openDropdown.value =
    openDropdown.value === menu ? null : menu;
};

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
  position: sticky;
  top: 0;
  z-index: 100;

  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid #eee;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;

  display: flex;
  align-items: center;
  gap: 8px;
  height: 40px;
}

.nav-link {
  font-size: 14px;
  
  display: flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;

  border-radius: 999px;

  color: #333;
  text-decoration: none;
  font-size: 15px;
  font-weight: 600;

  transition: 0.2s ease;
}

.nav-link:hover {
  background: #f5f5f5;
  color: #111;
}

.nav-link.router-link-active,
.nav-link.router-link-exact-active {
  background: #f1efff;
  color: #111;
    background: transparent;

}

.nav-dropdown {
  position: relative;
  height: 40px;
  display: flex;
  align-items: center;
}

.nav-dropdown::after {
  content: "";
  position: absolute;
  left: 0;
  top: 100%;
  width: 100%;
  height: 10px;
}

.nav-button {
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
}

/* dropdown */
.dropdown-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;

  min-width: 170px;
  padding: 8px;

  display: none;
  flex-direction: column;
  gap: 4px;

  background: #fff;
  border: 1px solid #eee;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);

  z-index: 200;
}

.nav-dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-item {
  padding: 9px 12px;
  border-radius: 10px;

  color: #333;
  text-decoration: none;
  font-size: 14px;
  white-space: nowrap;

  transition: 0.2s ease;
}

.dropdown-item:hover {
  background: #f7f5ff;
  color: #111;
}

.child-item {
  padding-left: 22px;
  color: #666;
  font-size: 13px;
}

/* 데스크탑 hover */
@media (min-width: 769px) {
  .nav-dropdown:hover .dropdown-menu {
    display: flex;
  }
}


/* 모바일 */
@media (max-width: 768px) {
  .navbar {
    overflow-x: auto;
  }

  .navbar::-webkit-scrollbar,
  .nav-container::-webkit-scrollbar {
    display: none;
  }

  .nav-container {
    height: 48px;
    padding: 0 12px;
    gap: 6px;

    justify-content: flex-start;
    overflow-x: auto;
    white-space: nowrap;
  }

  .nav-link {
    flex-shrink: 0;
    height: 34px;
    padding: 0 13px;
    font-size: 14px;
  }

  .nav-dropdown {
    flex-shrink: 0;
    height: 48px;
  }

  /* 모바일에서는 hover용 빈 영역 제거 */
  .nav-dropdown::after {
    display: none;
  }

  /* 모바일에서는 hover가 아니라 클릭(open)일 때만 열림 */
  .dropdown-menu,
  .nav-dropdown:hover .dropdown-menu {
    display: none;
  }

  .nav-dropdown.open .dropdown-menu {
    display: flex;
  }

  .nav-link.router-link-active,
  .nav-link.router-link-exact-active {
    color: #8E7CFF;
    background: transparent;
  }
}
</style>