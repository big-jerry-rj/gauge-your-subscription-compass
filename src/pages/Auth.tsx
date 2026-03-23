import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle, UserRound } from 'lucide-react';
import AnimatedBackground from '@/components/layout/AnimatedBackground';

export default function Auth() {
  const { signInWithMagicLink, continueAsGuest } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmail, setShowEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="mb-12 flex flex-col items-center">
            <img
              src={theme === 'dark' ? '/gauge-green.png' : '/gauge-black.png'}
              alt="Gauge"
              height={48}
              style={{ height: 48, width: 'auto' }}
              className="mb-4"
              draggable={false}
            />
            <p className="text-sm text-muted-foreground text-center leading-relaxed max-w-[220px]">
              All your subscriptions.<br />No surprises.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {sent ? (
              /* ── Magic link sent ── */
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="text-center"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <CheckCircle className="h-7 w-7 text-primary" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Check your email</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Sign-in link sent to{' '}
                  <span className="font-medium text-foreground">{email}</span>
                </p>
                <Button
                  variant="ghost"
                  className="mt-6 text-muted-foreground"
                  onClick={() => { setSent(false); setEmail(''); setShowEmail(false); }}
                >
                  Wrong email? Start over
                </Button>
              </motion.div>

            ) : showEmail ? (
              /* ── Email form ── */
              <motion.form
                key="email"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                onSubmit={handleSubmit}
                className="space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-12 pl-11 rounded-xl border-border bg-card text-base"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-base fab-shadow hover:opacity-90 transition-opacity"
                >
                  {loading ? 'Sending…' : 'Send sign-in link'}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
                <button
                  type="button"
                  onClick={() => setShowEmail(false)}
                  className="w-full text-center text-sm text-muted-foreground pt-1"
                >
                  ← Back
                </button>
              </motion.form>

            ) : (
              /* ── Main options ── */
              <motion.div
                key="options"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                {/* Email sign-in */}
                <Button
                  onClick={() => setShowEmail(true)}
                  className="h-12 w-full rounded-xl bg-primary text-primary-foreground font-semibold text-[15px] fab-shadow hover:opacity-90 transition-opacity"
                >
                  <Mail className="mr-2 h-4 w-4" />
                  Sign in with email
                </Button>

                {/* Divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-xs text-muted-foreground">or</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                {/* Guest */}
                <Button
                  variant="outline"
                  onClick={continueAsGuest}
                  className="h-12 w-full rounded-xl border-border/80 bg-card font-semibold text-[15px] text-foreground hover:bg-muted transition-colors"
                >
                  <UserRound className="mr-2 h-4 w-4 text-muted-foreground" />
                  Try without signing in
                </Button>

                <p className="text-center text-[11px] text-muted-foreground leading-relaxed pt-1">
                  Your data stays on this device only.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
