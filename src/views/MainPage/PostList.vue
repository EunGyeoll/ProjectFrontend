<template>
  <div class="post-list">
    <div
      class="post-item"
      v-for="post in posts"
      :key="post.postId"
      @click="goToDetail(post.postId)"
    >
      <!-- 왼쪽: 정보 -->
      <div class="post-left">
        <div class="post-header">
          <img class="profile" :src="post.profileImageUrl || defaultImage" alt="프로필 이미지" />
          <div class="author-info">
            <span class="nickname">{{ post.writerNickname }}</span>
            <span class="dot">·</span>
            <span class="date">{{ formatDate(post.postDate) }}</span>
          </div>
        </div>

        <div class="title">{{ post.title }}</div>

        <div class="meta">
          <span class="category-badge">{{ post.categoryName }}</span>
        </div>

        <div class="stats">
          <span class="views">👁 {{ post.hitCount }}</span>
          <span class="likes">❤️ {{ post.likeCount }}</span>
          <span class="comments">💬 {{ post.commentCount }}</span>
        </div>
      </div>

      <!-- 오른쪽 썸네일 -->
      <div v-if="post.representativeImagePath" class="thumbnail">
        <img :src="post.representativeImagePath" alt="대표 이미지" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts } from '@/apis/postApi'

const defaultImage = 'https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png';

const props = defineProps({
  sortOption: { type: String, default: 'latest' }
})

const posts = ref([])
const router = useRouter()

const fetchLatestPosts = async () => {
  try {
    const res = await fetchPosts({
      sortOption: props.sortOption,
      page: 0,
      size: 5
    })
    posts.value = res.data.content || []
  } catch (err) {
    console.error('게시글 로딩 실패:', err)
  }
}

const goToDetail = (postId) => {
  router.push(`/posts/${postId}`)
}

const formatDate = (dateStr) => {
  const postDate = new Date(dateStr)
  const now = new Date()
  const diff = now - postDate

  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (minutes < 1) return '방금 전'
  if (minutes < 60) return `${minutes}분 전`
  if (hours < 24) return `${hours}시간 전`
  return `${days}일 전`
}

onMounted(fetchLatestPosts)
</script>

<style scoped>
.post-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.post-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #eee;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: box-shadow 0.2s;
  cursor: pointer;
}

/* .post-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
} */


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
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.nickname {
  font-weight: bold;
  color: #333;
}

.date {
  font-size: 12px;
  color: #aaa;
}

.title {
  font-size: 16px;
  font-weight: bold;
  margin: 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;  
}

.meta {
  margin-top: 4px;
}

.category-badge {
  display: inline-block;
  background-color: #f0f0f0;  /* 밝은 회색 배경 */
  color: #555;               /* 진회색 텍스트 */
  padding: 4px 10px;
  font-size: 13px;
  border-radius: 16px;
  font-weight: 500;
}


.stats {
  margin-top: 6px;
  font-size: 13px;
  color: #666;
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  margin-left: 16px;
  flex-shrink: 0;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

</style>
