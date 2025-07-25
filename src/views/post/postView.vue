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
            :class="{ active: selectedCategory === cat.categoryId }"
            @click="goToCategory(cat.categoryId)"
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
              <span class="date">{{ formatDate(post.postDate) }}</span>
            </div>
          </div>

          <div class="title">{{ post.title }}</div>

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
defineOptions({ name: 'PostView' }) // 🔥 이거 꼭 넣어

const route = useRoute();
const router = useRouter();

const defaultProfileImage = 'https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png';

const posts = ref([]);
const categories = ref([]);
const selectedCategory = ref(null);

// 전체 게시글 조회
const fetchAllPosts = async () => {
  try {
    const res = await axiosInstance.get('/api/posts/list');
    posts.value = res.data.content || [];
    selectedCategory.value = null;
  } catch (err) {
    console.error('전체 게시글 조회 실패:', err);
  }
};

// 카테고리별 게시글 조회
const fetchPostsByCategoryId = async (categoryId) => {
  console.log('🚀 [API 요청] categoryId =', categoryId);

  try {
    selectedCategory.value = Number(categoryId);
    const res = await axiosInstance.get(`/api/posts/list`, {
      params : {categoryId}
      });
    console.log('✅ [응답 성공] posts =', res.data); // 확인
    posts.value = res.data.content || [];
  } catch (err) {
    console.error('❌ [API 에러] 카테고리별 게시글 조회 실패:', err);
  }
};



// 라우팅된 쿼리 파라미터 처리
const handleRouteChange = () => {
  console.log('🧭 현재 경로:', route.fullPath);
  console.log('🔍 route.query 전체:', route.query);

  const categoryParam = route.query.categoryId;
  console.log('📦 [쿼리 파라미터] categoryId =', categoryParam);

  // 🚫 'undefined' 또는 NaN인 경우는 전체 조회
  if (!categoryParam || categoryParam === 'undefined' || isNaN(Number(categoryParam))) {
    console.log('📥 fetchAllPosts 호출됨');
    fetchAllPosts();
  } else {
    console.log('📥 fetchPostsByCategoryId 호출됨');
    fetchPostsByCategoryId(Number(categoryParam));
  }
};



// 카테고리 클릭 시
const goToCategory = (categoryId) => {
  router.push({ path: '/posts', query: { categoryId } });
};

// 전체 버튼 클릭 시
const goToAll = () => {
  router.push({ path: '/posts' });
};

// 게시글 상세 이동
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

// 초기 로딩
onMounted(async () => {
  try {
    const res = await fetchPostCategories();
    categories.value = res.data;
    handleRouteChange(); // query.categoryId  처리
  } catch (err) {
    console.error('카테고리 로딩 실패:', err);
  };
});

// query.category 변경 감지
watch(() => route.query.categoryId, (newVal) => {
  console.log('👀 [watch 감지] categoryId 변경됨:', newVal);
  handleRouteChange();
});

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
.post-list li.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
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
    flex-direction: column;
    align-items: flex-start;
  }

  .thumbnail {
    width: 100%;
    height: auto;
    aspect-ratio: auto;
    margin-top: 8px;
  }
}


  </style>
  