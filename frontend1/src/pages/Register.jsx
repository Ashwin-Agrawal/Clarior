import { useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    try {
      setError("");
      if (!form.name || !form.email || !form.password) {
        setError("All fields are required");
        return;
      }
      if (form.password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      console.log("[Register] Submitting payload:", form);
      setLoading(true);
      await api.post("/auth/register", form);
      console.log("[Register] Success! Redirecting to login...");
      navigate("/login");
    } catch (err) {
      console.log("[Register] Failed:", err.response?.data);
      const backendMsg = err?.response?.data?.message;
      const validationErrors = err?.response?.data?.errors;
      
      if (validationErrors && validationErrors.length > 0) {
        setError(`${backendMsg}: ${validationErrors[0].msg}`);
      } else {
        setError(backendMsg || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-72px)] px-6 flex items-center justify-center">
        <Card className="w-full max-w-md p-7">
          <h2 className="text-3xl font-extrabold tracking-tight">Create account</h2>
          <p className="text-muted mt-2">Create your student account to get started.</p>

          {error && (
            <div className="mt-4 text-sm text-danger bg-surface2 border border-danger rounded-xl p-3">
              {error}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <Input
              label="Name"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Must include uppercase, lowercase, number, and special character.
            </p>
          </div>

          <Button
            onClick={handleRegister}
            disabled={loading}
            className="mt-5 w-full"
          >
            {loading ? "Creating…" : "Create account"}
          </Button>
        </Card>
      </div>
    </>
  );
}

export default Register;