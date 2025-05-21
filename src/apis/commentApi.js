import axiosInstance from "@/plugin/axiosInstance";

export function fetchComments(postNo) {
  return axiosInstance.get(`/api/comments/${postNo}`);
}

export function submitComment(postNo, commentData, imageFile) {
  const formData = new FormData();
  formData.append(
    "commentData",
    new Blob([JSON.stringify(commentData)], {
      type: "application/json",
    })
  );
  if (imageFile) {
    formData.append("image", imageFile);
  }

  return axiosInstance.post(`/api/comments/${postNo}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteComment(commentId) {
  return axiosInstance.delete(`/api/comments/${commentId}`)
}
