import axiosInstance from '@/plugin/axiosInstance';

export const checkLike = (postNo) => {
  return axiosInstance.get(`/api/likes/check/${postNo}`);
};

export const addLike = (postNo) => {
  return axiosInstance.post(`/api/likes/add/${postNo}`);
};

export const removeLike = (postNo) => {
  return axiosInstance.delete(`/api/likes/remove/${postNo}`);
};

export const getLikeList = (params) => {
  return axiosInstance.get('/api/likes/list', { params });
};

export const getLikeCount = (postNo) =>
  axiosInstance.get(`/api/likes/count/${postNo}`);