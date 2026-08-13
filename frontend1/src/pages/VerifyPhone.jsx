import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Navbar from '../components/Navbar';
import useSEO from '../hooks/useSEO';

export default function VerifyPhone() {
  useSEO({ title: 'Verify Phone', description: 'Verify your phone number to secure your Clarior account.' });
  const { user, fetchUser } = useAuth();
  const navigate = useNavigate();

  const [phone, setPhone]       = useState(user?.phone || '');
  const [step, setStep]         = useState('phone'); // 'phone' | 'otp'
  const [otp, setOtp]           = useState(['', '', '', '']);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const inputRefs               = useRef([]);

  // ── Step 1: Send OTP ────────────────────────────────────────
  const handleSendOTP = async () => {
    setError('');
    if (!phone.trim()) { setError('Please enter your phone number'); return; }
    setLoading(true);
    try {
      await api.post('/otp/send-phone-otp', { phone });
      setStep('otp');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────
  const handleVerifyOTP = async () => {
    setError('');
    const code = otp.join('');
    if (code.length < 4) { setError('Enter the full 4-digit OTP'); return; }
    setLoading(true);
    try {
      await api.post('/otp/verify-phone-otp', { otp: code });
      await fetchUser();
      setSuccess('Phone verified successfully!');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Verification failed');
    } finally { setLoading(false); }
  };

  // ── OTP box keyboard handler ─────────────────────────────────
  const handleOtpChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 3) inputRefs.current[idx + 1]?.focus();
  };
  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) inputRefs.current[idx - 1]?.focus();
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-16 pb-28 md:pb-16">
        <div className="w-full max-w-md animate-fade-up">
          {/* Card */}
          <div className="bg-surface border border-border rounded-[28px] p-8 shadow-card">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
            </div>

            {step === 'phone' ? (
              <>
                <h1 className="text-2xl font-extrabold text-center text-fg mb-2">Verify your phone</h1>
                <p className="text-sm text-muted text-center mb-8">
                  Enter your phone number — we'll send a 4-digit OTP to your registered email.
                </p>

                {error && (
                  <div className="mb-5 flex items-center gap-2.5 text-sm text-danger bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 animate-scale-in">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {error}
                  </div>
                )}

                <div className="flex items-center border border-border bg-surface2 rounded-2xl overflow-hidden focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all mb-4">
                  <span className="px-4 text-sm font-bold text-muted border-r border-border">+91</span>
                  <input
                    id="verify-phone-input"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                    className="flex-1 bg-transparent px-4 py-3.5 text-sm text-fg placeholder:text-muted outline-none"
                    maxLength={15}
                    autoFocus
                  />
                </div>

                <Button onClick={handleSendOTP} loading={loading} className="w-full" size="lg"
                  iconRight={!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>}>
                  Send OTP
                </Button>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-extrabold text-center text-fg mb-2">Enter the OTP</h1>
                <p className="text-sm text-muted text-center mb-8">
                  A 4-digit code was sent to <strong className="text-fg">{user?.email}</strong>.
                  <button onClick={() => { setStep('phone'); setOtp(['','','','']); setError(''); }} className="ml-2 text-primary font-semibold hover:underline cursor-pointer text-xs">Change?</button>
                </p>

                {error && (
                  <div className="mb-5 flex items-center gap-2.5 text-sm text-danger bg-danger/8 border border-danger/25 rounded-xl px-4 py-3 animate-scale-in">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mb-5 flex items-center gap-2.5 text-sm text-success bg-success/8 border border-success/25 rounded-xl px-4 py-3 animate-scale-in">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" className="flex-shrink-0"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
                    {success}
                  </div>
                )}

                {/* 4-digit OTP boxes */}
                <div className="flex justify-center gap-3 mb-6">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, idx)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="h-14 w-14 text-center text-2xl font-black text-fg bg-surface2 border-2 border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all duration-200"
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>

                <Button onClick={handleVerifyOTP} loading={loading} className="w-full" size="lg"
                  iconRight={!loading && <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6"/></svg>}>
                  Verify OTP
                </Button>

                <button
                  onClick={handleSendOTP}
                  disabled={loading}
                  className="mt-4 w-full text-xs text-muted hover:text-primary transition-colors font-semibold py-2 cursor-pointer"
                >
                  Didn't receive? Resend OTP
                </button>
              </>
            )}

            <div className="mt-6 pt-5 border-t border-border text-center">
              <Link to="/dashboard" className="text-xs text-muted hover:text-fg transition">Skip for now</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
