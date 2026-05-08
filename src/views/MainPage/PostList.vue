<template>
  <div class="post-grid">
    <article
      class="post-card"
      v-for="post in posts"
      :key="post.postId"
      @click="goToDetail(post.postId)"
    >
      <div class="post-top">
        <span class="category">{{ post.categoryName }}</span>
        <span class="date">{{ formatDate(post.createdDate) }}</span>
      </div>

      <h3 class="title">{{ post.title }}</h3>

      <p class="preview">
        {{ post.contentPreview }}
      </p>

      <div class="meta">
        <span class="writer">{{ post.writerNickname }}</span>
      </div>

      <div class="stats">
        <span>조회 {{ post.hitCount }}</span>
        <span>좋아요 {{ post.likeCount }}</span>
        <span>댓글 {{ post.commentCount }}</span>
      </div>
    </article>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchPosts } from '@/apis/postApi'

const posts = ref([])
const router = useRouter()

onMounted(async () => {
  const res = await fetchPosts({
    sortOption: 'latest',
    page: 0,
    size: 6
  })
  posts.value = res.data.content || []
})

const goToDetail = (id) => {
  router.push(`/posts/${id}`)
}

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = (now - d) / 1000

  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  return `${Math.floor(diff / 86400)}일 전`
}
</script>

<style scoped>
.post-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.post-card {
  min-height: 155px;
  padding: 18px;
  border-radius: 20px;
  border: 1px solid #eee;
  background: #fff;
  cursor: pointer;
  transition: 0.2s ease;

  display: flex;
  flex-direction: column;
}

.post-card:hover {
  transform: translateY(-4px);
  border-color: #dcd4ff;
  box-shadow: 0 12px 28px rgba(123, 97, 255, 0.12);
}

.post-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.category {
  padding: 5px 10px;
  border-radius: 999px;
  background: #f4f1ff;
  color: #7b61ff;
  font-size: 12px;
  font-weight: 800;
}

.date {
  font-size: 12px;
  color: #aaa;
}

.title {
  margin: 0 0 10px;
  font-size: 17px;
  letter-spacing: -0.02em;
  font-weight: 800;
  color: #222;
  line-height: 1.45;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.preview {
  margin: 0 0 14px;

  font-size: 13px;
  line-height: 1.6;
  color: #777;

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  min-height: 42px;
}

.meta {
  margin-top: auto;
  font-size: 13px;
  color: #777;
}

.writer {
  font-weight: 600;
}

.stats {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f1f1f1;

  display: flex;
  gap: 10px;
  flex-wrap: wrap;

  font-size: 12px;
  color: #777;
}

@media (max-width: 900px) {
  .post-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
  .post-grid {
    grid-template-columns: repeat(1, 1fr);
  }
}
</style>