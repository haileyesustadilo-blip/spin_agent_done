import React, { useState, useEffect } from 'react';
import { UniversalGame, SoloGame, MultiGame, Ticket } from '../../types';
import { StorageService } from '../../services/storage';
import { TicketCard } from './TicketCard';
import {
  X,
  Ticket as TicketIcon,
  Globe,
  Dices,
  Users,
  CheckCircle,
  Smartphone,
  PlusCircle,
  Plus,
  RotateCcw,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface SellTicketsModalProps {
  isOpen: boolean;
  initialType?: string;
  universalGames: UniversalGame[];
  soloGames: SoloGame[];
  onClose: () => void;
  onTicketSold: () => void;
}

export const SellTicketsModal: React.FC<SellTicketsModalProps> = ({
  isOpen,
  initialType = 'universal',
  universalGames,
  soloGames,
  onClose,
  onTicketSold,
}) => {
  const [ticketType, setTicketType] = useState<'universal' | 'solo' | 'multiplayer'>(
    (initialType as 'universal' | 'solo' | 'multiplayer') || 'universal'
  );

  const [selectedUniversalGame, setSelectedUniversalGame] = useState<UniversalGame | null>(
    universalGames[0] || null
  );

  useEffect(() => {
    if (universalGames.length > 0) {
      if (!selectedUniversalGame || !universalGames.find((g) => g.id === selectedUniversalGame.id)) {
        setSelectedUniversalGame(universalGames[0]);
      }
    } else {
      setSelectedUniversalGame(null);
    }
  }, [universalGames]);

  const [selectedSoloGame, setSelectedSoloGame] = useState<SoloGame | null>(
    soloGames[0] || null
  );

  const [multiGames, setMultiGames] = useState<MultiGame[]>(() => StorageService.getMultiGames());
  const [selectedMultiGame, setSelectedMultiGame] = useState<MultiGame | null>(() => {
    const list = StorageService.getMultiGames();
    return list[0] || null;
  });

  useEffect(() => {
    if (isOpen) {
      const list = StorageService.getMultiGames();
      setMultiGames(list);
      if (list.length > 0 && !selectedMultiGame) {
        setSelectedMultiGame(list[0]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (soloGames.length > 0) {
      if (!selectedSoloGame || !soloGames.find(g => g.id === selectedSoloGame.id)) {
        setSelectedSoloGame(soloGames[0]);
      }
    } else {
      setSelectedSoloGame(null);
    }
  }, [soloGames]);

  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('+2519');
  const [selectedNumber, setSelectedNumber] = useState('00');
  
  // Multi-seat selection state for Solo Games
  const [selectedSoloNumbers, setSelectedSoloNumbers] = useState<string[]>([]);

  // Multi-seat selection state for Multi Game Spin (one person can buy multiple seats!)
  const [selectedMultiNumbers, setSelectedMultiNumbers] = useState<string[]>([]);

  const toggleMultiSeatNumber = (numStr: string) => {
    setSelectedMultiNumbers((prev) => {
      if (prev.includes(numStr)) {
        return prev.filter((n) => n !== numStr);
      } else {
        return [...prev, numStr];
      }
    });
  };

  const handleQuickSelectMultiRandom = (count: number) => {
    const available: string[] = [];
    for (let i = 0; i < 100; i++) {
      const numStr = i.toString().padStart(2, '0');
      available.push(numStr);
    }
    // Shuffle and pick `count`
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    setSelectedMultiNumbers(shuffled.slice(0, count));
  };

  // Quick Room Creation State inside Modal
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomPrice, setNewRoomPrice] = useState(100);
  const [newRoomWinPct, setNewRoomWinPct] = useState(80);

  const [generatedTickets, setGeneratedTickets] = useState<Ticket[] | null>(null);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'telebirr' | 'cbe'>('cash');

  if (!isOpen) return null;

  const toggleSoloNumber = (num: string) => {
    if (selectedSoloNumbers.includes(num)) {
      setSelectedSoloNumbers(selectedSoloNumbers.filter((n) => n !== num));
    } else {
      setSelectedSoloNumbers([...selectedSoloNumbers, num]);
    }
  };

  const selectAllAvailableSoloNumbers = () => {
    if (!selectedSoloGame) return;
    const available = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].filter(
      (n) => !selectedSoloGame.selectedNumbers[n]
    );
    if (available.length > 0) {
      setSelectedSoloNumbers(available);
    }
  };

  const handleSellUniversal = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedUniversalGame) {
      setError('No active Universal Game available.');
      return;
    }

    if (!playerName.trim() || !playerPhone.trim() || !selectedNumber.trim()) {
      setError('Please provide Player Name, Phone Number, and Selected Number.');
      return;
    }

    try {
      const { ticket } = StorageService.sellUniversalTicket(
        selectedUniversalGame,
        playerName.trim(),
        playerPhone.trim(),
        selectedNumber.trim()
      );
      setGeneratedTickets([ticket]);
      onTicketSold();
    } catch (err: any) {
      setError(err.message || 'Failed to generate ticket.');
    }
  };

  const handleSellSolo = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedSoloGame) {
      setError('Please create or select an active Solo Game room first.');
      return;
    }

    if (selectedSoloNumbers.length === 0) {
      setError('Please select at least one seat number.');
      return;
    }

    try {
      const { tickets, soloGame: updatedGame } = StorageService.sellSoloTicketsBatch(
        selectedSoloGame.id,
        selectedSoloNumbers
      );
      setSelectedSoloGame(updatedGame);
      setGeneratedTickets(tickets);
      onTicketSold();
    } catch (err: any) {
      setError(err.message || 'Failed to sell solo ticket.');
    }
  };

  const handleQuickCreateRoom = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const name = newRoomName.trim() || `Spain Solo Room #${soloGames.length + 1}`;
      const newRoom = StorageService.createSoloGame(
        name,
        newRoomPrice || 100,
        10,
        newRoomWinPct || 70,
        'Quick created Solo Game room'
      );
      setSelectedSoloGame(newRoom);
      setIsCreatingRoom(false);
      setNewRoomName('');
      setSelectedSoloNumbers([]);
      onTicketSold();
    } catch (err: any) {
      setError(err.message || 'Failed to create room.');
    }
  };

  const handleReset = () => {
    setGeneratedTickets(null);
    setPlayerName('');
    setPlayerPhone('+2519');
    setSelectedNumber('12345');
    setSelectedSoloNumbers([]);
  };

  const handleSellMultiplayer = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedMultiGame) {
      setError('Please select a Multi Game Spin room.');
      return;
    }

    const numbersToBuy =
      selectedMultiNumbers.length > 0
        ? selectedMultiNumbers
        : selectedNumber.trim()
        ? [selectedNumber.trim()]
        : [];

    if (!playerName.trim() || !playerPhone.trim() || numbersToBuy.length === 0) {
      setError('Please fill in Player Name, Phone Number, and select at least one seat number.');
      return;
    }

    try {
      const { tickets } = StorageService.sellMultiGameTickets(
        selectedMultiGame.id,
        playerName.trim(),
        playerPhone.trim(),
        numbersToBuy
      );
      setGeneratedTickets(tickets);
      onTicketSold();
    } catch (err: any) {
      setError(err.message || 'Failed to issue multi game tickets.');
    }
  };

  // Solo price calculation
  const soloTicketCount = selectedSoloNumbers.length;
  const soloPricePerTicket = selectedSoloGame?.ticketPrice || 0;
  const soloTotalCost = soloPricePerTicket * soloTicketCount;
  const soloWinPct = selectedSoloGame?.winningPercentage || 80;
  const soloAgentMarginPct = (100 - soloWinPct) / 2;
  const soloAgentCommission = Math.round(soloTotalCost * (soloAgentMarginPct / 100));

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!generatedTickets ? (
          <div>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-widest mb-2">
                Agent Ticket Counter
              </span>
              <h2 className="text-2xl font-black text-white">Sell Game Ticket</h2>
              <p className="text-xs text-slate-400 mt-1">Select ticket type and seat numbers to issue tickets</p>
            </div>

            {/* Ticket Category Selector Tabs */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 mb-6 text-xs">
              <button
                type="button"
                onClick={() => setTicketType('universal')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  ticketType === 'universal'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>1. Universal Game</span>
              </button>

              <button
                type="button"
                onClick={() => setTicketType('solo')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  ticketType === 'solo'
                    ? 'bg-purple-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Dices className="w-4 h-4" />
                <span>2. Solo Game</span>
              </button>

              <button
                type="button"
                onClick={() => setTicketType('multiplayer')}
                className={`py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                  ticketType === 'multiplayer'
                    ? 'bg-blue-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>3. Multiplayer</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-medium">
                {error}
              </div>
            )}

            {/* Universal Game Form */}
            {ticketType === 'universal' && (
              !selectedUniversalGame ? (
                <div className="p-6 bg-slate-800/80 border border-slate-700 rounded-2xl text-center space-y-3 my-2">
                  <Globe className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="font-bold text-slate-300">No Active Universal Games</p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    There are currently no active Universal Draw Games. You can sell tickets for{' '}
                    <button type="button" onClick={() => setTicketType('solo')} className="text-amber-400 font-bold underline cursor-pointer">
                      Solo Games
                    </button>{' '}
                    or{' '}
                    <button type="button" onClick={() => setTicketType('multiplayer')} className="text-amber-400 font-bold underline cursor-pointer">
                      Multiplayer Games
                    </button>.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSellUniversal} className="space-y-4 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Select Universal Game</label>
                    <select
                      value={selectedUniversalGame.id}
                      onChange={(e) => {
                        const found = universalGames.find((g) => g.id === e.target.value);
                        if (found) setSelectedUniversalGame(found);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-amber-500"
                    >
                      {universalGames.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} — Price: {g.ticketPrice} Birr (Jackpot: {g.jackpotAmount.toLocaleString()} Birr)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Auto Commission Callout */}
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                    <div className="text-emerald-300">
                      <p className="font-bold">10% Agent Commission Guarantee</p>
                      <p className="text-[11px] text-emerald-200/80">
                        Ticket Price: {selectedUniversalGame.ticketPrice} Birr → You earn{' '}
                        <span className="font-bold text-white">
                          {Math.round(selectedUniversalGame.ticketPrice * selectedUniversalGame.agentCommissionRate)} Birr
                        </span>{' '}
                        instantly into wallet!
                      </p>
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Player Name *</label>
                    <input
                      type="text"
                      required
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="e.g. Ermias Tadesse"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                    <input
                      type="text"
                      required
                      value={playerPhone}
                      onChange={(e) => setPlayerPhone(e.target.value)}
                      placeholder="+251911234567"
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Selected Number (5-Digit Lucky Pick) *
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      required
                      maxLength={5}
                      value={selectedNumber}
                      onChange={(e) => setSelectedNumber(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-mono text-base font-bold text-center tracking-widest focus:outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedNumber(Math.floor(10000 + Math.random() * 90000).toString())}
                      className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-xl font-bold whitespace-nowrap cursor-pointer"
                    >
                      Random
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Payment Confirmation</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'cash', label: 'Cash Payment' },
                      { id: 'telebirr', label: 'Telebirr QR' },
                      { id: 'cbe', label: 'CBE Birr' },
                    ].map((pm) => (
                      <button
                        type="button"
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                          paymentMethod === pm.id
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                            : 'bg-slate-800 border-slate-700 text-slate-400'
                        }`}
                      >
                        {pm.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <TicketIcon className="w-4 h-4" />
                    <span>Generate Ticket & Collect {selectedUniversalGame.ticketPrice} Birr</span>
                  </button>
                </div>
              </form>
              )
            )}

            {/* Solo Game Ticket Form */}
            {ticketType === 'solo' && (
              <div className="space-y-4 text-xs">
                {soloGames.length === 0 || isCreatingRoom ? (
                  /* Quick Room Creation Form */
                  <form onSubmit={handleQuickCreateRoom} className="p-5 bg-purple-950/30 border border-purple-500/30 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-purple-400 font-bold">
                        <Dices className="w-5 h-5" />
                        <span>Create New Solo Game Room</span>
                      </div>
                      {soloGames.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setIsCreatingRoom(false)}
                          className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                    <p className="text-slate-400 text-[11px]">
                      No active room selected. Set up a Solo Room (0-9 numbers, 10 seats) to start selling tickets immediately:
                    </p>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Room Name</label>
                      <input
                        type="text"
                        value={newRoomName}
                        onChange={(e) => setNewRoomName(e.target.value)}
                        placeholder={`Spain Solo Room #${soloGames.length + 1}`}
                        className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Ticket Price (Birr)</label>
                        <input
                          type="number"
                          min={10}
                          step={10}
                          value={newRoomPrice}
                          onChange={(e) => setNewRoomPrice(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-300 font-semibold mb-1">Winner Payout (%)</label>
                        <input
                          type="number"
                          min={50}
                          max={90}
                          value={newRoomWinPct}
                          onChange={(e) => setNewRoomWinPct(Number(e.target.value))}
                          className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Room & Start Selling Seats</span>
                    </button>
                  </form>
                ) : (
                  /* Room Selector & Multi-Seat Purchase Form */
                  <form onSubmit={handleSellSolo} className="space-y-4 text-xs">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1">
                        <label className="block text-slate-300 font-semibold mb-1">Select Solo Room</label>
                        <select
                          value={selectedSoloGame?.id || ''}
                          onChange={(e) => {
                            const found = soloGames.find((g) => g.id === e.target.value);
                            if (found) {
                              setSelectedSoloGame(found);
                              setSelectedSoloNumbers([]);
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                        >
                          {soloGames.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.name} — {g.ticketPrice} Birr (Seats taken: {Object.keys(g.selectedNumbers).length}/{g.playerLimit}) {g.status !== 'waiting' ? '[CLOSED]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="pt-5">
                        <button
                          type="button"
                          onClick={() => setIsCreatingRoom(true)}
                          className="py-2.5 px-3 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 rounded-xl font-bold flex items-center space-x-1 cursor-pointer whitespace-nowrap"
                        >
                          <Plus className="w-4 h-4" />
                          <span>New Room</span>
                        </button>
                      </div>
                    </div>

                    {/* Anti-Fraud Game Closed Lock Banner */}
                    {selectedSoloGame && (selectedSoloGame.status !== 'waiting' || selectedSoloGame.isLocked || selectedSoloGame.ticketSellingClosedAt) ? (
                      <div className="p-4 bg-rose-500/10 border-2 border-rose-500/40 rounded-2xl text-center space-y-1.5 animate-pulse">
                        <p className="font-black text-rose-400 text-sm tracking-wider uppercase flex items-center justify-center space-x-1.5">
                          <Lock className="w-4 h-4 text-rose-400" />
                          <span>GAME CLOSED</span>
                        </p>
                        <p className="text-xs font-bold text-white">Ticket purchasing has ended.</p>
                        <p className="text-[11px] text-slate-300">This game is already running or completed. No new tickets can be issued.</p>
                      </div>
                    ) : (
                      <>
                        {/* Solo Number Multi-Selector (0-9) */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-slate-300 font-semibold">
                              Select Seat Numbers (0 to 9) — Click exact number to select/deselect
                            </label>
                            <button
                              type="button"
                              onClick={selectAllAvailableSoloNumbers}
                              className="text-[11px] text-purple-400 hover:text-purple-300 font-semibold underline cursor-pointer"
                            >
                              Select All Available
                            </button>
                          </div>

                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                            {['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => {
                              const isTaken = selectedSoloGame?.selectedNumbers?.[num];
                              const isSelected = selectedSoloNumbers.includes(num);

                              return (
                                <button
                                  type="button"
                                  key={num}
                                  disabled={!!isTaken}
                                  onClick={() => toggleSoloNumber(num)}
                                  title={isTaken ? `Seat #${num} purchased and LOCKED` : `Select Seat #${num}`}
                                  className={`py-2.5 rounded-xl font-black font-mono text-base border transition-all cursor-pointer relative ${
                                    isTaken
                                      ? 'bg-rose-950/40 border-rose-900/60 text-rose-500/60 line-through cursor-not-allowed'
                                      : isSelected
                                      ? 'bg-purple-500 border-purple-400 text-slate-950 font-black shadow-lg ring-2 ring-purple-300 scale-105'
                                      : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 hover:border-purple-500/50'
                                  }`}
                                >
                                  {num}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Summary Cost Breakdown */}
                        <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-2xl text-xs space-y-1.5">
                          <div className="flex justify-between items-center text-slate-300 font-semibold">
                            <span>Selected Seats ({soloTicketCount}):</span>
                            <span className="font-mono text-amber-300 font-bold">
                              {selectedSoloNumbers.length > 0
                                ? selectedSoloNumbers.map((n) => `#${n}`).join(', ')
                                : 'None selected'}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300 font-semibold">
                            <span>Total Ticket Price ({soloTicketCount} × {soloPricePerTicket} Birr):</span>
                            <span className="font-bold text-white text-sm">{soloTotalCost} Birr</span>
                          </div>
                          <div className="flex justify-between items-center text-emerald-400 text-[11px] font-bold pt-1 border-t border-purple-500/10">
                            <span>Agent Commission Earned (+{soloAgentMarginPct}% — Equal split with Admin):</span>
                            <span>+{soloAgentCommission} Birr</span>
                          </div>
                        </div>

                        <div className="pt-1">
                          <button
                            type="submit"
                            disabled={selectedSoloNumbers.length === 0}
                            className={`w-full py-3.5 font-black rounded-2xl shadow-xl text-sm flex items-center justify-center space-x-2 transition-all ${
                              selectedSoloNumbers.length === 0
                                ? 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-slate-950 shadow-purple-500/20 cursor-pointer'
                            }`}
                          >
                            <Dices className="w-4 h-4" />
                            <span>
                              {selectedSoloNumbers.length === 0
                                ? 'Click number(s) above to select seat(s)'
                                : `Issue ${soloTicketCount} ${soloTicketCount === 1 ? 'Solo Ticket' : 'Solo Tickets'} (${soloTotalCost} Birr)`}
                            </span>
                          </button>
                        </div>
                      </>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Multi Game Spin Form */}
            {ticketType === 'multiplayer' && (
              <form onSubmit={handleSellMultiplayer} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Select Multi Game Room</label>
                  {multiGames.length === 0 ? (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-[11px]">
                      No active Multi Game rooms. Create one in the Multi Game Spin tab!
                    </div>
                  ) : (
                    <select
                      value={selectedMultiGame?.id || ''}
                      onChange={(e) => {
                        const found = multiGames.find((g) => g.id === e.target.value);
                        if (found) setSelectedMultiGame(found);
                      }}
                      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium focus:outline-none focus:border-purple-500"
                    >
                      {multiGames.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} — Price: {g.ticketPrice} Birr ({g.tickets.length}/{g.maxTickets} tickets issued)
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {selectedMultiGame && (selectedMultiGame.isLocked || selectedMultiGame.status !== 'waiting' || selectedMultiGame.ticketSellingClosedAt) && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-[11px] text-rose-300 flex items-start space-x-2">
                    <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">GAME CLOSED: Ticket Purchasing Ended</p>
                      <p className="text-[10px] text-slate-300 mt-0.5">
                        This Multi Game Spin room is locked or running. No new tickets can be issued.
                      </p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Player Full Name</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-purple-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Player Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="+2519..."
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-300 font-semibold">
                      Select Seat Numbers (00 to 99)
                    </label>
                    <span className="text-[10px] text-amber-300 font-mono font-bold">
                      {selectedMultiNumbers.length > 0
                        ? `${selectedMultiNumbers.length} seat(s) selected`
                        : `Picked: #${selectedNumber.padStart(2, '0')}`}
                    </span>
                  </div>

                  {/* Quick Preset Buttons for Multi Game */}
                  <div className="flex items-center space-x-2 mb-2">
                    <button
                      type="button"
                      onClick={() => handleQuickSelectMultiRandom(5)}
                      className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 cursor-pointer"
                    >
                      + Quick 5 Seats
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickSelectMultiRandom(10)}
                      className="px-2.5 py-1 bg-purple-950/80 hover:bg-purple-900 border border-purple-500/30 rounded-lg text-[10px] font-bold text-purple-300 cursor-pointer"
                    >
                      + Quick 10 Seats
                    </button>
                    {selectedMultiNumbers.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedMultiNumbers([])}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-[10px] font-bold text-rose-300 cursor-pointer"
                      >
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* 00-99 Grid Picker Buttons */}
                  <div className="grid grid-cols-10 gap-1 p-2 bg-slate-950 rounded-2xl border border-slate-800 max-h-44 overflow-y-auto mb-2">
                    {Array.from({ length: 100 }).map((_, i) => {
                      const numStr = i.toString().padStart(2, '0');
                      const isSelectedInMulti = selectedMultiNumbers.includes(numStr);
                      const isSinglePicked = selectedMultiNumbers.length === 0 && selectedNumber.padStart(2, '0') === numStr;
                      const ticketsOnSeat = selectedMultiGame?.tickets.filter(t => t.selectedNumber.padStart(2, '0') === numStr).length || 0;

                      return (
                        <button
                          key={numStr}
                          type="button"
                          onClick={() => toggleMultiSeatNumber(numStr)}
                          className={`py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer relative ${
                            isSelectedInMulti
                              ? 'bg-purple-500 text-slate-950 font-black shadow-md ring-2 ring-purple-300'
                              : isSinglePicked
                              ? 'bg-purple-900/80 text-purple-200 border border-purple-400'
                              : ticketsOnSeat > 0
                              ? 'bg-slate-800/80 border border-slate-700 text-amber-300'
                              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                          }`}
                        >
                          {numStr}
                          {ticketsOnSeat > 0 && (
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 text-[8px] text-slate-950 font-black flex items-center justify-center">
                              {ticketsOnSeat}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {selectedMultiNumbers.length > 0 ? (
                    <div className="p-2.5 bg-purple-950/40 border border-purple-500/30 rounded-xl text-xs font-mono text-purple-200 truncate">
                      Selected Seats ({selectedMultiNumbers.length}):{' '}
                      <span className="font-bold text-amber-300">{selectedMultiNumbers.join(', ')}</span>
                    </div>
                  ) : (
                    <input
                      type="text"
                      required
                      value={selectedNumber}
                      onChange={(e) => setSelectedNumber(e.target.value)}
                      placeholder="e.g. 07 or 42"
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:border-purple-500 text-sm"
                    />
                  )}
                </div>

                {selectedMultiGame && (
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-[11px]">
                    {(() => {
                      const count = selectedMultiNumbers.length || 1;
                      const pricePerTicket = selectedMultiGame.ticketPrice;
                      const totalCost = count * pricePerTicket;
                      const marginPct = (100 - selectedMultiGame.winningPercentage) / 100;
                      const totalCommission = Math.round((totalCost * marginPct) / 2);

                      return (
                        <>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Selected Tickets Count:</span>
                            <span className="font-bold text-amber-300 font-mono">{count} ticket(s)</span>
                          </div>
                          <div className="flex justify-between items-center text-slate-300">
                            <span>Total Ticket Price ({pricePerTicket} Birr/ea):</span>
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
                )}

                <button
                  type="submit"
                  disabled={!selectedMultiGame || selectedMultiGame.isLocked || selectedMultiGame.status !== 'waiting' || !!selectedMultiGame.ticketSellingClosedAt}
                  className={`w-full py-3.5 font-black rounded-2xl text-xs flex items-center justify-center space-x-2 transition-all ${
                    !selectedMultiGame || selectedMultiGame.isLocked || selectedMultiGame.status !== 'waiting' || selectedMultiGame.ticketSellingClosedAt
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700/60'
                      : 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 text-slate-950 shadow-lg shadow-purple-500/20 cursor-pointer'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>
                    {selectedMultiGame?.isLocked || selectedMultiGame?.status !== 'waiting' || selectedMultiGame?.ticketSellingClosedAt
                      ? 'Game Closed — Cannot Issue Ticket'
                      : `Issue Multi Game Ticket (${selectedMultiGame?.ticketPrice || 0} Birr)`}
                  </span>
                </button>
              </form>
            )}
          </div>
        ) : (
          /* Ticket Generated Output View */
          <div className="space-y-6 text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>
                {generatedTickets.length === 1
                  ? 'Ticket Issued Successfully & Commission Credited!'
                  : `${generatedTickets.length} Tickets Issued Successfully & Commission Credited!`}
              </span>
            </div>

            {/* Printable Ticket Cards Container */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {generatedTickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} onPrint={() => window.print()} />
              ))}
            </div>

            {/* Notification & Confirmation Callout */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-1">
              <p className="font-semibold text-amber-300 flex items-center space-x-1.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <span>Ticket Issuance Confirmation</span>
              </p>
              <p className="text-slate-400 text-[11px]">
                {generatedTickets[0].gameType === 'solo' ? (
                  <>
                    Issued <span className="font-bold text-white">{generatedTickets.length} Solo Ticket(s)</span> for Seat Number(s){' '}
                    <span className="font-mono text-amber-400 font-bold">
                      {generatedTickets.map((t) => `#${t.selectedNumber}`).join(', ')}
                    </span>. Total Serial IDs:{' '}
                    <span className="font-mono text-white font-bold">
                      {generatedTickets.map((t) => t.id).join(', ')}
                    </span>.
                  </>
                ) : (
                  <>
                    An SMS notification containing Ticket ID{' '}
                    <span className="font-mono text-white font-bold">{generatedTickets[0].id}</span> was sent to{' '}
                    <span className="font-semibold text-white">{generatedTickets[0].playerPhone}</span>.
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs cursor-pointer flex items-center justify-center space-x-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Sell More Tickets</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs cursor-pointer"
              >
                Close Counter
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
