import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTheme } from '@/hooks/useTheme';
import { CURRENCIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { LogOut, Download, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { theme, toggleTheme } = useTheme();
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
    toast.success('Data exported successfully');
  };

  return (
    <div className="px-5 pb-24 pt-2">
      <h1 className="mb-5 text-[28px] font-black tracking-tight text-foreground">Settings</h1>

      <div className="space-y-4">
        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card p-5 card-shadow">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Account</h3>
          <p className="text-sm text-foreground">{user?.email}</p>
        </motion.div>

        {/* Currency */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl bg-card p-5 card-shadow">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Currency</h3>
          <Select value={profile?.preferred_currency ?? 'EUR'} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl bg-card p-5 card-shadow">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Appearance</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-2xl bg-card p-5 card-shadow">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Data</h3>
          <Button variant="outline" className="w-full rounded-xl" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export Subscriptions
          </Button>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-2xl bg-card p-5 card-shadow">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">About</h3>
          <p className="text-sm text-foreground font-semibold">Gauge v1.0</p>
          <p className="text-xs text-muted-foreground mt-1">Privacy-first subscription tracking. No bank linking, fully manual, fully yours.</p>
        </motion.div>

        {/* Sign Out */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Button variant="ghost" className="w-full rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
