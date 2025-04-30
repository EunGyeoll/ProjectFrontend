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
import { useAuthStore } from "@/stores/authStore";
import { login } from "@/apis/authApi"; // ✅ 서버 API 추가


export default {
  setup() {
    const id = ref("");
    const password = ref("");
    const authStore = useAuthStore();

    const handleLogin = async () => {
      if (id.value && password.value) {
        try {
          const requestData = { // 백엔드의 LoginRuest 필드명과 일치시키기
            memberId: id.value,
            password: password.value,
          };

          const response = await login(requestData); // ✅ 서버에 로그인 요청
          const { token, memberId, role } = response.data; // ✅ 서버 응답 구조 맞게 꺼냄

          const userData = {
            id: memberId,
            role: role,
            token: token,
          };

          authStore.saveAuth(userData);
          localStorage.setItem("token", token); // 로컬스토리지에도 저장

          alert("로그인 성공!");
          window.location.href = "/";
        } catch (error) {
          console.error("로그인 실패:", error.response?.data || error.message);
          alert("로그인 실패: " + (error.response?.data?.message || error.message));
        }
      } else {
        alert("아이디와 비밀번호를 입력하세요.");
      }
    };

    return {
      id,
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
