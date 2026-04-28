import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

function Verify() {
  const [college, setCollege] = useState("");
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const { fetchUser } = useAuth();

  const handleSubmit = async () => {
    try {
      setMsg("");
      setLoading(true);
      await api.patch("/users/profile", { college });
      await api.patch("/users/upi", { upiId });
      await fetchUser?.();

      setMsg("Details saved. Your account will be verified by admin.");
    } catch (err) {
      setMsg(err?.response?.data?.message || "Failed to save details");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-[calc(100vh-72px)] px-6 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border rounded-3xl p-7 shadow-sm">
          <h2 className="text-3xl font-extrabold tracking-tight">Senior verification</h2>
          <p className="text-gray-600 mt-2">
            Add your details so we can verify your profile and enable sessions.
          </p>

          {msg && (
            <div className="mt-4 text-sm text-gray-800 border rounded-xl bg-gray-50 p-3">
              {msg}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <label className="block text-sm text-gray-700">
              College
              <input
                placeholder="e.g. IIT Delhi"
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
              />
            </label>

            <label className="block text-sm text-gray-700">
              UPI ID
              <input
                placeholder="name@bank"
                className="mt-1 w-full border rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-gray-900/10"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
              />
            </label>
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-5 w-full bg-gray-900 hover:bg-black disabled:opacity-60 text-white px-6 py-3 rounded-xl font-medium"
          >
            {loading ? "Saving…" : "Save details"}
          </button>
        </div>
      </div>
    </>
  );
}

export default Verify;