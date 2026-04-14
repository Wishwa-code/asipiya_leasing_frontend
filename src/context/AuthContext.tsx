import React, { createContext, useContext, useState, useEffect } from "react";
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [currentBranchId, setCurrentBranchId] = useState<number | null>(null);

  useEffect(() => {
    const savedUser = Cookies.get("user_data");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        const savedBranchId = Cookies.get("current_branch_id");
        setCurrentBranchId(savedBranchId ? parseInt(savedBranchId) : parsedUser.branch_id);
      } catch (e) {
        console.error("Failed to parse user data from cookies", e);
      }
    }
  }, []);

  const login = (userData: User, token: string, refreshToken?: string) => {
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
