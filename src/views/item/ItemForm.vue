<template>
    <div class="item-form">
      <h2>상품 등록</h2>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>상품명</label>
          <input v-model="item.itemName" type="text" required />
        </div>
  
        <div class="form-group">
          <label>가격</label>
          <input v-model.number="item.price" type="number" required />
        </div>
  
        <div class="form-group">
          <label>설명</label>
          <textarea v-model="item.description" required></textarea>
        </div>
  
        <div class="form-group">
          <label>재고 수량</label>
          <input v-model.number="item.stockQuantity" type="number" required />
        </div>
  
        <div class="form-group">
        <label>카테고리</label>
        <select v-model="item.categoryId" required>
            <option value="" disabled>선택하세요</option>
            <optgroup
            v-for="group in categories"
            :key="group.categoryId"
            :label="group.categoryName"
            >
            <option
                v-for="child in group.children"
                :key="child.categoryId"
                :value="child.categoryId"
            >
                {{ child.categoryName }}
            </option>
            </optgroup>
        </select>
        </div>

  
        <div class="form-group">
          <label>이미지 업로드</label>
          <input type="file" multiple @change="handleFileChange" />
        </div>
  
        <button type="submit">등록</button>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { createItem } from '@/apis/itemApi';
  import axiosInstance from '@/plugin/axiosInstance';
  
  const router = useRouter();
  
  const item = ref({
    itemName: '',
    price: 0,
    description: '',
    stockQuantity: 1,
    categoryId: ''
  });
  
  const imageFiles = ref([]);
  const categories = ref([]);
  
  const handleFileChange = (e) => {
    imageFiles.value = Array.from(e.target.files);
  };
  
//   const fetchCategories = async () => {
//     const res = await axiosInstance.get('/api/admin/item-categories');
//     categories.value = res.data.flatMap(group => group.children);
//   };

    const fetchCategories = async () => {
    try {
        const res = await axiosInstance.get('/api/item-categories/tree');
        console.log('✅ 카테고리 트리:', res.data);
        categories.value = res.data;
    } catch (err) {
        console.error('❌ 카테고리 불러오기 실패:', err);
    }
    };


  const submitForm = async () => {
    try {
      await createItem(item.value, imageFiles.value);
      alert('상품이 등록되었습니다.');
      router.push('/items');
    } catch (err) {
      console.error(err);
      alert('등록에 실패했습니다.');
    }
  };
  
  onMounted(fetchCategories);
  </script>
  
  <style scoped>
  .item-form {
    max-width: 600px;
    margin: auto;
    padding: 24px;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #fff;
  }
  
  .form-group {
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
  }
  
  label {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  input,
  select,
  textarea {
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }
  
  button {
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  