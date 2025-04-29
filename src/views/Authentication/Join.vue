<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>회원가입</h2>
      <form @submit.prevent="handleSignUp">
        <div class="form-group">
          <label for="memberId">아이디</label>
          <input
              v-model="member.memberId"
              type="text"
              id="memberId"
              placeholder="아이디를 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
              v-model="member.password"
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="name">이름</label>
          <input
              v-model="member.name"
              type="text"
              id="name"
              placeholder="이름을 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="email">이메일</label>
          <input
              v-model="member.email"
              type="email"
              id="email"
              placeholder="이메일을 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="birthDate">생년월일</label>
          <input
              v-model="member.birthDate"
              type="date"
              id="birthDate"
              required
          />
        </div>
        <div class="form-group">
          <label for="phoneNum">전화번호</label>
          <input
              v-model="member.phoneNum"
              type="text"
              id="phoneNum"
              placeholder="전화번호를 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="address">주소</label>
          <input
              v-model="member.address"
              type="text"
              id="address"
              placeholder="주소를 입력하세요"
              @click="openAddressSearch"
              readonly
          />
        </div>
        <button type="submit" class="btn-submit">회원가입</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";

export default {
  setup() {
    const member = ref({
      memberId: "",
      password: "",
      name: "",
      email: "",
      birthDate: "",
      phoneNum: "",
      address: "",
    });

    const authStore = useAuthStore();

    const handleSignUp = async () => {
      try {
        await authStore.register(member.value);
        alert("회원가입 성공!");
        window.location.href = "/login";
      } catch (error) {
        alert("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    };

    const openAddressSearch = () => {
      // 다음 주소 API를 연동하여 주소 검색 창을 띄움
      new daum.Postcode({
        oncomplete: (data) => {
          member.value.address = data.address; // 선택한 주소를 저장
        },
      }).open();
    };

    return {
      member,
      handleSignUp,
      openAddressSearch,
    };
  },
};
</script>

<style scoped>
.signup-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.signup-box {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.signup-box h2 {
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #007bff;
  border: none;
  color: white;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-submit:hover {
  background-color: #0056b3;
}
</style>
