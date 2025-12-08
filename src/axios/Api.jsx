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
  
  // Garantir que o Content-Type seja definido para requisições POST/PUT
  if (config.method === 'post' || config.method === 'put') {
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
  }
  
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Permite que algumas requisições não redirecionem automaticamente
    const skipRedirect = error.config?.skipAuthRedirect;
    
    if ((error.response?.status === 401 || error.response?.status === 403) && !skipRedirect) {
      const message = error.response?.status === 403 
        ? "Acesso negado. Faça login novamente."
        : "Sessão expirada. Faça login novamente.";
      
      Swal.fire({
        icon: "error",
        text: message,
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
