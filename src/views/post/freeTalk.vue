<template>
    <div class="community-container">
      <div class="header">
        <h1>자유톡</h1>
        <router-link to="/posts/new" class="write-btn">글쓰기</router-link>
      </div>
  
      <div v-if="posts.length === 0" class="empty">게시글이 없습니다.</div>
  
      <ul class="post-list" v-else>
        <li v-for="post in posts" :key="post.id" @click="goToDetail(post.id)">
          <div class="title">{{ post.title }}</div>
          <div class="meta">
            <span class="author">{{ post.writerNickname }}</span>
            <span class="date">{{ formatDate(post.createdAt) }}</span>
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
      const res = await axiosInstance.get('/api/posts', {
        params: { category: '자유톡' }
      });
      posts.value = res.data;
    } catch (err) {
      console.error('자유톡 불러오기 실패:', err);
    }
  };
  
  const goToDetail = (postNo) => {
    router.push(`/posts/${postNo}`);
  };
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString();
  };
  
  onMounted(fetchPosts);
  </script>
  
  <style scoped>
  .community-container {
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
  
  .empty {
    color: #888;
    text-align: center;
    margin-top: 40px;
  }
  </style>
  