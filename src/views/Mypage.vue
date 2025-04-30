<template>
    <div class="mypage-container">
      <h1>마이페이지</h1>
  
      <section class="profile-section">
        <h2>회원정보 수정</h2>
        <form @submit.prevent="handleUpdate">
          <!-- 프로필 미리보기 -->
          <div class="form-group">
            <p>현재 프로필 이미지</p>
            <img :src="profileImageSrc" alt="프로필 미리보기" style="width: 100px; border-radius: 50%;" />
          </div>
  
          <div class="form-group">
            <label>아이디</label>
            <input v-model="form.memberId" type="text" placeholder="아이디" readonly />
          </div>
  
          <div class="form-group">
            <label>닉네임</label>
            <input v-model="form.nickName" type="text" placeholder="닉네임" />
          </div>
  
          <div class="form-group">
            <label>이름</label>
            <input v-model="form.name" type="text" placeholder="이름" />
          </div>
  
          <div class="form-group">
            <label>이메일</label>
            <input v-model="form.email" type="email" placeholder="이메일" />
          </div>
  
          <div class="form-group">
            <label>전화번호</label>
            <input v-model="form.phoneNum" type="text" placeholder="전화번호" />
          </div>
  
          <div class="form-group">
            <label>주소</label>
            <input v-model="form.address.mainAddress" type="text" placeholder="도시" />
            <button type="button" @click="openAddressSearch">주소 검색</button>
          </div>
  
            
          <div class="form-group">
            <label>우편번호</label>
            <input v-model="form.address.zipcode" type="text" placeholder="우편번호" />
          </div>
          
          <div class="form-group">
            <label>상세 주소</label>
            <input v-model="form.address.detailAddress" placeholder="상세 주소" />
          </div>

  
          <div class="form-group">
            <label>기존 비밀번호 <span style="color: red">*</span></label>
            <input v-model="form.currentPassword" type="password" required />
          </div>
  
          <div class="form-group">
            <label>새 비밀번호 (선택)</label>
            <input v-model="form.newPassword" type="password" placeholder="새 비밀번호 입력" />
          </div>
  
          <div class="form-group">
            <label>프로필 이미지 변경</label>
            <input type="file" @change="handleFileChange" accept="image/*" />
          </div>
  
          <button type="submit">회원정보 수정</button>
        </form>
      </section>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from "vue";
  import { getMyProfile, updateMemberInfo } from "@/apis/memberApi";
  import { useAuthStore } from "@/stores/authStore";
  
  const form = ref({
    memberId: "",
    nickName: "",
    name: "",
    email: "",
    phoneNum: "",
    address: {
      mainAddress: "",
      detailAddress: "",
      zipcode: ""
    },
    currentPassword: "",
    newPassword: ""
  });
  
  const profileImage = ref(null);
  const profileImagePreview = ref("");
  const defaultImage = "/profileblackk.png";
  
  // 기본 프로필 이미지 fallback
  const profileImageSrc = computed(() => {
    const val = profileImagePreview.value;
    return val && val.trim() !== "" && val !== "null" && val !== "undefined"
      ? val
      : defaultImage;
  });
  
  // ✅ 주소 검색 열기
  const openAddressSearch = () => {
    try {
      new window.daum.Postcode({
        oncomplete: (data) => {
          form.value.address.zipcode = data.zonecode;
          form.value.address.address = data.address;
        },
      }).open({
        left: (window.innerWidth / 2) - 200,
        top: (window.innerHeight / 2) - 300,
      });
    } catch (error) {
      console.error("주소 검색 실패:", error);
      alert("주소 검색 중 오류가 발생했습니다.");
    }
  };
  
  // ✅ 파일 미리보기 처리
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    profileImage.value = file;
    profileImagePreview.value = URL.createObjectURL(file);
  };
  
  // ✅ 회원 정보 불러오기 및 스크립트 로딩
  onMounted(async () => {
    try {
      const res = await getMyProfile();
      const data = res.data;
  
      form.value.memberId = data.memberId;
      form.value.nickName = data.nickName;
      form.value.name = data.name;
      form.value.email = data.email;
      form.value.phoneNum = data.phoneNum;
      profileImagePreview.value = data.profileImageUrl?.trim() || "";
  
      form.value.address.mainAddress = data.address?.mainAddress || "";
      form.value.address.detailAddress = data.address?.detailAddress || "";
      form.value.address.zipcode = data.address?.zipcode || "";
    } catch (error) {
      console.error("회원정보 불러오기 실패:", error);
      alert("회원정보를 불러오지 못했습니다.");
    }
  
    // 다음 주소 API 로드
    if (!window.daum || !window.daum.Postcode) {
      const script = document.createElement("script");
      script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
      script.onload = () => console.log("다음 주소 API 로드 완료");
      script.onerror = () => alert("주소 검색 로드 실패");
      document.head.appendChild(script);
    }
  });
  
  // ✅ 회원정보 수정 요청
  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      const updateData = {
        name: form.value.name,
        nickName: form.value.nickName,
        email: form.value.email,
        phoneNum: form.value.phoneNum,
        currentPassword: form.value.currentPassword,
        newPassword: form.value.newPassword,
        address: {
          address: form.value.address.mainAddress,
          addressDetail: form.value.address.addressDetail,
          zipcode: form.value.address.zipcode
        }
      };
  
      formData.append(
        "memberData",
        new Blob([JSON.stringify(updateData)], { type: "application/json" })
      );
  
      if (profileImage.value) {
        formData.append("profileImage", profileImage.value);
      }
  
      await updateMemberInfo(formData);
      alert("회원정보 수정 완료!");
      form.value.newPassword = "";
    } catch (error) {
      alert("수정 실패: " + (error.response?.data?.message || error.message));
    }
  };
  </script>
  
  <style scoped>
  .mypage-container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }
  .profile-section {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 10px;
  }
  .form-group {
    margin-bottom: 1rem;
  }
  label {
    display: block;
    font-weight: bold;
    margin-bottom: 0.3rem;
  }
  input {
    width: 100%;
    padding: 0.5rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  button {
    margin-top: 1rem;
    padding: 0.7rem 1.5rem;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
  }
  button:hover {
    background-color: #0056b3;
  }
  </style>
  