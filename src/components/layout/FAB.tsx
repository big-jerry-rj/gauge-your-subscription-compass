import { Plus } from 'lucide-react';

interface FABProps {
  onClick: () => void;
}

export default function FAB({ onClick }: FABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full gradient-primary fab-shadow transition-transform duration-200 hover:scale-105 active:scale-95"
      aria-label="Add subscription"
    >
      <Plus className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
    </button>
  );
}
