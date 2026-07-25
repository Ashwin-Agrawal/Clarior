import { useState, useEffect } from "react";
import { auth, RecaptchaVerifier, signInWithPhoneNumber } from "../config/firebase";
import api from "../services/api";

export default function PhoneVerificationModal({ isOpen, onClose, onSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [countdown, setCountdown] = useState(0);

  const initRecaptcha = async () => {
    try {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
      const container = document.getElementById("recaptcha-container");
      if (!container) return null;
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "expired-callback": () => {
          setError("reCAPTCHA verification expired. Please try sending OTP again.");
        },
      });
      await window.recaptchaVerifier.render();
      return window.recaptchaVerifier;
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
      setError("");
      setCountdown(0);
      setConfirmationResult(null);
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
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

      const appVerifier = await initRecaptcha();
      if (!appVerifier) throw new Error("Failed to initialize verification system. Please refresh the page.");

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
      setCountdown(30);
    } catch (err) {
      if (window.recaptchaVerifier) {
        try { window.recaptchaVerifier.clear(); } catch (_) {}
        window.recaptchaVerifier = null;
      }
      let msg = err.message || "Failed to send OTP. Please check the mobile number.";
      if (err.code === "auth/invalid-phone-number") msg = "Invalid phone number format. Please enter a valid 10-digit number.";
      if (err.code === "auth/too-many-requests") msg = "Too many requests. Please wait a few minutes before trying again.";
      if (err.code === "auth/operation-not-allowed") msg = "Phone authentication is not enabled. Please contact support.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) throw new Error("No active OTP request. Please request a new code.");
      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();
      const res = await api.post("/users/verify-phone-token", { idToken });
      if (onSuccess) onSuccess(res.data.user || res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      {/* Invisible reCAPTCHA container */}
      <div id="recaptcha-container" />

      <div className="w-full max-w-[400px] rounded-3xl border border-border bg-surface shadow-2xl relative overflow-hidden">
        {/* Top accent bar */}
        <div className="h-1 w-full bg-gradient-to-r from-primary to-accent" />

        <div className="p-6 sm:p-7">
          {/* Header row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary mb-2">
                Mobile Verification
              </div>
              <h3 className="text-xl font-black text-fg tracking-tight">
                {step === "phone" ? "Verify Your Number" : "Enter OTP Code"}
              </h3>
              <p className="text-xs text-muted mt-1 font-medium leading-5">
                {step === "phone"
                  ? "Enter your 10-digit Indian mobile number to receive a verification code."
                  : "Enter the 6-digit code sent to your mobile number."}
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
                <label className="block text-xs font-bold text-fg mb-1.5">Mobile Number</label>
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
                <p className="text-[10px] text-muted mt-1.5 font-medium">A 6-digit OTP will be sent via SMS. Standard rates may apply.</p>
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
                ) : "Send Verification Code"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
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
                    onClick={() => setStep("phone")}
                    className="w-full text-[10px] text-primary font-bold mt-1.5 hover:underline cursor-pointer"
                  >
                    Did not receive the code? Resend
                  </button>
                )}
              </div>
              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full py-3.5 rounded-xl bg-success text-white font-black text-sm tracking-wide hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : "Verify Phone Number"}
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
