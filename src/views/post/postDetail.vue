<template>
    <div class="post-detail-container" v-if="post">
      <div class="post-header">
        <img class="profile" :src="post.profileImageUrl" alt="프로필 이미지" />
        <div class="author-info">
          <span class="nickname">{{ post.writerNickname }}</span>
          <span class="date">{{ formatDate(post.postDate) }}</span>
        </div>
      </div>
  
      <h1 class="title">{{ post.title }}</h1>
      <div class="meta">#{{ post.categoryName }}</div>
      <div class="content" v-html="post.content"></div>
  
      <div class="images" v-if="post.imagePaths && post.imagePaths.length">
        <img v-for="(img, i) in post.imagePaths" :key="i" :src="img" class="post-image" />
      </div>
    </div>
    <div v-else class="loading">게시글을 불러오는 중입니다...</div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import axiosInstance from '@/plugin/axiosInstance';
  
  const post = ref(null);
  const route = useRoute();
  
  const fetchPost = async () => {
    try {
      const postId = route.params.id;
      const res = await axiosInstance.get(`/api/posts/${postId}`);
      post.value = res.data;
    } catch (err) {
      console.error('게시글 조회 실패:', err);
    }
  };
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };
  
  onMounted(fetchPost);
  </script>
  
  <style scoped>
  .post-detail-container {
    max-width: 800px;
    margin: auto;
    padding: 24px;
  }
  
  .post-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  
  .profile {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
  }
  
  .author-info {
    display: flex;
    flex-direction: column;
  }
  
  .nickname {
    font-weight: 600;
    font-size: 15px;
    color: #333;
  }
  
  .date {
    font-size: 13px;
    color: #aaa;
  }
  
  .title {
    font-size: 20px;
    font-weight: bold;
    margin: 12px 0;
  }
  
  .meta {
    font-size: 14px;
    color: #888;
    margin-bottom: 16px;
  }
  
  .content {
    font-size: 16px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
  
  .images {
    margin-top: 16px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  
  .post-image {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    border: 1px solid #ddd;
  }
  
  .loading {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
  </style>
  