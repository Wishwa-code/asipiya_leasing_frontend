import React, { createContext, useContext, useState } from "react";
import Cookies from "js-cookie";
import { User } from "../types/user";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (userData: User, token: string, refreshToken?: string) => void;
  logout: () => void;
  isHeadOffice: boolean;
  currentBranchId: number | null;
  switchBranch: (branchId: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- DEV MODE CONFIGURATION ---
const DEV_MODE = true; // Set to true to use hardcoded values
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
    const savedUser = Cookies.get("user_data");
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch (e) {
        console.error("Failed to parse user data from cookies", e);
        return null;
      }
    }
    return null;
  });

  const [currentBranchId, setCurrentBranchId] = useState<number | null>(() => {
    const savedBranchId = Cookies.get("current_branch_id");
    if (savedBranchId) return parseInt(savedBranchId);

    if (DEV_MODE) return DEV_USER.branch_id;

    const savedUser = Cookies.get("user_data");
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
    Cookies.set("auth_token", token, { expires: 7, secure: true, sameSite: "strict" });
    if (refreshToken) {
      Cookies.set("refresh_token", refreshToken, { expires: 7, secure: true, sameSite: "strict" });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 7, secure: true, sameSite: "strict" });
    Cookies.set("current_branch_id", userData.branch_id.toString(), { expires: 7, secure: true, sameSite: "strict" });
  };

  const switchBranch = (branchId: number) => {
    setCurrentBranchId(branchId);
    Cookies.set("current_branch_id", branchId.toString(), { expires: 7, secure: true, sameSite: "strict" });
  };

  const logout = () => {
    if (DEV_MODE) {
      setUser(null);
      setCurrentBranchId(null);
      return;
    }
    setUser(null);
    setCurrentBranchId(null);
    Cookies.remove("auth_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_data");
    Cookies.remove("current_branch_id");
    window.location.href = "/signin";
  };

  const isHeadOffice = user && currentBranchId ? currentBranchId === user.head_branch_id : false;

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isHeadOffice, currentBranchId, switchBranch }}>
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
