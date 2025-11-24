import axios from "axios";

const API_BASE_URL =
    process.env.REACT_APP_API_URL || "http://localhost:5002/api";

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("Unauthorized response received from API");
        }
        return Promise.reject(error);
    }
);

export { API_BASE_URL };
export default axiosInstance;
