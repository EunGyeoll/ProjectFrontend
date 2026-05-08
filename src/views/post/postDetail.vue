<template>
  <div class="post-detail-container" v-if="post">
    <div class="post-header">
      <img class="profile" :src="post.profileImageUrl || defaultProfileImage"  alt="프로필 이미지" />
      <div class="author-info">
        <span class="nickname">{{ post.writerNickname }}</span>
        <span class="date">{{ formatDate(post.postDate) }}</span>
        <span class="hit">조회수 {{ post.hitCount }}회</span>
      </div>
    </div>

    <h1 class="title">{{ post.title }}</h1>
    <div class="meta">#{{ post.categoryName }}</div>
    <div class="content" v-html="cleanContent"></div>

    <div class="gallery" v-if="contentImages.length">
      <img
        v-for="(img, i) in contentImages"
        :key="i"
        :src="img"
        class="gallery-img"
        @click="openImageModal(i)"
      />
    </div>


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
        <img :src="contentImages[currentImageIndex]" alt="확대 이미지" />
        <button class="close-btn" @click="closeImageModal">×</button>
        <button class="nav-btn prev" @click.stop="prevImage" v-if="contentImages.length > 1">‹</button>
        <button class="nav-btn next" @click.stop="nextImage" v-if="contentImages.length > 1">›</button>
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
  <textarea
    v-model="newComment"
    placeholder="댓글을 입력하세요"
  ></textarea>

  <div class="comment-form-bottom">
    <label class="file-label">
      이미지 첨부
      <input
        type="file"
        accept="image/*"
        @change="handleFileChange($event, 'comment')"
      />
    </label>

    <span class="file-name" v-if="commentFile">
      {{ commentFile.name }}
    </span>

    <button class="comment-submit-btn" @click="submitComment">
      댓글 작성
    </button>
  </div>
</div>

    <div class="comments">
      <div v-for="comment in comments" :key="comment.commentId" class="comment-block">
        <div class="comment comment-root">
          <div class="comment-content">
            <div class="comment-header">
            <img
              class="comment-profile"
              :src="comment.profileImageUrl || defaultProfileImage"
              alt="프로필"
            />
            <div class="comment-info">
            <strong>{{ comment.writerName }}</strong> · {{ formatDate(comment.commentDate) }}
            </div>
          </div>
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
                <div class="comment-header">
                <img
                  class="comment-profile"
                  :src="child.profileImageUrl || defaultProfileImage"
                  alt="프로필"
                />
                <div class="comment-info">
                  <strong>{{ child.writerName }}</strong> · {{ formatDate(child.commentDate) }}
                </div>
              </div>
              <div class="comment-content">
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
  
  const defaultProfileImage = 'https://pjtbucket.s3.ap-northeast-2.amazonaws.com/profile/profileblack.png';


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
  
const cleanContent = ref('');

const updateImageListFromContent = () => {
  if (!post.value?.content) return;

  const div = document.createElement('div');
  div.innerHTML = post.value.content;

  const imgTags = div.querySelectorAll('img');

  // 이미지 따로 저장
  contentImages.value = Array.from(imgTags).map((img) => img.src);

  // 🔥 본문에서는 제거
  imgTags.forEach((img) => img.remove());

  cleanContent.value = div.innerHTML;
};



  const fetchCommentsList = async (postId) => {
    try {
      const res = await fetchComments(postId);
          console.log('🔥 원본 댓글 데이터:', res.data);

      comments.value = buildCommentTree(res.data);
          console.log('🔥 트리 구조 댓글:', comments.value);

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
  const len = contentImages.value.length
  if (!len) return

  currentImageIndex.value =
    (currentImageIndex.value - 1 + len) % len
}

const nextImage = () => {
  const len = contentImages.value.length
  if (!len) return

  currentImageIndex.value =
    (currentImageIndex.value + 1) % len
}

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

.date,
.hit {
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
  line-height: 1.7;
  white-space: pre-wrap;
  color: #222;
}

/* 갤러리 */

.gallery {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 24px 0 32px;
}

.gallery-img {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.25s ease,
    opacity 0.25s ease,
    box-shadow 0.25s ease;
  background: #f5f5f5;
}

.gallery-img:hover {
  transform: translateY(-3px);
  opacity: 0.95;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* 공통 버튼 */

button {
  font-family: inherit;
}

/* 버튼 라인 */

.btn-row {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
  margin-top: 10px;
}

/* 기본 버튼 */

.reply-btn,
.edit-btn,
.delete-btn {
  padding: 7px 12px;
  font-size: 13px;
  border-radius: 999px;
  border: none;
  background: #f3f3f3;
  color: #444;
  cursor: pointer;
  transition: 0.2s;
}

.reply-btn:hover,
.edit-btn:hover,
.delete-btn:hover {
  background: #e5e5e5;
}

/* 댓글 작성 폼 */

.comment-form {
  margin-top: 32px;
  padding: 14px 16px;
  border: 1px solid #eee;
  border-radius: 22px;
  background: #fafafa;
  transition: 0.2s;
}

.comment-form:focus-within {
  border-color: #ccc;
  background: #fff;
}

.comment-form textarea {
  width: 100%;
  min-height: 40px;
  max-height: 140px;
  border: none;
  outline: none;
  resize: none;
  background: transparent;
  font-size: 14px;
  line-height: 1.6;
  font-family: inherit;
}

.comment-form-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  justify-content: flex-end;
}

.file-label {
  padding: 6px 10px;
  border-radius: 999px;
  background: #eee;
  font-size: 12px;
  cursor: pointer;
  color: #555;
  white-space: nowrap;
}

.file-label:hover {
  background: #e5e5e5;
}

.file-label input {
  display: none;
}

.file-name {
  flex: 1;
  font-size: 11px;
  color: #888;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.comment-submit-btn {
  padding: 7px 14px;
  border: none;
  border-radius: 999px;
  background: #111;
  color: white;
  font-size: 12px;
  cursor: pointer;
  transition: 0.2s;
}

.comment-submit-btn:hover {
  background: #333;
}

/* 댓글 */

.comments {
  margin-top: 40px;
}

.comment-block {
  padding: 20px 0;
  border-top: 1px solid #eee;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.comment-profile {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-info {
  font-size: 13px;
  color: #777;
}

.comment-info strong {
  font-weight: 700;
  color: #222;
}

.comment-content {
  padding: 14px 0;
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

/* 댓글 이미지 */

.comment-image {
  display: block;
  margin-top: 12px;
  max-width: 180px;
  max-height: 180px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #eee;
}

/* 대댓글 */

.child-comments {
  margin-left: 24px;
  margin-top: 12px;
  padding-left: 14px;
  border-left: 2px solid #eee;
}

/* 답글 작성 */

.reply-form {
  margin-top: 14px;
  padding: 14px;
  border-radius: 14px;
  background: #f7f7f7;
}

.reply-form textarea,
.edit-textarea {
  width: 100%;
  min-height: 76px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 12px;
  resize: vertical;
  font-size: 14px;
  line-height: 1.5;
  font-family: inherit;
  box-sizing: border-box;
}

/* 좋아요 */

.post-like {
  margin-top: 18px;
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

/* =========================
   이미지 모달
========================= */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(0, 0, 0, 0.86);
  backdrop-filter: blur(8px);
}

.modal-content {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  max-width: 100%;
  max-height: 100%;
}

.modal-content img {
  max-width: min(92vw, 1100px);
  max-height: 84vh;
  object-fit: contain;

  border-radius: 0px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.45);
}

/* 공통 버튼 */
.close-btn,
.nav-btn {
  position: fixed;
  z-index: 1001;

  display: flex;
  align-items: center;
  justify-content: center;

  border: none;
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  backdrop-filter: blur(14px);

  cursor: pointer;
  transition: 0.2s ease;

  padding: 0;
  line-height: 1;
}

/* X 버튼 */
.close-btn {
  top: 28px;
  right: 64px;

  width: 44px;
  height: 44px;

  font-size: 30px;
  font-weight: 300;
}

/* 좌우 버튼 */
.nav-btn {
  top: 50%;

  width: 52px;
  height: 52px;

  font-size: 46px;
  font-weight: 200;

  transform: translateY(-50%);
}

.nav-btn.prev {
  left: 32px;
}

.nav-btn.next {
  right: 32px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.08);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.08);
}

/* 로딩 */

.loading {
  text-align: center;
  padding: 40px;
  color: #aaa;
}

/* =========================
   반응형
========================= */
/* 반응형 */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 12px;
  }

  .modal-content img {
    max-width: 100%;
    max-height: 78vh;
    border-radius: 14px;
  }

  .close-btn {
    top: 18px;
    right: 24px;

    width: 40px;
    height: 40px;

    font-size: 26px;
  }

  .nav-btn {
    width: 42px;
    height: 42px;
    font-size: 34px;
  }

  .nav-btn.prev {
    left: 12px;
  }

  .nav-btn.next {
    right: 12px;
  }
}

@media (max-width: 480px) {
  .modal-content img {
    max-height: 72vh;
  }

  .close-btn {
    top: 14px;
    right: 18px;
  }

  .nav-btn {
    width: 38px;
    height: 38px;
    font-size: 30px;
  }
}
</style>
