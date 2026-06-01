import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { ROUTES } from "../../routes/paths";
import { User } from "../../types/user";

const serverURL = import.meta.env.VITE_APP_API_URL || "http://localhost:8084/";
const accountCenterURL =
  import.meta.env.VITE_ACCOUNT_CENTER_URL || "http://localhost:3000";

type Status = "loading" | "success" | "error";

export default function AutoLogin() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const hasCalled = useRef(false); // prevent double-call in StrictMode

  useEffect(() => {
    if (hasCalled.current) return;
    hasCalled.current = true;

    const token = searchParams.get("token");

    if (!token) {
      // No token in URL — send back to Account Center
      window.location.href = `${accountCenterURL}/systems`;
      return;
    }

    const autoLoginURL = serverURL.endsWith("/")
      ? `${serverURL}auto-login?token=${encodeURIComponent(token)}`
      : `${serverURL}/auto-login?token=${encodeURIComponent(token)}`;

    axios
      .get(autoLoginURL, { timeout: 20000 })
      .then((response) => {
        const data = response.data;

        const accessToken =
          data?.tokens?.access_token || data?.access_token || "";
        const refreshToken =
          data?.tokens?.refresh_token || data?.refresh_token || "";

        if (!accessToken) {
          throw new Error("No access token in backend response");
        }

        const rawUser = data?.user || {};

        const userData: User = {
          id: rawUser.id || 0,
          full_name: rawUser.full_name || rawUser.name || "User",
          email: rawUser.email || "",
          branch_id: rawUser.branch_id || 0,
          head_branch_id: rawUser.head_branch_id || 0,
          branch_name: rawUser.branch_name || "",
          privileges: rawUser.privileges || [],
          logo: rawUser.logo || "",
          company_name: rawUser.company_name || "",
          company_id: rawUser.company_id || 0,
          branches: rawUser.branches || [],
          branch_access: rawUser.branch_access ?? 1,
        };

        login(userData, accessToken, refreshToken);
        setStatus("success");

        // Brief success flash before navigating
        setTimeout(() => navigate(ROUTES.DASHBOARD, { replace: true }), 800);
      })
      .catch((err) => {
        console.error("[AutoLogin] Failed:", err);
        const detail =
          err?.response?.data?.error ||
          err?.response?.data?.details ||
          err.message ||
          "Authentication failed";
        setErrorMsg(detail);
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute rounded-full opacity-20 blur-3xl animate-pulse"
          style={{
            width: 480,
            height: 480,
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle, #3b82f6, transparent)",
            animationDuration: "4s",
          }}
        />
        <div
          className="absolute rounded-full opacity-10 blur-3xl animate-pulse"
          style={{
            width: 360,
            height: 360,
            bottom: "-5%",
            right: "-5%",
            background: "radial-gradient(circle, #6366f1, transparent)",
            animationDuration: "6s",
          }}
        />
      </div>

      <div
        className="relative z-10 w-full max-w-sm mx-4 rounded-2xl p-10 flex flex-col items-center gap-6"
        style={{
          background: "rgba(15, 23, 42, 0.7)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 32px 64px rgba(0,0,0,0.5)",
        }}
      >
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              boxShadow: "0 8px 24px rgba(99, 102, 241, 0.4)",
            }}
          >
            A
          </div>
          <span className="text-white/60 text-sm tracking-widest uppercase font-medium">
            Asipiya Leasing
          </span>
        </div>

        {/* State: Loading */}
        {status === "loading" && (
          <>
            {/* Spinner */}
            <div className="relative w-16 h-16">
              <div
                className="absolute inset-0 rounded-full border-4 border-blue-500/20"
                style={{ borderTopColor: "#3b82f6" }}
              />
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent animate-spin"
                style={{ borderTopColor: "#3b82f6" }}
              />
              {/* Inner pulse */}
              <div
                className="absolute inset-3 rounded-full animate-pulse"
                style={{
                  background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
                  opacity: 0.6,
                }}
              />
            </div>

            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-lg">
                Authenticating
              </p>
              <p className="text-white/40 text-sm">
                Verifying your Account Center session…
              </p>
            </div>

            {/* Progress bar */}
            <div
              className="w-full h-1 rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.08)" }}
            >
              <div
                className="h-full rounded-full animate-pulse"
                style={{
                  background: "linear-gradient(90deg, #3b82f6, #6366f1)",
                  width: "60%",
                }}
              />
            </div>
          </>
        )}

        {/* State: Success */}
        {status === "success" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(34, 197, 94, 0.15)",
                border: "2px solid rgba(34, 197, 94, 0.4)",
              }}
            >
              <svg
                className="w-8 h-8 text-green-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="text-center space-y-1">
              <p className="text-white font-semibold text-lg">
                Login Successful
              </p>
              <p className="text-white/40 text-sm">
                Redirecting to dashboard…
              </p>
            </div>
          </>
        )}

        {/* State: Error */}
        {status === "error" && (
          <>
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239, 68, 68, 0.15)",
                border: "2px solid rgba(239, 68, 68, 0.4)",
              }}
            >
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <div className="text-center space-y-1 px-2">
              <p className="text-white font-semibold text-lg">
                Authentication Failed
              </p>
              <p className="text-red-400/80 text-sm break-words">{errorMsg}</p>
            </div>

            <a
              href={`${accountCenterURL}/systems`}
              className="w-full py-3 rounded-xl text-center text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 active:scale-95"
              style={{
                background: "linear-gradient(135deg, #3b82f6, #6366f1)",
                boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
              }}
            >
              Return to Account Center
            </a>
          </>
        )}
      </div>
    </div>
  );
}
