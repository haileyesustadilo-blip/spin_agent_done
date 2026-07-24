import React, { useState } from 'react';
import { AuditLog } from '../../types';
import {
  ShieldCheck,
  Search,
  Lock,
  Ticket,
  ArrowUpRight,
  RotateCw,
  Trophy,
  PlusCircle,
  Key,
  Clock,
  Filter,
  FileText,
  X,
} from 'lucide-react';

interface AuditLogsWidgetProps {
  auditLogs: AuditLog[];
}

export const AuditLogsWidget: React.FC<AuditLogsWidgetProps> = ({ auditLogs }) => {
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'sales' | 'games' | 'withdrawals' | 'claims'>('all');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Helper to format relative time or formatted string
  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  // Helper for badge colors and icons
  const getActionMeta = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes('SELL') || act.includes('TICKET')) {
      return {
        label: 'TICKET SALE',
        badgeClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
        icon: Ticket,
        category: 'sales',
      };
    }
    if (act.includes('WITHDRAWAL')) {
      return {
        label: 'WITHDRAWAL',
        badgeClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
        icon: ArrowUpRight,
        category: 'withdrawals',
      };
    }
    if (act.includes('CLAIM') || act.includes('PRIZE')) {
      return {
        label: 'PRIZE PAYOUT',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        icon: Trophy,
        category: 'claims',
      };
    }
    if (act.includes('LOCK')) {
      return {
        label: 'TICKETS LOCKED',
        badgeClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
        icon: Lock,
        category: 'games',
      };
    }
    if (act.includes('CONCLUDE') || act.includes('START') || act.includes('SPIN')) {
      return {
        label: 'GAME SPIN',
        badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        icon: RotateCw,
        category: 'games',
      };
    }
    if (act.includes('CREATE')) {
      return {
        label: 'ROOM CREATED',
        badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
        icon: PlusCircle,
        category: 'games',
      };
    }
    return {
      label: 'SECURITY EVENT',
      badgeClass: 'bg-slate-800 text-slate-300 border-slate-700',
      icon: Key,
      category: 'other',
    };
  };

  // Filter logs
  const filteredLogs = auditLogs
    .filter((log) => {
      const meta = getActionMeta(log.action);
      if (categoryFilter !== 'all' && meta.category !== categoryFilter) return false;
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        return (
          log.action.toLowerCase().includes(query) ||
          log.details.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query)
        );
      }
      return true;
    })
    .slice(0, 10); // Strictly list the last 10 security-critical events

  return (
    <div className="bg-[#16191F] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Tamper-Proof Audit Trail</span>
          </div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <span>Security Audit Logs</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono font-medium">
              Top 10 Events
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time security surveillance tracking ticket sales, game starts, prize disbursements & withdrawals.
          </p>
        </div>

        {/* Status Security Badge */}
        <div className="flex items-center space-x-2 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 self-start sm:self-center">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <div className="text-[10px] font-mono">
            <span className="text-slate-400">Agent: </span>
            <span className="text-white font-bold">AG-8820</span>
            <span className="text-slate-500 mx-1">|</span>
            <span className="text-emerald-400 font-semibold">Protected</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'sales', label: 'Ticket Sales' },
            { id: 'games', label: 'Game Starts' },
            { id: 'withdrawals', label: 'Withdrawals' },
            { id: 'claims', label: 'Prize Claims' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === tab.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-60">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search audit logs..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
          />
        </div>
      </div>

      {/* Audit Log Entries List */}
      <div className="space-y-2.5">
        {filteredLogs.length === 0 ? (
          <div className="py-10 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-500 text-xs">
            No audit log records matching the filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const meta = getActionMeta(log.action);
            const IconComponent = meta.icon;

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className="p-3.5 bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer group"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-xl border ${meta.badgeClass} shrink-0 mt-0.5`}>
                    <IconComponent className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${meta.badgeClass}`}
                      >
                        {meta.label}
                      </span>
                      <span className="font-mono text-[10px] text-slate-500 font-bold">{log.id}</span>
                    </div>

                    <p className="text-xs text-slate-200 font-medium mt-1 group-hover:text-white transition-colors">
                      {log.details}
                    </p>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between text-[11px] text-slate-500 shrink-0 border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0 font-mono">
                  <div className="flex items-center space-x-1 text-slate-400 font-semibold">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{formatTimeAgo(log.timestamp)}</span>
                  </div>
                  <span className="text-[10px] text-slate-500">IP: {log.ipAddress || '197.156.120.44'}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-4 relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-base">Security Audit Record Inspector</h3>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 font-mono">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Log ID:</span>
                <span className="font-bold text-amber-400">{selectedLog.id}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Action Code:</span>
                <span className="font-bold text-purple-300">{selectedLog.action}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Agent ID:</span>
                <span className="text-slate-200">{selectedLog.agentId}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">IP Address:</span>
                <span className="text-slate-200">{selectedLog.ipAddress || '197.156.120.44'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-500">Timestamp:</span>
                <span className="text-slate-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
              </div>
              <div className="pt-2">
                <span className="text-slate-500 block mb-1">Audit Details:</span>
                <p className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-sans text-xs">
                  {selectedLog.details}
                </p>
              </div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
