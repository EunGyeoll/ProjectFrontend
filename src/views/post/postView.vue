<template>
  <div class="post-container">
    <div class="top-bar">
      <div class="category-scroll-wrapper">
        <div class="category-list">
          <!-- 전체 버튼 -->
          <button
            class="category-button"
            :class="{ active: selectedCategory === null }"
            @click="goToAll"
          >전체</button>

          <!-- 카테고리 버튼들 -->
          <button
            v-for="cat in categories"
            :key="cat.categoryId"
            class="category-button"
            :class="{ active: selectedCategory === cat.categoryName }"
            @click="goToCategory(cat.categoryName)"
          >
            {{ cat.categoryName }}
          </button>
        </div>
      </div>

      <router-link to="/posts/new" class="write-btn">글쓰기</router-link>
    </div>

    <div v-if="posts.length === 0" class="empty">게시글이 없습니다.</div>

    <ul class="post-list" v-else>
      <li
        v-for="post in posts"
        :key="post.postId"
        @click="goToDetail(post.postId)"
        class="post-item"
      >
        <div class="post-left">
          <div class="post-header">
            <img class="profile" :src="post.profileImageUrl || defaultProfileImage" alt="프로필 이미지" />
            <div class="author-info">
              <span class="nickname">{{ post.writerNickname }}</span>
              <span class="dot">·</span>
              <span class="date">{{ formatDate(post.createdDate) }}</span>
            </div>  
          </div>

          <div class="title">{{ post.title }}</div>

          <p class="preview">
            {{ post.contentPreview }}
          </p>

          <div class="meta">
            <span class="category">#{{ post.categoryName }}</span>
          </div>

          <div class="stats">
            <span class="views">👁 {{ post.hitCount }}</span>
            <span class="likes">❤️ {{ post.likeCount }}</span>
            <span class="comments">💬 {{ post.commentCount }}</span>
          </div>
        </div>

        <div v-if="post.representativeImagePath" class="thumbnail">
          <img :src="post.representativeImagePath" alt="대표 이미지" />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from '@/plugin/axiosInstance';
import { fetchPostCategories } from '@/apis/postApi';

defineOptions({ name: 'PostView' });

const route = useRoute();
const router = useRouter();

const defaultProfileImage = 'https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png';

const posts = ref([]);
const categories = ref([]);
const selectedCategory = ref(route.query.category || null);

// 게시글 목록 조회
const fetchPosts = async () => {
  try {
    const res = await axiosInstance.get('/api/posts/list', {
      params: selectedCategory.value ? { category: selectedCategory.value } : {}
    });
    posts.value = res.data.content || [];
  } catch (err) {
    console.error('📛 게시글 불러오기 실패:', err);
  }
};

// 카테고리 목록 조회
onMounted(async () => {
  try {
    const res = await fetchPostCategories();
    categories.value = res.data;
    await fetchPosts();
  } catch (err) {
    console.error('📛 카테고리 로딩 실패:', err);
  }
});

// URL 쿼리(category) 변경 감지
watch(
  () => route.query.category,
  (val) => {
    selectedCategory.value = val || null;
    fetchPosts();
  }
);

// 카테고리 버튼 클릭 시
const goToCategory = (categoryName) => {
  if (selectedCategory.value !== categoryName) {
    router.push({ path: '/posts', query: { category: categoryName } });
  }
};

// 전체 보기 클릭 시
const goToAll = () => {
  if (selectedCategory.value !== null) {
    router.push({ path: '/posts' });
  }
};

// 상세 페이지 이동
const goToDetail = (postId) => {
  router.push(`/posts/${postId}`);
};

// 날짜 포맷
const formatDate = (dateStr) => {
  const postDate = new Date(dateStr);
  const now = new Date();
  const diffMs = now - postDate;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (minutes < 1) return '방금 전';
  if (minutes < 60) return `${minutes}분 전`;
  if (hours < 24) return `${hours}시간 전`;
  return `${days}일 전`;
};
</script>

  
  <style scoped>
  .post-container {
  max-width: 800px;
  margin: auto;
  padding: 24px 16px;
}

/* 상단 바 */
.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.category-scroll-wrapper {
  overflow-x: auto;
  flex-grow: 1;
}

.category-list {
  display: flex;
  gap: 8px;
  flex-wrap: nowrap;
  padding-bottom: 4px;
}

.category-button {
  padding: 6px 14px;
  border: none;
  border-radius: 20px;
  background-color: #f0f0f0;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.category-button.active {
  background-color: #8E7CFF;
  color: white;
}

.write-btn {
  background-color: #8E7CFF;
  color: white;
  padding: 8px 16px;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none;
  flex-shrink: 0;
  transition: background-color 0.3s;
}

.write-btn:hover {
  background-color: #7a6ce6;
}

.empty {
  color: #888;
  text-align: center;
  margin-top: 40px;
  font-size: 16px;
}


/* 게시글 리스트 */
/* 게시글 리스트 */
.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-list li.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  padding: 18px 16px;
  border-radius: 14px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #eee;
  cursor: pointer;
  transition: 0.2s ease;
}

.post-list li.post-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.06);
  border-color: #ded8ff;
}

.post-left {
  flex: 1;
  min-width: 0;
}

/* 썸네일 */
.thumbnail {
  width: 110px;
  height: 90px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


.post-left {
  flex: 1;
  min-width: 0;
}

/* 작성자 & 날짜 */
.post-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.profile {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.nickname {
  font-weight: 600;
  color: #333;
}

.date {
  font-size: 12px;
  color: #aaa;
}

/* 제목 */
.title {
  font-weight: bold;
  font-size: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-bottom: 4px;
}

.preview {
  margin: 0 0 6px;
  font-size: 14px;
  line-height: 1.5;
  color: #777;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 카테고리 */
.meta {
  font-size: 13px;
  color: #777;
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.category {
  font-weight: bold;
  color: #999;
}

/* 조회수, 좋아요 등 */
.stats {
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 12px;
}

.likes, .comments, .views {
  display: flex;
  align-items: center;
}


/* 썸네일 */
.thumbnail {
  width: 100px;
  aspect-ratio: 1 / 1;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


/* 모바일 대응 */
@media (max-width: 768px) {
  .top-bar {
    flex-direction: column;
    align-items: stretch;
  }

  .write-btn {
    align-self: flex-end;
  }

  .post-list li.post-item {
    align-items: flex-start;
  }

  .thumbnail {
    width: 88px;
    height: 72px;
  }
}
  </style>
  