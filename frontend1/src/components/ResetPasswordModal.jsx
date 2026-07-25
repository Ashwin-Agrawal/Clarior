import { useState, useEffect } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../services/api";

export default function ResetPasswordModal({ isOpen, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'reset'

  const initRecaptcha = () => {
    try {
      if (window.recaptchaVerifierReset) {
        try { window.recaptchaVerifierReset.clear(); } catch (_) {}
        window.recaptchaVerifierReset = null;
      }
      const container = document.getElementById("recaptcha-reset-container");
      if (!container) return null;
      window.recaptchaVerifierReset = new RecaptchaVerifier(auth, container, {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setError("reCAPTCHA expired. Please request OTP again.");
        },
      });
      return window.recaptchaVerifierReset;
    } catch (err) {
      console.error("reCAPTCHA init error:", err);
      return null;
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setNewPassword("");
      setError("");
      setSuccessMessage("");
      setConfirmationResult(null);
      if (window.recaptchaVerifierReset) {
        try { window.recaptchaVerifierReset.clear(); } catch (_) {}
        window.recaptchaVerifierReset = null;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) {
        throw new Error("Please enter a valid 10-digit mobile number.");
      }

      const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length === 12
        ? `+${cleanPhone}`
        : `+91${cleanPhone.slice(-10)}`;

      const appVerifier = initRecaptcha();
      if (!appVerifier) {
        throw new Error("Failed to initialize verification system. Please refresh the page.");
      }

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("reset");
    } catch (err) {
      console.error("Firebase send OTP error:", err);
      if (window.recaptchaVerifierReset) {
        try { window.recaptchaVerifierReset.clear(); } catch (_) {}
        window.recaptchaVerifierReset = null;
      }
      let msg = err.message || "Failed to send OTP code. Please check the mobile number.";
      if (err.code === "auth/invalid-phone-number") msg = "Invalid phone number format.";
      if (err.code === "auth/too-many-requests") msg = "Too many requests. Please wait a few minutes before trying again.";
      if (err.code === "auth/operation-not-allowed") msg = "Phone authentication is not enabled in your Firebase console or region policy.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No active OTP session. Please try again.");
      }
      if (newPassword.length < 8) {
        throw new Error("New password must be at least 8 characters.");
      }

      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const res = await api.post("/auth/reset-password-phone", { idToken, newPassword });

      setSuccessMessage(res.data.message || "Password reset successfully!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Password reset error:", err);
      setError(err.response?.data?.message || err.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
      <div id="recaptcha-reset-container" />

      <div className="w-full max-w-md rounded-3xl border border-border bg-surface p-6 sm:p-8 shadow-card relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 text-muted hover:text-fg text-lg font-bold cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
            Password Reset
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-fg tracking-tight">
            {step === "phone" ? "Reset via Phone OTP" : "Enter OTP & New Password"}
          </h3>
          <p className="text-xs text-muted font-medium">
            {step === "phone"
              ? "Enter your registered mobile number to receive a verification OTP."
              : `Enter the OTP sent to your phone and choose a new password.`}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-danger/10 border border-danger/20 p-3.5 text-xs font-bold text-danger text-center">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-5 rounded-2xl bg-success/10 border border-success/20 p-3.5 text-xs font-bold text-success text-center">
            {successMessage}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex gap-2">
              <span className="flex items-center justify-center px-4 rounded-xl bg-surface2 border border-border text-sm font-black text-fg">
                +91
              </span>
              <input
                type="tel"
                placeholder="9876543210"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                maxLength={10}
                required
                className="flex-1 px-4 py-3 rounded-xl border border-border bg-surface text-fg font-bold tracking-wider focus:border-primary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading || phoneNumber.replace(/\D/g, "").length < 10}
              className="w-full py-3.5 rounded-2xl bg-primary text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-accent disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Sending OTP..." : "Send Reset OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-fg mb-1 block text-left">6-Digit OTP Code</label>
              <input
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength={6}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-fg font-black text-center text-xl tracking-[0.4em] focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-fg mb-1 block text-left">New Password</label>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                className="w-full px-4 py-3 rounded-xl border border-border bg-surface text-fg font-medium focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6 || newPassword.length < 8}
              className="w-full py-3.5 rounded-2xl bg-success text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Resetting Password..." : "Confirm & Reset Password"}
            </button>
            <button
              type="button"
              onClick={() => setStep("phone")}
              className="w-full text-xs font-bold text-muted hover:text-fg transition-colors"
            >
              Change Phone Number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
