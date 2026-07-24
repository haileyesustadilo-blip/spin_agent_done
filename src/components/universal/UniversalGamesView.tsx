import React from 'react';
import { UniversalGame, AgentProfile, Ticket as TicketType } from '../../types';
import { Globe, Ticket, Trophy, Clock, Lock, Sparkles, TrendingUp } from 'lucide-react';

interface UniversalGamesViewProps {
  agent: AgentProfile;
  universalGames: UniversalGame[];
  tickets?: TicketType[];
  onOpenSellTicketModal: (gameType: string) => void;
}

export const UniversalGamesView: React.FC<UniversalGamesViewProps> = ({
  agent,
  universalGames,
  tickets = [],
  onOpenSellTicketModal,
}) => {
  return (
    <div className="space-y-6 text-white pb-10">
      {/* Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-bold text-blue-300 mb-2">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>Admin Managed Universal Draws</span>
          </div>
          <h1 className="text-2xl font-black text-white">Universal Games Portal</h1>
          <p className="text-xs text-slate-400 mt-1">
            Agents earn <span className="text-emerald-400 font-bold">10% commission</span> per Universal ticket sold. (100 Birr Ticket = 10 Birr Agent Commission).
          </p>
        </div>

        <button
          onClick={() => onOpenSellTicketModal('universal')}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center space-x-2"
        >
          <Ticket className="w-4 h-4" />
          <span>Sell Universal Ticket</span>
        </button>
      </div>

      {/* Rules Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-1">
        <p className="font-bold text-amber-300 flex items-center space-x-1.5">
          <Lock className="w-4 h-4 text-amber-400" />
          <span>Agent Permissions for Universal Games</span>
        </p>
        <p className="text-slate-400 text-[11px]">
          Universal Games are completely managed and drawn by Spain Game Admin. Agents participate by selling tickets and collecting 10% instant commission. Agents cannot edit or start Universal Games.
        </p>
      </div>

      {/* Universal Games Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {universalGames.map((game) => {
          const soldCount = Math.max(
            game.totalTicketsSold || 0,
            tickets.filter((t) => t.gameType === 'universal' && (t.gameId === game.id || t.gameName === game.name)).length
          );

          return (
            <div
              key={game.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase tracking-widest">
                    Universal Jackpot
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">{game.id}</span>
                </div>

                <h3 className="text-lg font-black text-white">{game.name}</h3>

                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">Grand Prize Pool</p>
                  <p className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                    {game.jackpotAmount.toLocaleString()} Birr
                  </p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 font-medium">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Ticket Price:</span>
                    <span className="font-bold text-white">{game.ticketPrice} Birr</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Agent Commission (10%):</span>
                    <span className="font-bold text-emerald-400">
                      +{Math.round(game.ticketPrice * game.agentCommissionRate)} Birr
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Total Tickets Sold:</span>
                    <span className="font-mono text-white font-bold">{soldCount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onOpenSellTicketModal('universal')}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-2xl text-xs shadow-md cursor-pointer"
              >
                Sell Ticket for {game.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
