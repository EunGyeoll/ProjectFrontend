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
  
      <!-- 댓글 작성 -->
      <div class="comment-form">
        <textarea v-model="newComment" placeholder="댓글을 입력하세요"></textarea>
        <input type="file" @change="handleFileChange($event, 'comment')" />
        <button @click="submitComment">댓글 작성</button>
      </div>
  

        <!-- 댓글 목록 -->
        <div class="comments">
        <div v-for="comment in comments" :key="comment.commentId" class="comment-block">
            <div class="comment comment-root">
            <div class="comment-content">
                <strong>{{ comment.writerName }}</strong> · {{ formatDate(comment.commentDate) }}


        <!-- 댓글 수정 영역 -->
        <div v-if="editingCommentId === comment.commentId">
        <textarea v-model="editedContent" class="edit-textarea" />

        <!-- 기존 이미지 보여주기 + 삭제 -->
        <div v-if="comment.imageUrl && !removeImage">
            <img :src="comment.imageUrl" alt="기존 이미지" class="comment-image" />
            <button @click="removeImage.value = true" class="delete-btn">기존 이미지 삭제</button>
        </div>

        <!-- 새로운 이미지 선택 -->
        <input type="file" @change="handleEditImageChange" />

        <div class="btn-row">
            <button @click="submitEdit(comment.commentId)">저장</button>
            <button @click="cancelEdit()">취소</button>
        </div>
        </div>
        <div v-else>
          <p>{{ comment.content }}</p>
          <img v-if="comment.imageUrl" :src="comment.imageUrl" class="comment-image" />
        </div>
        

        <!-- 버튼들 -->
        <div class="btn-row">
          <button class="reply-btn" @click="toggleReply(comment.commentId)">답글</button>
          <button class="edit-btn" @click="startEdit(comment)">수정</button>
          <button class="delete-btn" @click="deleteComment(comment.commentId)">삭제</button>
        </div>
      </div>

      <!-- 대댓글 폼 -->
      <div v-if="replyTarget === comment.commentId" class="reply-form">
        <textarea v-model="replyContent" placeholder="답글을 입력하세요"></textarea>
        <input type="file" @change="handleFileChange($event, 'reply')" />
        <button @click="submitReply(comment.commentId)">답글 작성</button>
      </div>

      <!-- 대댓글 목록 -->
      <div class="child-comments" v-for="child in comment.childComments" :key="child.commentId">
        <div class="comment">
          <div class="comment-content">
            <strong>{{ child.writerName }}</strong> · {{ formatDate(child.commentDate) }}

            <div v-if="editingCommentId === child.commentId">
              <textarea v-model="editedContent" class="edit-textarea" />
              <div class="btn-row">
                <button @click="submitEdit(child.commentId)">저장</button>
                <button @click="cancelEdit()">취소</button>
              </div>
            </div>
            <div v-else>
              <p>{{ child.content }}</p>
              <img v-if="child.imageUrl" :src="child.imageUrl" class="comment-image" />
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
  import { fetchComments, submitComment as submitCommentApi } from '@/apis/commentApi'; // ✅ 수정된 import
  import axiosInstance from '@/plugin/axiosInstance';
  
  const post = ref(null);
  const hitCount = ref('');
  const route = useRoute();
  const comments = ref([]);
  const newComment = ref('');
  const replyTarget = ref(null);
  const replyContent = ref('');
  const commentFile = ref(null);
  const replyFile = ref(null);
  const editingCommentId = ref(null);         // 수정 중인 댓글 ID
  const editedContent = ref('');              // 수정할 내용
  const editedFile = ref(null);       // 새 이미지 파일
  const removeImage = ref(false);     // 기존 이미지 삭제 여부

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
  editingCommentId.value = comment.commentId;
  editedContent.value = comment.content;
  removeImage.value = false;
  editedFile.value = null;
  };


const cancelEdit = () => {
  editingCommentId.value = null;
  editedContent.value = '';
};

const submitEdit = async (commentId) => {
  if (!editedContent.value.trim()) return;

  try {
    const formData = new FormData();
    const commentData = {
      content: editedContent.value,
    };

    formData.append(
      'commentData',
      new Blob([JSON.stringify(commentData)], { type: 'application/json' })
    );

    if (!removeImage.value && editedFile.value) {
      formData.append('image', editedFile.value); // 새 이미지 첨부
    }

    // ✅ 서버에서는 image 없을 경우 기존 이미지 유지,
    //    있고 + 삭제 플래그면 기존 이미지 삭제
    await axiosInstance.put(`/api/comments/${commentId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    // 상태 초기화
    editingCommentId.value = null;
    editedContent.value = '';
    editedFile.value = null;
    removeImage.value = false;

    fetchCommentsList(route.params.id);
  } catch (err) {
    console.error('댓글 수정 실패:', err);
  }
};


const handleEditImageChange = (event) => {
  editedFile.value = event.target.files[0];
  removeImage.value = false; // 새 파일 올리면 삭제 플래그 초기화
};


const deleteComment = async (commentId) => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await axiosInstance.delete(`/api/comments/${commentId}`);
    fetchCommentsList(route.params.id);
  } catch (err) {
    console.error('댓글 삭제 실패:', err);
  }
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
  
  .comment-form textarea,
  .reply-form textarea {
    width: 100%;
    padding: 8px;
    margin: 12px 0;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  
  .comment-form button,
  .reply-form button,
  .reply-btn {
    background-color: #ff84a2;
    color: white;
    border: none;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 8px;
  }
  
  .comments {
    margin-top: 32px;
  }
  
  .comment {
    border-top: 1px solid #eee;
    padding-top: 12px;
    margin-top: 12px;
  }
  
  .comment-root {
  border-top: 1px solid #eee;
  padding-top: 12px;
  margin-top: 12px;
}

.child-comments {
  margin-left: 16px;
  margin-top: 8px;
  border-left: 2px solid #f0f0f0;
  padding-left: 12px;
}

  .comment-header {
    font-size: 14px;
    color: #555;
    margin-bottom: 4px;
  }
  
  .comment-body {
    font-size: 15px;
    color: #333;
  }
  
  .comment-image {
  margin-top: 8px;
  max-width: 100px;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.hit {
  font-size: 13px;
  color: #aaa;
}

.btn-row {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.edit-btn,
.delete-btn {
  background-color: #eee;
  border: none;
  padding: 4px 8px;
  margin-top: 8px;
  cursor: pointer;
  font-size: 12px;
  border-radius: 4px;
}


.edit-textarea {
  width: 100%;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

  .loading {
    text-align: center;
    padding: 40px;
    color: #aaa;
  }
  </style>
  