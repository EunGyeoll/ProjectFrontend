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


    <!-- 이미지 리스트 -->
    <!-- <div class="images" v-if="post.imagePaths && post.imagePaths.length">
      <img
        v-for="(img, i) in post.imagePaths"
        :key="i"
        :src="img"
        class="post-image"
        @click="openImageModal(i)"
      />
    </div> -->

    <!-- 이미지 확대 모달 -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal">
      <div class="modal-content">
        <img :src="post.imagePaths[currentImageIndex]" alt="확대 이미지" />
        <button class="close-btn" @click="closeImageModal">×</button>
        <button class="nav-btn prev" @click.stop="prevImage">‹</button>
        <button class="nav-btn next" @click.stop="nextImage">›</button>
      </div>
    </div>



    <div class="post-like">
      <font-awesome-icon
        :icon="[liked ? 'fas' : 'far', 'heart']"
        :class="['heart-icon', { liked, disabled: !isLoggedIn }]"
        @click="toggleLike"
      />
      <span class="like-count">{{ likeCount }}</span>
    </div>

    
    <!-- 수정/삭제 버튼 -->
    <div class="btn-row" v-if="isLoggedIn && post.isOwner">
      <button class="edit-btn" @click="goToEditPage">수정</button>
      <button class="delete-btn" @click="deletePost">삭제</button>
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
  import { useRoute, useRouter } from 'vue-router';
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

  const contentImages = ref([]);
  const showImageModal = ref(false);
  const currentImageIndex = ref(0);


  const route = useRoute();
  const router = useRouter();
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
      const postId = route.params.id;
      const res = await axiosInstance.get(`/api/posts/${postId}`);

      // const post = ref(null); 로 선언된 변수에 백엔드 응답 데이터(res.data)를 넣는 것임.
      post.value = res.data;
      updateImageListFromContent();
     
      console.log('대표이미지: ', post.value.representativeImagePath);
      console.log('모달 이미지 리스트:', contentImages.value);

      console.log('✅ 게시글 응답:', res.data); // isOwner 확인

      fetchCommentsList(postId);
    } catch (err) {
      console.error('게시글 조회 실패:', err);
    }
  };
  
  const updateImageListFromContent = () => {
    if (post.value?.content) {
      const div = document.createElement('div'); // 가상의 div태그 생성
      const imgTags = div.querySelectorAll('img');  // img 태그들만 골라냄
      
      contentImages.value = Array.from(imgTags).map((img) => img.src); // src 속성만 추출해 배열로 저장
    }
  };



  const fetchCommentsList = async (postId) => {
    try {
      const res = await fetchComments(postId);
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
    const postId = route.params.id;
    try {
      await submitCommentApi(postId, { content: newComment.value }, commentFile.value);
      newComment.value = '';
      commentFile.value = null;
      fetchCommentsList(postId);
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
    const postId = route.params.id;
    try {
      await submitCommentApi(postId, { content: replyContent.value, parentCommentId: parentId }, replyFile.value);
      replyContent.value = '';
      replyTarget.value = null;
      replyFile.value = null;
      fetchCommentsList(postId);
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

    // DOM이 그려진 후 이미지 클릭 이벤트 바인딩
    setTimeout(() => {
    const images = document.querySelectorAll('.content img'); // 본문 내 img DOM 탐색
    images.forEach((img, idx) => {
      img.addEventListener('click', () => openImageModal(idx)); // 클릭 시 모달 열기
    });
  }, 0);
  });


const openImageModal = (index) => {
  currentImageIndex.value = index;
  showImageModal.value = true;
};

const closeImageModal = () => {
  showImageModal.value = false;
};

const prevImage = () => {
  if (!post.value?.imagePaths?.length) return;
  currentImageIndex.value =
    (currentImageIndex.value - 1 + post.value.imagePaths.length) %
    post.value.imagePaths.length;
};

const nextImage = () => {
  if (!post.value?.imagePaths?.length) return;
  currentImageIndex.value =
    (currentImageIndex.value + 1) % post.value.imagePaths.length;
};

// 게시글 수정 페이지로
const goToEditPage = () => {
  if (post.value) {
    router.push(`/posts/edit/${post.value.postId}`);
  }
};

// 게시글 삭제 페이지로
const deletePost = async () => {
  if (!confirm('정말 게시글을 삭제하시겠습니까?')) return;

  try {
    await axiosInstance.delete(`/api/posts/${post.value.postId}`);
    alert('삭제되었습니다');

    await router.push('/posts').catch((err) => {
      console.error('라우터 이동 실패:', err);
      alert('페이지 이동 중 오류가 발생했습니다');
    });

  } catch (err) {
    console.error('게시글 삭제 실패:', err);
    alert('삭제 중 오류가 발생했습니다');
  }
};

  // 이미지 클릭 시 모달 열기
  setTimeout(() => {
    const images = document.querySelectorAll('.content img');
    images.forEach((img, idx) => {
      img.addEventListener('click', () => {
        currentImageIndex.value = idx;
        showImageModal.value = true;
      });
    });
  }, 0);
  </script>
  
  
  
  
  
  <style scoped>
.post-detail-container {
  max-width: 800px;
  margin: auto;
  padding: 24px;
  font-family: 'Noto Sans KR', sans-serif;
  box-sizing: border-box;
}

/* 헤더 영역 */
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

/* 제목, 메타, 본문 */
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

/* 이미지 리스트 */
.images {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.post-image {
  width: 180px;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
  cursor: pointer;
  transition: transform 0.2s;
}
.post-image:hover {
  transform: scale(1.02);
}

/* 공통 버튼 스타일 */
button {
  font-family: inherit;
}

.btn,
.reply-btn,
.edit-btn,
.delete-btn {
  padding: 6px 12px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn {
  background-color: #ff84a2;
  color: #fff;
}

.btn:hover {
  background-color: #e46d8c;
}

.reply-btn,
.edit-btn,
.delete-btn {
  background-color: #f2f2f2;
  color: #333;
}

.reply-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  background-color: #ddd;
}

.btn-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 8px;
}

/* 댓글 폼 */
.comment-form,
.reply-form {
  margin-top: 24px;
}

textarea,
.edit-textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
  font-size: 14px;
  font-family: inherit;
  box-sizing: border-box;
}

/* 댓글 목록 */
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
  max-width: 120px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

/* 대댓글 */
.child-comments {
  margin-left: 20px;
  padding-left: 12px;
  border-left: 2px solid #f0f0f0;
  margin-top: 12px;
}

/* 좋아요 영역 */
.post-like {
  margin-top: 16px;
  font-size: 24px;
  user-select: none;
}

.heart-icon {
  font-size: 24px;
  color: #ccc;
  cursor: pointer;
  vertical-align: middle;
  transition: color 0.2s;
}

.heart-icon.liked {
  color: #e46d8c;
}

.heart-icon.disabled {
  opacity: 0.5;
  cursor: default;
}

.like-count {
  margin-left: 6px;
  font-size: 14px;
  color: #666;
}

/* 모달 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

/* 모달 버튼 */
.close-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  width: 32px;
  height: 32px;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  font-size: 36px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  color: #333;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.nav-btn.prev {
  left: -60px;
}

.nav-btn.next {
  right: -60px;
}

/* 로딩 메시지 */
.loading {
  text-align: center;
  padding: 40px;
  color: #aaa;
}
@media (max-width: 600px) {
  .post-image {
    width: 100%;
  }
  .btn-row {
    justify-content: center;
  }
}
  </style>
  