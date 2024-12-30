<template>
    <div class="container">
      <!-- 상품 검색 및 카테고리 필터 -->
      <section class="filters py-3">
        <div class="row">
          <div class="col-md-4">
            <select class="form-select" v-model="selectedCategory" @change="filterByCategory">
              <option value="">모든 카테고리</option>
              <option value="electronics">전자제품</option>
              <option value="furniture">가구</option>
              <option value="clothing">의류</option>
            </select>
          </div>
          <div class="col-md-8 text-end">
            <router-link to="/create" class="btn btn-primary">새 상품 등록</router-link>
          </div>
        </div>
      </section>
  
      <!-- 상품 목록 -->
      <section class="product-list">
        <div class="row">
          <div class="col-md-4" v-for="product in filteredProducts" :key="product.id">
            <div class="card mb-4">
              <img :src="product.imageUrl" class="card-img-top" alt="상품 이미지" />
              <div class="card-body">
                <h5 class="card-title">{{ product.name }}</h5>
                <p class="card-text">{{ product.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="badge bg-success">{{ product.price.toLocaleString() }} 원</span>
                  <router-link :to="`/product/${product.id}`" class="btn btn-outline-primary btn-sm">상세보기</router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </template>
  
  <script>
  export default {
    name: 'MainPage',
    data() {
      return {
        searchQuery: '',
        selectedCategory: '',
        products: [
          {
            id: 1,
            name: '핸드폰',
            description: '상태 좋은 핸드폰 판매합니다.',
            price: 200000,
            category: 'electronics',
            imageUrl: 'https://via.placeholder.com/300',
          },
          {
            id: 2,
            name: '소파',
            description: '편안한 소파입니다.',
            price: 150000,
            category: 'furniture',
            imageUrl: 'https://via.placeholder.com/300',
          },
          {
            id: 3,
            name: '셔츠',
            description: '스타일리시한 셔츠',
            price: 25000,
            category: 'clothing',
            imageUrl: 'https://via.placeholder.com/300',
          },
        ],
        filteredProducts: [],
      };
    },
    methods: {
      filterByCategory() {
        this.filteredProducts = this.products.filter((product) => {
          if (this.selectedCategory === '') return true;
          return product.category === this.selectedCategory;
        });
      },
    },
    created() {
      this.filteredProducts = this.products;
    },
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .card-img-top {
    height: 200px;
    object-fit: cover;
  }
  </style>
  