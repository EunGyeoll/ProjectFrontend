<template>
  <div class="item-detail-container" v-if="item">
    <div class="item-header">
      <img
        class="item-image"
        :src="item.representativeImagePath"
        alt="대표 이미지"
        @click="openImageModalByUrl(item.representativeImagePath)"
      />
<div class="info">
  <div>
    <h1 class="title">{{ item.itemName }}</h1>

    <p class="price">{{ formatPrice(item.price) }}원</p>

    <p class="category">{{ item.categoryName }}</p>

    <div class="item-like">
      <font-awesome-icon
        :icon="[liked ? 'fas' : 'far', 'heart']"
        class="heart-icon"
        :class="{ liked }"
        @click="handleHeartClick"
      />
      <span class="like-count">{{ favoriteCount }}</span>
    </div>
  </div>

  <!-- 버튼은 항상 아래 -->
  <button
    class="chat-btn"
    @click="goToChat"
    :disabled="!isLoggedIn"
  >
    💬 판매자에게 채팅하기
  </button>
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
          @click="openImageModalByUrl(img)"
        />
      </div>
    </div>

    <!-- 이미지 확대 모달 -->
    <div v-if="showImageModal" class="modal-overlay" @click.self="closeImageModal" tabindex="0">
      <div class="modal-content">
        <img :src="item.imagePaths[currentImageIndex]" alt="확대 이미지" />
        <button class="close-btn" @click="closeImageModal">×</button>
        <button class="nav-btn prev" @click.stop="prevImage" v-if="item.imagePaths.length > 1">‹</button>
        <button class="nav-btn next" @click.stop="nextImage" v-if="item.imagePaths.length > 1">›</button>
      </div>
    </div>
  </div>

  <div v-else class="loading">상품 정보를 불러오는 중입니다...</div>
</template>



<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from "vue-router";
import axiosInstance from '@/plugin/axiosInstance';
import {
  checkFavorite,
  addFavorite,
  removeFavorite,
  getFavoriteCount,
} from '@/apis/favoriteItemApi';

const item = ref(null);
const route = useRoute();
const router = useRouter();


const liked = ref(null);
const likedChecked = ref(false);
const favoriteCount = ref(0);
const isLoggedIn = ref(false);

// 모달 관련 상태
const showImageModal = ref(false);
const currentImageIndex = ref(0);

const fetchItem = async () => {
  const id = route.params.id;
  try {
    const res = await axiosInstance.get(`/api/items/${id}`);
    item.value = res.data;
  } catch (err) {
    console.error("❌ 상품 조회 실패", err);
  }
};

const goToChat = () => {
  if (!isLoggedIn.value) {
    alert("채팅은 로그인 후 이용할 수 있어요!");
    return;
  }
  if (!item.value) {
    alert("상품 정보를 불러오는 중입니다. 잠시만 기다려주세요.");
    return;
  }
  const sellerId = item.value.sellerId; // ⚠️ 필드명 다르면 수정
  const sellerNickname = item.value.sellerNickname || item.value.sellerId;

  if (!sellerId) {
    alert("판매자 정보를 찾을 수 없습니다.");
    return;
  }


router.push({
  path: "/chat",
  query: {
    user: sellerId,
    nickname: sellerNickname
  }
});


};


const checkFavoriteStatus = async () => {
  try {
    const res = await checkFavorite(route.params.id);
    liked.value = res.data;
  } catch (err) {
    console.error("❌ 찜 상태 확인 실패:", err.response?.status, err.response?.data || err.message);
  } finally {
    likedChecked.value = true;
  }
};

const fetchFavoriteCount = async () => {
  try {
    const res = await getFavoriteCount(route.params.id);
    favoriteCount.value = res.data;
  } catch (err) {
    console.error("찜 수 조회 실패: ", err);
  }
};

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
    await fetchFavoriteCount();
  } catch (err) {
    console.error('찜 처리 실패:', err);
    alert("찜 처리 중 오류가 발생했습니다.");
  }
};

const handleHeartClick = () => {
  if (!isLoggedIn.value) {
    alert("찜 기능은 로그인 후 사용할 수 있어요!");
    return;
  }
  toggleLike();
};

// 모달 함수
const openImageModalByUrl = (imgUrl) => {
  if (!item.value || !item.value.imagePaths) return;
  const index = item.value.imagePaths.indexOf(imgUrl);
  if (index !== -1) {
    currentImageIndex.value = index;
    showImageModal.value = true;
    setTimeout(() => {
      document.querySelector('.modal-overlay')?.focus();
    }, 0);
  }
};

const closeImageModal = () => {
  showImageModal.value = false;
  currentImageIndex.value = 0;
};

const prevImage = () => {
  const len = item.value?.imagePaths?.length || 0;
  currentImageIndex.value = (currentImageIndex.value - 1 + len) % len;
};

const nextImage = () => {
  const len = item.value?.imagePaths?.length || 0;
  currentImageIndex.value = (currentImageIndex.value + 1) % len;
};

const handleKeyDown = (e) => {
  if (e.key === 'Escape') {
    closeImageModal();
  }
};

const formatPrice = (price) => {
  return price?.toLocaleString() || '0';
};

onMounted(async () => {
  await fetchItem();                 // ⬅️ item 로드 기다림
  console.log("📌 item 데이터:", item.value);
  fetchFavoriteCount();

  const token = localStorage.getItem("token");
  if (token) {
    isLoggedIn.value = true;
    checkFavoriteStatus();
  }

  window.addEventListener("keydown", handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>


<style scoped>
.item-detail-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.item-header {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 36px;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.05);
}

.item-image {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: cover;
  border-radius: 18px;
  background: #f5f5f5;
  cursor: pointer;
}

.info {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 28px;
  font-weight: 800;
  color: #222;
  margin: 0 0 14px;
}

.price {
  font-size: 24px;
  font-weight: 900;
  color: #222;
  margin: 0 0 12px;
}

.category {
  display: inline-block;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  background: #f3f3f3;
  color: #666;
  font-size: 13px;
  font-weight: 700;
  margin-bottom: 20px;
}

.chat-btn {
  margin-top: auto;
  width: 100%;
  padding: 14px;
  background: #8e7cff;
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 800;
  cursor: pointer;
  transition: 0.2s ease;
}

.chat-btn:hover {
  background: #7b61ff;
}

.chat-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.item-like {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.heart-icon {
  font-size: 25px;
  cursor: pointer;
  color: #ccc;
  transition: 0.2s;
}

.heart-icon.liked {
  color: #e46d8c;
}

.heart-icon.disabled {
  opacity: 0.4;
}

.like-count {
  font-size: 14px;
  color: #888;
}

.description,
.gallery {
  margin-top: 36px;
  padding: 24px;
  border: 1px solid #eee;
  border-radius: 20px;
  background: #fff;
}

.description h2,
.gallery h2 {
  font-size: 20px;
  font-weight: 800;
  margin: 0 0 16px;
}

.description p {
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
}

.image-list {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.gallery-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 14px;
  border: 1px solid #eee;
  cursor: pointer;
  transition: 0.2s;
}

.gallery-image:hover {
  transform: translateY(-2px);
}

.loading {
  text-align: center;
  padding: 60px;
  color: #aaa;
}

/* 이미지 확대 모달 */
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.65);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  outline: none;
}

.modal-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-content img {
  max-width: 100%;
  max-height: 82vh;
  object-fit: contain;
  border-radius: 12px;
}

.close-btn {
  position: absolute;
  top: -12px;
  right: -12px;
  background: #fff;
  color: #333;
  border: none;
  border-radius: 50%;
  font-size: 24px;
  width: 34px;
  height: 34px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
}

.nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.85);
  border: none;
  font-size: 34px;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  cursor: pointer;
  color: #333;
}

.nav-btn.prev {
  left: -58px;
}

.nav-btn.next {
  right: -58px;
}

@media (max-width: 768px) {
  .item-header {
    grid-template-columns: 1fr;
  }

  .nav-btn.prev {
    left: 10px;
  }

  .nav-btn.next {
    right: 10px;
  }
}
</style>
