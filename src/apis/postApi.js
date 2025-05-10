import axiosInstance from "@/plugin/axiosInstance";

// 모든 상품 가져오기
export function fetchAllPosts(params) {
    return axiosInstance.get("/api/posts/list", { params });
  }


  // 게시글 상세보기
  export function fetchAllPosts(params) {
    return axiosInstance.get("/api/posts/list", { params });
  }
  
  
// 2. 이미지 없는 게시글 등록 (JSON 요청)
export function createPost(postData) {
    return axiosInstance.post('/api/posts/new', postData);
  }
  
// 3. 이미지 포함 게시글 등록 (multipart 요청)
export function createPostWithImage(postData, imageFiles) {
    const postDataBlob = new Blob([JSON.stringify(postData)], {
        type: 'application/json',
    });

    const formData = new FormData();
    formData.append('postData', postDataBlob);

    imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
    });

    return axiosInstance.post('/api/posts/new-with-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    }

export function fetchPostCategories() {
    return axiosInstance.get('/api/post-categories');
  }