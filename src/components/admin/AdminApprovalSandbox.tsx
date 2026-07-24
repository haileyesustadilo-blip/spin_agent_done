import React, { useState } from 'react';
import { AgentProfile, WithdrawalRequest, AuditLog } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Sliders,
  X,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Building,
  User,
  Clock,
  FileText,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface AdminApprovalSandboxProps {
  isOpen: boolean;
  activeAgent: AgentProfile;
  allAgents: AgentProfile[];
  withdrawals: WithdrawalRequest[];
  auditLogs: AuditLog[];
  onClose: () => void;
  onRefresh: () => void;
}

export const AdminApprovalSandbox: React.FC<AdminApprovalSandboxProps> = ({
  isOpen,
  activeAgent,
  allAgents,
  withdrawals,
  auditLogs,
  onClose,
  onRefresh,
}) => {
  const [tab, setTab] = useState<'agents' | 'withdrawals' | 'audit'>('agents');

  if (!isOpen) return null;

  const handleApproveAgent = (agentId: string) => {
    const agents = StorageService.getAllAgents();
    const found = agents.find((a) => a.id === agentId);
    if (found) {
      found.status = 'approved';
      StorageService.saveAllAgents(agents);

      // If active agent is updated
      if (activeAgent.id === agentId) {
        const cur = StorageService.getAgent();
        cur.status = 'approved';
        StorageService.saveAgent(cur);
      }

      StorageService.addAuditLog('ADMIN_APPROVE_AGENT', `Admin activated agent account ${agentId} (${found.fullName})`);
      onRefresh();
    }
  };

  const handleRejectAgent = (agentId: string) => {
    const agents = StorageService.getAllAgents();
    const found = agents.find((a) => a.id === agentId);
    if (found) {
      found.status = 'rejected';
      StorageService.saveAllAgents(agents);

      if (activeAgent.id === agentId) {
        const cur = StorageService.getAgent();
        cur.status = 'rejected';
        StorageService.saveAgent(cur);
      }

      StorageService.addAuditLog('ADMIN_REJECT_AGENT', `Admin rejected agent account ${agentId}`);
      onRefresh();
    }
  };

  const handleApproveWithdrawal = (withdrawalId: string) => {
    StorageService.adminApproveWithdrawal(withdrawalId);
    onRefresh();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2.5 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">Spain Game Admin Approval Sandbox</h2>
            <p className="text-xs text-slate-400">
              Simulate Spain Game Admin actions: approve pending agents, approve bank payouts, view audit logs.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex space-x-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6 text-xs font-bold">
          <button
            onClick={() => setTab('agents')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'agents' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Agents ({allAgents.filter((a) => a.status === 'pending').length})
          </button>

          <button
            onClick={() => setTab('withdrawals')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'withdrawals' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pending Withdrawals ({withdrawals.filter((w) => w.status === 'pending').length})
          </button>

          <button
            onClick={() => setTab('audit')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              tab === 'audit' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            System Audit Logs
          </button>
        </div>

        {/* Tab Content 1: Agents */}
        {tab === 'agents' && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {allAgents.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No agent applications registered.</div>
            ) : (
              allAgents.map((ag) => (
                <div
                  key={ag.id}
                  className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-white">{ag.fullName}</span>
                      <span className="font-mono text-[10px] text-amber-300">({ag.id})</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          ag.status === 'approved'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : ag.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {ag.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Phone: <span className="font-mono text-white">{ag.phone}</span> • Email: {ag.email}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Bank: {ag.bankAccountNumber} ({ag.accountHolderName})
                    </p>
                  </div>

                  {ag.status === 'pending' ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproveAgent(ag.id)}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve Agent</span>
                      </button>
                      <button
                        onClick={() => handleRejectAgent(ag.id)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-xs font-bold"
                      >
                        Reject
                      </button>
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-500 font-bold uppercase">
                      Status: {ag.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 2: Withdrawals */}
        {tab === 'withdrawals' && (
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No bank withdrawals found.</div>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-300">{w.id}</span>
                      <span className="font-bold text-emerald-400 text-sm">
                        {w.amount.toLocaleString()} Birr
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Agent: <span className="font-bold">{w.agentName}</span> ({w.agentId})
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Bank: {w.bankName} • Acc: <span className="font-mono text-white">{w.accountNumber}</span> ({w.accountHolder})
                    </p>
                  </div>

                  {w.status === 'pending' ? (
                    <button
                      onClick={() => handleApproveWithdrawal(w.id)}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-1"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve Bank Transfer</span>
                    </button>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Transfer Approved
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 3: Audit Logs */}
        {tab === 'audit' && (
          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[11px] flex items-center justify-between font-mono"
              >
                <div>
                  <span className="text-amber-400 font-bold">{log.action}</span> •{' '}
                  <span className="text-slate-300">{log.details}</span>
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Agent: {log.agentId} • IP: {log.ipAddress}
                  </p>
                </div>
                <span className="text-[10px] text-slate-500">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
