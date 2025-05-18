import axiosInstance from '@/plugin/axiosInstance';

export const checkFavorite = (itemId) => {
  return axiosInstance.get(`/api/favorites/check/${itemId}`);
};

export const addFavorite = (itemId) => {
  return axiosInstance.post(`/api/favorites/add/${itemId}`);
};

export const removeFavorite = (itemId) => {
  return axiosInstance.delete(`/api/favorites/remove/${itemId}`);
};

export const getFavoriteList = (params) => {
  return axiosInstance.get('/api/favorites/list', { params });
};

export const getFavoriteCount = (itemId) =>
  axiosInstance.get(`/api/favorites/count/${itemId}`);