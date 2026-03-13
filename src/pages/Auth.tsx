import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { CheckCircle, X } from 'lucide-react';

export default function Auth() {
  const { signInWithMagicLink, signInWithGoogle, signInWithApple } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await signInWithMagicLink(email);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  };

  const handleApple = async () => {
    const { error } = await signInWithApple();
    if (error) setError(error.message);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-[#FAFAFA] px-6 pt-24">
      {/* Animated Gauge Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          type: 'spring',
          stiffness: 260,
          damping: 20,
          delay: 0.1,
        }}
        className="mb-8"
      >
        <div className="flex h-[72px] w-[180px] items-center justify-center rounded-[20px]"
          style={{ background: '#B8E63C' }}
        >
          <span className="text-[36px] font-black tracking-tight" style={{ color: '#1a3a00' }}>
            Gauge
          </span>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-sm"
      >
        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-[#22C55E]" />
            </div>
            <h2 className="text-xl font-bold text-[#0F172A]">Check your email</h2>
            <p className="mt-2 text-sm text-[#64748B]">
              We sent a magic link to <span className="font-medium text-[#0F172A]">{email}</span>
            </p>
            <button
              className="mt-6 text-sm font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Use a different email
            </button>
          </motion.div>
        ) : (
          <>
            <h1 className="mb-8 text-center text-[26px] font-bold text-[#0F172A]">
              Log in or sign up
            </h1>

            {/* Email input */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="h-[52px] rounded-full bg-white px-5 text-base text-[#0F172A] placeholder:text-[#94A3B8] border border-gray-200 focus:border-gray-300 focus:ring-0"
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => setEmail('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              {/* Continue button */}
              <button
                type="submit"
                disabled={loading || !email}
                className="flex h-[52px] w-full items-center justify-center rounded-full bg-[#0F172A] text-white font-semibold text-base transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Continue'}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-sm text-[#94A3B8]">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogle}
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white text-[#0F172A] font-semibold text-base transition-colors hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <button
                onClick={handleApple}
                className="flex h-[52px] w-full items-center justify-center gap-3 rounded-full border border-gray-200 bg-white text-[#0F172A] font-semibold text-base transition-colors hover:bg-gray-50"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#0F172A">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                Continue with Apple
              </button>
            </div>

            <p className="mt-8 text-center text-xs text-[#94A3B8]">
              No password needed. We'll email you a secure login link.
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
