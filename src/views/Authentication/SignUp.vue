<template>
  <div class="signup-container">
    <div class="signup-box">
      <h2>회원가입</h2>
      <form @submit.prevent="handleSignUp">

        <div class="form-group">
          <label for="memberId">아이디</label>
          <input v-model="member.memberId" type="text" id="memberId" placeholder="5자 이상" required />
          <button type="button" @click="checkId">중복 확인</button>
        </div>

        <div class="form-group">
          <label for="password">비밀번호</label>
          <div style="display: flex; gap: 0.5rem; align-items: center;">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="member.password"
              id="password"
              placeholder="8자 이상 (영문+숫자+특수문자)"
              required
            />
            <button type="button" @click="showPassword = !showPassword" style="white-space: nowrap;">
              {{ showPassword ? '숨기기' : '보기' }}
            </button>
          </div>
        </div>

        <div class="form-group">
  <label for="passwordConfirm">비밀번호 확인</label>
  <div style="display: flex; gap: 0.5rem; align-items: center;">
    <input
      :type="showPassword ? 'text' : 'password'"
      v-model="member.passwordConfirm"
      id="passwordConfirm"
      placeholder="비밀번호를 다시 입력하세요"
      required
    />
    <button type="button" @click="showPassword = !showPassword" style="white-space: nowrap;">
      {{ showPassword ? '숨기기' : '보기' }}
    </button>
  </div>
</div>

        <div class="form-group">
          <label for="memberName">이름</label>
          <input v-model="member.memberName" type="text" id="memberName" placeholder="이름을 입력하세요" required />
        </div>

        <div class="form-group">
          <label for="nickName">닉네임</label>
          <input v-model="member.nickName" type="text" id="nickName" placeholder="닉네임을 입력하세요" required />
          <button type="button" @click="checkNick">중복 확인</button>
        </div>

        <div class="form-group">
          <label for="birthDate">생년월일</label>
          <input v-model="member.birthDate" type="date" id="birthDate" required />
        </div>

        <div class="form-group">
          <label for="phoneNum">전화번호</label>
          <input
            v-model="member.phoneNum"
            @input="e => member.phoneNum = e.target.value.replace(/[^0-9]/g, '')"
            maxlength="11"
          />
          <button type="button" @click="checkPhoneNum">중복 확인</button>
        </div>

        <div class="form-group">
          <label for="email">이메일</label>
          <input v-model="member.email" type="email" id="email" placeholder="이메일을 입력하세요" required />
          <button type="button" @click="checkEmail">중복 확인</button>
        </div>

        <div class="form-group">
          <label for="zipCode">우편번호</label>
          <input v-model="member.zipCode" type="text" id="zipCode" placeholder="우편번호" readonly required />
          <button type="button" @click="openAddressSearch">우편번호 찾기</button>
        </div>

        <div class="form-group">
          <label for="mainAddress">주소</label>
          <input v-model="member.mainAddress" type="text" id="mainAddress" placeholder="주소" readonly required />
        </div>

        <div class="form-group">
          <label for="detailAddress">상세 주소</label>
          <input v-model="member.detailAddress" type="text" id="detailAddress" placeholder="상세 주소" required />
        </div>

        <div class="form-group">
          <label for="profileImage">프로필 이미지 (선택)</label>
          <input type="file" id="profileImage" @change="handleFileChange" accept="image/*" />
        </div>

        <div class="preview-container">
          <img :src="profileImagePreview || defaultProfileImage" alt="프로필 미리보기" class="preview-image" />
          <p>프로필 이미지 미리보기</p>
        </div>

        <button type="submit" class="btn-submit">회원가입</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from "vue";
import {
  join,
  checkDuplicateId,
  checkDuplicateNickName,
  checkDuplicateEmail,
  checkDuplicatePhoneNum,
} from "@/apis/authApi";

const defaultProfileImage = "/profileblack.png";

export default {
  setup() {
    const member = reactive({
      memberId: "",
      password: "",
      passwordConfirm: "", 
      memberName: "",
      nickName: "",
      email: "",
      birthDate: "",
      phoneNum: "",
      zipCode: "",
      mainAddress: "",
      detailAddress: "",
      profileImage: null,
    });

    const profileImagePreview = ref(null);
    const showPassword = ref(false); //  비밀번호 보기 토글

    const checkId = async () => {
      const trimmedId = member.memberId?.trim();
      if (!trimmedId) return alert("아이디를 입력하세요.");
      if (trimmedId.length < 5) return alert("아이디는 5자 이상 입력해야 합니다.");
      try {
        const res = await checkDuplicateId(trimmedId);
        alert(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || "아이디 중복확인 실패");
      }
    };

    const checkNick = async () => {
      const trimmedNick = member.nickName?.trim();
      if (!trimmedNick) return alert("닉네임을 입력하세요.");
      if (trimmedNick.length < 2) return alert("닉네임은 2자 이상 입력해야 합니다.");
      try {
        const res = await checkDuplicateNickName(trimmedNick);
        alert(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || "닉네임 중복 확인 실패");
      }
    };

    const checkEmail = async () => {
      const email = member.email?.trim();
      if (!email || !email.includes("@")) return alert("올바른 이메일을 입력하세요.");
      try {
        const res = await checkDuplicateEmail(email);
        alert(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || "이메일 중복 확인 실패");
      }
    };

    const checkPhoneNum = async () => {
      const phone = member.phoneNum?.trim();
      if (!phone || !/^\d{10,11}$/.test(phone)) return alert("올바른 전화번호를 입력하세요.");
      try {
        const res = await checkDuplicatePhoneNum(phone);
        alert(res.data.message);
      } catch (err) {
        alert(err.response?.data?.message || "전화번호 중복 확인 실패");
      }
    };

    const handleFileChange = (event) => {
      const file = event.target.files[0];
      if (!file) {
        member.profileImage = null;
        profileImagePreview.value = null;
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];

      if (!allowedTypes.includes(file.type)) {
        alert("지원하지 않는 파일 형식입니다. (jpg, png, gif만 허용)");
        event.target.value = "";
        return;
      }

      if (file.size > maxSize) {
        alert("파일 크기가 5MB를 초과합니다.");
        event.target.value = "";
        return;
      }

      member.profileImage = file;
      profileImagePreview.value = URL.createObjectURL(file);
    };

    const handleSignUp = async () => {
      // 비밀번호 정규식 검사 (8~15자, 영문+숫자+특수문자)
      const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=])[A-Za-z\d!@#$%^&*()_+=]{8,15}$/;
      if (!passwordRegex.test(member.password)) {
        alert("비밀번호는 8~15자이며, 영문+숫자+특수문자를 포함해야 합니다.");
        return;
      }

      // 비밀번호 확인 검사
      if (member.password !== member.passwordConfirm) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
      }
      
      try {
        const formData = new FormData();
        const memberData = {
          memberId: member.memberId,
          password: member.password,
          memberName: member.memberName,
          nickName: member.nickName,
          email: member.email,
          birthDate: member.birthDate,
          phoneNum: member.phoneNum,
          address: {
            mainAddress: member.mainAddress,
            detailAddress: member.detailAddress,
            zipcode: member.zipCode,
          },
        };

        formData.append("memberData", new Blob([JSON.stringify(memberData)], { type: "application/json" }));
        if (member.profileImage) {
          formData.append("profileImage", member.profileImage);
        }

        const response = await join(formData);
        alert(response.data);
        Object.keys(member).forEach((key) => (member[key] = ""));
        profileImagePreview.value = null;
        window.location.href = "/login";
      } catch (error) {
        console.error("회원가입 실패:", error.response?.data || error.message);
        alert("회원가입 실패: " + (error.response?.data?.message || error.message));
      }
    };

    const openAddressSearch = () => {
      try {
        new daum.Postcode({
          oncomplete: (data) => {
            member.zipCode = data.zonecode;
            member.mainAddress = data.address;
          },
        }).open({
          left: window.innerWidth / 2 - 200,
          top: window.innerHeight / 2 - 300,
        });
      } catch (error) {
        console.error("우편번호 검색창 열기 실패:", error);
        alert("우편번호 검색 도중 문제가 발생했습니다. 다시 시도해주세요.");
      }
    };

    const kakaoApiKey = import.meta.env.VITE_KAKAO_MAP_API_KEY;
    const postcodeApiUrl = import.meta.env.VITE_KAKAO_POSTCODE_API_URL;

    onMounted(() => {
      if (!window.kakao || !window.kakao.maps) {
        const script = document.createElement("script");
        script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoApiKey}&autoload=false&libraries=services`;
        script.onload = () => {
          window.kakao.maps.load(() => {
            console.log("카카오 지도 API 로드 완료!");
          });
        };
        script.onerror = () => {
          alert("카카오 지도 API 로드 실패");
        };
        document.head.appendChild(script);
      }

      if (!window.daum || !window.daum.Postcode) {
        const postcodeScript = document.createElement("script");
        postcodeScript.src = postcodeApiUrl;
        postcodeScript.onload = () => {
          console.log("다음 우편번호 서비스 로드 완료!");
        };
        postcodeScript.onerror = () => {
          alert("다음 우편번호 서비스 로드 실패");
        };
        document.head.appendChild(postcodeScript);
      }
    });

    return {
      member,
      handleSignUp,
      openAddressSearch,
      handleFileChange,
      profileImagePreview,
      defaultProfileImage,
      checkId,
      checkNick,
      checkEmail,
      checkPhoneNum,
      showPassword, 
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
  overflow-y: auto; /* 추가 */
  padding: 2rem 0; /* 추가 (너무 붙지 않게 위아래 여유) */
}


.signup-box {
  width: 100%;
  max-width: 400px;
  max-height: 90vh; /* 추가 */
  overflow-y: auto; /* 추가 */
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

.preview-container {
  margin-top: 1rem;
  text-align: center;
}

.preview-image {
  margin-top: 0.5rem;
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  border: 1px solid #ccc;
}
</style>
