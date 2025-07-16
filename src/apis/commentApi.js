import axiosInstance from "@/plugin/axiosInstance";

export function fetchComments(postId) {
  return axiosInstance.get(`/api/comments/${postId}`);
}

export function submitComment(postId, commentData, imageFile) {
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

  return axiosInstance.post(`/api/comments/${postId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
}

export function deleteComment(commentId) {
  return axiosInstance.delete(`/api/comments/${commentId}`)
}
