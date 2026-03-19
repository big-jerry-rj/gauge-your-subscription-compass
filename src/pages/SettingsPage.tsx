import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { CURRENCIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Download, Moon, LogOut, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import GaugeLogo from '@/components/GaugeLogo';

export default function SettingsPage() {
  const { profile, updateProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { subscriptions } = useSubscriptions();

  const handleCurrencyChange = async (code: string) => {
    await updateProfile.mutateAsync({ preferred_currency: code });
    toast.success(`Currency changed to ${code}`);
  };

  const handleExport = () => {
    const data = JSON.stringify(subscriptions, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gauge-subscriptions-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Data exported');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
  };

  return (
    <div className="px-5 pb-28">
      {/* Page header */}
      <div className="pt-8 pb-6">
        <GaugeLogo height={50} className="mb-1" />
        <h1 className="text-[32px] font-black tracking-tight text-foreground leading-none">Account</h1>
      </div>

      <div className="space-y-3">
        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl border border-border/40">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-2xl bg-card p-5 card-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <UserCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-foreground truncate">{user?.email ?? '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Gauge account</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Currency */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="relative rounded-2xl border border-border/40">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-2xl bg-card p-5 card-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Currency</h3>
            <Select value={profile?.preferred_currency ?? 'EUR'} onValueChange={handleCurrencyChange}>
              <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(c => (
                  <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="relative rounded-2xl border border-border/40">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-2xl bg-card p-5 card-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Appearance</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">Dark Mode</span>
              </div>
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
            </div>
          </div>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.11 }}
          className="relative rounded-2xl border border-border/40">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-2xl bg-card p-5 card-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">Data</h3>
            <Button variant="outline" className="w-full rounded-xl" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Subscriptions
            </Button>
          </div>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}
          className="relative rounded-2xl border border-border/40">
          <GlowingEffect spread={40} glow={true} disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
          <div className="relative rounded-2xl bg-card p-5 card-shadow">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
            <p className="text-sm font-bold text-foreground">Gauge v1.0</p>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Privacy-first subscription tracking. No bank linking, fully manual, fully yours.
            </p>
          </div>
        </motion.div>

        {/* Sign out */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.17 }}>
          <Button
            variant="outline"
            className="w-full rounded-2xl h-12 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
