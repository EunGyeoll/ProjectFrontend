<template>
  <div class="mypage-container">
    <h1>마이페이지</h1>

    <section class="profile-section">
      <!-- <h2>회원정보 수정</h2> -->
      <form @submit.prevent="handleUpdate">
        <!-- ✅ 프로필 이미지 미리보기 + 버튼 -->
        <div class="form-group">
          <label>프로필 이미지</label>
          <div class="profile-image-wrapper">
            <img :src="profileImageSrc" alt="프로필 이미지" class="profile-preview" />
            <div class="image-button-group">
              <label class="custom-btn">
                변경
                <input type="file" @change="handleFileChange" accept="image/*" hidden />
              </label>
              <button v-if="profileImagePreview" type="button" class="custom-btn outline" @click="removeImage">
                제거
              </button>
            </div>
          </div>
        </div>

        <!-- 회원 정보 입력 필드 -->
        <div class="form-group">
          <label>아이디</label>
          <input v-model="form.memberId" type="text" readonly />
        </div>

        <div class="form-group">
          <label>닉네임</label>
          <input v-model="form.nickName" type="text" @input="onNickInput" />
          <button type="button" @click="checkNick">중복 확인</button>
        </div>

        <div class="form-group">
          <label>이름</label>
          <input v-model="form.name" type="text" />
        </div>

        <div class="form-group">
          <label>전화번호</label>
          <input
            v-model="form.phoneNum"
            type="tel"
            pattern="[0-9]*"
            inputmode="numeric"
            maxlength="11"
            @input="onPhoneInput"
          />
          <button type="button" @click="checkPhoneNum">중복 확인</button>
        </div>

        <div class="form-group">
          <label>이메일</label>
          <div style="display: flex; gap: 0.5rem;">
            <input v-model="form.email" type="email" @input="onEmailInput" />
            <button type="button" @click="checkEmail">중복 확인</button>
          </div>
        </div>

        <!-- ✅ 주소 필드 통합 -->
        <div class="form-group">
          <label>주소</label>
          <div style="display: flex; gap: 0.5rem;">
            <input v-model="form.address.zipcode" placeholder="우편번호" readonly />
            <button type="button" @click="openAddressSearch">주소 검색</button>
          </div>
          <input v-model="form.address.mainAddress" placeholder="기본 주소" readonly style="margin-top: 0.5rem;" />
          <input v-model="form.address.detailAddress" placeholder="상세 주소" style="margin-top: 0.5rem;" />
        </div>

        <!-- 비밀번호 변경 -->
        <div class="form-group password-group">
          <label>기존 비밀번호 확인 <span style="color: red">*</span></label>
          <div class="password-wrapper">
            <input
              :type="showCurrentPassword ? 'text' : 'password'"
              v-model="form.currentPassword"
              @input="onPasswordInput"
              required
            />
            <button type="button" class="toggle-btn" @click="showCurrentPassword = !showCurrentPassword">
              {{ showCurrentPassword ? '👁‍🗨' : '👁' }}
            </button>
          </div>
        </div>

        <div class="form-group password-group">
          <label>새 비밀번호 (선택)</label>
          <div class="password-wrapper">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="form.newPassword"
              @input="onPasswordInput"
              placeholder="(선택) 새 비밀번호 입력"
            />
            <button type="button" class="toggle-btn" @click="showNewPassword = !showNewPassword">
              {{ showNewPassword ? '👁‍🗨' : '👁' }}
            </button>
          </div>
          <small style="color: #888;">비워두면 기존 비밀번호가 유지됩니다.</small>
        </div>


        <!-- 저장 버튼 -->
        <button type="submit">회원정보 수정</button>
      </form>
    </section>
  </div>
</template>


<script setup>
import { ref, computed, onMounted } from "vue";
import { getMyProfile, updateMemberInfo } from "@/apis/memberApi";
import { checkDuplicateNickName, checkDuplicateEmail, checkDuplicatePhoneNum } from "@/apis/authApi";

const showCurrentPassword = ref(false);
const showNewPassword = ref(false);

// 회원 정보 form
const form = ref({
  memberId: "",
  nickName: "",
  name: "",
  email: "",
  phoneNum: "",
  address: {
    mainAddress: "",
    detailAddress: "",
    zipcode: "",
  },
  currentPassword: "",
  newPassword: "",
});

// 원본 데이터 저장 (닉네임, 이메일, 전화번호)
const original = ref({
  nickName: "",
  email: "",
  phoneNum: "",
});

const profileImage = ref(null);
const profileImagePreview = ref("");
const defaultImage = "/profileblack.png";

// 중복 체크 상태
const lastChecked = ref({ nickName: "", email: "", phone: "" });
const isNickChecked = ref(true);
const isEmailChecked = ref(true);
const isPhoneChecked = ref(true);

// 이미지 미리보기 URL 계산
const profileImageSrc = computed(() => {
  const val = profileImagePreview.value;

  if (!val || val.trim() === "" || val === "null" || val === "undefined") {
    return defaultImage;
  }

  // ✅ S3 URL이든 blob이든 둘 다 허용
  if (val.startsWith("http") || val.startsWith("blob:")) {
    return val;
  }

  return defaultImage;
});


// 프로필 이미지 변경
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  if (file.size > 3 * 1024 * 1024) {
    alert("이미지는 3MB 이하만 업로드 가능합니다.");
    return;
  }

  if (profileImagePreview.value && profileImagePreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(profileImagePreview.value);
  }

  profileImage.value = file;
  profileImagePreview.value = URL.createObjectURL(file);
  e.target.value = "";
};

// 프로필 이미지 제거
const removeImage = () => {
  if (profileImagePreview.value && profileImagePreview.value.startsWith("blob:")) {
    URL.revokeObjectURL(profileImagePreview.value);
  }
  profileImage.value = null;
  profileImagePreview.value = "";
};

// 주소 검색
const openAddressSearch = () => {
  if (!window.daum?.Postcode) {
    alert("주소 검색 기능을 사용할 수 없습니다. 새로고침 해보세요.");
    return;
  }

  new window.daum.Postcode({
    oncomplete: (data) => {
      form.value.address.zipcode = data.zonecode;
      form.value.address.mainAddress = data.address;
    },
  }).open({
    left: window.innerWidth / 2 - 200,
    top: window.innerHeight / 2 - 300,
  });
};

// 중복 체크 함수들
// 닉네임 중복체크
const checkNick = async () => {
  const nick = form.value.nickName.trim();
  if (!nick || nick.length < 2) return alert("닉네임은 2자 이상 입력하세요.");

  // 기존 값과 동일하면 중복 확인 건너뛰기
  if (nick === original.value.nickName) {
    alert("현재 사용하시는 닉네임입니다.");
    isNickChecked.value = true;
    lastChecked.value.nickName = nick;
    return;
  }

  try {
    await checkDuplicateNickName(nick);
    lastChecked.value.nickName = nick;
    isNickChecked.value = true;
    alert("사용 가능한 닉네임입니다.");
  } catch {
    isNickChecked.value = false;
    alert("중복된 닉네임입니다.");
  }
};

// 이메일 중복체크
const checkEmail = async () => {
  const email = form.value.email.trim();
  if (!email.includes("@")) return alert("올바른 이메일 형식이 아닙니다.");

  if (email === original.value.email) {
    alert("현재 사용 중인 이메일입니다.");
    isEmailChecked.value = true;
    lastChecked.value.email = email;
    return;
  }

  try {
    await checkDuplicateEmail(email);
    alert("사용 가능한 이메일입니다.");
    lastChecked.value.email = email;
    isEmailChecked.value = true;
  } catch {
    alert("이미 사용 중인 이메일입니다.");
    isEmailChecked.value = false;
  }
};


// 폰번호 중복체크
const checkPhoneNum = async () => {
  const phone = form.value.phoneNum.trim();
  if (!/^[0-9]{10,11}$/.test(phone)) return alert("전화번호는 10~11자리의 숫자여야 합니다.");

  if (phone === original.value.phoneNum) {
    alert("현재 사용 중인 전화번호입니다.");
    isPhoneChecked.value = true;
    lastChecked.value.phone = phone;
    return;
  }

  try {
    await checkDuplicatePhoneNum(phone);
    alert("사용 가능한 전화번호입니다.");
    lastChecked.value.phone = phone;
    isPhoneChecked.value = true;
  } catch {
    alert("이미 사용 중인 전화번호입니다.");
    isPhoneChecked.value = false;
  }
};


// 입력 변경 시 중복 확인 초기화 및 공백 제거
const onNickInput = (e) => {
  form.value.nickName = e.target.value.replace(/\s/g, "");
  isNickChecked.value = false;
};
const onEmailInput = (e) => {
  form.value.email = e.target.value.replace(/\s/g, "");
  isEmailChecked.value = false;
};
const onPhoneInput = (e) => {
  form.value.phoneNum = e.target.value.replace(/[^0-9]/g, "").replace(/\s/g, "");
  isPhoneChecked.value = false;
};
const onPasswordInputTrim = (e) => {
  form.value.currentPassword = form.value.currentPassword?.replace(/\s/g, "") || "";
  form.value.newPassword = form.value.newPassword?.replace(/\s/g, "") || "";
};

// 회원정보 수정
const handleUpdate = async () => {
  const trimmedName = form.value.name?.trim();
  const trimmedEmail = form.value.email?.trim();
  const trimmedPhone = form.value.phoneNum?.trim();
  const currentPwd = form.value.currentPassword?.trim();
  const newPwd = form.value.newPassword?.trim();

  if (!trimmedName) return alert("이름을 입력해주세요.");
  if (!trimmedEmail || !trimmedEmail.includes("@")) return alert("이메일을 정확히 입력해주세요.");
  if (!trimmedPhone || !/^[0-9]{10,11}$/.test(trimmedPhone)) return alert("전화번호를 정확히 입력해주세요.");
  if (!currentPwd) return alert("기존 비밀번호를 입력해주세요.");

  if (newPwd && !/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=])[A-Za-z\d!@#$%^&*()_+=]{8,15}$/.test(newPwd)) {
    return alert("새 비밀번호는 8자 이상, 영문+숫자+특수문자를 포함해야 합니다.");
  }

  // ✅ 값이 변경된 경우에만 중복 확인 요구
  if (
    form.value.nickName.trim() !== original.value.nickName &&
    (!isNickChecked.value || lastChecked.value.nickName !== form.value.nickName.trim())
  ) {
    return alert("닉네임 중복 확인을 해주세요.");
  }

  if (
    form.value.email.trim() !== original.value.email &&
    (!isEmailChecked.value || lastChecked.value.email !== form.value.email.trim())
  ) {
    return alert("이메일 중복 확인을 해주세요.");
  }

  if (
    form.value.phoneNum.trim() !== original.value.phoneNum &&
    (!isPhoneChecked.value || lastChecked.value.phone !== form.value.phoneNum.trim())
  ) {
    return alert("전화번호 중복 확인을 해주세요.");
  }

  try {
    const formData = new FormData();
    const updateData = {
      name: trimmedName,
      nickName: form.value.nickName,
      email: trimmedEmail,
      phoneNum: trimmedPhone,
      currentPassword: currentPwd,
      // newPassword: newPwd,
      address: {
        mainAddress: form.value.address.mainAddress,
        detailAddress: form.value.address.detailAddress,
        zipcode: form.value.address.zipcode,
      },
    };

    formData.append("memberData", new Blob([JSON.stringify(updateData)], { type: "application/json" }));
    if (profileImage.value) {
      formData.append("profileImage", profileImage.value);
    }

    await updateMemberInfo(formData);
    alert("회원정보 수정 완료!");
    form.value.newPassword = "";
  } catch (error) {
    alert("수정 실패: " + (error.response?.data?.message || error.message || "알 수 없는 오류"));
  }
};

// 초기 데이터 불러오기
onMounted(async () => {
  try {
    const res = await getMyProfile();
    const data = res.data;
    console.log("🔥 받아온 프로필 이미지:", data.profileImageUrl); 

    form.value.memberId = data.memberId;
    form.value.nickName = data.nickName;
    form.value.name = data.name;
    form.value.email = data.email;
    form.value.phoneNum = data.phoneNum;
    profileImagePreview.value = data.profileImageUrl?.trim() || "";

    form.value.address.mainAddress = data.address?.mainAddress || "";
    form.value.address.detailAddress = data.address?.detailAddress || "";
    form.value.address.zipcode = data.address?.zipcode || "";

    // ✅ 원본 값 저장
    original.value.nickName = data.nickName;
    original.value.email = data.email;
    original.value.phoneNum = data.phoneNum;

  } catch (error) {
    alert("회원정보를 불러오지 못했습니다.");
  }

  if (!window.daum || !window.daum.Postcode) {
    const script = document.createElement("script");
    script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
    script.onload = () => console.log("다음 주소 API 로드 완료");
    script.onerror = () => alert("주소 검색 로드 실패");
    document.head.appendChild(script);
  }
});
</script>


  
  <style scoped>
  /* ✅ 전체 페이지 레이아웃 */
  .mypage-container {
    display: flex;
    justify-content: center;
    padding: 2rem;
  }
  
  /* ✅ 카드 스타일 (회원정보 영역) */
  .signup-box,
  .profile-section {
    width: 100%;
    max-width: 500px;
    padding: 2rem;
    background: #ffffff;
    border-radius: 10px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  .profile-section h2 {
    text-align: center;
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
    color: #333;
  }
  
  /* ✅ 각 입력 필드 묶음 */
  .form-group {
    margin-bottom: 1rem;
    text-align: left;
  }
  
  label {
    display: block;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
  
  /* ✅ 기본 input 스타일 */
  input {
    width: 100%;
    padding: 0.6rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 6px;
    box-sizing: border-box;
  }
  
  /* ✅ 기본 버튼 스타일 */
  button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background-color: #007bff;
    color: white;
    font-weight: bold;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  /* ✅ 프로필 이미지 미리보기 스타일 */
  .profile-image-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .profile-preview {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    border: 1px solid #ccc;
    margin-bottom: 0.5rem;
  }
  
  .image-button-group {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}

  .custom-btn,
  .custom-btn.outline {
    height: 36px;
    font-size: 0.9rem;
    padding: 0 1rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    box-sizing: border-box;
    cursor: pointer;
    transition: background-color 0.2s ease-in-out;
    min-width: 80px;
  }

  /* ✅ 변경 버튼 */
  .custom-btn {
    background-color: #007bff;
    color: white;
    border: none;
  }
  
  .custom-btn:hover {
    background-color: #0056b3;
  }
  
  /* ✅ 제거 버튼 */
  .custom-btn.outline {
    background-color: transparent;
    color: #007bff;
    border: 1px solid #007bff;
  }
  
  .custom-btn.outline:hover {
    background-color: #f0f8ff;
  }
  
  /* ✅ 이미지 태그 공통 스타일 (보호용) */
  img {
    margin-top: 0.5rem;
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 50%;
    border: 1px solid #ccc;
  }

.password-group {
  position: relative;
}

.password-wrapper {
  position: relative;
}

.password-wrapper input {
  width: 100%;
  padding-right: 2.5rem; /* 👁 버튼 공간 확보 */
  box-sizing: border-box;
}

.toggle-btn {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #333;
  cursor: pointer;
  padding: 0;
  width: auto;
  height: auto;
}

.toggle-btn:hover {
  opacity: 0.7;
}

  </style>
  