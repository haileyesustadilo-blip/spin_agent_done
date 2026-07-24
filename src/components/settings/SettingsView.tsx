import React, { useState } from 'react';
import { AgentProfile } from '../../types';
import { StorageService } from '../../services/storage';
import {
  Settings,
  ShieldCheck,
  Building,
  KeyRound,
  Phone,
  Mail,
  User,
  CheckCircle,
  Lock,
  Smartphone,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SettingsViewProps {
  agent: AgentProfile;
  onRefresh: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ agent, onRefresh }) => {
  const [bankAccountNumber, setBankAccountNumber] = useState(agent.bankAccountNumber);
  const [accountHolderName, setAccountHolderName] = useState(agent.accountHolderName);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [otpRequiredForLogin, setOtpRequiredForLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSaveBankDetails = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedAgent = {
      ...agent,
      bankAccountNumber,
      accountHolderName,
    };
    StorageService.saveAgent(updatedAgent);
    StorageService.addAuditLog('UPDATE_BANK_DETAILS', `Updated bank details for agent ${agent.id}`);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
    onRefresh();
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-800 text-xs font-bold text-slate-300 mb-2">
          <Settings className="w-3.5 h-3.5 text-amber-400" />
          <span>Agent Profile & Security Configuration</span>
        </div>
        <h1 className="text-2xl font-black text-white">Agent Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage bank accounts, profile details, and security features (2FA, OTP, Encrypted Passwords).
        </p>
      </div>

      {savedNotice && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs text-emerald-300 font-bold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Agent Settings Updated Successfully!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile & Bank Info */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <Building className="w-4 h-4 text-amber-400" />
            <span>Bank Account & Settlement Details</span>
          </h2>

          <form onSubmit={handleSaveBankDetails} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Full Agent Name</label>
              <input
                type="text"
                disabled
                value={agent.fullName}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address</label>
                <input
                  type="text"
                  disabled
                  value={agent.email}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled
                  value={agent.phone}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Bank Account Number *</label>
              <input
                type="text"
                required
                value={bankAccountNumber}
                onChange={(e) => setBankAccountNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Account Holder Name *</label>
              <input
                type="text"
                required
                value={accountHolderName}
                onChange={(e) => setAccountHolderName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
            >
              Save Bank Settlement Details
            </button>
          </form>
        </div>

        {/* Security System Settings */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Agent Portal Security Features</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">Two Factor Authentication (2FA)</p>
                <p className="text-[10px] text-slate-400">Require 2FA code for wallet withdrawals</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorEnabled}
                onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-white">OTP Verification for Logins</p>
                <p className="text-[10px] text-slate-400">Send 6-digit SMS OTP code on every login</p>
              </div>
              <input
                type="checkbox"
                checked={otpRequiredForLogin}
                onChange={(e) => setOtpRequiredForLogin(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
              <p className="font-bold text-amber-300">Active Security Protections</p>
              <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-300">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Encrypted Passwords</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Secure QR Codes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Fraud Detection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Duplicate Prevention</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>Session Protection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  <span>HTTPS Protection</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
