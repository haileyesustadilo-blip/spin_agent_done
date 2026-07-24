import React, { useState } from 'react';
import { SoloGame, AgentProfile } from '../../types';
import { StorageService } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  Dices,
  PlusCircle,
  Play,
  RotateCw,
  Trophy,
  Users,
  CheckCircle,
  Sparkles,
  Info,
  Clock,
  DollarSign,
} from 'lucide-react';

interface SoloGamesViewProps {
  agent: AgentProfile;
  soloGames: SoloGame[];
  onOpenSellTicketModal: (gameType: string) => void;
  onRefresh: () => void;
}

export const SoloGamesView: React.FC<SoloGamesViewProps> = ({
  agent,
  soloGames,
  onOpenSellTicketModal,
  onRefresh,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGameForSpin, setSelectedGameForSpin] = useState<SoloGame | null>(soloGames[0] || null);

  // Wheel animation state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationDegree, setRotationDegree] = useState(0);
  const [spunResult, setSpunResult] = useState<{ number: string; winnerName: string; prize: number } | null>(null);

  // Form states
  const [gameName, setGameName] = useState(`Agent Solo Spin #${soloGames.length + 1}`);
  const [ticketPrice, setTicketPrice] = useState(100);
  const [playerLimit, setPlayerLimit] = useState(10);
  const [winningPercentage, setWinningPercentage] = useState(80);
  const [description, setDescription] = useState('1-10 Players. Numbers 0-9. Agent controlled spin.');

  const handleCreateSolo = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.createSoloGame(
      gameName,
      ticketPrice,
      playerLimit,
      winningPercentage,
      description
    );
    setShowCreateModal(false);
    onRefresh();
  };

  // Spin Wheel Physics Function
  const handleSpinWheel = (game: SoloGame) => {
    if (isSpinning) return;

    // ANTI-FRAUD RULE: Lock all tickets immediately before wheel starts spinning
    try {
      const lockedGame = StorageService.lockSoloGameTickets(game.id);
      setSelectedGameForSpin(lockedGame);
    } catch (e) {
      // Game might already be locked/in_progress, proceed
    }

    setIsSpinning(true);
    setSpunResult(null);

    // Pick random winning number 0-9
    const randomNum = Math.floor(Math.random() * 10).toString();
    const targetIndex = parseInt(randomNum);

    // Calculate exact rotation so top pointer lands at the CENTER of segment targetIndex
    // Segment 0 center = 18deg, Segment 1 center = 54deg, ..., Segment i center = i*36 + 18deg
    const targetCenterAngle = targetIndex * 36 + 18;
    const desiredMod = (360 - targetCenterAngle) % 360;

    const currentMod = rotationDegree % 360;
    let extraDeg = (desiredMod - currentMod + 360) % 360;
    if (extraDeg === 0) {
      extraDeg = 360;
    }

    // 6 full 360-degree spins + precise offset to land right in the middle of the number
    const totalRotation = rotationDegree + 360 * 6 + extraDeg;

    setRotationDegree(totalRotation);

    setTimeout(() => {
      setIsSpinning(false);

      // Conclude game in storage
      const concluded = StorageService.concludeSoloGame(game.id, randomNum);
      setSpunResult({
        number: randomNum,
        winnerName: concluded.winnerPlayerName || 'No Winner',
        prize: concluded.winnerPrize || 0,
      });

      // Confetti burst for victory!
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onRefresh();
    }, 4000);
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
            <Dices className="w-3.5 h-3.5 text-purple-400" />
            <span>Agent Solo Game Operator Portal</span>
          </div>
          <h1 className="text-2xl font-black text-white">Solo Game Operator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create custom solo rooms (0-9 numbers), sell seats, and spin the wheel to select winners.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Solo Game</span>
        </button>
      </div>

      {/* Official Solo Rules Callout Card */}
      <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-3">
        <h3 className="font-bold text-sm text-amber-300 flex items-center space-x-2">
          <Info className="w-4 h-4 text-amber-400" />
          <span>Official Solo Game Specification Rules</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400">Numbers: 0 to 9</p>
            <p className="text-[10px] text-slate-400">10 Total wheel segments</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400">Max Players: 10</p>
            <p className="text-[10px] text-slate-400">1 Number = 1 Player</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400">Unavailable Selection</p>
            <p className="text-[10px] text-slate-400">Selected numbers lock out</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-400">Agent Start Option</p>
            <p className="text-[10px] text-slate-400">Can spin before 10 players</p>
          </div>
        </div>
      </div>

      {/* Main Wheel Spinner & Active Game Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Spinning Wheel Column */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative flex flex-col items-center justify-center text-center overflow-hidden">
          {selectedGameForSpin ? (
            <div className="w-full max-w-md space-y-6">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase tracking-widest">
                  Solo Wheel Stage
                </span>
                <h3 className="text-xl font-black text-white mt-1">{selectedGameForSpin.name}</h3>
                <p className="text-xs text-slate-400">
                  Ticket Price: <span className="font-bold text-amber-300">{selectedGameForSpin.ticketPrice} Birr</span> • Winner Pool:{' '}
                  <span className="font-bold text-emerald-400">
                    {Math.round(
                      Object.keys(selectedGameForSpin.selectedNumbers).length *
                        selectedGameForSpin.ticketPrice *
                        (selectedGameForSpin.winningPercentage / 100)
                    )}{' '}
                    Birr ({selectedGameForSpin.winningPercentage}%)
                  </span>
                </p>
              </div>

              {/* Wheel Container with Pointer Arrow */}
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto my-4">
                {/* Top Pointer Arrow */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[22px] border-t-amber-400 filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]" />

                {/* Outer Golden Frame & Animated Rotating Wheel */}
                <div className="w-full h-full rounded-full border-[6px] border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.3)] relative overflow-hidden bg-slate-950">
                  <div
                    className="w-full h-full rounded-full relative transition-transform duration-[4000ms]"
                    style={{
                      transform: `rotate(${rotationDegree}deg)`,
                      transitionTimingFunction: 'cubic-bezier(0.15, 0.9, 0.2, 1)',
                    }}
                  >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num, i) => {
                        const angle = 36;
                        const startAngleDeg = -90 + i * angle;
                        const endAngleDeg = -90 + (i + 1) * angle;
                        const centerAngleDeg = -90 + i * angle + angle / 2;

                        const x1 = 50 + 50 * Math.cos((Math.PI * startAngleDeg) / 180);
                        const y1 = 50 + 50 * Math.sin((Math.PI * startAngleDeg) / 180);
                        const x2 = 50 + 50 * Math.cos((Math.PI * endAngleDeg) / 180);
                        const y2 = 50 + 50 * Math.sin((Math.PI * endAngleDeg) / 180);

                        const pathData = `M 50 50 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 50 50 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;
                        const isTaken = selectedGameForSpin.selectedNumbers[num];

                        // Rich sector palette matching casino style
                        const colors = [
                          '#78350f', '#064e3b', '#1e3a8a', '#312e81', '#581c87',
                          '#1e1b4b', '#047857', '#831843', '#0c4a6e', '#713f12'
                        ];

                        const tx = 50 + 34 * Math.cos((Math.PI * centerAngleDeg) / 180);
                        const ty = 50 + 34 * Math.sin((Math.PI * centerAngleDeg) / 180);

                        return (
                          <g key={num}>
                            <path
                              d={pathData}
                              fill={colors[i % colors.length]}
                              opacity={isTaken ? 1 : 0.85}
                              stroke="#0f172a"
                              strokeWidth="0.8"
                            />
                            <text
                              x={tx.toFixed(3)}
                              y={ty.toFixed(3)}
                              fill="#ffffff"
                              fontSize="9"
                              fontWeight="900"
                              textAnchor="middle"
                              dominantBaseline="central"
                              className="font-mono select-none"
                            >
                              {num}
                            </text>
                          </g>
                        );
                      })}
                      {/* Center pin/hub */}
                      <circle cx="50" cy="50" r="6" fill="#020617" stroke="#fbbf24" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Spun Victory Output Banner */}
              {spunResult && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-1 animate-bounce">
                  <p className="text-xs uppercase font-bold text-emerald-400">Wheel Landed On Number</p>
                  <p className="text-4xl font-black text-amber-400 font-mono">#{spunResult.number}</p>
                  <p className="text-xs font-semibold text-white">
                    Winner: <span className="text-amber-300 font-bold">{spunResult.winnerName}</span> ({spunResult.prize.toLocaleString()} Birr Prize)
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => handleSpinWheel(selectedGameForSpin)}
                  disabled={isSpinning || selectedGameForSpin.status === 'completed'}
                  className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs shadow-xl flex items-center justify-center space-x-2 transition-all ${
                    isSpinning || selectedGameForSpin.status === 'completed'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20 transform hover:-translate-y-0.5'
                  }`}
                >
                  <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>{isSpinning ? 'Spinning Wheel...' : 'Spin Solo Wheel Now!'}</span>
                </button>

                <button
                  onClick={() => onOpenSellTicketModal('solo')}
                  disabled={selectedGameForSpin.status === 'completed'}
                  className="w-full sm:w-auto px-5 py-3.5 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-2xl font-bold text-xs"
                >
                  Sell Solo Ticket Seat
                </button>
              </div>
            </div>
          ) : (
            <div className="text-slate-400 text-xs py-12">Select a Solo Game to open the wheel stage</div>
          )}
        </div>

        {/* Solo Games List & Seat Map Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span>Active Solo Rooms</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {soloGames.map((game) => {
              const picksCount = Object.keys(game.selectedNumbers).length;
              const isSelected = selectedGameForSpin?.id === game.id;

              return (
                <div
                  key={game.id}
                  onClick={() => setSelectedGameForSpin(game)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500 ring-1 ring-purple-500/30'
                      : 'bg-slate-800/60 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{game.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                      {game.ticketPrice} Birr/seat
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-3">
                    Seats Taken: <span className="font-bold text-white">{picksCount}</span> / {game.playerLimit}
                  </p>

                  {/* Seat Map Badges (0-9) */}
                  <div className="grid grid-cols-5 gap-1">
                    {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                      const player = game.selectedNumbers[num];
                      return (
                        <div
                          key={num}
                          title={player ? (player.playerName && player.playerName !== `Seat #${num}` ? `${player.playerName}` : `Seat #${num} Taken`) : 'Empty Seat'}
                          className={`p-1 text-center rounded-lg text-[10px] font-mono font-bold border ${
                            player
                              ? 'bg-purple-500 text-white border-purple-400'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          #{num}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Create Solo Game Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white">
            <h2 className="text-xl font-bold mb-4">Create New Solo Game Room</h2>
            <form onSubmit={handleCreateSolo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Game Name</label>
                <input
                  type="text"
                  required
                  value={gameName}
                  onChange={(e) => setGameName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ticket Price (Birr)</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Player Limit (1-10)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={10}
                    value={playerLimit}
                    onChange={(e) => setPlayerLimit(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Winning Percentage (%)</label>
                <input
                  type="number"
                  required
                  min={50}
                  max={90}
                  value={winningPercentage}
                  onChange={(e) => setWinningPercentage(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Winner Payout = {winningPercentage}%. Remaining {100 - winningPercentage}% margin is split equally: Agent ({(100 - winningPercentage) / 2}%) and Admin ({(100 - winningPercentage) / 2}%).
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl"
                >
                  Create Game Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
