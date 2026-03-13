import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { CURRENCIES } from '@/lib/constants';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Download, Upload, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useRef } from 'react';

export default function SettingsPage() {
  const { profile, updateProfile } = useProfile();
  const { signOut, user } = useAuth();
  const { subscriptions, importSubscriptions } = useSubscriptions();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (Array.isArray(data)) {
          importSubscriptions(data);
          toast.success(`Imported ${data.length} subscriptions`);
        }
      } catch {
        toast.error('Invalid file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="px-5 pb-24 pt-12">
      <h1 className="mb-5 text-[32px] font-black tracking-tight text-[#0F172A]">Settings</h1>

      <div className="space-y-4">
        {/* Currency */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-[16px] card-elevated p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Currency</h3>
          <Select value={profile?.preferred_currency ?? 'EUR'} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="rounded-xl bg-white"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CURRENCIES.map(c => (
                <SelectItem key={c.code} value={c.code}>{c.symbol} {c.name} ({c.code})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-[16px] card-elevated p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Data</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full rounded-xl border-gray-200" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> Export Subscriptions
            </Button>
            <Button variant="outline" className="w-full rounded-xl border-gray-200" onClick={handleImport}>
              <Upload className="mr-2 h-4 w-4" /> Import Subscriptions
            </Button>
            <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleFileChange} />
          </div>
        </motion.div>

        {/* Account */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-[16px] card-elevated p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">Account</h3>
          {user?.email && (
            <p className="text-sm text-[#0F172A] mb-3">{user.email}</p>
          )}
          <Button
            variant="outline"
            className="w-full rounded-xl border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </motion.div>

        {/* About */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="rounded-[16px] card-elevated p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-3">About</h3>
          <p className="text-sm font-semibold text-[#0F172A]">Gauge v1.0</p>
          <p className="text-xs text-[#64748B] mt-1">Privacy-first subscription tracking. No bank linking, fully manual, fully yours.</p>
        </motion.div>
      </div>
    </div>
  );
}
