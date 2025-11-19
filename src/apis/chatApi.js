import axiosInstance from "@/plugin/axiosInstance.js";

export const chatApi = {
    getChatRooms(memberId) {
        return axiosInstance.get(`/api/chat/list/${memberId}`);
    },
    
    getChatHistory(sender, receiver) {
        return axiosInstance.get(`/api/chat/history/${sender}/${receiver}`);
    }
}