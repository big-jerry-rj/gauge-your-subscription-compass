import { useState } from "react";
import BottomNav from "@/components/layout/BottomNav";
import FAB from "@/components/layout/FAB";
import AnimatedBackground from "@/components/layout/AnimatedBackground";
import AddSubscriptionSheet from "@/components/subscriptions/AddSubscriptionSheet";
import GaugeLogo from "@/components/GaugeLogo";
import SubscriptionsPage from "./SubscriptionsPage";
import InsightsPage from "./InsightsPage";
import CalendarPage from "./CalendarPage";
import SettingsPage from "./SettingsPage";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const [activeTab, setActiveTab] = useState("subscriptions");
  const [showAdd, setShowAdd] = useState(false);

  const renderPage = () => {
    switch (activeTab) {
      case "subscriptions":
        return <SubscriptionsPage />;
      case "insights":
        return <InsightsPage />;
      case "calendar":
        return <CalendarPage />;
      case "settings":
        return <SettingsPage />;
      default:
        return <SubscriptionsPage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Floating glow background */}
      <AnimatedBackground />

      <div className="relative z-10 mx-auto max-w-lg">
        {/* Header with logo */}
        <div className="flex items-center justify-center px-5 pb-2 safe-top" style={{ paddingTop: 'max(20px, calc(env(safe-area-inset-top) + 8px))' }}>
          <GaugeLogo height={40} />
        </div>

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
