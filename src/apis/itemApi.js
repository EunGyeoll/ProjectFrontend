import axiosInstance from "@/plugin/axiosInstance";

// 모든 상품 가져오기
export function fetchAllItems(params) {
  return axiosInstance.get("/api/items/list", { params });
}

export function fetchItemCategories() {
  return axiosInstance.get('/api/item-categories');
}

// 카테고리별로 상품 가져오기
export function fetchItemsByCategory(category, params) {
  return axiosInstance.get(`/api/items/by-category`, {
    params: { name: category, ...params }
  });
}


export function createItem(itemData, imageFiles) {
    const formData = new FormData();
    formData.append("itemData", new Blob([JSON.stringify(itemData)], { type: "application/json" }));
  
    imageFiles.forEach(file => formData.append("imageFiles", file));
  
    return axiosInstance.post("/api/items/new", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  }
  