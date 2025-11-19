import { defineStore } from "pinia";
import axiosInstance from "@/plugin/axiosInstance"; // 이름 명확히 바꿈

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: {
      id: "",
      role: "",
      isLoggedIn: false,
    },
    token: null,
  }),
  getters: {
    isLoggedIn(state) {
      return !!state.token;
    },
  },
  actions: {
    saveAuth({ id, role, token }) {
      this.user.id = id;
      this.user.role = role;
      this.user.isLoggedIn = true;
      this.token = token;

      localStorage.setItem("userId", id);
      localStorage.setItem("userRole", role);
      localStorage.setItem("token", token);

      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; // ✅
    },
    clearAuth() {
      this.user = { id: "", role: "", isLoggedIn: false };
      this.token = null;

      localStorage.removeItem("userId");
      localStorage.removeItem("userRole");
      localStorage.removeItem("token");

      delete axiosInstance.defaults.headers.common["Authorization"]; // ✅
    },
    restoreAuth() {
      const token = localStorage.getItem("token");
      const id = localStorage.getItem("userId");
      const role = localStorage.getItem("userRole");

      if (token && id && role) {
        this.user.id = id;
        this.user.role = role;
        this.user.isLoggedIn = true;
        this.token = token;

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`; // ✅
      }
    },
  },
});
