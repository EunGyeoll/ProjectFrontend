import axios from "axios";
import { useAuthStore } from "@/stores/authStore";  
import { useAlertStore } from "@/stores/alertStore";

const instance = axios.create({
    baseURL: "http://localhost:8000",
});

instance.interceptors.request.use(
  (config) => {
        const token = localStorage.getItem("token"); // 항상 localStorage에서 토큰 꺼내기
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
        const alert = useAlertStore(); 

        if (error.response?.status === 401) {
            store.clearAuth();  
            localStorage.removeItem("token"); //  로컬스토리지의 토큰도 같이 삭제

            alert.show("세션이 만료되었습니다. 다시 로그인해주세요."); 
            
            setTimeout(() => {
                window.location.href = "/login";
            }, 2000); // 알림 보여준 후 이동
        }
        return Promise.reject(error);
    }
);

export default instance;
