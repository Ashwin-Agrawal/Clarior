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

  useEffect(() => {
    if (!isOpen) {
      setStep("phone");
      setPhoneNumber("");
      setOtp("");
      setError("");
      setConfirmationResult(null);
      return;
    }

    // Initialize invisible reCAPTCHA when modal opens
    if (!window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
          callback: () => {
            // reCAPTCHA solved
          },
          "expired-callback": () => {
            setError("reCAPTCHA expired. Please try sending OTP again.");
          },
        });
      } catch (err) {
        console.error("reCAPTCHA init error:", err);
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

      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err) {
      console.error("Firebase send OTP error:", err);
      setError(err.message || "Failed to send OTP code. Please check the mobile number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!confirmationResult) {
        throw new Error("No active OTP request. Please request code again.");
      }

      const userCredential = await confirmationResult.confirm(otp);
      const idToken = await userCredential.user.getIdToken();

      // Send Firebase ID Token to backend to verify and mark phone as verified
      const res = await api.post("/users/verify-phone-token", { idToken });

      if (onSuccess) {
        onSuccess(res.data.user || res.data);
      }
      onClose();
    } catch (err) {
      console.error("Firebase verify OTP error:", err);
      setError(err.response?.data?.message || "Invalid OTP code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-sm p-4 animate-fade-in">
      {/* Container for invisible reCAPTCHA */}
      <div id="recaptcha-container" />

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
            Mobile Verification
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-fg tracking-tight">
            {step === "phone" ? "Verify Mobile Number" : "Enter Verification Code"}
          </h3>
          <p className="text-xs text-muted font-medium">
            {step === "phone"
              ? "Enter your 10-digit mobile number to receive an instant SMS OTP."
              : `Enter the 6-digit OTP code sent to your phone.`}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-danger/10 border border-danger/20 p-3.5 text-xs font-bold text-danger text-center">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div className="flex gap-2">
              <span className="flex items-center justify-center px-4 rounded-xl bg-surface2 border border-border text-sm font-black text-fg">
                🇮🇳 +91
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
              {loading ? "Sending OTP Code..." : "Send OTP via SMS"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              maxLength={6}
              required
              className="w-full px-4 py-3.5 rounded-2xl border border-border bg-surface text-fg font-black text-center text-2xl tracking-[0.5em] focus:border-primary focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3.5 rounded-2xl bg-success text-white font-black text-xs uppercase tracking-wider shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? "Verifying Token..." : "Verify & Save Phone"}
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
