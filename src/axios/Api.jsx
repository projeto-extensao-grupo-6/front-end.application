import axios from "axios";
import Swal from "sweetalert2";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const Api = axios.create({
  baseURL: BACKEND_URL,
});

Api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Swal.fire({
        icon: "error",
        text: `Sessão expirada. Faça login novamente.`,
        timer: 2500,
        showConfirmButton: false,
      });

      sessionStorage.clear();
      setTimeout(() => (window.location.href = "/login"), 2500);
    }

    return Promise.reject(error);
  }
);

export default Api;
