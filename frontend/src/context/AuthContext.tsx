import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "PHC" | "ADMIN" | "HOSPITAL" | null;

export interface AuthUser {
  role: UserRole;
  phcId?: string;
  hospitalId?: string;
  userName: string;
  roleTitle: string;
  facilityName?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole;
  phcId: string;
  hospitalId: string;
  loginAsPHC: (phcId: string, phcName?: string) => void;
  loginAsAdmin: (adminName?: string) => void;
  loginAsHospital: (hospitalId: string, hospitalName?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem("ruralcare_auth_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [phcId, setPhcId] = useState<string>(() => {
    return user?.phcId || localStorage.getItem("ruralcare_phc_id") || "PHC001";
  });

  const [hospitalId, setHospitalId] = useState<string>(() => {
    return user?.hospitalId || localStorage.getItem("ruralcare_hospital_id") || "H001";
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("ruralcare_auth_user", JSON.stringify(user));
      if (user.phcId) localStorage.setItem("ruralcare_phc_id", user.phcId);
      if (user.hospitalId) localStorage.setItem("ruralcare_hospital_id", user.hospitalId);
    } else {
      localStorage.removeItem("ruralcare_auth_user");
    }
  }, [user]);

  const loginAsPHC = (targetPhcId: string, phcName?: string) => {
    const newUser: AuthUser = {
      role: "PHC",
      phcId: targetPhcId,
      userName: "Dr. PHC Medical Officer",
      roleTitle: "Primary Health Center Staff",
      facilityName: phcName || `Primary Health Center (${targetPhcId})`,
    };
    setUser(newUser);
    setPhcId(targetPhcId);
  };

  const loginAsAdmin = (adminName?: string) => {
    const newUser: AuthUser = {
      role: "ADMIN",
      userName: adminName || "State Health Administrator",
      roleTitle: "Central Command Admin",
      facilityName: "State Health Mission Hub",
    };
    setUser(newUser);
  };

  const loginAsHospital = (targetHospitalId: string, hospitalName?: string) => {
    const newUser: AuthUser = {
      role: "HOSPITAL",
      hospitalId: targetHospitalId,
      userName: "Dr. Hospital Specialist",
      roleTitle: "District Hospital Specialist",
      facilityName: hospitalName || `District Hospital (${targetHospitalId})`,
    };
    setUser(newUser);
    setHospitalId(targetHospitalId);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("ruralcare_auth_user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        phcId,
        hospitalId,
        loginAsPHC,
        loginAsAdmin,
        loginAsHospital,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
