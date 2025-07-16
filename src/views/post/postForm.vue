<template>
  <div class="post-write-container">
    <h2>{{ isEditMode ? '글 수정' : '글 작성' }}</h2>

    <form @submit.prevent="isEditMode ? updatePost() : submitPost()">
      <!-- 카테고리 -->
      <div class="form-group">
        <label>카테고리</label>
        <select v-model="form.categoryId" required>
          <option value="" disabled>카테고리를 선택하세요</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.categoryName }}
          </option>
        </select>
      </div>

      <!-- 제목 -->
      <div class="form-group">
        <label>제목</label>
        <input type="text" v-model="form.title" required />
      </div>

      <!-- Toast UI Editor -->
      <div class="form-group">
        <label>내용</label>
        <div ref="editorRoot" />
      </div>

      <button type="submit">{{ isEditMode ? '수정' : '등록' }}</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axiosInstance from '@/plugin/axiosInstance';
import Editor from '@toast-ui/editor';
import { updatePost as updatePostApi } from '@/apis/postApi'
import { fetchPostCategories } from '@/apis/postApi'
import '@toast-ui/editor/dist/toastui-editor.css';

const route = useRoute();
const router = useRouter();
const postId = route.params.id;
const isEditMode = !!postId;

const form = ref({
  title: '',
  content: '',
  categoryId: ''
});

const categories = ref([]);
const editorRoot = ref(null);
let editorInstance = null;

// 에디터 초기화 및 데이터 로드
onMounted(async () => {
  await fetchCategories();
  if (isEditMode) {
    await fetchPostDetail();
  }

  if (editorInstance) editorInstance.destroy();

  editorInstance = new Editor({
    el: editorRoot.value,
    height: '500px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    initialValue: isEditMode ? form.value.content : '',
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        const formData = new FormData();
        formData.append('file', blob);

        try {
          const res = await axiosInstance.post('/api/test-upload', formData);
          const imageUrl = res.data;
          callback(imageUrl, blob.name);
        } catch (err) {
          console.error('이미지 업로드 실패:', err);
          alert('이미지 업로드에 실패했습니다.');
        }
      }
    }
  });
});

// 카테고리 로딩
const fetchCategories = async () => {
  try {
    const res = await fetchPostCategories();
    categories.value = res.data;
  } catch (err) {
    console.error('카테고리 로딩 실패:', err);
  }
};

// 수정 모드일 경우 게시글 정보 불러오기
const fetchPostDetail = async () => {
  try {
    const res = await axiosInstance.get(`/api/posts/${postId}`);
    const post = res.data;
    form.value.title = post.title;
    form.value.content = post.content;
    form.value.categoryId = post.categoryId;
  } catch (err) {
    console.error('게시글 불러오기 실패:', err);
  }
};

// 글 작성
const submitPost = async () => {
  form.value.content = editorInstance.getHTML();

  const postData = {
    ...form.value,
    postDate: new Date().toISOString()
  };

  try {
    await axios.post('/api/posts/new', postData);
    alert('글이 등록되었습니다!');
    router.push('/posts');
  } catch (err) {
    console.error('등록 실패:', err);
    alert('등록에 실패했습니다.');
  }
};

// 글 수정
const updatePost = async () => {
  form.value.content = editorInstance.getHTML();

  const payload = {
    ...form.value,
    postDate: new Date().toISOString()
  };

  const formData = new FormData();
  formData.append('postData', new Blob([JSON.stringify(payload)], { type: 'application/json' }));

  const token = localStorage.getItem('token');

  try {
    await updatePostApi(postId, formData, token); 
    alert('수정 완료!');
    router.push(`/posts/${postId}`);
  } catch (err) {
    console.error('수정 실패:', err);
    alert('수정에 실패했습니다.');
  }
};
</script>

<style scoped>
.post-write-container {
  max-width: 800px;
  margin: auto;
  padding: 24px;
}
.form-group {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
}
label {
  font-weight: 600;
  margin-bottom: 4px;
}
input, select {
  padding: 8px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
button {
  background-color: #ff84a2;
  color: white;
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
button:hover {
  background-color: #e46d8c;
}

@media (max-width: 600px) {
  .post-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .thumbnail {
    width: 100%;
    margin: 12px 0 0 0;
  }

  .post-left {
    max-width: 100%;
  }
}
</style>
