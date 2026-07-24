export type AgentStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface AgentProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bankAccountNumber: string;
  accountHolderName: string;
  status: AgentStatus;
  governmentIdUrl?: string;
  profilePicUrl?: string;
  registeredAt: string;
  walletBalance: number;
  pendingBalance: number;
  todaySalesCount: number;
  todayCommission: number;
  totalTicketsSold: number;
  pendingWinnersCount: number;
  activeGamesCount: number;
}

export type GameType = 'universal' | 'solo' | 'multiplayer';

export interface UniversalGame {
  id: string;
  name: string;
  ticketPrice: number;
  jackpotAmount: number;
  agentCommissionRate: number; // e.g. 0.10 for 10%
  drawTime: string;
  status: 'active' | 'closed' | 'completed';
  totalTicketsSold: number;
  winningNumber?: string;
  ticketSellingClosedAt?: string;
  isLocked?: boolean;
}

export interface MultiGameTicketSelection {
  playerName: string;
  playerPhone: string;
  ticketId: string;
  seventeenDigitId: string;
  selectedNumber: string;
  purchasedAt: string;
}

export interface MultiGame {
  id: string;
  agentId: string;
  name: string;
  ticketPrice: number;
  maxTickets: number; // e.g. 50, 100
  numberRange: '0-9' | '0-99'; // Spin range
  winningPercentage: number; // default 80%
  description: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  tickets: MultiGameTicketSelection[];
  winningNumber?: string;
  winningTicketIds?: string[];
  totalPool?: number;
  agentCommission?: number;
  adminCommission?: number;
  createdAt: string;
  ticketSellingClosedAt?: string;
  isLocked?: boolean;
}

export interface SoloGame {
  id: string;
  agentId: string;
  name: string;
  ticketPrice: number;
  playerLimit: number; // 1-10
  winningPercentage: number; // default 70%
  description: string;
  startTime: string;
  endTime: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'cancelled';
  selectedNumbers: { [number: string]: { playerName?: string; playerPhone?: string; ticketId: string } }; // '0'-'9' -> player
  winningNumber?: string;
  winnerPlayerName?: string;
  winnerPrize?: number;
  totalPool?: number;
  agentCommission?: number;
  createdAt: string;
  ticketSellingClosedAt?: string;
  isLocked?: boolean;
}

export interface Ticket {
  id: string; // e.g. TK56874
  seventeenDigitId: string; // e.g. 48392018472930182
  gameId: string;
  gameName: string;
  gameType: GameType;
  agentId: string;
  agentName: string;
  playerName?: string;
  playerPhone?: string;
  selectedNumber: string; // e.g. "12345" or "7"
  ticketPrice: number;
  commissionEarned: number;
  purchaseDate: string;
  qrData: string;
  status: 'valid' | 'winner_unclaimed' | 'claimed' | 'non_winner' | 'cancelled';
  prizeAmount?: number;
  claimedAt?: string;
  isLocked?: boolean;
  ticketSellingClosedAt?: string;
}

export interface Transaction {
  id: string;
  agentId: string;
  type: 'ticket_sale' | 'commission_payout' | 'solo_creation' | 'withdrawal' | 'prize_disbursement';
  amount: number;
  description: string;
  referenceId?: string; // ticket id, game id, or withdrawal id
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

export interface WithdrawalRequest {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'ticket' | 'commission' | 'winner' | 'game' | 'payment' | 'announcement';
}

export interface AuditLog {
  id: string;
  agentId: string;
  action: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}
