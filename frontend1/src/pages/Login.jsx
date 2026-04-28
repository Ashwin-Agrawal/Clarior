import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Get the intended destination from navigation state
  const from = location.state?.from || "/dashboard";

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });

      // ✅ SET USER (cookies handle auth automatically)
      // Response format: {success: true, message: "...", data: {user: {...}}}
      setUser(res.data.data.user);

      // Navigate to intended destination
      navigate(from, { replace: true });
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-72px)] px-6 flex items-center justify-center">
        <Card className="w-full max-w-md p-7">
          <h2 className="text-3xl font-extrabold tracking-tight">Welcome back</h2>
          <p className="text-muted mt-2">Login to manage sessions and bookings.</p>

          {error && (
            <div className="mt-4 text-sm text-danger bg-surface2 border border-danger rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleLogin}
            disabled={loading}
            className="mt-5 w-full"
          >
            {loading ? "Logging in…" : "Login"}
          </Button>
        </Card>
      </div>
    </>
  );
}

export default Login;