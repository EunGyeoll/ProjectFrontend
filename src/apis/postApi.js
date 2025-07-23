import axiosInstance from "@/plugin/axiosInstance";

// 모든 게시글 가져오기
export function fetchAllPosts(params) {
    return axiosInstance.get("/api/posts/list", { params });
  }

export const fetchPosts = (params) => {
  return axiosInstance.get('/api/posts/list', { params })
}
  
// 게시글 등록 (JSON 요청)
export function createPost(postData) {
    return axiosInstance.post('/api/posts', postData);
  }


// 게시글 카테고리 가져오기
export function fetchPostCategories() {
    return axiosInstance.get('/api/post-categories');
  }


// 게시글 상세보기
export function fetchPostDetail(postId) {
return axiosInstance.get(`/api/posts/${postId}`);
}

// 게시글 수정
export function updatePost(postId, formData, token) {
  return axiosInstance.put(`/api/posts/${postId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': `Bearer ${token}`
    }
  });
}
 


 