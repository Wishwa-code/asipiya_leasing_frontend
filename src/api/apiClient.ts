import axios from "axios";
import Cookies from "js-cookie";

const serverURL = import.meta.env.VITE_APP_API_URL || "http://localhost:8084/";
const baseURL = serverURL.endsWith("/") ? `${serverURL}api/v1/` : `${serverURL}/api/v1/`;
const accountCenterURL = import.meta.env.VITE_ACCOUNT_CENTER_URL || "http://localhost:3000";

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
    const token = localStorage.getItem("auth_token");
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
    // Do NOT trigger refresh for the login, auto-login, or refresh endpoints themselves
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest.url?.includes("login") &&
      !originalRequest.url?.includes("auto-login") &&
      !originalRequest.url?.includes("refresh") &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");

        // Call backend refresh endpoint
        // Note: We use axios directly here, not 'instance', to avoid interceptor loops
        const res = await axios.post(`${serverURL.endsWith("/") ? serverURL : serverURL + "/"}refresh`, {
          refresh_token: refreshToken,
        });

        if (res.status === 200) {
          // Extract tokens from nested structure: { tokens: { access_token, refresh_token } }
          const access_token = res.data?.tokens?.access_token || res.data?.access_token;
          const refresh_token = res.data?.tokens?.refresh_token || res.data?.refresh_token;

          // 1. Save new tokens to localStorage
          localStorage.setItem("auth_token", access_token);
          if (refresh_token) {
            localStorage.setItem("refresh_token", refresh_token);
          }

          // 2. Update the header for the original request
          originalRequest.headers.set("Authorization", `Bearer ${access_token}`);

          // 3. Retry the original request with the new token
          return instance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token is invalid/expired — send user back to Account Center
        console.error("Refresh token expired or invalid", refreshError);
        localStorage.removeItem("auth_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user_data");
        localStorage.removeItem("current_branch_id");

        // Clear legacy cookies too
        Cookies.remove("auth_token", { path: "/" });
        Cookies.remove("refresh_token", { path: "/" });
        Cookies.remove("user_data", { path: "/" });
        Cookies.remove("current_branch_id", { path: "/" });

        window.location.href = `${accountCenterURL}/systems`;
      }
    }

    return Promise.reject(error);
  }
);

export { instance, baseURL, serverURL };
export default instance;
