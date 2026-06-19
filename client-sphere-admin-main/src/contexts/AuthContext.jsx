import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/services/authService";
import { setUnauthorizedHandler } from "@/api/axiosClient";
import {
  clearAuthSession,
  normalizeUser,
  syncSessionUser,
} from "@/utils/authSession";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const setUserState = useCallback((nextUser) => {
    const normalized = normalizeUser(nextUser);
    syncSessionUser(normalized);
    setUser(normalized);
  }, []);

  const clearUser = useCallback(() => {
    authService.invalidateMe();
    clearAuthSession();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    authService.invalidateMe();
    try {
      const res = await authService.getMe();
      if (!res.data?.user) {
        clearUser();
        return null;
      }
      setUserState(res.data.user);
      return res.data.user;
    } catch {
      clearUser();
      return null;
    }
  }, [clearUser, setUserState]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearUser();
    });
  }, [clearUser]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await authService.getMe();
        if (!active) return;
        if (res.data?.user) {
          setUserState(res.data.user);
        } else {
          clearAuthSession();
          setUser(null);
        }
      } catch {
        if (active) {
          clearAuthSession();
          setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [setUserState]);

  const login = useCallback(
    (userData) => {
      authService.invalidateMe();
      setUserState(userData);
    },
    [setUserState]
  );

  const updateUser = useCallback(
    (partial) => {
      setUser((prev) => {
        const next = normalizeUser({ ...(prev || {}), ...partial });
        syncSessionUser(next);
        return next;
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* clear local session even if request fails */
    }
    clearUser();
  }, [clearUser]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user?.id),
      login,
      logout,
      updateUser,
      refreshUser,
    }),
    [user, loading, login, logout, updateUser, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

export default AuthContext;
