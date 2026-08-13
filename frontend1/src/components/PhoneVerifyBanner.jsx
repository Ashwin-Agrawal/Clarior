import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PhoneVerifyBanner() {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Only show for logged-in users who haven't verified their phone
  if (!user || user.isPhoneVerified || dismissed) return null;

  return (
    <div className='relative z-[80] w-full bg-gradient-to-r from-amber-500/10 via-primary/8 to-accent/10 border-b border-amber-400/25'>
      <div className='max-w-[960px] mx-auto px-4 py-2.5 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2.5 min-w-0'>
          <span className='flex h-2 w-2 shrink-0'>
            <span className='animate-ping absolute inline-flex h-2 w-2 rounded-full bg-amber-400 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-amber-500' />
          </span>
          <p className='text-xs font-semibold text-fg truncate'>
            <span className='font-black text-amber-600 dark:text-amber-400'>Verify your phone</span>
            <span className='hidden sm:inline text-muted'> — Secure your account and enable password reset via OTP.</span>
          </p>
        </div>
        <div className='flex items-center gap-2 shrink-0'>
          <Link
            to='/verify-phone'
            className='text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-primary text-white hover:bg-primary/90 active:scale-95 transition-all shadow-sm'
          >
            Verify Now
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className='h-6 w-6 flex items-center justify-center rounded-full text-muted hover:text-fg hover:bg-surface2 transition-all cursor-pointer'
            aria-label='Dismiss'
          >
            <svg className='h-3.5 w-3.5' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth='2.5'>
              <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12'/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}