import axiosInstance from '@/plugin/axiosInstance';

export const checkLike = (postId) => {
  return axiosInstance.get(`/api/likes/check/${postId}`);
};

export const addLike = (postId) => {
  return axiosInstance.post(`/api/likes/add/${postId}`);
};

export const removeLike = (postId) => {
  return axiosInstance.delete(`/api/likes/remove/${postId}`);
};

export const getLikeList = (params) => {
  return axiosInstance.get('/api/likes/list', { params });
};

export const getLikeCount = (postId) =>
  axiosInstance.get(`/api/likes/count/${postId}`);