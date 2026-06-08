import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../types/user";

// Account Center URL — used for logout redirect and unauthenticated redirect
const ACCOUNT_CENTER_URL =
  import.meta.env.VITE_ACCOUNT_CENTER_URL || "http://localhost:3000";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  isHeadOffice: boolean;
  currentBranchId: number | null;
  switchBranch: (branchId: number) => void;
  accountCenterUrl: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DEV MODE CONFIGURATION ---
const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true"; // Set to true via environment variable to bypass SSO and use DEV_USER for local testing
const DEV_USER: User = {
  id: 1,
  full_name: "Admin",
  email: "admin@asipiya.lk",
  branch_id: 1,
  head_branch_id: 2,
  branch_name: "Head Office",
  privileges: [
    "VIEW_PRODUCT", "ADD_PRODUCT", "VIEW_CUSTOMER", "ADD_CUSTOMER",
    "VIEW_BLACKLIST_CUSTOMER", "CUSTOMER_SAVING_ACC", "INSURANCE",
    "PENDING_LOAN", "CREATE_LOAN", "LOAN_DISBURSEMENT", "CURRENT_LOANS",
    "LOAN_RESCHEDULE", "FULL_LOAN_DETAIL", "VIEW_PAYMENT", "ADD_REPAYMENT",
    "BULK_REPAYMENT", "LOAN_SETTLEMENT", "MAIN_REPORTS_DASHBOARD",
    "LOAN_DISBURSEMENT_PERFORMANCE"
  ],
  logo: "/images/user/user-01.jpg",
  company_name: "Asipiya",
  company_id: 1,
  branches: [
    { idBranch: 1, Name: "Head Office" },
    { idBranch: 2, Name: "Kandy Branch" },
    { idBranch: 3, Name: "Colombo Branch" }
  ],
  branch_access: 1
};
// ------------------------------

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    if (DEV_MODE) return DEV_USER;
    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user data from localStorage", e);
        return null;
      }
    }
    return null;
  });

  const [currentBranchId, setCurrentBranchId] = useState<number | null>(() => {
    const savedBranchId = localStorage.getItem("current_branch_id") || Cookies.get("current_branch_id");
    if (savedBranchId) return parseInt(savedBranchId);

    if (DEV_MODE) return DEV_USER.branch_id;

    const savedUser = localStorage.getItem("user_data");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        return parsedUser.branch_id;
      } catch (e) { }
    }
    return null;
  });

  const login = (userData: User, token: string, refreshToken?: string) => {
    if (DEV_MODE) return;
    setUser(userData);
    setCurrentBranchId(userData.branch_id);
    
    // Save tokens and user data in localStorage (bypasses 4KB size limits for large privilege lists)
    localStorage.setItem("auth_token", token);
    if (refreshToken) {
      localStorage.setItem("refresh_token", refreshToken);
    }
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("current_branch_id", userData.branch_id.toString());

    // Also write current_branch_id to cookies since some older subsystems might read it
    const isSecure = window.location.protocol === "https:";
    Cookies.set("current_branch_id", userData.branch_id.toString(), { expires: 7, secure: isSecure, sameSite: "strict", path: "/" });
  };

  const switchBranch = (branchId: number) => {
    setCurrentBranchId(branchId);
    localStorage.setItem("current_branch_id", branchId.toString());

    const isSecure = window.location.protocol === "https:";
    Cookies.set("current_branch_id", branchId.toString(), { expires: 7, secure: isSecure, sameSite: "strict", path: "/" });
  };

  const logout = () => {
    if (DEV_MODE) {
      setUser(null);
      setCurrentBranchId(null);
      return;
    }
    setUser(null);
    setCurrentBranchId(null);

    // Clear localStorage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("current_branch_id");

    // Clear legacy cookies
    Cookies.remove("auth_token", { path: "/" });
    Cookies.remove("refresh_token", { path: "/" });
    Cookies.remove("user_data", { path: "/" });
    Cookies.remove("current_branch_id", { path: "/" });

    // Redirect to Account Center's system selection page
    window.location.href = `${ACCOUNT_CENTER_URL}/systems`;
  };

  const isHeadOffice = user && currentBranchId ? currentBranchId === user.head_branch_id : false;

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout,
      isHeadOffice,
      currentBranchId,
      switchBranch,
      accountCenterUrl: ACCOUNT_CENTER_URL,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
