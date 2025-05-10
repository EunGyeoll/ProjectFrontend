<template>
    <div class="post-write-container">
      <h1>게시글 작성</h1>
      <form @submit.prevent="submitPost">
        <div class="form-group">
          <label>카테고리</label>
          <select v-model="form.categoryId" required>
            <option value="" disabled>카테고리를 선택하세요</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.categoryName }}
            </option>
          </select>
        </div>
  
        <div class="form-group">
          <label>제목</label>
          <input type="text" v-model="form.title" required />
        </div>
  
        <div class="form-group">
          <label>내용</label>
          <textarea v-model="form.content" required></textarea>
        </div>
  
        <div class="form-group">
          <label>이미지 업로드</label>
          <input type="file" multiple @change="handleImageChange" />
        </div>
  
        <button type="submit">등록</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { fetchPostCategories, createPost, createPostWithImage } from '@/apis/postApi';
  
  const router = useRouter();
  
  const form = ref({
    title: '',
    content: '',
    categoryId: ''
  });
  
  const imageFiles = ref([]);
  const categories = ref([]);
  
  const handleImageChange = (e) => {
    imageFiles.value = Array.from(e.target.files);
  };
  
  const fetchCategories = async () => {
    try {
      const res = await fetchPostCategories();
      categories.value = res.data;
    } catch (err) {
      console.error('카테고리 불러오기 실패:', err);
    }
  };
  
  const submitPost = async () => {
    try {
      const payload = {
        title: form.value.title,
        content: form.value.content,
        categoryId: form.value.categoryId,
        postDate: new Date().toISOString()
      };
  
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
  
  onMounted(fetchCategories);
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
  