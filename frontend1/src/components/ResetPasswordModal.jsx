import { useState, useEffect } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../services/api";

export default function ResetPasswordModal({ isOpen, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'reset'
  const [countdown, setCountdown] = useState(0);

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
      setCountdown(0);
      setConfirmationResult(null);
      if (window.recaptchaVerifierReset) {
        try { window.recaptchaVerifierReset.clear(); } catch (_) {}
        window.recaptchaVerifierReset = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const cleanPhone = phoneNumber.replace(/\D/g, "");
      if (cleanPhone.length < 10) throw new Error("Please enter a valid 10-digit mobile number.");

      const formattedPhone = cleanPhone.startsWith("91") && cleanPhone.length === 12
        ? `+${cleanPhone}`
        : `+91${cleanPhone.slice(-10)}`;

      const appVerifier = initRecaptcha();
      if (!appVerifier) throw new Error("Failed to initialize verification. Please refresh the page.");

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("reset");
      setCountdown(30);
    } catch (err) {
      if (window.recaptchaVerifierReset) {
        try { window.recaptchaVerifierReset.clear(); } catch (_) {}
        window.recaptchaVerifierReset = null;
      }
      let msg = err.message || "Failed to send OTP. Please check the mobile number.";
      if (err.code === "auth/invalid-phone-number") msg = "Invalid phone number format.";
      if (err.code === "auth/too-many-requests") msg = "Too many requests. Please wait before trying again.";
      if (err.code === "auth/operation-not-allowed") msg = "Phone authentication is not enabled. Please contact support.";
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
      if (!confirmationResult) throw new Error("No active OTP session. Please try again.");
      if (newPassword.length < 8) throw new Error("New password must be at least 8 characters.");

      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      const res = await api.post("/auth/reset-password-phone", { idToken, newPassword });
      setSuccessMessage(res.data.message || "Password reset successfully. You can now log in.");
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Password reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div id="recaptcha-reset-container" />

      <div className="w-full max-w-[400px] rounded-3xl border border-border bg-surface shadow-2xl relative overflow-hidden">
        {/* Accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

        <div className="p-6 sm:p-7">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary mb-2">
                Password Reset
              </div>
              <h3 className="text-xl font-black text-fg tracking-tight">
                {step === "phone" ? "Reset Your Password" : "Verify OTP"}
              </h3>
              <p className="text-xs text-muted mt-1 font-medium leading-5">
                {step === "phone"
                  ? "Enter your registered mobile number to receive a reset code."
                  : "Enter the OTP sent to your phone and set a new password."}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-xl bg-surface2 border border-border flex items-center justify-center text-muted hover:text-fg hover:border-border/80 transition-all cursor-pointer flex-shrink-0 ml-3"
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Success */}
          {successMessage && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-success/8 border border-success/20 px-3.5 py-3 text-xs font-semibold text-success">
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="flex-shrink-0 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {successMessage}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2.5 rounded-2xl bg-danger/8 border border-danger/20 px-3.5 py-3 text-xs font-semibold text-danger">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-fg mb-1.5">Registered Mobile Number</label>
                <div className="flex gap-2">
                  <span className="flex items-center justify-center px-3.5 rounded-xl bg-surface2 border border-border text-sm font-black text-fg flex-shrink-0">
                    +91
                  </span>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={phoneNumber}
                    onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    required
                    autoFocus
                    className="flex-1 px-4 py-3 rounded-xl border border-border bg-bg text-fg font-bold tracking-wider text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all placeholder:text-muted/50"
                  />
                </div>
                <p className="text-[10px] text-muted mt-1.5 font-medium">Must be the number used during registration.</p>
              </div>
              <button
                type="submit"
                disabled={loading || phoneNumber.replace(/\D/g, "").length < 10}
                className="w-full py-3.5 rounded-xl bg-primary text-white font-black text-sm tracking-wide hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending OTP...
                  </>
                ) : "Send Reset Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* OTP */}
              <div>
                <label className="block text-xs font-bold text-fg mb-1.5">6-Digit OTP Code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="------"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-4 py-4 rounded-xl border border-border bg-bg text-fg font-black text-center text-2xl tracking-[0.6em] focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all"
                />
                {countdown > 0 ? (
                  <p className="text-[10px] text-muted mt-1.5 text-center font-medium">Resend OTP in {countdown}s</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                    className="w-full text-[10px] text-primary font-bold mt-1.5 hover:underline cursor-pointer"
                  >
                    Did not receive the code? Resend
                  </button>
                )}
              </div>

              {/* New password */}
              <div>
                <label className="block text-xs font-bold text-fg mb-1.5">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    className="w-full px-4 pr-11 py-3 rounded-xl border border-border bg-bg text-fg font-medium text-sm focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:outline-none transition-all placeholder:text-muted/50"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-fg transition-colors">
                    {showPassword
                      ? <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6 || newPassword.length < 8}
                className="w-full py-3.5 rounded-xl bg-success text-white font-black text-sm tracking-wide hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Resetting Password...
                  </>
                ) : "Confirm New Password"}
              </button>
              <button
                type="button"
                onClick={() => { setStep("phone"); setOtp(""); setError(""); }}
                className="w-full text-xs font-semibold text-muted hover:text-fg transition-colors py-1 cursor-pointer"
              >
                Change Phone Number
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
