import axiosInstance from "@/plugin/axiosInstance.js";

function join(formData) {
    return axiosInstance.post("/api/members/signup", formData, {
        withCredentials: true 
        // headers: {
        //     "Content-Type": "multipart/form-data"
        // }
    });
}

function login(member){
    return axiosInstance.post(
        "/api/members/login",
        member
    )
}

export { join, login };