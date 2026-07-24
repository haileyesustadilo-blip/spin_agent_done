import React from 'react';
import { SystemNotification } from '../../types';
import { StorageService } from '../../services/storage';
import { Bell, Check, Ticket, TrendingUp, Trophy, Megaphone, DollarSign } from 'lucide-react';

interface NotificationsViewProps {
  notifications: SystemNotification[];
  onRefresh: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onRefresh,
}) => {
  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    StorageService.saveNotifications(updated);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-xs font-bold text-rose-300 mb-2">
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Agent System Alerts</span>
          </div>
          <h1 className="text-2xl font-black text-white">Agent Notifications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time notifications for ticket sales, commission earnings, winners, and admin announcements.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center space-x-1.5"
        >
          <Check className="w-4 h-4" />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs">No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`p-4 rounded-2xl border transition-all ${
                !n.read
                  ? 'bg-amber-500/10 border-amber-500/30 ring-1 ring-amber-500/20'
                  : 'bg-slate-800/60 border-slate-700/60'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-amber-300">{n.title}</span>
                <span className="text-[10px] text-slate-400">
                  {new Date(n.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-200">{n.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
