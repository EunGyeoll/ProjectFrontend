<template>
  <div class="item-detail-container" v-if="item">
    <div class="item-header">
      <img
        class="item-image"
        :src="item.representativeImagePath"
        alt="대표 이미지"
        @click="openModal(item.representativeImagePath)"
      />
      <div class="info">
        <h1 class="title">{{ item.itemName }}</h1>
        <p class="price">{{ formatPrice(item.price) }}원</p>
        <p class="category">카테고리: {{ item.categoryName }}</p>

        <!-- 찜하기 하트 버튼 -->
        <div class="item-like">
          <font-awesome-icon
          :icon="[liked === true ? 'fas' : 'far', 'heart']"
          :class="['heart-icon', { liked: liked === true, disabled: !isLoggedIn }]"
          @click="handleHeartClick"
          />
          <span class="like-count">{{ favoriteCount }}</span>
        </div>



      </div>
    </div>

    <div class="description">
      <h2>상품 설명</h2>
      <p v-html="item.description"></p>
    </div>

    <div class="gallery" v-if="item.imagePaths && item.imagePaths.length">
      <h2>추가 이미지</h2>
      <div class="image-list">
        <img
          v-for="(img, i) in item.imagePaths"
          :key="i"
          :src="img"
          class="gallery-image"
          @click="openModal(img)"
        />
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <div v-if="modalImage" class="modal" @click.self="closeModal">
      <div class="modal-content">
        <button class="close-button" @click="closeModal">✕</button>
        <img :src="modalImage" class="modal-image" />
      </div>
    </div>
  </div>
  <div v-else class="loading">상품 정보를 불러오는 중입니다...</div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import axiosInstance from '@/plugin/axiosInstance';
import {
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavoriteCount,
} from '@/apis/favoriteItemApi';

const item = ref(null);
const route = useRoute();
const liked = ref(null); // ← 초기값을 false 대신 null로
const likedChecked = ref(false); // 찜 상태 체크 완료 여부
const favoriteCount = ref(0);
const isLoggedIn = ref(false);

const modalImage = ref(null);

const fetchItem = async () => {
  const id = route.params.id;
  console.log("fetchItem 호출됨, id:", id);

  try {
    const res = await axiosInstance.get(`/api/items/${id}`);
    console.log("item fetch 성공", res.data);
    item.value = res.data;
  } catch (err) {
    console.error("❌ 상품 조회 실패", err);
  }
};

const checkFavoriteStatus = async () => {
  try {
    const res = await checkFavorite(route.params.id);
    liked.value = res.data;
    console.log("liked 상태:", liked.value);  // true로 찍히는지 확인
  } catch (err) {
    console.error("❌ 찜 상태 확인 실패:", err.response?.status, err.response?.data || err.message);
  } finally {
    likedChecked.value = true;
  }
};

const fetchFavoriteCount = async() => {
  try {
    const res = await getFavoriteCount(route.params.id);
    favoriteCount.value = res.data;
  } catch (err) {
    console.error("찜 수 조회 실패: ", err);
  }
}

const toggleLike = async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("찜 기능은 로그인 후 사용할 수 있어요!");
    return;
  }

  try {
    const itemId = route.params.id;
    if (liked.value) {
      await removeFavorite(itemId);
    } else {
      await addFavorite(itemId);
    }
    liked.value = !liked.value;
    await fetchFavoriteCount(); // 찜 수 다시 불러오기
  } catch (err) {
    console.error('찜 처리 실패:', err);
    alert("찜 처리 중 오류가 발생했습니다.");
  }
};


const openModal = (imgUrl) => {
  modalImage.value = imgUrl;
};

const closeModal = () => {
  modalImage.value = null;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeModal();
  }
};

// formatPrice는 반드시 <script setup> 안에서 정의해야 template에서 사용 가능
const formatPrice = (price) => {
  return price?.toLocaleString() || '0';
};

onMounted(() => {
  fetchItem();
  fetchFavoriteCount();

  const token = localStorage.getItem("token");
  if (token) {
    isLoggedIn.value = true;
    checkFavoriteStatus();
  }


  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleHeartClick = () => {
  console.log("🔐 isLoggedIn 상태:", isLoggedIn.value); 
  if (!isLoggedIn.value) {
    alert("찜 기능은 로그인 후 사용할 수 있어요!");
    return;
  }
  toggleLike();
};

</script>


<style scoped>
.item-detail-container {
  max-width: 800px;
  margin: auto;
  padding: 24px;
}

.item-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.item-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.info {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.price {
  font-size: 18px;
  color: #e46d8c;
  margin-bottom: 8px;
}

.category {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}

.item-like {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  color: #ccc;
  transition: color 0.2s;
  margin-top: 10px;
}


.heart {
  color: #ccc;
}

/* ::v-deep(.heart.liked) {
  color: #e46d8c;
} */
:deep(.heart.liked) {
  color: #e46d8c;
}

.item-like:hover .heart {
  color: #e46d8c;
}


.description {
  margin-top: 32px;
}

.description h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.description p {
  line-height: 1.6;
  white-space: pre-wrap;
}

.gallery {
  margin-top: 32px;
}

.image-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gallery-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  position: relative;
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}

.close-button {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  border: none;
  font-size: 20px;
  border-radius: 50%;
  padding: 4px 8px;
  cursor: pointer;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #aaa;
}

.item-detail-container {
  max-width: 800px;
  margin: auto;
  padding: 24px;
}

.item-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.item-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ccc;
  cursor: pointer;
}

.info {
  flex: 1;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 12px;
}

.price {
  font-size: 18px;
  color: #e46d8c;
  margin-bottom: 8px;
}

.category {
  font-size: 14px;
  color: #555;
  margin-bottom: 4px;
}


.description {
  margin-top: 32px;
}

.description h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.description p {
  line-height: 1.6;
  white-space: pre-wrap;
}

.gallery {
  margin-top: 32px;
}

.image-list {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.gallery-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-content {
  position: relative;
}

.modal-image {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
}

.close-button {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  border: none;
  font-size: 20px;
  border-radius: 50%;
  padding: 4px 8px;
  cursor: pointer;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.4);
}

.loading {
  text-align: center;
  padding: 40px;
  color: #aaa;
}

.item-like {
  font-size: 24px;
  cursor: pointer;
  user-select: none;
  color: #ccc;
  transition: color 0.2s;
}

.heart.liked {
  color: #e46d8c;
}

.item-like:hover .heart {
  color: #e46d8c;
}

.like-count {
  margin-left: 6px;
  font-size: 14px;
  color: #888;
}

.heart-icon {
  font-size: 24px;
  cursor: pointer;
  color: #ccc;
  transition: color 0.2s;
  vertical-align: middle; 
}

.heart-icon.liked {
  color: #e46d8c;
}

.heart-icon.disabled {
  opacity: 0.4;
}

</style>
