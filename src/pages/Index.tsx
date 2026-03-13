import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import BottomNav from '@/components/layout/BottomNav';
import FAB from '@/components/layout/FAB';
import AddSubscriptionSheet from '@/components/subscriptions/AddSubscriptionSheet';
import SubscriptionsPage from './SubscriptionsPage';
import InsightsPage from './InsightsPage';
import CalendarPage from './CalendarPage';
import SettingsPage from './SettingsPage';
import Auth from './Auth';
import { motion, AnimatePresence } from 'framer-motion';

export default function Index() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('subscriptions');
  const [showAdd, setShowAdd] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 rounded-2xl gradient-primary fab-shadow animate-pulse" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Auth />;

  const renderPage = () => {
    switch (activeTab) {
      case 'subscriptions': return <SubscriptionsPage />;
      case 'insights': return <InsightsPage />;
      case 'calendar': return <CalendarPage />;
      case 'settings': return <SettingsPage />;
      default: return <SubscriptionsPage />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-lg">
        {/* Safe area top padding */}
        <div className="h-12" />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      <FAB onClick={() => setShowAdd(true)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <AddSubscriptionSheet open={showAdd} onOpenChange={setShowAdd} />
    </div>
  );
}
