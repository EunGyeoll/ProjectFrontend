<template>
    <div class="post-container">
      <div class="header">
        <h2>커뮤니티</h2>
        <router-link to="/posts/new" class="write-btn">글쓰기</router-link>
      </div>
  
      <div v-if="posts.length === 0" class="empty">게시글이 없습니다.</div>
  
      <ul class="post-list" v-else>
        <li v-for="post in posts" :key="post.postId" @click="goToDetail(post.postId)" class="post-item">
  <div class="post-left">
    <div class="post-header">
      <img class="profile" :src="post.profileImageUrl" alt="프로필 이미지" />
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
      <span class="views" title="조회수">👁 {{ post.hitCount }}</span>
      <span class="likes" title="좋아요">❤️ {{ post.likeCount }}</span>
      <span class="comments" title="댓글">💬 {{ post.commentCount }}</span>
    </div>
  </div>

  <!-- 오른쪽 썸네일 -->
  <div v-if="post.representativeImagePath" class="thumbnail">
    <img :src="post.representativeImagePath" alt="대표 이미지" />
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
  
  const goToDetail = (postId) => {
    router.push(`/posts/${postId}`);
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
  
  .post-list li.post-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    border-bottom: 1px solid #eee;
    cursor: pointer;
  }


.post-left {
  flex: 1;
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
  
  .title {
    font-weight: bold;
    font-size: 16px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.views {
  display: flex;
  align-items: center;
}

.thumbnail {
  width: 100px;
  aspect-ratio: 1 / 1; 
  margin-left: 16px;
  flex-shrink: 0;
  overflow: hidden;
  border-radius: 6px;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover; 
}



  </style>
  