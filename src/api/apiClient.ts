import axios from "axios";
import Cookies from "js-cookie";
import { handleLogout } from "./services/authService";

const serverURL = import.meta.env.VITE_APP_API_URL || "http://localhost:8084/";
const baseURL = serverURL.endsWith("/") ? `${serverURL}api/v1/` : `${serverURL}/api/v1/`;

const instance = axios.create({
  baseURL: baseURL,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request Interceptor
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    const xsrfToken = Cookies.get("laravel_session");

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    if (xsrfToken) {
      config.headers.set("X-XSRF-TOKEN", xsrfToken);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried this request yet
    // Do NOT trigger refresh for the login endpoint itself
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url?.includes("login") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");

        // Call backend refresh endpoint
        // Note: We use axios directly here, not 'instance', to avoid interceptor loops
        const res = await axios.post(`${serverURL.endsWith("/") ? serverURL : serverURL + "/"}refresh`, {
          refresh_token: refreshToken,
        });

        if (res.status === 200) {
          // Extract tokens from nested structure: { tokens: { access_token, refresh_token } }
          const access_token = res.data?.tokens?.access_token || res.data?.access_token;
          const refresh_token = res.data?.tokens?.refresh_token || res.data?.refresh_token;

          // 1. Save new tokens
          Cookies.set("auth_token", access_token, { expires: 7, secure: true, sameSite: "strict" });
          Cookies.set("refresh_token", refresh_token || "", { expires: 7, secure: true, sameSite: "strict" });

          // 2. Update the header for the original request
          originalRequest.headers.set("Authorization", `Bearer ${access_token}`);

          // 3. Retry the original request with the new token
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // If refresh fails, the refresh token is likely expired too
        console.error("Refresh token expired or invalid", refreshError);
        // handleLogout();
      }
    }

    return Promise.reject(error);
  }
);

export { instance, baseURL, serverURL };
export default instance;
