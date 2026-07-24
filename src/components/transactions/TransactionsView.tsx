import React, { useState } from 'react';
import { Transaction } from '../../types';
import { Receipt, Search, Filter, CheckCircle, ArrowDownLeft, ArrowUpRight, Calendar, X } from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({ transactions }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filtered = transactions.filter((tx) => {
    const q = searchQuery.trim().toLowerCase();

    // Date formatting helper strings for flexible matching
    const txDateObj = new Date(tx.date);
    const dateFormattedLocal = txDateObj.toLocaleString().toLowerCase();
    const dateFormattedIso = txDateObj.toISOString().toLowerCase();
    const dateFormattedDateOnly = txDateObj.toLocaleDateString().toLowerCase();

    // Check query against ticket ID, transaction ID, reference ID, description, or date text
    const matchesSearch =
      !q ||
      tx.id.toLowerCase().includes(q) ||
      tx.description.toLowerCase().includes(q) ||
      (tx.referenceId && tx.referenceId.toLowerCase().includes(q)) ||
      dateFormattedLocal.includes(q) ||
      dateFormattedIso.includes(q) ||
      dateFormattedDateOnly.includes(q);

    // Check explicit date picker filter if set
    let matchesDate = true;
    if (filterDate) {
      const txYMD = txDateObj.toISOString().split('T')[0];
      const localYMD = `${txDateObj.getFullYear()}-${String(txDateObj.getMonth() + 1).padStart(2, '0')}-${String(
        txDateObj.getDate()
      ).padStart(2, '0')}`;
      matchesDate = txYMD === filterDate || localYMD === filterDate;
    }

    const matchesFilter = filterType === 'all' || tx.type === filterType;

    return matchesSearch && matchesDate && matchesFilter;
  });

  const clearAllFilters = () => {
    setSearchQuery('');
    setFilterDate('');
    setFilterType('all');
  };

  const hasActiveFilters = searchQuery !== '' || filterDate !== '' || filterType !== 'all';

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-xs font-bold text-teal-300 mb-2">
          <Receipt className="w-3.5 h-3.5 text-teal-400" />
          <span>Permanent Financial & Audit Logs</span>
        </div>
        <h1 className="text-2xl font-black text-white">Agent Transactions History</h1>
        <p className="text-xs text-slate-400 mt-1">
          Every ticket sale, commission payout, solo game creation, and bank withdrawal is logged permanently.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-slate-900 p-4 border border-slate-800 rounded-2xl text-xs">
        <div className="flex flex-col sm:flex-row items-center gap-3 flex-1">
          {/* Search Input for Ticket ID / Reference / Description / Date */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by Ticket ID, Ref, or Date..."
              className="w-full pl-9 pr-8 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Specific Date Picker Input */}
          <div className="relative w-full sm:w-auto flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 w-full sm:w-auto">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none text-xs cursor-pointer"
                title="Select Specific Date"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-slate-400 hover:text-white ml-1"
                  title="Clear Date"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full lg:w-auto justify-between lg:justify-end">
          {/* Filter Type */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="all">All Types</option>
              <option value="ticket_sale">Ticket Sales</option>
              <option value="commission_payout">Commission Payouts</option>
              <option value="withdrawal">Withdrawals</option>
              <option value="prize_disbursement">Prize Disbursements</option>
            </select>
          </div>

          {/* Reset button if filters active */}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 underline px-1 shrink-0"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-semibold text-slate-400">
          <span>
            Showing {filtered.length} of {transactions.length} transactions
          </span>
          {hasActiveFilters && (
            <span className="text-amber-400/90 font-mono text-[11px]">Filtered view</span>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs space-y-2">
            <p className="font-semibold text-slate-400">No matching transactions found.</p>
            <p>Try adjusting your search by ticket ID, transaction reference, or date picker.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="mt-2 px-3 py-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl hover:bg-amber-500/20 font-bold cursor-pointer"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          filtered.map((tx) => {
            const isCredit = tx.type === 'commission_payout' || tx.type === 'ticket_sale';

            return (
              <div
                key={tx.id}
                className="p-4 bg-slate-800/60 rounded-2xl border border-slate-700/60 flex items-center justify-between text-xs hover:border-slate-600 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      isCredit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-amber-300">{tx.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-slate-700 text-slate-300">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-semibold text-white mt-0.5">{tx.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(tx.date).toLocaleString()} • Ref: <span className="font-mono font-bold text-slate-300">{tx.referenceId || 'N/A'}</span>
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`font-black text-sm ${
                      isCredit ? 'text-emerald-400' : 'text-slate-300'
                    }`}
                  >
                    {isCredit ? '+' : '-'}{tx.amount.toLocaleString()} Birr
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-end space-x-1">
                    <CheckCircle className="w-3 h-3 text-emerald-400" />
                    <span>{tx.status}</span>
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

