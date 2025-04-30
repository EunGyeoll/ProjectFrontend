import axiosInstance from "@/plugin/axiosInstance";

function updateMemberInfo(formData) {
  return axiosInstance.patch("/api/members/update", formData, {
    headers: {
      "Content-Type": "multipart/form-data"
    }
  });
}

function getMyProfile() {
    return axiosInstance.get("/api/members/me");
  }

export { updateMemberInfo , getMyProfile};
