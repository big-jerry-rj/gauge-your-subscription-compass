import { LayoutList, BarChart3, Calendar, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const leftTabs = [
  { id: 'subscriptions', label: 'Subs', icon: LayoutList },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
];

const rightTabs = [
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'account', label: 'Account', icon: UserCircle },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const renderTab = (tab: typeof leftTabs[number]) => {
    const isActive = activeTab === tab.id;
    const Icon = tab.icon;
    return (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={cn(
          "flex flex-col items-center gap-1 px-3 py-2 transition-all duration-200 active:scale-95",
          isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <div className={cn(
          "flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200",
          isActive ? "bg-primary/[0.15]" : "hover:bg-muted/60"
        )}>
          <Icon className="h-[19px] w-[19px]" strokeWidth={isActive ? 2.5 : 1.8} />
        </div>
        <span className={cn(
          "text-[10px] font-semibold tracking-wide",
          isActive ? "text-primary" : "text-muted-foreground"
        )}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 nav-glass safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {leftTabs.map(renderTab)}
        <div className="w-14" />
        {rightTabs.map(renderTab)}
      </div>
    </nav>
  );
}
