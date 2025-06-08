<template>
  <div class="post-write-container">
    <h2>글 작성</h2>

    <form @submit.prevent="submitPost">
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

      <!-- 이미지 다중 첨부 -->
      <div class="form-group">
        <label>이미지 첨부</label>
        <input type="file" multiple accept="image/*" @change="handleImageChange" />
      </div>

      <!-- Toast UI Editor -->
      <div class="form-group">
        <label>내용</label>
        <div ref="editorRoot" />
      </div>

      <button type="submit">등록</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Editor from '@toast-ui/editor';
import '@toast-ui/editor/dist/toastui-editor.css';

import { fetchPostCategories, createPost, createPostWithImage } from '@/apis/postApi';

const router = useRouter();

const form = ref({
  title: '',
  content: '',
  categoryId: ''
});

const imageFiles = ref([]); // 선택된 이미지들
const categories = ref([]);
const editorRoot = ref(null);
const editorInstance = ref(null);

// Toast UI Editor 초기화
onMounted(async () => {
  await fetchCategories();

  // 기존 에디터 인스턴스 제거 (중복 초기화 방지)
  if (editorInstance.value) {
    editorInstance.value.destroy();
  }

  editorInstance.value = new Editor({
    el: editorRoot.value,
    height: '500px',
    initialEditType: 'wysiwyg',
    previewStyle: 'vertical',
    hooks: {
      addImageBlobHook: async (blob, callback) => {
        const formData = new FormData();
        formData.append('file', blob);

        try {
          const res = await axios.post('/test-upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          const imageUrl = res.data;
          console.log('S3 이미지 URL:', imageUrl);

          callback(imageUrl, blob.name);
        } catch (err) {
          console.error('에디터 이미지 업로드 실패:', err);
          alert('이미지 업로드 실패');
        }
      }
    }
  });
});



// 이미지 input으로 선택 시 본문에 삽입
const handleImageChange = async (e) => {
  const files = Array.from(e.target.files);
  imageFiles.value = files;

  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/test-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const imageUrl = res.data;
      editorInstance.value.insertText(`![${file.name}](${imageUrl})\n`);
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
    }
  }
};

// 카테고리 불러오기
const fetchCategories = async () => {
  try {
    const res = await fetchPostCategories();
    categories.value = res.data;
  } catch (err) {
    console.error('카테고리 로딩 실패:', err);
  }
};

// 등록
const submitPost = async () => {
  form.value.content = editorInstance.value.getHTML();

  const payload = {
    title: form.value.title,
    content: form.value.content,
    categoryId: form.value.categoryId,
    postDate: new Date().toISOString()
  };

  try {
    if (imageFiles.value.length > 0) {
      await createPostWithImage(payload, imageFiles.value);
    } else {
      await createPost(payload);
    }

    alert('글이 등록되었습니다!');
    router.push('/posts');
  } catch (err) {
    console.error('등록 실패:', err);
    alert('등록에 실패했습니다.');
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

input,
textarea,
select {
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
</style>

  
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
  
  input,
  textarea,
  select {
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
  </style>
  