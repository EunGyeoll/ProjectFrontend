<template>
  <div class="login-container">
    <div class="login-box">
      <h2>로그인</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="id">아이디</label>
          <input
              v-model="id"
              type="text"
              id="id"
              placeholder="아이디를 입력하세요"
              required
          />
        </div>
        <div class="form-group">
          <label for="password">비밀번호</label>
          <input
              v-model="password"
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요"
              required
          />
        </div>
        <button type="submit" class="btn-submit">로그인</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "@/stores/authStore";  // authStore 가져오기

export default {
  setup() {
    const id = ref("");  // 아이디로 변경
    const password = ref("");
    const authStore = useAuthStore();  // authStore 사용

    const handleLogin = async () => {
      if (id.value && password.value) {
        try {
          // 서버에서 로그인 요청 보내기 (예: 아이디와 비밀번호를 사용)
          // 예시로 mock된 토큰과 데이터를 사용합니다.
          const mockToken = "mock-jwt-token";  // 실제 서버에서 받은 JWT 토큰
          const mockUserData = {
            id: id.value,  // 아이디로 변경
            role: "user",  // 예시로 "user"로 설정
            token: mockToken,
          };

          // authStore에 로그인 정보 저장
          authStore.saveAuth(mockUserData);  // ID, Role, Token을 저장

          alert("로그인 성공!");
          window.location.href = "/"; // 로그인 성공 후 메인 페이지로 이동
        } catch (error) {
          alert("로그인에 실패했습니다.");
        }
      } else {
        alert("아이디와 비밀번호를 입력하세요.");
      }
    };

    return {
      id,  // 아이디로 바뀐 변수
      password,
      handleLogin,
    };
  },
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  //background-color: #f0f2f5;
} 

.login-box {
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.login-box h2 {
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
