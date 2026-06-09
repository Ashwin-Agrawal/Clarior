/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const isDev = import.meta.env.DEV;

  // 🔒 Stabilized setter: only update state when the user data actually changes.
  // Without this, every setUser(newObj) — even with identical data — creates a new
  // object reference which triggers all [user]-dependent useEffects.
  const userRef = useRef(null);
  const setUser = useCallback((next) => {
    const nextStr = next ? JSON.stringify(next) : null;
    const currStr = userRef.current ? JSON.stringify(userRef.current) : null;
    if (isDev) console.log("[AuthContext] setUser call - same:", nextStr === currStr);
    if (nextStr !== currStr) {
      if (isDev) console.log("[AuthContext] Updating user state...");
      userRef.current = next;
      setUserRaw(next);
    }
  }, [isDev]);

  useEffect(() => {
    if (isDev) console.log("[AuthContext] Render - user:", user?._id, "loading:", loading);
  }, [user, loading, isDev]);

  const fetchUser = useCallback(async () => {
    if (isDev) console.log("[AuthContext] fetchUser starting...");
    try {
      const res = await api.get("/users/me");
      if (isDev) console.log("[AuthContext] fetchUser success:", res.data.data.user?._id);
      setUser(res.data.data.user);
    } catch (err) {
      if (isDev) console.log("[AuthContext] fetchUser failed:", err.response?.status);
      setUser(null);
    } finally {
      if (isDev) console.log("[AuthContext] fetchUser finished. Setting loading to false.");
      setLoading(false);
    }
  }, [setUser, isDev]);

  // Run once on mount
  useEffect(() => {
    if (isDev) console.log("[AuthContext] Mount effect firing fetchUser");
    fetchUser();
  }, [fetchUser, isDev]);

  // Listen for session-expired events dispatched by the API interceptor.
  // This replaces window.location.href = "/login" (which caused full remount loops).
  useEffect(() => {
    const handleExpiry = () => {
      if (isDev) console.log("[AuthContext] clarior:session-expired event received");
      setUser(null);
      navigate("/login", { replace: true });
    };
    window.addEventListener("clarior:session-expired", handleExpiry);
    return () => {
      if (isDev) console.log("[AuthContext] Removing expiry listener");
      window.removeEventListener("clarior:session-expired", handleExpiry);
    };
  }, [navigate, setUser, isDev]);

  const value = useMemo(
    () => ({ user, setUser, loading, fetchUser }),
    [user, setUser, loading, fetchUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
