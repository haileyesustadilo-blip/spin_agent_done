import { AgentProfile, UniversalGame, SoloGame, MultiGame, Ticket, Transaction, WithdrawalRequest, SystemNotification, AuditLog } from '../types';

export const INITIAL_AGENT: AgentProfile = {
  id: 'AG-8820',
  fullName: 'Agent Account',
  email: 'agent@spaingame.et',
  phone: '+251911234567',
  bankAccountNumber: '1000284759201',
  accountHolderName: 'Agent Account',
  status: 'approved',
  governmentIdUrl: '',
  profilePicUrl: '',
  registeredAt: new Date().toISOString(),
  walletBalance: 0,
  pendingBalance: 0,
  todaySalesCount: 0,
  todayCommission: 0,
  totalTicketsSold: 0,
  pendingWinnersCount: 0,
  activeGamesCount: 0,
};

export const INITIAL_UNIVERSAL_GAMES: UniversalGame[] = [
  {
    id: 'UG-101',
    name: 'Universal Jackpot Grand Draw',
    ticketPrice: 100,
    jackpotAmount: 1000000,
    agentCommissionRate: 0.10, // 10 Birr per 100 Birr ticket
    drawTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'active',
    totalTicketsSold: 0,
  },
  {
    id: 'UG-102',
    name: 'Spain Weekly Millionaire',
    ticketPrice: 200,
    jackpotAmount: 2500000,
    agentCommissionRate: 0.10, // 20 Birr per ticket
    drawTime: new Date(Date.now() + 86400000 * 5).toISOString(),
    status: 'active',
    totalTicketsSold: 0,
  },
  {
    id: 'UG-103',
    name: 'Daily Fast 50 Birr Lotto',
    ticketPrice: 50,
    jackpotAmount: 250000,
    agentCommissionRate: 0.10, // 5 Birr per ticket
    drawTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    status: 'active',
    totalTicketsSold: 0,
  },
];

export const INITIAL_SOLO_GAMES: SoloGame[] = [];

export const INITIAL_MULTI_GAMES: MultiGame[] = [];

export const INITIAL_TICKETS: Ticket[] = [];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [];

export const INITIAL_NOTIFICATIONS: SystemNotification[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'LOG-1009',
    agentId: 'AG-8820',
    action: 'WITHDRAWAL_REQUEST',
    details: 'Submitted withdrawal request WD-892 for 1,500 Birr to CBE (Acc: 1000284759201)',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1008',
    agentId: 'AG-8820',
    action: 'CONCLUDE_MULTI_GAME',
    details: 'Concluded Multi Game Spin MG-101 with winning combination #42. 1 winner verified.',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1007',
    agentId: 'AG-8820',
    action: 'LOCK_GAME_TICKETS',
    details: 'Ticket sales permanently CLOSED & LOCKED for Multi Game MG-101 before spin',
    timestamp: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1006',
    agentId: 'AG-8820',
    action: 'SELL_MULTI_TICKET',
    details: 'Multi Game Ticket TK88219 issued for seat #42 in game MG-101 to Player Bekele',
    timestamp: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1005',
    agentId: 'AG-8820',
    action: 'CLAIM_PRIZE',
    details: 'Disbursed 2,400 Birr prize payout to winner ticket TK77412 (Player Almaz)',
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1004',
    agentId: 'AG-8820',
    action: 'SELL_SOLO_TICKET',
    details: 'Solo Ticket TK65490 issued for number #7 in game SG-201',
    timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1003',
    agentId: 'AG-8820',
    action: 'CREATE_SOLO_GAME',
    details: 'Solo game SG-201 (Agent Solo Room #1) created. Ticket price: 100 Birr',
    timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1002',
    agentId: 'AG-8820',
    action: 'SELL_UNIVERSAL_TICKET',
    details: 'Universal Ticket TK10928 sold for 100 Birr (10 Birr Agent Commission)',
    timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    ipAddress: '197.156.120.44',
  },
  {
    id: 'LOG-1001',
    agentId: 'AG-8820',
    action: 'AGENT_LOGIN',
    details: 'Security session established for Agent AG-8820 (Phone: +251911234567)',
    timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    ipAddress: '197.156.120.44',
  },
];
