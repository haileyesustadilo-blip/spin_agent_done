import React, { useState } from 'react';
import { Ticket } from '../../types';
import { TicketCard } from '../tickets/TicketCard';
import { HelpCircle, Search, Smartphone, Printer, ShieldCheck, User } from 'lucide-react';

interface PlayerSupportViewProps {
  tickets: Ticket[];
}

export const PlayerSupportView: React.FC<PlayerSupportViewProps> = ({ tickets }) => {
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [smsSentNotice, setSmsSentNotice] = useState('');

  const searchResults = tickets.filter(
    (t) =>
      t.playerPhone.includes(searchPhone) ||
      t.playerName.toLowerCase().includes(searchPhone.toLowerCase()) ||
      t.id.toLowerCase().includes(searchPhone.toLowerCase())
  );

  const handleResendSMS = (t: Ticket) => {
    setSmsSentNotice(`SMS ticket link and 17-digit ID (${t.seventeenDigitId}) resent to ${t.playerPhone}!`);
    setTimeout(() => setSmsSentNotice(''), 4000);
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold text-cyan-300 mb-2">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>Customer Assistant Tool</span>
        </div>
        <h1 className="text-2xl font-black text-white">Player Support Counter</h1>
        <p className="text-xs text-slate-400 mt-1">
          Assist players in looking up purchased tickets, re-sending SMS receipts, and re-printing ticket stubs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Search Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <Search className="w-4 h-4 text-amber-400" />
            <span>Search Player Tickets</span>
          </h2>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="Enter player phone (+2519...), name, or Ticket ID..."
              className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {smsSentNotice && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-bold flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>{smsSentNotice}</span>
            </div>
          )}

          <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
            {searchResults.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">No matching tickets found.</div>
            ) : (
              searchResults.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicket(t)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    selectedTicket?.id === t.id
                      ? 'bg-amber-500/10 border-amber-500'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono font-bold text-amber-300">{t.id}</span> •{' '}
                      <span className="font-bold text-white">{t.playerName}</span>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{t.playerPhone}</p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleResendSMS(t);
                        }}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg text-[10px] font-bold"
                      >
                        Resend SMS
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Selected Ticket Preview & Reprint */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-white mb-4">Ticket Preview & Customer Actions</h2>

            {selectedTicket ? (
              <div className="space-y-4">
                <TicketCard ticket={selectedTicket} onPrint={() => window.print()} />

                <button
                  onClick={() => handleResendSMS(selectedTicket)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2"
                >
                  <Smartphone className="w-4 h-4 text-amber-400" />
                  <span>Resend Ticket Receipt SMS to {selectedTicket.playerPhone}</span>
                </button>
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 text-xs">
                Select a ticket from search results to preview customer stub and perform actions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
