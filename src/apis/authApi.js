import axiosInstance from "@/plugin/axiosInstance.js";

function join(formData) {
    return axiosInstance.post("/api/members/signup", formData, {
        withCredentials: true 
    });
}

function login(member){
    return axiosInstance.post(
        "/api/members/login",
        member
    )
}

// 아이디 중복확인
function checkDuplicateId(memberId) {
    return axiosInstance.get(`/api/members/check-id`, 
        { params: { memberId } 
    });
}

// 닉네임 중복확인
function checkDuplicateNickName(nickName) {
    return axiosInstance.get(`/api/members/check-nickname`, { params: { nickName }, });
}

// 이메일 중복확인
function checkDuplicateEmail(email) {
    return axiosInstance.get("/api/members/check-email", { params: { email } });
  }
  
// 폰넘버 중복확인
function checkDuplicatePhoneNum(phoneNum) {
    return axiosInstance.get("/api/members/check-phone", { params: { phoneNum } });
}
  

export { join, login, checkDuplicateId, checkDuplicateNickName, checkDuplicateEmail, checkDuplicatePhoneNum};