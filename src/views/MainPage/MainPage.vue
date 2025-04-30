  <template>
    <div class="container">
      <!-- 배너 -->
      <section class="banner mb-4">
        <Banner />
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

  <script setup>
  import { ref, computed } from 'vue';
  import Banner from "@/assets/MainPage/Banner.vue";

  // 데이터 선언
  const searchQuery = ref('');
  const selectedCategory = ref('');
  const products = ref([
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
  ]);

  // 필터링된 상품 목록 계산
  const filteredProducts = computed(() => {
    if (!selectedCategory.value) return products.value;
    return products.value.filter((product) => product.category === selectedCategory.value);
  });
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
