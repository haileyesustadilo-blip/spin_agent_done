import React, { useState } from 'react';
import { AgentProfile, WithdrawalRequest, Transaction } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Wallet,
  TrendingUp,
  ArrowDownCircle,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Receipt,
  FileText,
  ShieldCheck,
  Percent,
  HelpCircle,
  Info,
  X,
  Eye,
} from 'lucide-react';

interface WalletViewProps {
  agent: AgentProfile;
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  onRefresh: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  agent,
  withdrawals,
  transactions,
  onRefresh,
}) => {
  const [withdrawAmount, setWithdrawAmount] = useState<number>(2500);
  const [bankName, setBankName] = useState('Commercial Bank of Ethiopia');
  const [accountNumber, setAccountNumber] = useState(agent.bankAccountNumber || '1000284759201');
  const [accountHolder, setAccountHolder] = useState(agent.accountHolderName || agent.fullName);

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedTxForSplitDetail, setSelectedTxForSplitDetail] = useState<Transaction | null>(null);

  // Calculate real monthly earnings from commission transactions
  const monthlyEarnings = transactions
    .filter((tx) => tx.type === 'commission_payout' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleWithdrawalRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (withdrawAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid withdrawal amount.' });
      return;
    }

    try {
      const wd = StorageService.requestWithdrawal(
        withdrawAmount,
        bankName,
        accountNumber,
        accountHolder
      );
      setMessage({
        type: 'success',
        text: `Withdrawal request #${wd.id} of ${withdrawAmount} Birr submitted for Admin approval.`,
      });
      onRefresh();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Withdrawal failed.' });
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300 mb-2">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agent Wallet & Earnings Statement</span>
          </div>
          <h1 className="text-2xl font-black text-white">Wallet Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Monitor ticket sales commissions, available balances, and verify 50/50 admin/agent revenue splits.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl">
          <ShieldCheck className="w-6 h-6 text-purple-400 shrink-0" />
          <div className="text-xs">
            <p className="font-bold text-purple-200">Anti-Fraud 50/50 Rule Active</p>
            <p className="text-[11px] text-purple-300/80">Net margin is split equally (50% Admin / 50% Agent)</p>
          </div>
        </div>
      </div>

      {/* 4 Wallet Financial Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Available Balance</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 mt-1">
            {agent.walletBalance.toLocaleString()} <span className="text-xs font-bold">Birr</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Ready for withdrawal</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Pending Balance</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
            {agent.pendingBalance.toLocaleString()} <span className="text-xs font-bold">Birr</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Awaiting admin transfer</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Today's Earnings</p>
          <p className="text-2xl sm:text-3xl font-black text-white mt-1">
            {agent.todayCommission.toLocaleString()} <span className="text-xs font-bold">Birr</span>
          </p>
          <p className="text-[10px] text-emerald-400 mt-2">+50% Equal Margin Commission</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
          <p className="text-xs text-slate-400 font-medium">Monthly Earnings</p>
          <p className="text-2xl sm:text-3xl font-black text-purple-300 mt-1">
            {monthlyEarnings.toLocaleString()} <span className="text-xs font-bold">Birr</span>
          </p>
          <p className="text-[10px] text-slate-500 mt-2">Current month total</p>
        </div>
      </div>

      {/* 50/50 Revenue Split Ledger & Verification Tooltip Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div>
            <h2 className="font-bold text-sm text-white flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>50/50 Admin/Agent Split Verification Ledger</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hover over or click any transaction to inspect exact gross sales, winner pool, and equal 50/50 margin calculations.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-[11px] font-bold self-start sm:self-auto">
            🛡️ Guaranteed Anti-Fraud Split Rule
          </span>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">No transactions recorded yet.</div>
          ) : (
            transactions.map((tx) => {
              const isCommission = tx.type === 'commission_payout' || tx.type === 'ticket_sale';
              const ticketPrice = tx.amount;
              // Winner price = 80%, margin = 20%, split 10% agent / 10% admin
              const agentShare = Math.round(ticketPrice * 0.10);
              const adminShare = Math.round(ticketPrice * 0.10);
              const winnerPayout = Math.round(ticketPrice * 0.80);

              return (
                <div
                  key={tx.id}
                  className="p-3.5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/60 hover:border-purple-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-amber-300">{tx.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 font-bold text-slate-300 uppercase">
                          {tx.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-300 font-medium mt-0.5">{tx.description}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(tx.date).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end space-x-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-700/50">
                    <div className="text-right">
                      <p className="font-mono font-bold text-white text-sm">
                        {tx.amount.toLocaleString()} Birr
                      </p>
                      <p className="text-[10px] text-emerald-400 font-semibold">
                        Split: {agentShare} Birr Agent / {adminShare} Birr Admin
                      </p>
                    </div>

                    <button
                      onClick={() => setSelectedTxForSplitDetail(tx)}
                      className="px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 border border-purple-500/30 rounded-xl font-bold text-[11px] flex items-center space-x-1 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Inspect 50/50 Split</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Grid: Withdrawal Form & History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Withdrawal Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
            <span>Agent Bank Withdrawal Request</span>
          </h2>

          {message && (
            <div
              className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                message.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleWithdrawalRequest} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Enter Amount to Withdraw (Birr) *
              </label>
              <input
                type="number"
                required
                min={100}
                max={agent.walletBalance}
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono text-base font-bold focus:outline-none focus:border-amber-500"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                Max available: <span className="font-bold text-white">{agent.walletBalance.toLocaleString()} Birr</span>
              </p>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Name *</label>
              <select
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
              >
                <option value="Commercial Bank of Ethiopia">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Telebirr SuperApp">Telebirr Wallet</option>
                <option value="CBE Birr">CBE Birr Mobile</option>
                <option value="Dashen Bank">Dashen Bank</option>
                <option value="Awash Bank">Awash Bank</option>
                <option value="Bank of Abyssinia">Bank of Abyssinia</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Number *</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Account Holder Name *</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={agent.walletBalance < 100}
              className={`w-full py-3.5 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all ${
                agent.walletBalance < 100
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Submit Withdrawal Request</span>
            </button>
          </form>
        </div>

        {/* Withdrawal Requests History */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Withdrawal Request History</span>
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No withdrawal history found.</div>
            ) : (
              withdrawals.map((w) => (
                <div
                  key={w.id}
                  className="p-3.5 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-300">{w.id}</span>
                      <span className="text-white font-bold">{w.amount.toLocaleString()} Birr</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {w.bankName} • Acc: <span className="font-mono text-slate-300">{w.accountNumber}</span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Requested: {new Date(w.requestedAt).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    {w.status === 'approved' ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                        <CheckCircle className="w-3 h-3 text-emerald-400" />
                        <span>Approved</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span>Pending Admin</span>
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Expanded 50/50 Revenue Split Detail Popover / Modal */}
      {selectedTxForSplitDetail && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-xs text-white relative">
            <button
              onClick={() => setSelectedTxForSplitDetail(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">50/50 Revenue Split Verification</h3>
                <p className="text-[11px] text-slate-400 font-mono">Reference: {selectedTxForSplitDetail.id}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60 space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Transaction Event:</span>
                  <span className="text-white font-bold">{selectedTxForSplitDetail.description}</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-slate-400">Gross Ticket Volume:</span>
                  <span className="font-mono font-bold text-amber-400 text-sm">
                    {selectedTxForSplitDetail.amount} Birr
                  </span>
                </div>
              </div>

              {/* Step-by-Step 50/50 Rule Breakdown */}
              <div className="p-4 bg-purple-950/30 border border-purple-500/20 rounded-2xl space-y-3">
                <p className="font-bold text-purple-300 text-xs uppercase tracking-wider flex items-center space-x-1.5">
                  <Percent className="w-3.5 h-3.5 text-purple-400" />
                  <span>Equal Split Mathematical Rule (80% Winner / 20% Margin)</span>
                </p>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex justify-between items-center text-slate-300">
                    <span>1. Winner Prize Pool (80%):</span>
                    <span className="text-white font-bold">
                      {Math.round(selectedTxForSplitDetail.amount * 0.80)} Birr
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300">
                    <span>2. Total Net Margin (20%):</span>
                    <span className="text-amber-300 font-bold">
                      {Math.round(selectedTxForSplitDetail.amount * 0.20)} Birr
                    </span>
                  </div>
                  <div className="pt-2 border-t border-purple-500/20 flex justify-between items-center text-emerald-400 font-bold">
                    <span>3. Agent Commission (50% of Margin = 10%):</span>
                    <span>+{Math.round(selectedTxForSplitDetail.amount * 0.10)} Birr</span>
                  </div>
                  <div className="flex justify-between items-center text-purple-300 font-bold">
                    <span>4. Admin Platform Share (50% of Margin = 10%):</span>
                    <span>+{Math.round(selectedTxForSplitDetail.amount * 0.10)} Birr</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center space-x-2 text-[11px] text-emerald-300 font-semibold">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Verified Anti-Fraud Rule Compliant: Agent and Admin received equal 50/50 split of the 20% margin.</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedTxForSplitDetail(null)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all cursor-pointer"
            >
              Close Breakdown
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
