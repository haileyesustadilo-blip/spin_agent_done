import React, { useState, useEffect } from 'react';
import { MultiGame, AgentProfile } from '../../types';
import { StorageService } from '../../services/storage';
import confetti from 'canvas-confetti';
import {
  RotateCw,
  PlusCircle,
  Ticket,
  Lock,
  Trophy,
  Users,
  ShieldCheck,
  Dices,
  CheckCircle,
  Sparkles,
  AlertCircle,
  X,
  Eye,
  Info,
  DollarSign,
  Search,
} from 'lucide-react';

interface MultiGamesViewProps {
  agent: AgentProfile;
  multiGames: MultiGame[];
  onOpenSellTicketModal: (gameType: string) => void;
  onRefresh: () => void;
}

export const MultiGamesView: React.FC<MultiGamesViewProps> = ({
  agent,
  multiGames,
  onOpenSellTicketModal,
  onRefresh,
}) => {
  // Active selected room for wheel stage / inspector
  const [selectedGame, setSelectedGame] = useState<MultiGame | null>(multiGames[0] || null);

  // Keep selectedGame in sync if multiGames list updates
  useEffect(() => {
    if (multiGames.length > 0) {
      if (!selectedGame || !multiGames.find((g) => g.id === selectedGame.id)) {
        setSelectedGame(multiGames[0]);
      } else {
        const updated = multiGames.find((g) => g.id === selectedGame.id);
        if (updated) setSelectedGame(updated);
      }
    } else {
      setSelectedGame(null);
    }
  }, [multiGames]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRosterModal, setShowRosterModal] = useState(false);
  const [showSellModal, setShowSellModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Winner Verification states
  const [ticketQuery, setTicketQuery] = useState('');
  const [verificationResult, setVerificationResult] = useState<any | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [payoutSuccess, setPayoutSuccess] = useState<string | null>(null);

  const handleVerifyQuery = (query: string) => {
    setVerifyError(null);
    setPayoutSuccess(null);
    if (!query.trim()) {
      setVerifyError('Please enter a Ticket ID or 17-Digit Security Code.');
      return;
    }
    const res = StorageService.verifyTicket(query.trim());
    if (!res.ticket) {
      setVerifyError(res.message || 'Ticket not found or invalid ID.');
      setVerificationResult(null);
    } else {
      setVerificationResult(res);
    }
  };

  const handleDisbursePrize = (ticketId: string) => {
    try {
      setVerifyError(null);
      const updated = StorageService.claimWinnerPrize(ticketId);
      setPayoutSuccess(`Successfully disbursed ${updated.prizeAmount} Birr prize to ${updated.playerName}!`);
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      onRefresh();
      // Re-query if verification panel is open
      setVerificationResult(StorageService.verifyTicket(ticketId));
    } catch (err: any) {
      setVerifyError(err.message || 'Failed to disburse prize payout');
    }
  };

  // Form states for Create Room
  const [roomName, setRoomName] = useState('Multi Spin Arena 00-99');
  const [ticketPrice, setTicketPrice] = useState(50);
  const [maxTickets, setMaxTickets] = useState(100);
  const [winningPercentage, setWinningPercentage] = useState(80);
  const [description, setDescription] = useState('100 Seats (00-99). Dual Wheel Spin Stage.');

  // Form states for Quick Sell Modal
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [selectedSeatNumber, setSelectedSeatNumber] = useState('00');
  const [selectedSeatNumbers, setSelectedSeatNumbers] = useState<string[]>([]);
  const [sellMessage, setSellMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const toggleSeatNumber = (numStr: string) => {
    setSelectedSeatNumbers((prev) => {
      if (prev.includes(numStr)) {
        return prev.filter((n) => n !== numStr);
      } else {
        return [...prev, numStr];
      }
    });
  };

  const handleQuickSelectRandomSeats = (count: number) => {
    const available: string[] = [];
    for (let i = 0; i < 100; i++) {
      const numStr = i.toString().padStart(2, '0');
      available.push(numStr);
    }
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    setSelectedSeatNumbers(shuffled.slice(0, count));
  };

  // Dual Wheel Spin Physics State
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation1, setRotation1] = useState(0); // Wheel 1 (First Digit 0-9)
  const [rotation2, setRotation2] = useState(0); // Wheel 2 (Second Digit 0-9)
  const [digit1Result, setDigit1Result] = useState<string | null>(null);
  const [digit2Result, setDigit2Result] = useState<string | null>(null);
  const [finalWinningNum, setFinalWinningNum] = useState<string | null>(null);
  const [spinError, setSpinError] = useState<string | null>(null);

  // Filter for seat grid
  const [seatSearch, setSeatSearch] = useState('');

  // Handle Create Multi Game Room
  const handleCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRoom = StorageService.createMultiGame(
        agent.id,
        roomName,
        ticketPrice,
        maxTickets,
        winningPercentage,
        '0-99',
        description
      );
      setShowCreateModal(false);
      onRefresh();
      setSelectedGame(newRoom);
    } catch (err: any) {
      alert(err.message || 'Failed to create room');
    }
  };

  // Handle Dual Wheel Spin Action
  const handleStartDualSpin = (game: MultiGame) => {
    if (isSpinning) return;
    setSpinError(null);

    // ANTI-FRAUD RULE: Lock all tickets immediately before wheel starts spinning
    try {
      const lockedGame = StorageService.lockMultiGameTickets(game.id);
      setSelectedGame(lockedGame);
      onRefresh();
    } catch (err: any) {
      // Proceed if already locked
    }

    setIsSpinning(true);
    setDigit1Result(null);
    setDigit2Result(null);
    setFinalWinningNum(null);

    // Pick 2 digits (0-9 for tens, 0-9 for units)
    const d1Val = Math.floor(Math.random() * 10);
    const d2Val = Math.floor(Math.random() * 10);

    const d1Str = d1Val.toString();
    const d2Str = d2Val.toString();
    const combinedNum = `${d1Str}${d2Str}`;

    // Target angle calculations for 10-sector wheels (0..9)
    // Segment i center = i * 36 + 18 degrees
    const targetCenter1 = d1Val * 36 + 18;
    const desiredMod1 = (360 - targetCenter1) % 360;
    const currentMod1 = rotation1 % 360;
    let extra1 = (desiredMod1 - currentMod1 + 360) % 360;
    if (extra1 === 0) extra1 = 360;
    const totalRot1 = rotation1 + 360 * 6 + extra1;

    const targetCenter2 = d2Val * 36 + 18;
    const desiredMod2 = (360 - targetCenter2) % 360;
    const currentMod2 = rotation2 % 360;
    let extra2 = (desiredMod2 - currentMod2 + 360) % 360;
    if (extra2 === 0) extra2 = 360;
    const totalRot2 = rotation2 + 360 * 8 + extra2; // Wheel 2 spins slightly longer for dramatic flair!

    setRotation1(totalRot1);
    setRotation2(totalRot2);

    // Wheel 1 stops at 3.5s
    setTimeout(() => {
      setDigit1Result(d1Str);
    }, 3500);

    // Wheel 2 stops at 4.2s -> Conclude Spin
    setTimeout(() => {
      setDigit2Result(d2Str);
      setFinalWinningNum(combinedNum);
      setIsSpinning(false);

      try {
        const concluded = StorageService.concludeMultiGame(game.id, combinedNum);
        setSelectedGame(concluded);
        onRefresh();

        // Confetti victory explosion!
        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
      } catch (err: any) {
        setSpinError(err.message || 'Error concluding game spin');
      }
    }, 4200);
  };

  // Quick Sell Ticket Submit (Single or Multiple Seats)
  const handleQuickSell = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGame) return;
    setSellMessage(null);

    const seatsToBuy =
      selectedSeatNumbers.length > 0
        ? selectedSeatNumbers
        : selectedSeatNumber.trim()
        ? [selectedSeatNumber.trim().padStart(2, '0')]
        : [];

    if (seatsToBuy.length === 0) {
      setSellMessage({
        type: 'error',
        text: 'Please select at least one seat number (00 to 99).',
      });
      return;
    }

    try {
      StorageService.sellMultiGameTickets(
        selectedGame.id,
        playerName.trim(),
        playerPhone.trim(),
        seatsToBuy
      );

      setSellMessage({
        type: 'success',
        text: `Issued ${seatsToBuy.length} ticket(s) for Seat(s) #${seatsToBuy.join(', #')}!`,
      });
      setPlayerName('');
      setPlayerPhone('');
      setSelectedSeatNumbers([]);
      onRefresh();
    } catch (err: any) {
      setSellMessage({
        type: 'error',
        text: err.message || 'Failed to issue tickets',
      });
    }
  };

  // Helper to render a 10-sector Wheel SVG (0-9) with Physics-Based Animation
  const renderWheelSVG = (currentRotation: number, isWheelSpinning: boolean, labelTitle: string, resultDigit: string | null) => {
    const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const colors = [
      '#78350f', '#064e3b', '#1e3a8a', '#312e81', '#581c87',
      '#1e1b4b', '#047857', '#831843', '#0c4a6e', '#713f12'
    ];

    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center space-x-1">
          <RotateCw className={`w-3.5 h-3.5 ${isWheelSpinning ? 'animate-spin text-purple-400' : 'text-amber-400'}`} />
          <span>{labelTitle}</span>
        </div>

        {/* Wheel Container */}
        <div className="relative w-44 h-44 sm:w-56 sm:h-56">
          {/* Top Golden Pointer Arrow Needle with Physics Ticking Vibration */}
          <div
            className={`absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] origin-bottom ${
              isWheelSpinning ? 'needle-tick-active' : ''
            }`}
          />

          {/* Golden Ring Frame with Glow Pulse */}
          <div
            className={`w-full h-full rounded-full border-[5px] border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] relative overflow-hidden bg-slate-950 ${
              isWheelSpinning ? 'golden-ring-active' : ''
            }`}
          >
            {/* Wheel Disc with Smooth Physics Deceleration */}
            <div
              className={`w-full h-full rounded-full relative wheel-physics-spin ${
                resultDigit !== null && !isWheelSpinning ? 'wheel-land-bounce' : ''
              }`}
              style={{
                transform: `rotate(${currentRotation}deg)`,
              }}
            >
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {numbers.map((num, i) => {
                  const angle = 36;
                  const startAngleDeg = -90 + i * angle;
                  const endAngleDeg = -90 + (i + 1) * angle;
                  const centerAngleDeg = -90 + i * angle + angle / 2;

                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngleDeg) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngleDeg) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngleDeg) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngleDeg) / 180);

                  const pathData = `M 50 50 L ${x1.toFixed(3)} ${y1.toFixed(3)} A 50 50 0 0 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

                  const tx = 50 + 34 * Math.cos((Math.PI * centerAngleDeg) / 180);
                  const ty = 50 + 34 * Math.sin((Math.PI * centerAngleDeg) / 180);

                  return (
                    <g key={num}>
                      <path
                        d={pathData}
                        fill={colors[i % colors.length]}
                        stroke="#0f172a"
                        strokeWidth="0.8"
                      />
                      <text
                        x={tx.toFixed(3)}
                        y={ty.toFixed(3)}
                        fill="#ffffff"
                        fontSize="10"
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
                {/* Center Hub */}
                <circle cx="50" cy="50" r="7" fill="#020617" stroke="#fbbf24" strokeWidth="1.5" />
              </svg>
            </div>
          </div>
        </div>

        {/* Digit Landed Badge */}
        <div className="mt-1">
          <span
            className={`px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono font-bold text-amber-300 transition-all ${
              resultDigit !== null ? 'ring-2 ring-emerald-500/50 bg-emerald-950/40 text-emerald-300 scale-105' : ''
            }`}
          >
            Digit: {resultDigit !== null ? resultDigit : isWheelSpinning ? '...' : '?'}
          </span>
        </div>
      </div>
    );
  };

  // Build seat counts map for currently selected room
  const seatCountsMap: Record<string, number> = {};
  if (selectedGame) {
    selectedGame.tickets.forEach((t) => {
      const formattedNum = t.selectedNumber.padStart(2, '0');
      seatCountsMap[formattedNum] = (seatCountsMap[formattedNum] || 0) + 1;
    });
  }

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-bold text-purple-300 mb-2">
            <RotateCw className="w-3.5 h-3.5 text-purple-400" />
            <span>Multi Game Dual Spin Arena (00 - 99)</span>
          </div>
          <h1 className="text-2xl font-black text-white">Multi Game Spin Operator</h1>
          <p className="text-xs text-slate-400 mt-1">
            Create custom multi rooms (00 to 99), sell unlimited seat tickets, lock sales before spin, and spin two wheels for 1st & 2nd digits!
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-slate-950 font-black text-xs shadow-lg shadow-purple-500/20 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Multi Room</span>
        </button>
      </div>

      {/* Rules & Anti-Fraud Banner */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-2">
        <h3 className="font-bold text-xs text-purple-300 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
          <span>Multi Game Dual Wheel Spin Rules (00 to 99)</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-300">Probability: 00 to 99</p>
            <p className="text-[10px] text-slate-400">100 Total combinations</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-300">First Wheel: 1st Digit</p>
            <p className="text-[10px] text-slate-400">Tens place (0 to 9)</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-300">Second Wheel: 2nd Digit</p>
            <p className="text-[10px] text-slate-400">Units place (0 to 9)</p>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
            <p className="font-bold text-amber-300">50/50 Margin Split</p>
            <p className="text-[10px] text-slate-400">Agent & Admin split margin</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Stage Column & Right Rooms List Column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dual Wheel Stage */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          {selectedGame ? (
            <div className="w-full space-y-6">
              {/* Header Info */}
              <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-800 pb-4 gap-2 text-left">
                <div>
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold uppercase tracking-wider">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Selected Room: {selectedGame.id}</span>
                  </div>
                  <h3 className="text-xl font-black text-white mt-1">{selectedGame.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Ticket Price: <span className="font-bold text-amber-300">{selectedGame.ticketPrice} Birr</span> • Issued:{' '}
                    <span className="font-mono font-bold text-purple-300">
                      {selectedGame.tickets.length} / {selectedGame.maxTickets} tickets
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer shadow-lg transition-all"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Verify Winners</span>
                  </button>

                  <button
                    onClick={() => setShowRosterModal(true)}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs flex items-center space-x-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    <span>View Roster ({selectedGame.tickets.length})</span>
                  </button>

                  <button
                    onClick={() => setShowSellModal(true)}
                    disabled={selectedGame.isLocked || selectedGame.status !== 'waiting' || !!selectedGame.ticketSellingClosedAt}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                      selectedGame.isLocked || selectedGame.status !== 'waiting' || selectedGame.ticketSellingClosedAt
                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/50'
                        : 'bg-purple-500 hover:bg-purple-400 text-slate-950 shadow-lg cursor-pointer'
                    }`}
                  >
                    <Ticket className="w-3.5 h-3.5" />
                    <span>Sell Ticket Seat</span>
                  </button>
                </div>
              </div>

              {/* DUAL WHEELS DISPLAY (First Digit Wheel + Second Digit Wheel) */}
              <div className="py-2">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12">
                  {/* Wheel 1: First Digit */}
                  {renderWheelSVG(rotation1, isSpinning, '1st Wheel (Tens Digit)', digit1Result)}

                  {/* Plus / Combined Symbol */}
                  <div className="hidden sm:flex flex-col items-center justify-center text-amber-400 font-black text-xl">
                    <span>+</span>
                    <span className="text-[10px] text-slate-500 font-normal">COMBINE</span>
                  </div>

                  {/* Wheel 2: Second Digit */}
                  {renderWheelSVG(rotation2, isSpinning, '2nd Wheel (Units Digit)', digit2Result)}
                </div>
              </div>

              {/* Combined Result Display */}
              {finalWinningNum && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-1.5 animate-bounce max-w-md mx-auto">
                  <p className="text-xs uppercase font-bold text-emerald-400 flex items-center justify-center space-x-1.5">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>DUAL WHEEL COMBINED RESULT</span>
                  </p>
                  <p className="text-4xl font-black text-amber-300 font-mono tracking-widest">
                    #{finalWinningNum}
                  </p>
                  <p className="text-xs text-slate-200">
                    {selectedGame.winningTicketIds?.length || 0} Ticket(s) Held This Winning Number!
                  </p>
                </div>
              )}

              {/* Spin Trigger Control Button */}
              {selectedGame.status !== 'completed' && (
                <div className="pt-2 max-w-md mx-auto">
                  <button
                    onClick={() => handleStartDualSpin(selectedGame)}
                    disabled={isSpinning}
                    className={`w-full py-4 font-black rounded-2xl shadow-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${
                      isSpinning
                        ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 cursor-pointer shadow-amber-500/20 transform hover:-translate-y-0.5'
                    }`}
                  >
                    <RotateCw className={`w-5 h-5 ${isSpinning ? 'animate-spin' : ''}`} />
                    <span>
                      {isSpinning
                        ? 'Spinning Both Wheels...'
                        : selectedGame.isLocked
                        ? 'Spin Dual Wheels Now!'
                        : 'Start Dual Wheel Spin & Lock Tickets'}
                    </span>
                  </button>
                  <p className="text-[10px] text-slate-500 mt-2">
                    🔒 Spinning locks ticket sales permanently (<code className="text-amber-400 font-mono">isLocked: true</code>).
                  </p>
                </div>
              )}

              {selectedGame.status === 'completed' && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-slate-300 space-y-3 max-w-lg mx-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Verified Multi Room Winners</span>
                    </span>
                    <button
                      onClick={() => setShowVerifyModal(true)}
                      className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold rounded-lg text-[10px] hover:bg-emerald-500/30 transition-all cursor-pointer"
                    >
                      Search Ticket ID
                    </button>
                  </div>

                  {(() => {
                    const allTickets = StorageService.getTickets();
                    const winners = allTickets.filter(
                      (t) => t.gameId === selectedGame.id && (t.status === 'winner_unclaimed' || t.status === 'claimed' || t.selectedNumber === selectedGame.winningNumber)
                    );

                    if (winners.length === 0) {
                      return (
                        <div className="p-3 bg-slate-900 rounded-xl text-center text-slate-500 text-[11px]">
                          No players held winning number <span className="font-mono font-bold text-amber-400">#{selectedGame.winningNumber}</span>. Remaining pool distributed to agent commission margin.
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {winners.map((win) => {
                          const isUnclaimed = win.status === 'winner_unclaimed';
                          return (
                            <div
                              key={win.id}
                              className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs ${
                                isUnclaimed
                                  ? 'bg-amber-500/10 border-amber-500/30 text-white'
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-slate-200'
                              }`}
                            >
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="font-bold text-white">{win.playerName}</span>
                                  <span className="font-mono text-[10px] text-amber-300 font-bold bg-slate-900 px-1.5 py-0.5 rounded">
                                    Seat #{win.selectedNumber}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                  ID: <span className="text-slate-200">{win.id}</span> • Code: <span className="text-slate-200">{win.seventeenDigitId}</span>
                                </p>
                                <p className="text-[10px] text-slate-400">
                                  Prize Pool: <span className="font-bold text-emerald-400">{win.prizeAmount || 0} Birr</span>
                                </p>
                              </div>

                              <div>
                                {isUnclaimed ? (
                                  <button
                                    onClick={() => handleDisbursePrize(win.id)}
                                    className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-[11px] shadow-lg cursor-pointer transition-all transform hover:scale-105"
                                  >
                                    Disburse {win.prizeAmount} Birr
                                  </button>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] uppercase">
                                    ✓ Prize Claimed
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3">
              <Dices className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Multi Game Room Active</h3>
              <p className="text-xs text-slate-400">Click "Create Multi Room" above to launch your first 00-99 spin room.</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer inline-flex items-center space-x-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Create First Room</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Rooms List & 00-99 Seat Selector Inspector */}
        <div className="space-y-6">
          {/* Active Multi Game Rooms List */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Multi Game Rooms ({multiGames.length})</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center space-x-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>New</span>
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {multiGames.length === 0 ? (
                <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 text-center text-xs text-slate-500">
                  No rooms created yet.
                </div>
              ) : (
                multiGames.map((game) => {
                  const isSelected = selectedGame?.id === game.id;
                  const isClosed = game.status !== 'waiting' || game.isLocked || !!game.ticketSellingClosedAt;

                  return (
                    <div
                      key={game.id}
                      onClick={() => setSelectedGame(game)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold text-amber-300">{game.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                            game.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isClosed
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}
                        >
                          {game.status === 'completed'
                            ? 'COMPLETED'
                            : isClosed
                            ? 'LOCKED'
                            : 'OPEN'}
                        </span>
                      </div>

                      <p className="font-bold text-xs text-white truncate">{game.name}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                        <span>Price: {game.ticketPrice} Birr</span>
                        <span className="font-mono text-purple-300">
                          {game.tickets.length} / {game.maxTickets} tickets
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Interactive Seat Numbers Grid Inspector (00 to 99) */}
          {selectedGame && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-white flex items-center space-x-1.5">
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    <span>00 - 99 Seats Inspector</span>
                  </h4>
                  <p className="text-[10px] text-slate-400">Click any seat number to issue a ticket for it!</p>
                </div>
              </div>

              {/* Filter / Search Seat */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter seat # (e.g. 07, 42)..."
                  value={seatSearch}
                  onChange={(e) => setSeatSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              {/* 00 to 99 Grid */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 max-h-64 overflow-y-auto p-1 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                {Array.from({ length: 100 }).map((_, i) => {
                  const numStr = i.toString().padStart(2, '0');
                  if (seatSearch && !numStr.includes(seatSearch)) return null;

                  const ticketCount = seatCountsMap[numStr] || 0;
                  const isWinningSeat = selectedGame.winningNumber === numStr;

                  return (
                    <button
                      key={numStr}
                      onClick={() => {
                        setSelectedSeatNumber(numStr);
                        setShowSellModal(true);
                      }}
                      className={`p-1.5 rounded-xl border text-[11px] font-mono font-bold flex flex-col items-center justify-center transition-all cursor-pointer relative ${
                        isWinningSeat
                          ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md animate-pulse'
                          : ticketCount > 0
                          ? 'bg-purple-900/60 border-purple-500/60 text-purple-200 hover:bg-purple-800/80'
                          : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>#{numStr}</span>
                      {ticketCount > 0 && (
                        <span className="text-[9px] font-sans text-amber-300 font-semibold">
                          ({ticketCount})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CREATE MULTI GAME ROOM MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Create Multi Game Spin Room</h3>
                <p className="text-[11px] text-slate-400">Launch 00-99 dual wheel multiplayer spin room.</p>
              </div>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Room Title / Name</label>
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder="e.g. 50 Birr Multi Spin Arena 00-99"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Ticket Price (Birr)</label>
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    required
                    value={ticketPrice}
                    onChange={(e) => setTicketPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Max Tickets Limit</label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    required
                    value={maxTickets}
                    onChange={(e) => setMaxTickets(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Spin Range</label>
                  <div className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold">
                    00 to 99 (Dual Wheels)
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold mb-1 block">Winning Payout %</label>
                  <input
                    type="number"
                    min="50"
                    max="90"
                    required
                    value={winningPercentage}
                    onChange={(e) => setWinningPercentage(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono font-bold focus:border-purple-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-purple-950/40 border border-purple-500/20 rounded-2xl space-y-1 text-[11px] text-purple-200">
                <p className="font-bold flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                  <span>50/50 Equal Margin Commission Guaranteed</span>
                </p>
                <p className="text-slate-300 text-[10px]">
                  Net margin ({100 - winningPercentage}%) is split equally 50% to Agent and 50% to Admin.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all cursor-pointer text-xs"
              >
                Launch Multi Game Spin Room
              </button>
            </form>
          </div>
        </div>
      )}

      {/* QUICK SELL TICKET SEAT MODAL */}
      {showSellModal && selectedGame && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => {
                setShowSellModal(false);
                setSellMessage(null);
              }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                <Ticket className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Sell Multi Game Ticket</h3>
                <p className="text-[11px] text-slate-400">
                  Room: <span className="font-bold text-white">{selectedGame.name}</span> | Price:{' '}
                  <span className="font-mono text-amber-300 font-bold">{selectedGame.ticketPrice} Birr</span>
                </p>
              </div>
            </div>

            {sellMessage && (
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center space-x-2 ${
                  sellMessage.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                {sellMessage.type === 'success' ? (
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{sellMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleQuickSell} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Player Full Name</label>
                <input
                  type="text"
                  required
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold mb-1 block">Player Phone Number</label>
                <input
                  type="tel"
                  required
                  value={playerPhone}
                  onChange={(e) => setPlayerPhone(e.target.value)}
                  placeholder="+251911..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:border-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold block">Select Seat Numbers (00 - 99)</label>
                  <span className="text-[10px] text-amber-300 font-mono font-bold">
                    {selectedSeatNumbers.length > 0
                      ? `${selectedSeatNumbers.length} seat(s) selected`
                      : `Picked: #${selectedSeatNumber.padStart(2, '0')}`}
                  </span>
                </div>

                {/* Quick Presets */}
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleQuickSelectRandomSeats(5)}
                    className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 cursor-pointer"
                  >
                    + Quick 5 Seats
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickSelectRandomSeats(10)}
                    className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 cursor-pointer"
                  >
                    + Quick 10 Seats
                  </button>
                  {selectedSeatNumbers.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSeatNumbers([])}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-rose-300 cursor-pointer"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Grid 00-99 Picker */}
                <div className="grid grid-cols-10 gap-1 p-2 bg-slate-950 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto mb-2">
                  {Array.from({ length: 100 }).map((_, i) => {
                    const numStr = i.toString().padStart(2, '0');
                    const isSelected = selectedSeatNumbers.includes(numStr);
                    const isSinglePicked = selectedSeatNumbers.length === 0 && selectedSeatNumber.padStart(2, '0') === numStr;
                    const countOnSeat = selectedGame?.tickets.filter(t => t.selectedNumber.padStart(2, '0') === numStr).length || 0;

                    return (
                      <button
                        key={numStr}
                        type="button"
                        onClick={() => toggleSeatNumber(numStr)}
                        className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer relative ${
                          isSelected
                            ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                            : isSinglePicked
                            ? 'bg-purple-900/80 text-purple-200 border border-purple-400'
                            : countOnSeat > 0
                            ? 'bg-slate-800/80 border border-slate-700 text-amber-300'
                            : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        {numStr}
                        {countOnSeat > 0 && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 text-[8px] text-slate-950 font-black flex items-center justify-center">
                            {countOnSeat}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {selectedSeatNumbers.length > 0 ? (
                  <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-200 truncate">
                    Selected Seats ({selectedSeatNumbers.length}):{' '}
                    <span className="font-bold text-amber-300">{selectedSeatNumbers.join(', ')}</span>
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={selectedSeatNumber}
                    onChange={(e) => setSelectedSeatNumber(e.target.value)}
                    placeholder="e.g. 07 or 42"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:border-purple-500 focus:outline-none text-base"
                  />
                )}
              </div>

              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-[11px]">
                {(() => {
                  const count = selectedSeatNumbers.length || 1;
                  const totalCost = count * selectedGame.ticketPrice;
                  const marginPct = (100 - selectedGame.winningPercentage) / 100;
                  const totalCommission = Math.round((totalCost * marginPct) / 2);

                  return (
                    <>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Selected Ticket Count:</span>
                        <span className="font-bold text-amber-300 font-mono">{count} ticket(s)</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-300">
                        <span>Total Ticket Price ({selectedGame.ticketPrice} Birr/ea):</span>
                        <span className="font-bold text-white font-mono">{totalCost} Birr</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-400 font-bold">
                        <span>Agent Commission (50/50 Equal Margin Split):</span>
                        <span>+{totalCommission} Birr</span>
                      </div>
                    </>
                  );
                })()}
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all cursor-pointer text-xs"
              >
                Issue {selectedSeatNumbers.length || 1} Ticket(s) ({ (selectedSeatNumbers.length || 1) * selectedGame.ticketPrice } Birr)
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TICKETS ROSTER MODAL */}
      {showRosterModal && selectedGame && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => setShowRosterModal(false)}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-300">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Tickets Roster: {selectedGame.name}</h3>
                <p className="text-[11px] text-slate-400">Total Issued: {selectedGame.tickets.length} tickets</p>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
              {selectedGame.tickets.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">No tickets issued for this room yet.</div>
              ) : (
                selectedGame.tickets.map((t, idx) => {
                  const isWinning = selectedGame.winningNumber === t.selectedNumber;
                  return (
                    <div
                      key={t.ticketId || idx}
                      className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                        isWinning
                          ? 'bg-amber-500/20 border-amber-500/50 text-white'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
                          #{t.selectedNumber}
                        </span>
                        <div>
                          <p className="font-bold text-white">{t.playerName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{t.playerPhone}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-mono text-xs font-bold text-slate-300">{t.ticketId}</p>
                        <p className="text-[10px] text-slate-500">{new Date(t.purchasedAt).toLocaleTimeString()}</p>
                        {isWinning && (
                          <span className="mt-0.5 inline-block px-2 py-0.5 bg-amber-500 text-slate-950 font-black rounded-full text-[9px] uppercase">
                            🏆 WINNER TICKET
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => setShowRosterModal(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Close Roster
            </button>
          </div>
        </div>
      )}

      {/* VERIFY MULTI GAME WINNERS MODAL */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-white relative">
            <button
              onClick={() => {
                setShowVerifyModal(false);
                setVerificationResult(null);
                setVerifyError(null);
                setPayoutSuccess(null);
                setTicketQuery('');
              }}
              className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl text-emerald-400">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white">Verify Multi Game Winner Ticket</h3>
                <p className="text-[11px] text-slate-400">Lookup 17-Digit Security Code or Ticket ID for Multi Spin payouts</p>
              </div>
            </div>

            {/* Input Search */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">Enter Ticket ID or 17-Digit Code</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="e.g. TK48219 or 8820-9941-1029-4821"
                    value={ticketQuery}
                    onChange={(e) => setTicketQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyQuery(ticketQuery)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono focus:border-purple-500 focus:outline-none"
                  />
                </div>
                <button
                  onClick={() => handleVerifyQuery(ticketQuery)}
                  className="px-5 py-2.5 bg-purple-500 hover:bg-purple-400 text-slate-950 font-bold rounded-xl text-xs shadow-lg transition-all cursor-pointer shrink-0"
                >
                  Verify Ticket
                </button>
              </div>
            </div>

            {/* Error or Success Banners */}
            {verifyError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-semibold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {payoutSuccess && (
              <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center space-x-2 animate-bounce">
                <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{payoutSuccess}</span>
              </div>
            )}

            {/* Verification Result Card */}
            {verificationResult && verificationResult.ticket && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Game Room:</span>
                  <span className="font-bold text-white">{verificationResult.ticket.gameName}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Seat / Combination:</span>
                  <span className="font-bold text-amber-400 text-sm">#{verificationResult.ticket.selectedNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Player Holder:</span>
                  <span className="text-slate-200">{verificationResult.ticket.playerName} ({verificationResult.ticket.playerPhone || 'N/A'})</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Ticket Security ID:</span>
                  <span className="text-purple-300">{verificationResult.ticket.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">17-Digit Code:</span>
                  <span className="text-slate-300">{verificationResult.ticket.seventeenDigitId}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status:</span>
                  <span
                    className={`font-black uppercase px-2 py-0.5 rounded text-[10px] ${
                      verificationResult.ticket.status === 'winner_unclaimed'
                        ? 'bg-amber-500 text-slate-950'
                        : verificationResult.ticket.status === 'claimed'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {verificationResult.ticket.status === 'winner_unclaimed'
                      ? '🏆 UNCLAIMED WINNER!'
                      : verificationResult.ticket.status === 'claimed'
                      ? '✓ CLAIMED & DISBURSED'
                      : verificationResult.ticket.status.toUpperCase()}
                  </span>
                </div>

                {verificationResult.ticket.status === 'winner_unclaimed' && (
                  <button
                    onClick={() => handleDisbursePrize(verificationResult.ticket.id)}
                    className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs shadow-xl transition-all cursor-pointer transform hover:-translate-y-0.5"
                  >
                    Disburse {verificationResult.ticket.prizeAmount || 0} Birr Prize Payout Now
                  </button>
                )}
              </div>
            )}

            <button
              onClick={() => {
                setShowVerifyModal(false);
                setVerificationResult(null);
                setVerifyError(null);
                setPayoutSuccess(null);
                setTicketQuery('');
              }}
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl text-xs transition-all cursor-pointer"
            >
              Close Verification Stage
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
