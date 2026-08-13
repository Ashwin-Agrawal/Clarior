import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Logo } from '../components/layout/icons';
import useSEO from '../hooks/useSEO';

export default function ForgotPassword() {
  useSEO({ title: 'Forgot Password', description: 'Reset your Clarior password via OTP.' });
  const navigate = useNavigate();
  const [step, setStep]     = useState('email');
  const [email, setEmail]   = useState('');
  const [otp, setOtp]       = useState(['', '', '', '']);
  const [newPw, setNewPw]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const refs = useRef([]);

  const handleSendOTP = async () => {
    setError('');
    if (!email.trim()) return setError('Enter your email');
    setLoading(true);
    try {
      await api.post('/otp/forgot-password', { email });
      setStep('otp');
    } catch (e) { setError(e?.response?.data?.message || 'Failed to send OTP'); }
    finally { setLoading(false); }
  };

  const handleVerifyOTP = () => {
    setError('');
    if (otp.join('').length < 4) return setError('Enter the full 4-digit OTP');
    setStep('password');
  };

  const handleReset = async () => {
    setError('');
    if (newPw.length < 8) return setError('Password must be at least 8 characters');
    if (newPw !== confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/otp/reset-password', { email, otp: otp.join(''), newPassword: newPw });
      setSuccess('Password reset! Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1800);
    } catch (e) { setError(e?.response?.data?.message || 'Reset failed. Try again.'); }
    finally { setLoading(false); }
  };

  const onChange = (val, i) => {
    if (!/^[0-9]?$/.test(val)) return;
    const n = [...otp]; n[i] = val; setOtp(n);
    if (val && i < 3) refs.current[i + 1]?.focus();
  };
  const onKeyDown = (e, i) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const stepIdx = step === 'email' ? 0 : step === 'otp' ? 1 : 2;
  const steps = ['Email', 'OTP', 'Password'];

  const ErrorBox = ({ msg }) => msg ? (
    <div className='mb-5 flex items-center gap-2.5 text-sm text-danger bg-danger/8 border border-danger/25 rounded-xl px-4 py-3'>{msg}</div>
  ) : null;

  const SuccessBox = ({ msg }) => msg ? (
    <div className='mb-5 flex items-center gap-2.5 text-sm text-success bg-success/8 border border-success/25 rounded-xl px-4 py-3'>{msg}</div>
  ) : null;

  return (
    <div className='min-h-screen bg-bg flex items-center justify-center px-4 py-16'>
      <div className='w-full max-w-md animate-fade-up'>
        <Link to='/' className='flex items-center justify-center gap-2.5 mb-8 hover:opacity-90 transition'>
          <Logo size='navbar' />
          <span className='font-extrabold text-xl text-fg'>Clarior</span>
        </Link>

        {/* Steps */}
        <div className='flex items-center justify-center gap-1 mb-8'>
          {steps.map((label, i) => (
            <div key={label} className='flex items-center gap-1'>
              <div className='flex flex-col items-center'>
                <div className={'h-7 w-7 rounded-full flex items-center justify-center text-xs font-black transition-all ' + (i <= stepIdx ? 'bg-primary text-white' : 'bg-surface2 border border-border text-muted')}>
                  {i < stepIdx ? <svg className='h-3 w-3' fill='none' stroke='currentColor' strokeWidth='3' viewBox='0 0 24 24'><polyline points='20 6 9 17 4 12'/></svg> : i + 1}
                </div>
                <span className={'text-[9px] font-bold mt-1 uppercase ' + (i <= stepIdx ? 'text-primary' : 'text-muted')}>{label}</span>
              </div>
              {i < 2 && <div className={'h-px w-6 mb-5 ' + (i < stepIdx ? 'bg-primary' : 'bg-border')} />}
            </div>
          ))}
        </div>

        <div className='bg-surface border border-border rounded-[28px] p-8 shadow-card'>
          <ErrorBox msg={error} />
          <SuccessBox msg={success} />

          {step === 'email' && (
            <>
              <h1 className='text-2xl font-extrabold text-fg mb-2'>Forgot your password?</h1>
              <p className='text-sm text-muted mb-7'>Enter your email — we'll send a 4-digit OTP.</p>
              <Input label='Email' id='forgot-email' type='email' placeholder='you@example.com' value={email}
                onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                iconLeft={<svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><path d='M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z'/><polyline points='22,6 12,13 2,6'/></svg>} />
              <Button onClick={handleSendOTP} loading={loading} className='mt-5 w-full' size='lg'>Send OTP</Button>
            </>
          )}

          {step === 'otp' && (
            <>
              <h1 className='text-2xl font-extrabold text-fg mb-2'>Enter OTP</h1>
              <p className='text-sm text-muted mb-7'>4-digit code sent to <strong className='text-fg'>{email}</strong></p>
              <div className='flex justify-center gap-3 mb-6'>
                {otp.map((d, i) => (
                  <input key={i} ref={el => { refs.current[i] = el; }} type='text' inputMode='numeric' maxLength={1} value={d}
                    onChange={e => onChange(e.target.value, i)} onKeyDown={e => onKeyDown(e, i)}
                    className='h-14 w-14 text-center text-2xl font-black text-fg bg-surface2 border-2 border-border rounded-2xl outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 transition-all'
                    autoFocus={i === 0} />
                ))}
              </div>
              <Button onClick={handleVerifyOTP} className='w-full' size='lg'>Continue</Button>
              <button onClick={handleSendOTP} disabled={loading} className='mt-4 w-full text-xs text-muted hover:text-primary transition font-semibold py-2 cursor-pointer'>Resend OTP</button>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className='text-2xl font-extrabold text-fg mb-2'>Set new password</h1>
              <p className='text-sm text-muted mb-7'>Choose a strong password for your account.</p>
              <div className='space-y-4'>
                <Input label='New Password' id='new-pw' type='password' placeholder='At least 8 characters' value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  iconLeft={<svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>} />
                <Input label='Confirm Password' id='confirm-pw' type='password' placeholder='Repeat password' value={confirm}
                  onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleReset()}
                  iconLeft={<svg width='16' height='16' fill='none' stroke='currentColor' strokeWidth='2' viewBox='0 0 24 24'><rect x='3' y='11' width='18' height='11' rx='2'/><path d='M7 11V7a5 5 0 0 1 10 0v4'/></svg>} />
              </div>
              <Button onClick={handleReset} loading={loading} className='mt-6 w-full' size='lg'>Reset Password</Button>
            </>
          )}

          <div className='mt-6 pt-5 border-t border-border text-center'>
            <Link to='/login' className='text-xs text-muted hover:text-fg transition'>Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}