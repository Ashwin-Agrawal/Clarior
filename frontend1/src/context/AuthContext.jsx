import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔒 Stabilized setter: only update state when the user data actually changes.
  // Without this, every setUser(newObj) — even with identical data — creates a new
  // object reference which triggers all [user]-dependent useEffects.
  const userRef = useRef(null);
  const setUser = useCallback((next) => {
    const nextStr = next ? JSON.stringify(next) : null;
    const currStr = userRef.current ? JSON.stringify(userRef.current) : null;
    if (nextStr !== currStr) {
      userRef.current = next;
      setUserRaw(next);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [setUser]);

  // Run once on mount
  useEffect(() => {
    fetchUser();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen for session-expired events dispatched by the API interceptor.
  // This replaces window.location.href = "/login" (which caused full remount loops).
  useEffect(() => {
    const handleExpiry = () => {
      setUser(null);
      navigate("/login", { replace: true });
    };
    window.addEventListener("clarior:session-expired", handleExpiry);
    return () => window.removeEventListener("clarior:session-expired", handleExpiry);
  }, [navigate, setUser]);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);