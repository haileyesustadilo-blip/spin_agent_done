import {
  AgentProfile,
  UniversalGame,
  SoloGame,
  MultiGame,
  MultiGameTicketSelection,
  Ticket,
  Transaction,
  WithdrawalRequest,
  SystemNotification,
  AuditLog,
} from '../types';
import {
  INITIAL_AGENT,
  INITIAL_UNIVERSAL_GAMES,
  INITIAL_SOLO_GAMES,
  INITIAL_MULTI_GAMES,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_WITHDRAWALS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const STORAGE_VERSION = 'v6_multi_spin_update';
if (typeof window !== 'undefined') {
  if (localStorage.getItem('spain_game_data_version') !== STORAGE_VERSION) {
    localStorage.clear();
    localStorage.setItem('spain_game_data_version', STORAGE_VERSION);
  }
}

const KEYS = {
  AGENT: 'spain_game_agent',
  UNIVERSAL_GAMES: 'spain_game_universal_games',
  SOLO_GAMES: 'spain_game_solo_games',
  MULTI_GAMES: 'spain_game_multi_games',
  TICKETS: 'spain_game_tickets',
  TRANSACTIONS: 'spain_game_transactions',
  WITHDRAWALS: 'spain_game_withdrawals',
  NOTIFICATIONS: 'spain_game_notifications',
  AUDIT_LOGS: 'spain_game_audit_logs',
  ALL_AGENTS: 'spain_game_all_agents',
};

// Helper: 17-digit random numeric string generator
export function generate17DigitId(): string {
  let result = '';
  for (let i = 0; i < 17; i++) {
    result += Math.floor(Math.random() * 10).toString();
  }
  return result;
}

// Helper: Short Ticket ID generator (e.g. TK56874)
export function generateTicketId(): string {
  const num = Math.floor(10000 + Math.random() * 90000);
  return `TK${num}`;
}

export class StorageService {
  static getAgent(): AgentProfile {
    const raw = localStorage.getItem(KEYS.AGENT);
    if (!raw) {
      localStorage.setItem(KEYS.AGENT, JSON.stringify(INITIAL_AGENT));
      return INITIAL_AGENT;
    }
    const parsed: AgentProfile = JSON.parse(raw);
    if (parsed.fullName === 'Haile Tadilo') {
      parsed.fullName = INITIAL_AGENT.fullName;
      parsed.accountHolderName = INITIAL_AGENT.accountHolderName;
      if (parsed.email === 'haile.agent@spaingame.et') {
        parsed.email = INITIAL_AGENT.email;
      }
      localStorage.setItem(KEYS.AGENT, JSON.stringify(parsed));
    }
    return parsed;
  }

  static saveAgent(agent: AgentProfile): void {
    localStorage.setItem(KEYS.AGENT, JSON.stringify(agent));
  }

  static getAllAgents(): AgentProfile[] {
    const raw = localStorage.getItem(KEYS.ALL_AGENTS);
    if (!raw) {
      const initialList = [INITIAL_AGENT];
      localStorage.setItem(KEYS.ALL_AGENTS, JSON.stringify(initialList));
      return initialList;
    }
    const parsedList: AgentProfile[] = JSON.parse(raw);
    let updated = false;
    parsedList.forEach((ag) => {
      if (ag.fullName === 'Haile Tadilo') {
        ag.fullName = INITIAL_AGENT.fullName;
        ag.accountHolderName = INITIAL_AGENT.accountHolderName;
        if (ag.email === 'haile.agent@spaingame.et') {
          ag.email = INITIAL_AGENT.email;
        }
        updated = true;
      }
    });
    if (updated) {
      localStorage.setItem(KEYS.ALL_AGENTS, JSON.stringify(parsedList));
    }
    return parsedList;
  }

  static saveAllAgents(agents: AgentProfile[]): void {
    localStorage.setItem(KEYS.ALL_AGENTS, JSON.stringify(agents));
  }

  static getUniversalGames(): UniversalGame[] {
    const raw = localStorage.getItem(KEYS.UNIVERSAL_GAMES);
    if (!raw) {
      localStorage.setItem(KEYS.UNIVERSAL_GAMES, JSON.stringify(INITIAL_UNIVERSAL_GAMES));
      return INITIAL_UNIVERSAL_GAMES;
    }
    const parsed: UniversalGame[] = JSON.parse(raw);
    const cleaned = parsed.filter((g) => !['UG-101', 'UG-102', 'UG-103'].includes(g.id));
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(KEYS.UNIVERSAL_GAMES, JSON.stringify(cleaned));
    }
    return cleaned;
  }

  static getSoloGames(): SoloGame[] {
    const raw = localStorage.getItem(KEYS.SOLO_GAMES);
    if (!raw) {
      localStorage.setItem(KEYS.SOLO_GAMES, JSON.stringify(INITIAL_SOLO_GAMES));
      return INITIAL_SOLO_GAMES;
    }
    return JSON.parse(raw);
  }

  static saveSoloGames(games: SoloGame[]): void {
    localStorage.setItem(KEYS.SOLO_GAMES, JSON.stringify(games));
  }

  static getMultiGames(): MultiGame[] {
    const raw = localStorage.getItem(KEYS.MULTI_GAMES);
    if (!raw) {
      localStorage.setItem(KEYS.MULTI_GAMES, JSON.stringify(INITIAL_MULTI_GAMES));
      return INITIAL_MULTI_GAMES;
    }
    const parsed: MultiGame[] = JSON.parse(raw);
    // Remove old fake initial items if present
    const cleaned = parsed.filter((g) => g.id !== 'MG-501' && g.id !== 'MG-502');
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(KEYS.MULTI_GAMES, JSON.stringify(cleaned));
    }
    return cleaned;
  }

  static saveMultiGames(games: MultiGame[]): void {
    localStorage.setItem(KEYS.MULTI_GAMES, JSON.stringify(games));
  }

  static getTickets(): Ticket[] {
    const raw = localStorage.getItem(KEYS.TICKETS);
    if (!raw) {
      localStorage.setItem(KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    return JSON.parse(raw);
  }

  static saveTickets(tickets: Ticket[]): void {
    localStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
  }

  static getTransactions(): Transaction[] {
    const raw = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!raw) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  }

  static saveTransactions(txs: Transaction[]): void {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(txs));
  }

  static getWithdrawals(): WithdrawalRequest[] {
    const raw = localStorage.getItem(KEYS.WITHDRAWALS);
    if (!raw) {
      localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
      return INITIAL_WITHDRAWALS;
    }
    return JSON.parse(raw);
  }

  static saveWithdrawals(wds: WithdrawalRequest[]): void {
    localStorage.setItem(KEYS.WITHDRAWALS, JSON.stringify(wds));
  }

  static getNotifications(): SystemNotification[] {
    const raw = localStorage.getItem(KEYS.NOTIFICATIONS);
    if (!raw) {
      localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
      return INITIAL_NOTIFICATIONS;
    }
    return JSON.parse(raw);
  }

  static saveNotifications(notes: SystemNotification[]): void {
    localStorage.setItem(KEYS.NOTIFICATIONS, JSON.stringify(notes));
  }

  static getAuditLogs(): AuditLog[] {
    const raw = localStorage.getItem(KEYS.AUDIT_LOGS);
    if (!raw) {
      localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(INITIAL_AUDIT_LOGS));
      return INITIAL_AUDIT_LOGS;
    }
    return JSON.parse(raw);
  }

  static addAuditLog(action: string, details: string, agentId = 'AG-8820'): void {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}`,
      agentId,
      action,
      details,
      timestamp: new Date().toISOString(),
      ipAddress: '197.156.120.44',
    };
    logs.unshift(newLog);
    localStorage.setItem(KEYS.AUDIT_LOGS, JSON.stringify(logs));
  }

  // Sell Universal or Multiplayer Ticket
  static sellUniversalTicket(
    game: UniversalGame,
    playerName: string,
    playerPhone: string,
    selectedNumber: string
  ): { ticket: Ticket; agent: AgentProfile } {
    // ANTI-FRAUD RULE 1: Tickets cannot be sold after game closes or starts
    if (game.status === 'closed' || game.status === 'completed' || game.isLocked || game.ticketSellingClosedAt) {
      throw new Error('GAME CLOSED: Ticket purchasing has ended. This game is already running or completed.');
    }

    const agent = this.getAgent();
    const ticketId = generateTicketId();
    const seventeenDigitId = generate17DigitId();
    const commission = Math.round(game.ticketPrice * game.agentCommissionRate);

    const ticket: Ticket = {
      id: ticketId,
      seventeenDigitId,
      gameId: game.id,
      gameName: game.name,
      gameType: 'universal',
      agentId: agent.id,
      agentName: agent.fullName,
      playerName,
      playerPhone,
      selectedNumber,
      ticketPrice: game.ticketPrice,
      commissionEarned: commission,
      purchaseDate: new Date().toISOString(),
      qrData: JSON.stringify({
        ticketId,
        seventeenDigitId,
        gameName: game.name,
        number: selectedNumber,
        playerName,
        playerPhone,
        agentName: agent.fullName,
        date: new Date().toISOString(),
      }),
      status: 'valid',
    };

    // Update Universal Game total tickets sold
    const universalGames = this.getUniversalGames();
    const targetUg = universalGames.find(g => g.id === game.id);
    if (targetUg) {
      targetUg.totalTicketsSold = (targetUg.totalTicketsSold || 0) + 1;
      localStorage.setItem(KEYS.UNIVERSAL_GAMES, JSON.stringify(universalGames));
    }

    // Save Ticket
    const tickets = this.getTickets();
    tickets.unshift(ticket);
    this.saveTickets(tickets);

    // Update Agent Stats & Wallet
    agent.walletBalance += commission;
    agent.todayCommission += commission;
    agent.todaySalesCount += 1;
    agent.totalTicketsSold += 1;
    this.saveAgent(agent);

    // Save Transaction
    const txs = this.getTransactions();
    txs.unshift({
      id: `TX-${Date.now()}`,
      agentId: agent.id,
      type: 'ticket_sale',
      amount: game.ticketPrice,
      description: `Sold Universal Ticket ${ticketId} (#${selectedNumber}) to ${playerName}`,
      referenceId: ticketId,
      date: new Date().toISOString(),
      status: 'completed',
    });
    txs.unshift({
      id: `TX-${Date.now() + 1}`,
      agentId: agent.id,
      type: 'commission_payout',
      amount: commission,
      description: `10% Commission (${commission} Birr) for Ticket ${ticketId}`,
      referenceId: ticketId,
      date: new Date().toISOString(),
      status: 'completed',
    });
    this.saveTransactions(txs);

    // Save Notification
    const notes = this.getNotifications();
    notes.unshift({
      id: `NT-${Date.now()}`,
      title: 'Ticket Sold & Commission Added',
      message: `Sold ticket ${ticketId} to ${playerName}. +${commission} Birr commission credited to wallet!`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'commission',
    });
    this.saveNotifications(notes);

    // Audit log
    this.addAuditLog('SELL_UNIVERSAL_TICKET', `Ticket ${ticketId} sold for ${game.ticketPrice} Birr (Commission ${commission} Birr)`);

    return { ticket, agent };
  }

  // Create Solo Game
  static createSoloGame(
    name: string,
    ticketPrice: number,
    playerLimit: number, // 1-10
    winningPercentage: number,
    description: string
  ): SoloGame {
    const agent = this.getAgent();
    const games = this.getSoloGames();

    const newGame: SoloGame = {
      id: `SG-${Math.floor(100 + Math.random() * 900)}`,
      agentId: agent.id,
      name,
      ticketPrice,
      playerLimit,
      winningPercentage,
      description,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'waiting',
      selectedNumbers: {},
      createdAt: new Date().toISOString(),
    };

    games.unshift(newGame);
    this.saveSoloGames(games);

    agent.activeGamesCount += 1;
    this.saveAgent(agent);

    this.addAuditLog('CREATE_SOLO_GAME', `Solo game ${newGame.id} (${name}) created. Price: ${ticketPrice} Birr`);

    return newGame;
  }

  // Lock Solo Game Tickets Before Spinning Starts
  static lockSoloGameTickets(soloGameId: string): SoloGame {
    const soloGames = this.getSoloGames();
    const game = soloGames.find((g) => g.id === soloGameId);
    if (!game) throw new Error('Solo Game not found');

    if (game.status === 'completed') {
      throw new Error('GAME CLOSED: Game is already completed and READ ONLY.');
    }

    game.status = 'in_progress';
    game.isLocked = true;
    if (!game.ticketSellingClosedAt) {
      game.ticketSellingClosedAt = new Date().toISOString();
    }
    this.saveSoloGames(soloGames);

    this.addAuditLog(
      'LOCK_GAME_TICKETS',
      `Ticket selling permanently CLOSED & LOCKED for Solo Game ${game.id} at ${game.ticketSellingClosedAt}`
    );

    return game;
  }

  // Sell Solo Game Ticket
  static sellSoloTicket(
    soloGameId: string,
    chosenNumber: string, // '0'-'9'
    playerName = '',
    playerPhone = ''
  ): { ticket: Ticket; soloGame: SoloGame } {
    const agent = this.getAgent();
    const soloGames = this.getSoloGames();
    const game = soloGames.find((g) => g.id === soloGameId);

    if (!game) throw new Error('Solo Game not found');

    // ANTI-FRAUD RULE 1 & 11: No ticket sales after game starts or closed
    if (game.status !== 'waiting' || game.isLocked || game.ticketSellingClosedAt) {
      throw new Error('GAME CLOSED: Ticket purchasing has ended. This game is already running or completed.');
    }

    // ANTI-FRAUD SOLO RULE: Once a seat/number is sold, it is LOCKED and cannot be sold again
    if (game.selectedNumbers[chosenNumber]) {
      throw new Error(`Number #${chosenNumber} is already purchased and LOCKED! It cannot be sold again.`);
    }

    const currentPicksCount = Object.keys(game.selectedNumbers).length;
    if (currentPicksCount >= game.playerLimit) {
      throw new Error(`Maximum player limit (${game.playerLimit}) reached for this Solo game.`);
    }

    const ticketId = generateTicketId();
    const seventeenDigitId = generate17DigitId();

    const formattedPlayerName = playerName.trim() || `Seat #${chosenNumber}`;
    const formattedPlayerPhone = playerPhone.trim() || 'N/A';

    // Remaining margin is split equally (50/50) between Agent and Admin
    // (e.g. when winner payout is 80%, 20% margin is split: 10% Agent, 10% Admin)
    const agentMarginPercentage = (100 - game.winningPercentage) / 2;
    const agentCommissionPerTicket = Math.round(game.ticketPrice * (agentMarginPercentage / 100));

    // Update Solo Game record
    game.selectedNumbers[chosenNumber] = {
      playerName: formattedPlayerName,
      playerPhone: formattedPlayerPhone,
      ticketId,
    };
    this.saveSoloGames(soloGames);

    // Create Ticket
    const ticket: Ticket = {
      id: ticketId,
      seventeenDigitId,
      gameId: game.id,
      gameName: game.name,
      gameType: 'solo',
      agentId: agent.id,
      agentName: agent.fullName,
      playerName: formattedPlayerName,
      playerPhone: formattedPlayerPhone,
      selectedNumber: chosenNumber,
      ticketPrice: game.ticketPrice,
      commissionEarned: agentCommissionPerTicket,
      purchaseDate: new Date().toISOString(),
      qrData: JSON.stringify({
        ticketId,
        seventeenDigitId,
        gameName: game.name,
        number: chosenNumber,
        agentName: agent.fullName,
        type: 'solo',
      }),
      status: 'valid',
    };

    const tickets = this.getTickets();
    tickets.unshift(ticket);
    this.saveTickets(tickets);

    // Agent earnings
    agent.walletBalance += agentCommissionPerTicket;
    agent.todayCommission += agentCommissionPerTicket;
    agent.todaySalesCount += 1;
    agent.totalTicketsSold += 1;
    this.saveAgent(agent);

    // Transaction
    const txs = this.getTransactions();
    txs.unshift({
      id: `TX-${Date.now()}`,
      agentId: agent.id,
      type: 'ticket_sale',
      amount: game.ticketPrice,
      description: `Solo Ticket ${ticketId} (#${chosenNumber}) issued for ${game.name}`,
      referenceId: ticketId,
      date: new Date().toISOString(),
      status: 'completed',
    });
    this.saveTransactions(txs);

    this.addAuditLog('SELL_SOLO_TICKET', `Solo Ticket ${ticketId} issued for number #${chosenNumber} in game ${game.id}`);

    return { ticket, soloGame: game };
  }

  // Sell Multiple Solo Game Tickets at once
  static sellSoloTicketsBatch(
    soloGameId: string,
    chosenNumbers: string[], // e.g. ['0', '1', '5']
    playerName = '',
    playerPhone = ''
  ): { tickets: Ticket[]; soloGame: SoloGame } {
    if (!chosenNumbers || chosenNumbers.length === 0) {
      throw new Error('Please select at least one number to buy.');
    }

    const tickets: Ticket[] = [];
    let updatedGame: SoloGame | null = null;

    for (const num of chosenNumbers) {
      const res = this.sellSoloTicket(soloGameId, num, playerName, playerPhone);
      tickets.push(res.ticket);
      updatedGame = res.soloGame;
    }

    return { tickets, soloGame: updatedGame! };
  }

  // Spin Solo Wheel & Conclude Game
  static concludeSoloGame(soloGameId: string, winningNum: string): SoloGame {
    const agent = this.getAgent();
    const soloGames = this.getSoloGames();
    const game = soloGames.find((g) => g.id === soloGameId);
    if (!game) throw new Error('Solo Game not found');

    if (game.status === 'completed' && game.winningNumber) {
      throw new Error('ANTI-FRAUD LOCK: Game is already completed and READ ONLY. Winning numbers cannot be modified.');
    }

    const totalPlayers = Object.keys(game.selectedNumbers).length;
    const totalPool = totalPlayers * game.ticketPrice;
    const prizeAmount = Math.round(totalPool * (game.winningPercentage / 100));
    const totalMargin = totalPool - prizeAmount;
    const agentCommissionTotal = Math.round(totalMargin / 2); // Equal 50/50 split with Admin

    game.status = 'completed';
    game.isLocked = true;
    if (!game.ticketSellingClosedAt) {
      game.ticketSellingClosedAt = new Date().toISOString();
    }
    game.winningNumber = winningNum;
    game.totalPool = totalPool;
    game.agentCommission = agentCommissionTotal;

    const winnerInfo = game.selectedNumbers[winningNum];
    const tickets = this.getTickets();

    if (winnerInfo) {
      game.winnerPlayerName = winnerInfo.playerName;
      game.winnerPrize = prizeAmount;

      // Update ticket to winner_unclaimed
      const winningTicket = tickets.find((t) => t.id === winnerInfo.ticketId);
      if (winningTicket) {
        winningTicket.status = 'winner_unclaimed';
        winningTicket.prizeAmount = prizeAmount;
        winningTicket.qrData = JSON.stringify({
          ticketId: winningTicket.id,
          seventeenDigitId: winningTicket.seventeenDigitId,
          gameName: game.name,
          number: winningNum,
          playerName: winnerInfo.playerName,
          status: 'winner_unclaimed',
          prize: prizeAmount,
        });
      }

      agent.pendingWinnersCount += 1;

      // Notification
      const notes = this.getNotifications();
      notes.unshift({
        id: `NT-${Date.now()}`,
        title: 'Solo Game Winner Chosen!',
        message: `Number #${winningNum} won! Winner: ${winnerInfo.playerName} (${prizeAmount} Birr prize).`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'winner',
      });
      this.saveNotifications(notes);
    } else {
      game.winnerPlayerName = 'No Winner (Number was unselected)';
      game.winnerPrize = 0;
    }

    // Mark other tickets in this solo game as non_winner
    tickets.forEach((t) => {
      if (t.gameId === game.id && t.selectedNumber !== winningNum) {
        t.status = 'non_winner';
      }
    });

    this.saveTickets(tickets);
    this.saveSoloGames(soloGames);

    agent.activeGamesCount = Math.max(0, agent.activeGamesCount - 1);
    this.saveAgent(agent);

    this.addAuditLog('SOLO_GAME_SPIN', `Solo Game ${game.id} spun. Winning number: #${winningNum}. Winner: ${game.winnerPlayerName}`);

    return game;
  }

  // Create Multi Game Spin Room
  static createMultiGame(
    agentId: string,
    name: string,
    ticketPrice: number,
    maxTickets: number = 100,
    winningPercentage: number = 80,
    numberRange: '0-9' | '0-99' = '0-9',
    description: string = 'Multi Game Spin Room'
  ): MultiGame {
    const games = this.getMultiGames();
    const newGame: MultiGame = {
      id: `MG-${Math.floor(100 + Math.random() * 900)}`,
      agentId,
      name,
      ticketPrice,
      maxTickets,
      numberRange,
      winningPercentage,
      description,
      status: 'waiting',
      tickets: [],
      createdAt: new Date().toISOString(),
    };

    games.unshift(newGame);
    this.saveMultiGames(games);

    this.addAuditLog('CREATE_MULTI_GAME', `Created Multi Game Spin Room ${newGame.id}: ${newGame.name}`);
    return newGame;
  }

  // Lock Multi Game Tickets Before Spinning Starts
  static lockMultiGameTickets(multiGameId: string): MultiGame {
    const multiGames = this.getMultiGames();
    const game = multiGames.find((g) => g.id === multiGameId);
    if (!game) throw new Error('Multi Game not found');

    if (game.status === 'completed') {
      throw new Error('GAME CLOSED: Game is already completed and READ ONLY.');
    }

    game.status = 'in_progress';
    game.isLocked = true;
    if (!game.ticketSellingClosedAt) {
      game.ticketSellingClosedAt = new Date().toISOString();
    }
    this.saveMultiGames(multiGames);

    this.addAuditLog(
      'LOCK_MULTI_GAME_TICKETS',
      `Ticket selling permanently CLOSED & LOCKED for Multi Game ${game.id} at ${game.ticketSellingClosedAt}`
    );

    return game;
  }

  // Sell Multi Game Ticket
  static sellMultiGameTicket(
    multiGameId: string,
    playerName: string,
    playerPhone: string,
    chosenNumber: string
  ): { ticket: Ticket; multiGame: MultiGame } {
    const res = this.sellMultiGameTickets(multiGameId, playerName, playerPhone, [chosenNumber]);
    return { ticket: res.tickets[0], multiGame: res.multiGame };
  }

  static sellMultiGameTickets(
    multiGameId: string,
    playerName: string,
    playerPhone: string,
    chosenNumbers: string[]
  ): { tickets: Ticket[]; multiGame: MultiGame } {
    const multiGames = this.getMultiGames();
    const game = multiGames.find((g) => g.id === multiGameId);

    if (!game) throw new Error('Multi Game not found');

    if (chosenNumbers.length === 0) {
      throw new Error('Please select at least one seat number.');
    }

    // ANTI-FRAUD RULE: No ticket sales after game starts or closed/locked
    if (game.status !== 'waiting' || game.isLocked || game.ticketSellingClosedAt) {
      throw new Error('GAME CLOSED: Ticket purchasing has ended. This game is already running or completed.');
    }

    if (game.tickets.length + chosenNumbers.length > game.maxTickets) {
      throw new Error(`Room limit exceeded (${game.maxTickets} max tickets). Only ${game.maxTickets - game.tickets.length} remaining.`);
    }

    const agent = this.getAgent();
    const marginPct = (100 - game.winningPercentage) / 100;
    const totalMarginPerTicket = game.ticketPrice * marginPct;
    const commissionPerTicket = Math.round(totalMarginPerTicket / 2);

    const createdTickets: Ticket[] = [];
    let totalCommission = 0;

    const allTickets = this.getTickets();

    chosenNumbers.forEach((numRaw) => {
      const chosenNumber = numRaw.padStart(2, '0');
      const ticketId = generateTicketId();
      const seventeenDigitId = generate17DigitId();

      const newTicketSelection: MultiGameTicketSelection = {
        playerName,
        playerPhone,
        ticketId,
        seventeenDigitId,
        selectedNumber: chosenNumber,
        purchasedAt: new Date().toISOString(),
      };

      game.tickets.push(newTicketSelection);

      const ticketObj: Ticket = {
        id: ticketId,
        seventeenDigitId,
        gameId: game.id,
        gameName: game.name,
        gameType: 'multiplayer',
        agentId: agent.id,
        agentName: agent.fullName,
        playerName,
        playerPhone,
        selectedNumber: chosenNumber,
        ticketPrice: game.ticketPrice,
        commissionEarned: commissionPerTicket,
        purchaseDate: new Date().toISOString(),
        qrData: JSON.stringify({
          ticketId,
          seventeenDigitId,
          gameName: game.name,
          number: chosenNumber,
          playerName,
          status: 'valid',
        }),
        status: 'valid',
      };

      createdTickets.push(ticketObj);
      allTickets.unshift(ticketObj);
      totalCommission += commissionPerTicket;
    });

    this.saveMultiGames(multiGames);
    this.saveTickets(allTickets);

    // Update Agent Stats
    agent.walletBalance += totalCommission;
    agent.todayCommission += totalCommission;
    agent.todaySalesCount += chosenNumbers.length;
    agent.totalTicketsSold += chosenNumbers.length;
    this.saveAgent(agent);

    // Add Transaction
    const txs = this.getTransactions();
    txs.unshift({
      id: `TX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      agentId: agent.id,
      type: 'commission_payout',
      amount: totalCommission,
      date: new Date().toISOString(),
      description: `Commission earned on ${chosenNumbers.length} Multi Game Ticket(s) for ${playerName}`,
      status: 'completed',
    });
    this.saveTransactions(txs);

    this.addAuditLog(
      'SELL_MULTI_TICKETS',
      `Issued ${chosenNumbers.length} Multi Game Ticket(s) for player ${playerName}`
    );

    return { tickets: createdTickets, multiGame: game };
  }

  // Conclude Multi Game Spin
  static concludeMultiGame(multiGameId: string, winningNum: string): MultiGame {
    const multiGames = this.getMultiGames();
    const game = multiGames.find((g) => g.id === multiGameId);
    if (!game) throw new Error('Multi Game not found');

    if (game.status === 'completed' && game.winningNumber) {
      throw new Error('ANTI-FRAUD LOCK: Game is already completed and READ ONLY. Winning numbers cannot be modified.');
    }

    const agent = this.getAgent();
    const totalTickets = game.tickets.length;
    const totalPool = totalTickets * game.ticketPrice;
    const totalPrizePool = Math.round(totalPool * (game.winningPercentage / 100));
    const totalMargin = totalPool - totalPrizePool;
    const agentCommissionTotal = Math.round(totalMargin / 2); // Equal 50/50 split with Admin

    game.status = 'completed';
    game.isLocked = true;
    if (!game.ticketSellingClosedAt) {
      game.ticketSellingClosedAt = new Date().toISOString();
    }
    game.winningNumber = winningNum;
    game.totalPool = totalPool;
    game.agentCommission = agentCommissionTotal;
    game.adminCommission = totalMargin - agentCommissionTotal;

    // Find all tickets with winning number
    const winningSelections = game.tickets.filter((t) => t.selectedNumber === winningNum);
    game.winningTicketIds = winningSelections.map((w) => w.ticketId);

    const tickets = this.getTickets();

    if (winningSelections.length > 0) {
      const perTicketPrize = Math.round(totalPrizePool / winningSelections.length);

      winningSelections.forEach((winnerSel) => {
        const matchingTicket = tickets.find((t) => t.id === winnerSel.ticketId);
        if (matchingTicket) {
          matchingTicket.status = 'winner_unclaimed';
          matchingTicket.prizeAmount = perTicketPrize;
          matchingTicket.qrData = JSON.stringify({
            ticketId: matchingTicket.id,
            seventeenDigitId: matchingTicket.seventeenDigitId,
            gameName: game.name,
            number: winningNum,
            playerName: winnerSel.playerName,
            status: 'winner_unclaimed',
            prize: perTicketPrize,
          });
        }
      });

      agent.pendingWinnersCount += winningSelections.length;

      // System notification
      const notes = this.getNotifications();
      notes.unshift({
        id: `NT-${Date.now()}`,
        title: 'Multi Game Spin Winner!',
        message: `Winning Number #${winningNum}! ${winningSelections.length} winning ticket(s) share ${totalPrizePool} Birr!`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'winner',
      });
      this.saveNotifications(notes);
    } else {
      const notes = this.getNotifications();
      notes.unshift({
        id: `NT-${Date.now()}`,
        title: 'Multi Game Spin Completed',
        message: `Winning Number #${winningNum} (No player held this number).`,
        timestamp: new Date().toISOString(),
        read: false,
        type: 'game',
      });
      this.saveNotifications(notes);
    }

    // Mark non winning tickets
    tickets.forEach((t) => {
      if (t.gameId === game.id && t.selectedNumber !== winningNum) {
        t.status = 'non_winner';
      }
    });

    this.saveTickets(tickets);
    this.saveAgent(agent);
    this.saveMultiGames(multiGames);

    this.addAuditLog(
      'CONCLUDE_MULTI_GAME',
      `Concluded Multi Game ${game.id} with winning number ${winningNum}. ${winningSelections.length} winners.`
    );

    return game;
  }

  // Verify and Claim Winner Ticket
  static verifyTicket(query: string): {
    result: 'VALID WINNER' | 'INVALID TICKET' | 'ALREADY CLAIMED' | 'NON WINNER' | 'VALID UNCLAIMED';
    ticket?: Ticket;
    message: string;
  } {
    const tickets = this.getTickets();
    const cleanQuery = query.trim();

    // Look by Ticket ID, 17-digit ID, or JSON parse
    let foundTicket = tickets.find(
      (t) => t.id.toLowerCase() === cleanQuery.toLowerCase() || t.seventeenDigitId === cleanQuery
    );

    if (!foundTicket && cleanQuery.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleanQuery);
        if (parsed.ticketId) {
          foundTicket = tickets.find((t) => t.id === parsed.ticketId || t.seventeenDigitId === parsed.seventeenDigitId);
        }
      } catch {
        // ignore
      }
    }

    if (!foundTicket) {
      return {
        result: 'INVALID TICKET',
        message: 'No matching ticket record found in system or ticket is fake.',
      };
    }

    if (foundTicket.status === 'claimed') {
      return {
        result: 'ALREADY CLAIMED',
        ticket: foundTicket,
        message: `Ticket ${foundTicket.id} was already redeemed on ${new Date(foundTicket.claimedAt!).toLocaleString()}.`,
      };
    }

    if (foundTicket.status === 'winner_unclaimed') {
      return {
        result: 'VALID WINNER',
        ticket: foundTicket,
        message: `CONFIRMED WINNER! ${foundTicket.playerName} won ${foundTicket.prizeAmount || 0} Birr on Ticket ${foundTicket.id}!`,
      };
    }

    if (foundTicket.status === 'non_winner') {
      return {
        result: 'NON WINNER',
        ticket: foundTicket,
        message: `Ticket ${foundTicket.id} is a valid ticket but did not land a winning number.`,
      };
    }

    return {
      result: 'VALID UNCLAIMED',
      ticket: foundTicket,
      message: `Ticket ${foundTicket.id} is active and valid for upcoming draw (${foundTicket.gameName}).`,
    };
  }

  // Claim Prize Payout
  static claimWinnerPrize(ticketId: string): Ticket {
    const agent = this.getAgent();
    const tickets = this.getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);

    if (!ticket) throw new Error('Ticket not found');
    if (ticket.status !== 'winner_unclaimed') {
      throw new Error(`Ticket is not in unclaimed winner state (current state: ${ticket.status})`);
    }

    ticket.status = 'claimed';
    ticket.claimedAt = new Date().toISOString();
    this.saveTickets(tickets);

    agent.pendingWinnersCount = Math.max(0, agent.pendingWinnersCount - 1);
    this.saveAgent(agent);

    const txs = this.getTransactions();
    txs.unshift({
      id: `TX-${Date.now()}`,
      agentId: agent.id,
      type: 'prize_disbursement',
      amount: ticket.prizeAmount || 0,
      description: `Disbursed ${ticket.prizeAmount} Birr Prize to Winner ${ticket.playerName} (Ticket ${ticket.id})`,
      referenceId: ticket.id,
      date: new Date().toISOString(),
      status: 'completed',
    });
    this.saveTransactions(txs);

    this.addAuditLog('CLAIM_PRIZE', `Agent disbursed ${ticket.prizeAmount} Birr prize for ticket ${ticket.id} to ${ticket.playerName}`);

    return ticket;
  }

  // Withdrawal Request
  static requestWithdrawal(amount: number, bankName: string, accountNumber: string, accountHolder: string): WithdrawalRequest {
    const agent = this.getAgent();
    if (amount > agent.walletBalance) {
      throw new Error(`Requested amount (${amount} Birr) exceeds available balance (${agent.walletBalance} Birr).`);
    }

    // Deduct available, add to pending
    agent.walletBalance -= amount;
    agent.pendingBalance += amount;
    this.saveAgent(agent);

    const withdrawals = this.getWithdrawals();
    const newWd: WithdrawalRequest = {
      id: `WD-${Math.floor(100 + Math.random() * 900)}`,
      agentId: agent.id,
      agentName: agent.fullName,
      amount,
      bankName,
      accountNumber,
      accountHolder,
      requestedAt: new Date().toISOString(),
      status: 'pending',
    };

    withdrawals.unshift(newWd);
    this.saveWithdrawals(withdrawals);

    const txs = this.getTransactions();
    txs.unshift({
      id: `TX-${Date.now()}`,
      agentId: agent.id,
      type: 'withdrawal',
      amount,
      description: `Withdrawal Request to ${bankName} (${accountNumber})`,
      referenceId: newWd.id,
      date: new Date().toISOString(),
      status: 'pending',
    });
    this.saveTransactions(txs);

    this.addAuditLog('WITHDRAWAL_REQUEST', `Submitted withdrawal request ${newWd.id} for ${amount} Birr`);

    return newWd;
  }

  // Admin approval simulation
  static adminApproveWithdrawal(withdrawalId: string): void {
    const wds = this.getWithdrawals();
    const wd = wds.find((w) => w.id === withdrawalId);
    if (!wd || wd.status !== 'pending') return;

    wd.status = 'approved';
    wd.approvedAt = new Date().toISOString();
    this.saveWithdrawals(wds);

    const agent = this.getAgent();
    if (agent.id === wd.agentId) {
      agent.pendingBalance = Math.max(0, agent.pendingBalance - wd.amount);
      this.saveAgent(agent);
    }

    const txs = this.getTransactions();
    const matchingTx = txs.find((t) => t.referenceId === wd.id);
    if (matchingTx) {
      matchingTx.status = 'completed';
      this.saveTransactions(txs);
    }

    const notes = this.getNotifications();
    notes.unshift({
      id: `NT-${Date.now()}`,
      title: 'Withdrawal Approved!',
      message: `Your withdrawal request of ${wd.amount} Birr to ${wd.bankName} has been processed.`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'payment',
    });
    this.saveNotifications(notes);

    this.addAuditLog('ADMIN_APPROVE_WITHDRAWAL', `Admin approved withdrawal ${withdrawalId} of ${wd.amount} Birr`);
  }

  static resetToDemoData(): void {
    localStorage.clear();
    this.getAgent();
    this.getUniversalGames();
    this.getSoloGames();
    this.getTickets();
    this.getTransactions();
    this.getWithdrawals();
    this.getNotifications();
    this.getAuditLogs();
  }
}
