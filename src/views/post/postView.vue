<template>
    <div class="post-container">
      <div class="header">
        <h1>커뮤니티 전체글</h1>
        <router-link to="/posts/new" class="write-btn">글쓰기</router-link>
      </div>
  
      <div v-if="posts.length === 0" class="empty">게시글이 없습니다.</div>
  
      <ul class="post-list" v-else>
        <li v-for="post in posts" :key="post.postNo" @click="goToDetail(post.postNo)">
          <div class="post-header">
            <img class="profile" :src="post.profileImageUrl" alt="프로필 이미지" />
            <div class="author-info">
              <span class="nickname">{{ post.writerNickname }}</span>
              <span class="date">{{ formatDate(post.postDate) }}</span>
            </div>
          </div>
          <div class="title">{{ post.title }}</div>
          <div class="meta">
  <span class="category">#{{ post.categoryName }}</span>
</div>
<div class="stats">
  <span class="likes">❤️ {{ post.likeCount }}</span>
  <span class="comments">💬 {{ post.commentCount }}</span>
</div>

        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axiosInstance from '@/plugin/axiosInstance';
  
  const posts = ref([]);
  const router = useRouter();
  
  const fetchPosts = async () => {
    try {
      const res = await axiosInstance.get('/api/posts/list'); // 전체글 조회
      posts.value = res.data.content || [];
    } catch (err) {
      console.error('전체 게시글 조회 실패:', err);
    }
  };
  
  const goToDetail = (postNo) => {
    router.push(`/posts/${postNo}`);
  };
  
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

  
  onMounted(fetchPosts);
  </script>
  
  <style scoped>
  .post-container {
    max-width: 800px;
    margin: auto;
    padding: 24px;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }
  
  .write-btn {
    background-color: #ff84a2;
    color: white;
    padding: 8px 16px;
    font-weight: 600;
    border-radius: 6px;
    text-decoration: none;
  }
  
  .post-list {
    list-style: none;
    padding: 0;
  }
  
  .post-list li {
    padding: 16px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }
  
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
    flex-direction: column;
  }
  
  .nickname {
    font-weight: 600;
    font-size: 14px;
    color: #333;
  }
  
  .date {
    font-size: 12px;
    color: #aaa;
  }
  
  .title {
    font-weight: bold;
    font-size: 16px;
  }
  
  .meta {
    font-size: 13px;
    color: #777;
    margin-top: 4px;
    display: flex;
    gap: 12px;
  }
  
  .category {
    font-weight: bold;
    color: #999;
  }
  
  .empty {
    color: #888;
    text-align: center;
    margin-top: 40px;
  }

  .stats {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 12px;
}

.likes,
.comments {
  display: flex;
  align-items: center;
}

  </style>
  