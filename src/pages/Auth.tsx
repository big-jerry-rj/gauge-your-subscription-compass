import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, CheckCircle } from 'lucide-react';

export default function Auth() {
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary fab-shadow">
            <span className="text-2xl font-black text-primary-foreground">G</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Gauge</h1>
          <p className="mt-2 text-muted-foreground">Track your subscriptions, privately.</p>
        </div>

        {sent ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <CheckCircle className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Check your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We sent a magic link to <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button
              variant="ghost"
              className="mt-6"
              onClick={() => { setSent(false); setEmail(''); }}
            >
              Use a different email
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="h-12 pl-11 text-base rounded-xl border-border bg-card"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              type="submit"
              disabled={loading || !email}
              className="h-12 w-full rounded-xl gradient-primary text-primary-foreground font-semibold text-base fab-shadow hover:opacity-90 transition-opacity"
            >
              {loading ? 'Sending...' : 'Continue with Magic Link'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              No password needed. We'll email you a secure login link.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
}
