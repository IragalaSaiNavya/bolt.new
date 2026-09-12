import type { LucideIcon } from 'lucide-react';
import { ShieldCheck, Upload } from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon?: LucideIcon;
}

export function Navbar({ onNavigate }: { onNavigate: (section: string) => void }) {
  const items: NavItem[] = [
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'requests', label: 'Decisions' },
    { id: 'architecture', label: 'Architecture' },
    { id: 'output', label: 'Output' },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <button onClick={() => onNavigate('hero')} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Buy or Wait?</span>
        </button>

        <div className="flex items-center gap-1">
          {items.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
