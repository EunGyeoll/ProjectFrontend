import axios from "axios";
import { useAuthStore } from "@/stores/authStore";  // authStore로 변경

const instance = axios.create({
    baseURL: "http://localhost:8000",
});

instance.interceptors.request.use(
  (config) => {
        const token = localStorage.getItem("token"); // ✅ 항상 localStorage에서 토큰 꺼내기
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

instance.interceptors.response.use(
    (response) => response,
    (error) => {
        const store = useAuthStore();  
        if (error.response?.status === 401) {
            store.clearAuth();  
            localStorage.removeItem("token"); //  로컬스토리지의 토큰도 같이 삭제
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default instance;
