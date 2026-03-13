import { LayoutList, BarChart3, Calendar, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'subscriptions', label: 'Subs', icon: LayoutList },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 1.5} fill={isActive ? "currentColor" : "none"} />
              <span className="text-[10px] font-medium uppercase tracking-wider">{tab.label}</span>
              {isActive && (
                <div className="mt-0.5 h-1 w-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
