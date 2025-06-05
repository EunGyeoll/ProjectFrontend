import axiosInstance from "@/plugin/axiosInstance";


export function searchAll(keyword, page = 0, size = 5, itemCategory = "", postCategory = "") {
  return axiosInstance.get("/api/search", {
    params: {
      keyword,
      page,
      size,
      ...(itemCategory ? { itemCategory } : {}),
      ...(postCategory ? { postCategory } : {})
    }
  });
}

  