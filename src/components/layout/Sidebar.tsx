import React from 'react';
import {
  LayoutDashboard,
  Ticket,
  Dices,
  Globe,
  QrCode,
  CheckCircle,
  Wallet,
  TrendingUp,
  Receipt,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  ChevronRight,
  ShieldAlert,
  Users,
  RotateCw,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onLogout: () => void;
  isApproved: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  onLogout,
  isApproved,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sell-tickets', label: 'Sell Tickets', icon: Ticket },
    { id: 'solo-games', label: 'Solo Games', icon: Dices },
    { id: 'multi-games', label: 'Multi Game Spin', icon: RotateCw, highlight: true },
    { id: 'universal-games', label: 'Universal Games', icon: Globe },
    { id: 'verify-winners', label: 'Verify Winners & QR', icon: QrCode, highlight: true },
    { id: 'wallet', label: 'Wallet & Earnings', icon: Wallet },
    { id: 'reports', label: 'Commission Reports', icon: TrendingUp },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'support', label: 'Player Support', icon: HelpCircle },
    { id: 'settings', label: 'Agent Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#16191F] border-r border-slate-800 text-slate-300 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-5rem)] p-4 shrink-0">
      {/* Upper Navigation Links */}
      <div className="space-y-1">
        {!isApproved && (
          <div className="mb-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Pending Admin Approval</p>
              <p className="text-[11px] text-amber-200/80 mt-0.5">
                Ticket selling features unlocked upon approval. Use Admin Sandbox to approve!
              </p>
            </div>
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-xs transition-all font-medium ${
                isActive
                  ? 'bg-slate-800 text-white font-bold'
                  : item.highlight
                  ? 'hover:bg-slate-800 hover:text-white text-amber-400'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-emerald-400' : item.highlight ? 'text-amber-400' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
            </button>
          );
        })}
      </div>

      {/* Bottom Logout & Info */}
      <div className="pt-3 border-t border-slate-800 space-y-3">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-colors"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Logout</span>
        </button>

        <div className="p-4 bg-[#0F1115] rounded-xl border border-slate-800 text-[10px] text-slate-500 text-center font-mono">
          <p className="font-semibold text-slate-400">Spain Game Agent v2.4</p>
          <p>QR & 17-Digit Verification</p>
        </div>
      </div>
    </aside>
  );
};
