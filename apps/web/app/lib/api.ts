import axios from "axios";

function resolveApiBaseUrl() {
  const rawValue = import.meta.env.VITE_API_URL?.trim();

  if (!rawValue) return "/api";

  if (/^https?:\/\//i.test(rawValue)) {
    const url = new URL(rawValue);
    const pathname = url.pathname.replace(/\/+$/, "");

    if (!pathname || pathname === "/") {
      url.pathname = "/api";
    } else {
      url.pathname = pathname;
    }

    return url.toString().replace(/\/+$/, "");
  }

  return rawValue.replace(/\/+$/, "");
}

const API_BASE_URL = resolveApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("bt_token") : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("bt_token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);
