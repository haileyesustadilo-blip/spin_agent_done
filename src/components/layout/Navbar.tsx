import React, { useState } from 'react';
import { AgentProfile, SystemNotification } from '../../types';
import {
  ShieldCheck,
  Wallet,
  Bell,
  User,
  Settings,
  LogOut,
  Sliders,
  CheckCircle,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

interface NavbarProps {
  agent: AgentProfile;
  notifications: SystemNotification[];
  onNavigate: (tab: string) => void;
  onOpenAdminSandbox: () => void;
  onLogout: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  agent,
  notifications,
  onNavigate,
  onOpenAdminSandbox,
  onLogout,
  onResetData,
}) => {
  const [showNotificationsMenu, setShowNotificationsMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#0F1115] border-b border-slate-800 text-slate-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand & Status */}
        <div className="flex items-center space-x-4">
          <div
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-[#0F1115] text-lg shadow-sm group-hover:scale-105 transition-transform">
              S
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-bold tracking-tight text-white">
                  SPAIN GAME
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                  AGENT
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Ticket Seller & Solo Operator</p>
            </div>
          </div>

          {/* Account Status Badge */}
          <div className="hidden md:flex items-center ml-4 pl-4 border-l border-slate-800">
            {agent.status === 'approved' ? (
              <div className="flex items-center gap-2 bg-[#16191F] border border-slate-800 px-3 py-1.5 rounded-full text-xs font-medium text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Online</span>
              </div>
            ) : agent.status === 'pending' ? (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Waiting Admin Approval</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <span>Status: {agent.status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Action Icons & Controls */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Admin Approval Sandbox Toggle Button */}
          <button
            onClick={onOpenAdminSandbox}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition-all shadow-sm"
            title="Open Admin Sandbox to manage agent approval & withdrawals"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Admin Sandbox</span>
          </button>

          {/* Wallet Balance Pill */}
          <div
            onClick={() => onNavigate('wallet')}
            className="flex items-center space-x-2.5 bg-[#16191F] hover:bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-800 cursor-pointer transition-all"
          >
            <div className="p-1 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Wallet</p>
              <p className="text-xs font-bold text-emerald-400">
                {agent.walletBalance.toLocaleString()} ETB
              </p>
            </div>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotificationsMenu(!showNotificationsMenu);
                setShowProfileMenu(false);
              }}
              className="relative p-2.5 rounded-xl bg-[#16191F] hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotificationsMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#16191F] border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
                <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-sm text-white">Notifications</span>
                  </div>
                  <button
                    onClick={() => onNavigate('notifications')}
                    className="text-xs text-amber-400 hover:underline font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">No notifications</div>
                  ) : (
                    notifications.slice(0, 5).map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          setShowNotificationsMenu(false);
                          onNavigate('notifications');
                        }}
                        className={`p-3 text-xs hover:bg-slate-800/50 cursor-pointer transition-colors ${
                          !n.read ? 'bg-amber-500/5' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-300">{n.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        <p className="text-slate-300 line-clamp-2">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Agent Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfileMenu(!showProfileMenu);
                setShowNotificationsMenu(false);
              }}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center font-bold text-white ring-2 ring-emerald-500 ring-offset-2 ring-offset-[#0F1115] overflow-hidden">
                {agent.profilePicUrl ? (
                  <img
                    src={agent.profilePicUrl}
                    alt={agent.fullName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{agent.fullName.charAt(0)}</span>
                )}
              </div>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-[#16191F] border border-slate-800 rounded-2xl shadow-2xl z-50 p-2 text-xs">
                <div className="p-3 border-b border-slate-800 mb-1">
                  <p className="font-bold text-white text-sm">{agent.fullName}</p>
                  <p className="text-slate-400 font-medium">{agent.phone}</p>
                  <p className="text-[10px] text-amber-400 font-mono mt-1">ID: {agent.id}</p>
                </div>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onNavigate('settings');
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Agent Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onResetData();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 text-slate-300 flex items-center space-x-2 transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-slate-400" />
                  <span>Reset Demo Data</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-500/10 text-rose-400 flex items-center space-x-2 transition-colors mt-1"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
