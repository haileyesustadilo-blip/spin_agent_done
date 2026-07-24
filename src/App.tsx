/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { StorageService } from './services/storage';
import {
  AgentProfile,
  UniversalGame,
  SoloGame,
  MultiGame,
  Ticket,
  Transaction,
  WithdrawalRequest,
  SystemNotification,
  AuditLog,
} from './types';

// Layout
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';

// Auth
import { LoginView } from './components/auth/LoginView';
import { RegisterModal } from './components/auth/RegisterModal';

// Views
import { AgentDashboard } from './components/dashboard/AgentDashboard';
import { SoloGamesView } from './components/sologames/SoloGamesView';
import { MultiGamesView } from './components/multigames/MultiGamesView';
import { UniversalGamesView } from './components/universal/UniversalGamesView';
import { QRScannerView } from './components/qr/QRScannerView';
import { WalletView } from './components/wallet/WalletView';
import { ReportsView } from './components/reports/ReportsView';
import { TransactionsView } from './components/transactions/TransactionsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { PlayerSupportView } from './components/support/PlayerSupportView';
import { SettingsView } from './components/settings/SettingsView';

// Modals
import { SellTicketsModal } from './components/tickets/SellTicketsModal';
import { AdminApprovalSandbox } from './components/admin/AdminApprovalSandbox';

// Icons for Mobile Bottom Nav
import {
  LayoutDashboard,
  Ticket as TicketIcon,
  Dices,
  Globe,
  QrCode,
  Wallet,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // App Data State
  const [agent, setAgent] = useState<AgentProfile>(() => StorageService.getAgent());
  const [allAgents, setAllAgents] = useState<AgentProfile[]>(() => StorageService.getAllAgents());
  const [universalGames, setUniversalGames] = useState<UniversalGame[]>(() =>
    StorageService.getUniversalGames()
  );
  const [soloGames, setSoloGames] = useState<SoloGame[]>(() => StorageService.getSoloGames());
  const [multiGames, setMultiGames] = useState<MultiGame[]>(() => StorageService.getMultiGames());
  const [tickets, setTickets] = useState<Ticket[]>(() => StorageService.getTickets());
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    StorageService.getTransactions()
  );
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() =>
    StorageService.getWithdrawals()
  );
  const [notifications, setNotifications] = useState<SystemNotification[]>(() =>
    StorageService.getNotifications()
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Modal Visibility States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showSellTicketModal, setShowSellTicketModal] = useState(false);
  const [sellModalGameType, setSellModalGameType] = useState<string>('universal');
  const [showAdminSandbox, setShowAdminSandbox] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync state from LocalStorage
  const refreshData = () => {
    setAgent(StorageService.getAgent());
    setAllAgents(StorageService.getAllAgents());
    setUniversalGames(StorageService.getUniversalGames());
    setSoloGames(StorageService.getSoloGames());
    setMultiGames(StorageService.getMultiGames());
    setTickets(StorageService.getTickets());
    setTransactions(StorageService.getTransactions());
    setWithdrawals(StorageService.getWithdrawals());
    setNotifications(StorageService.getNotifications());
    setAuditLogs(StorageService.getAuditLogs());
  };

  const handleResetData = () => {
    StorageService.resetToDemoData();
    refreshData();
  };

  const handleOpenSellTicket = (gameType = 'universal') => {
    setSellModalGameType(gameType);
    setShowSellTicketModal(true);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F1115] font-sans text-slate-300">
        <LoginView
          onLoginSuccess={(loggedAgent) => {
            setAgent(loggedAgent);
            setIsLoggedIn(true);
            refreshData();
          }}
          onOpenRegister={() => setShowRegisterModal(true)}
        />

        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onRegistered={(newAg) => {
            setAgent(newAg);
            setIsLoggedIn(true);
            refreshData();
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F1115] font-sans text-slate-300 flex flex-col selection:bg-emerald-500 selection:text-[#0F1115]">
      {/* Top Navigation */}
      <Navbar
        agent={agent}
        notifications={notifications}
        onNavigate={(t) => {
          setActiveTab(t);
          setMobileMenuOpen(false);
        }}
        onOpenAdminSandbox={() => setShowAdminSandbox(true)}
        onLogout={() => setIsLoggedIn(false)}
        onResetData={handleResetData}
      />

      {/* Main Container Layout */}
      <div className="flex-1 w-full mx-auto flex">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onNavigate={(t) => setActiveTab(t)}
          onLogout={() => setIsLoggedIn(false)}
          isApproved={agent.status === 'approved'}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <AgentDashboard
              agent={agent}
              tickets={tickets}
              transactions={transactions}
              soloGames={soloGames}
              universalGames={universalGames}
              auditLogs={auditLogs}
              onNavigate={(t) => setActiveTab(t)}
              onOpenSellTicketModal={handleOpenSellTicket}
              onOpenCreateSoloModal={() => setActiveTab('solo-games')}
            />
          )}

          {activeTab === 'sell-tickets' && (
            <div className="space-y-6">
              <div className="p-6 bg-[#16191F] border border-slate-800 rounded-2xl flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Ticket Selling Terminal</h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Sell Universal, Solo, or Multiplayer tickets directly to players.
                  </p>
                </div>
                <button
                  onClick={() => handleOpenSellTicket('universal')}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-[#0F1115] font-bold rounded-2xl text-xs transition-all shadow-lg"
                >
                  Launch Ticket Selling Wizard
                </button>
              </div>

              {/* Directly inline sell modal view if on sell tab */}
              <UniversalGamesView
                agent={agent}
                universalGames={universalGames}
                tickets={tickets}
                onOpenSellTicketModal={handleOpenSellTicket}
              />
            </div>
          )}

          {activeTab === 'solo-games' && (
            <SoloGamesView
              agent={agent}
              soloGames={soloGames}
              onOpenSellTicketModal={handleOpenSellTicket}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'multi-games' && (
            <MultiGamesView
              agent={agent}
              multiGames={multiGames}
              onOpenSellTicketModal={handleOpenSellTicket}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'universal-games' && (
            <UniversalGamesView
              agent={agent}
              universalGames={universalGames}
              tickets={tickets}
              onOpenSellTicketModal={handleOpenSellTicket}
            />
          )}

          {(activeTab === 'scan-qr' || activeTab === 'verify-winners') && (
            <QRScannerView tickets={tickets} onRefresh={refreshData} />
          )}

          {activeTab === 'wallet' && (
            <WalletView
              agent={agent}
              withdrawals={withdrawals}
              transactions={transactions}
              onRefresh={refreshData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsView agent={agent} tickets={tickets} transactions={transactions} />
          )}

          {activeTab === 'transactions' && <TransactionsView transactions={transactions} />}

          {activeTab === 'notifications' && (
            <NotificationsView notifications={notifications} onRefresh={refreshData} />
          )}

          {activeTab === 'support' && <PlayerSupportView tickets={tickets} />}

          {activeTab === 'settings' && <SettingsView agent={agent} onRefresh={refreshData} />}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden sticky bottom-0 z-40 bg-[#16191F] border-t border-slate-800 px-2 py-1.5 flex items-center justify-around text-[10px]">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'sell-tickets', label: 'Sell', icon: TicketIcon },
          { id: 'solo-games', label: 'Solo', icon: Dices },
          { id: 'verify-winners', label: 'Verify', icon: QrCode },
          { id: 'wallet', label: 'Wallet', icon: Wallet },
        ].map((m) => {
          const Icon = m.icon;
          const isActive = activeTab === m.id;
          return (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={`flex flex-col items-center py-1 px-3 rounded-xl font-bold transition-all ${
                isActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-400'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span>{m.label}</span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <SellTicketsModal
        isOpen={showSellTicketModal}
        initialType={sellModalGameType}
        universalGames={universalGames}
        soloGames={soloGames}
        onClose={() => setShowSellTicketModal(false)}
        onTicketSold={refreshData}
      />

      <AdminApprovalSandbox
        isOpen={showAdminSandbox}
        activeAgent={agent}
        allAgents={allAgents}
        withdrawals={withdrawals}
        auditLogs={auditLogs}
        onClose={() => setShowAdminSandbox(false)}
        onRefresh={refreshData}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onRegistered={(newAg) => {
          setAgent(newAg);
          setIsLoggedIn(true);
          refreshData();
        }}
      />
    </div>
  );
}
