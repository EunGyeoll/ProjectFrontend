<template>
  <div class="post-detail-container" v-if="post">
    <div class="post-header">
      <img class="profile" :src="post.profileImageUrl" alt="프로필 이미지" />
      <div class="author-info">
        <span class="nickname">{{ post.writerNickname }}</span>
        <span class="date">{{ formatDate(post.postDate) }}</span>
        <span class="hit">조회수 {{ post.hitCount }}회</span>
      </div>
    </div>

    <h1 class="title">{{ post.title }}</h1>
    <div class="meta">#{{ post.categoryName }}</div>
    <div class="content" v-html="post.content"></div>

    <div class="images" v-if="post.imagePaths && post.imagePaths.length">
      <img v-for="(img, i) in post.imagePaths" :key="i" :src="img" class="post-image" />
    </div>

    <div class="post-like">
      <font-awesome-icon
        :icon="[liked ? 'fas' : 'far', 'heart']"
        :class="['heart-icon', { liked, disabled: !isLoggedIn }]"
        @click="toggleLike"
      />
      <span class="like-count">{{ likeCount }}</span>
    </div>

    <div class="comment-form">
      <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
      <input type="file" @change="handleFileChange($event, 'comment')" />
      <button @click="submitComment">댓글 작성</button>
    </div>

    <div class="comments">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-block">
        <div class="comment comment-root">
          <div class="comment-content">
            <strong>{{ comment.writerName }}</strong> · {{ formatDate(comment.commentDate) }}

            <div v-if="editingState.commentId === comment.commentId">
              <textarea v-model="editingState.content" class="edit-textarea" />
              <div v-if="comment.imageUrl && !editingState.removeImage">
                <img :src="comment.imageUrl" class="comment-image" />
                <button class="delete-btn" @click="editingState.removeImage = true">기존 이미지 삭제</button>
              </div>
              <input type="file" @change="handleEditImageChange" />
              <div class="btn-row">
                <button @click="submitEdit(comment.commentId)">저장</button>
                <button @click="cancelEdit">취소</button>
              </div>
            </div>
            <div v-else>
              <template v-if="comment.deleted">
                삭제된 댓글입니다.
              </template>
              <template v-else>
                {{ comment.content }}
                <img v-if="comment.imageUrl" :src="comment.imageUrl" class="comment-image" />
              </template>
            </div>

            <div class="btn-row">
              <button class="reply-btn" @click="toggleReply(comment.commentId)">답글</button>
              <button class="edit-btn" @click="startEdit(comment)">수정</button>
              <button class="delete-btn" @click="deleteComment(comment.commentId)">삭제</button>
            </div>
          </div>

          <div v-if="replyTarget === comment.commentId" class="reply-form">
            <textarea v-model="replyContent" placeholder="답글을 입력하세요"></textarea>
            <input type="file" @change="handleFileChange($event, 'reply')" />
            <button @click="submitReply(comment.commentId)">답글 작성</button>
          </div>

          <div class="child-comments" v-for="child in comment.childComments" :key="child.commentId">
            <div class="comment">
              <div class="comment-content">
                <strong>{{ child.writerName }}</strong> · {{ formatDate(child.commentDate) }}

                <div v-if="editingState.commentId === child.commentId">
                  <textarea v-model="editingState.content" class="edit-textarea" />
                  <div v-if="child.imageUrl && !editingState.removeImage">
                    <img :src="child.imageUrl" class="comment-image" />
                    <button class="delete-btn" @click="editingState.removeImage = true">기존 이미지 삭제</button>
                  </div>
                  <input type="file" @change="handleEditImageChange" />
                  <div class="btn-row">
                    <button @click="submitEdit(child.commentId)">저장</button>
                    <button @click="cancelEdit">취소</button>
                  </div>
                </div>
                <div v-else>
                  <template v-if="child.deleted">
                    삭제된 댓글입니다.
                  </template>
                  <template v-else>
                    {{ child.content }}
                    <img v-if="child.imageUrl" :src="child.imageUrl" class="comment-image" />
                  </template>
                </div>


                <div class="btn-row">
                  <button class="edit-btn" @click="startEdit(child)">수정</button>
                  <button class="delete-btn" @click="deleteComment(child.commentId)">삭제</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="loading">게시글을 불러오는 중입니다...</div>
</template>

  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    fetchComments,
    submitComment as submitCommentApi,
    deleteComment as deleteCommentApi 
  } from '@/apis/commentApi';
  import {
    checkLike,
    addLike,
    removeLike,
    getLikeCount,
  } from '@/apis/likedPostApi';
  
  import axiosInstance from '@/plugin/axiosInstance';
  
  const post = ref(null);
  const route = useRoute();
  const comments = ref([]);
  const newComment = ref('');
  const replyTarget = ref(null);
  const replyContent = ref('');
  const commentFile = ref(null);
  const replyFile = ref(null);
  
  const editingState = ref({
    commentId: null,
    content: '',
    file: null,
    removeImage: false,
  });
  
  const liked = ref(false);
  const likeCount = ref(0);
  const isLoggedIn = ref(false);
  
  const fetchPost = async () => {
    try {
      const postNo = route.params.id;
      const res = await axiosInstance.get(`/api/posts/${postNo}`);
      post.value = res.data;
      fetchCommentsList(postNo);
    } catch (err) {
      console.error('게시글 조회 실패:', err);
    }
  };
  
  const fetchCommentsList = async (postNo) => {
    try {
      const res = await fetchComments(postNo);
      comments.value = buildCommentTree(res.data);
    } catch (err) {
      console.error('댓글 조회 실패:', err);
    }
  };
  
  const buildCommentTree = (flatComments) => {
    const map = {};
    const roots = [];
    flatComments.forEach(comment => {
      comment.childComments = [];
      map[comment.commentId] = comment;
    });
    flatComments.forEach(comment => {
      if (comment.parentCommentId) {
        map[comment.parentCommentId]?.childComments.push(comment);
      } else {
        roots.push(comment);
      }
    });
    return roots;
  };
  
  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (type === 'comment') commentFile.value = file;
    else replyFile.value = file;
  };
  
  const submitComment = async () => {
    if (!newComment.value.trim()) return;
    const postNo = route.params.id;
    try {
      await submitCommentApi(postNo, { content: newComment.value }, commentFile.value);
      newComment.value = '';
      commentFile.value = null;
      fetchCommentsList(postNo);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
    }
  };
  
  const toggleReply = (commentId) => {
    replyTarget.value = replyTarget.value === commentId ? null : commentId;
    replyContent.value = '';
    replyFile.value = null;
  };
  
  const submitReply = async (parentId) => {
    if (!replyContent.value.trim()) return;
    const postNo = route.params.id;
    try {
      await submitCommentApi(postNo, { content: replyContent.value, parentCommentId: parentId }, replyFile.value);
      replyContent.value = '';
      replyTarget.value = null;
      replyFile.value = null;
      fetchCommentsList(postNo);
    } catch (err) {
      console.error('답글 작성 실패:', err);
    }
  };
  
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString();
  };
  
  const startEdit = (comment) => {
    editingState.value = {
      commentId: comment.commentId,
      content: comment.content,
      file: null,
      removeImage: false,
    };
  };
  
  const cancelEdit = () => {
    editingState.value = {
      commentId: null,
      content: '',
      file: null,
      removeImage: false,
    };
  };
  
  const submitEdit = async (commentId) => {
    if (!editingState.value.content.trim()) return;
  
    try {
      const formData = new FormData();
      const commentData = { content: editingState.value.content };
  
      formData.append(
        'commentData',
        new Blob([JSON.stringify(commentData)], { type: 'application/json' })
      );
  
      if (editingState.value.file) {
        formData.append('image', editingState.value.file);
      }
  
      formData.append('deleteImage', editingState.value.removeImage ? 'true' : 'false');
  
      await axiosInstance.put(`/api/comments/${commentId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
  
      cancelEdit(); // 상태 초기화
      await fetchCommentsList(route.params.id);
    } catch (err) {
      console.error('댓글 수정 실패:', err);
    }
  };
  
  const handleEditImageChange = (event) => {
    editingState.value.file = event.target.files[0];
    editingState.value.removeImage = false; // 이미지 새로 선택하면 삭제 취소
  };
  
  const deleteComment = async (commentId) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
  
    try {
      await deleteCommentApi(commentId);
      await fetchCommentsList(route.params.id);
    } catch (err) {
      console.error('댓글 삭제 실패:', err);
    }
  };
  
  // 좋아요 관련
  const checkLikedStatus = async () => {
    try {
      const res = await checkLike(route.params.id);
      liked.value = res.data;
    } catch (err) {
      liked.value = false;
    }
  };
  
  const fetchLikeCount = async () => {
    try {
      const res = await getLikeCount(route.params.id);
      likeCount.value = res.data;
    } catch (err) {
      console.error('좋아요 수 조회 실패:', err);
    }
  };
  
  const toggleLike = async () => {
    if (!isLoggedIn.value) {
      alert('좋아요 기능은 로그인 후 사용할 수 있어요!');
      return;
    }
  
    try {
      if (liked.value) {
        await removeLike(route.params.id);
      } else {
        await addLike(route.params.id);
      }
      liked.value = !liked.value;
      await fetchLikeCount();
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  };
  
  onMounted(async () => {
    await fetchPost();
    await fetchLikeCount();
    const token = localStorage.getItem('token');
    if (token) {
      isLoggedIn.value = true;
      await checkLikedStatus();
    }
  });
  </script>
  
  
  
  
  
  <style scoped>
.post-detail-container {
  max-width: 800px;
  margin: auto;
  padding: 24px;
  font-family: 'Noto Sans KR', sans-serif;
}

.post-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.profile {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.author-info {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  color: #666;
}

.nickname {
  font-weight: 600;
  color: #222;
}

.date, .hit {
  font-size: 13px;
  color: #aaa;
}

.title {
  font-size: 22px;
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
  object-fit: cover;
}

/* 댓글 영역 */
.comment-form, .reply-form {
  margin-top: 24px;
}

.comment-form textarea,
.reply-form textarea,
.edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.comment-form button,
.reply-form button,
.reply-btn,
.edit-btn,
.delete-btn {
  background-color: #ff84a2;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  margin-top: 8px;
}

.reply-btn,
.edit-btn,
.delete-btn {
  background-color: #f2f2f2;
  color: #333;
}

.btn-row {
  display: flex;
  /* align-content:end; */
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.comments {
  margin-top: 32px;
}

.comment-block {
  padding: 16px 0;
  border-top: 1px solid #eee;
}

.comment-content {
  font-size: 14px;
  color: #333;
}

.comment-image {
  margin-top: 8px;
  max-width: 100px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.child-comments {
  margin-left: 20px;
  border-left: 2px solid #f0f0f0;
  padding-left: 12px;
  margin-top: 12px;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #aaa;
}

/* 좋아요 영역 */
.post-like {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  color: #ccc;
  transition: color 0.2s;
  margin-top: 10px;
}

.heart-icon {
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  vertical-align: middle; 
}

.heart-icon.liked {
  color: #e46d8c;
}

.heart-icon.disabled {
  opacity: 0.5;
}

.like-count {
  margin-left: 6px;
  font-size: 14px;
  color: #666;
}

  </style>
  