import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { prefetchAndNotify } from "@/lib/itunesIcons";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import AddSubscriptionSheet from "@/components/subscriptions/AddSubscriptionSheet";
import SubscriptionsPage from "./SubscriptionsPage";
import InsightsPage from "./InsightsPage";
import CalendarPage from "./CalendarPage";
import SettingsPage from "./SettingsPage";
import Auth from "./Auth";
import { motion, AnimatePresence } from "framer-motion";
import { Subscription } from "@/hooks/useSubscriptions";

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [showAdd, setShowAdd] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);

  // Kick off App Store icon prefetch in the background — results are cached in
  // localStorage and immediately available on subsequent visits
  useEffect(() => { prefetchAndNotify(); }, []);

  // Show nothing while Supabase checks existing session
  if (loading) {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <AnimatedBackground />
      </div>
    );
  }

  // Not signed in and not a guest — show auth screen
  if (!isAuthenticated) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case "subscriptions":
        return <SubscriptionsPage onAdd={() => setShowAdd(true)} onEdit={sub => setEditingSub(sub)} />;
      case "insights":
        return <InsightsPage />;
      case "calendar":
        return <CalendarPage />;
      case "account":
        return <SettingsPage />;
      default:
        return <SubscriptionsPage onAdd={() => setShowAdd(true)} onEdit={sub => setEditingSub(sub)} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-lg">
        <div style={{ height: 'env(safe-area-inset-top, 0px)' }} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.18 }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </div>

      <FAB onClick={() => setShowAdd(true)} />
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
      <AddSubscriptionSheet open={showAdd} onOpenChange={setShowAdd} />
      <AddSubscriptionSheet
        open={!!editingSub}
        onOpenChange={open => !open && setEditingSub(null)}
        subscriptionToEdit={editingSub}
      />
    </div>
  );
}
