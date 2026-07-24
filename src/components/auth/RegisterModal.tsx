import React, { useState } from 'react';
import { AgentProfile } from '../../types';
import { StorageService } from '../../services/storage';
import {
  X,
  Upload,
  CheckCircle,
  Clock,
  ShieldCheck,
  Building,
  User,
  Phone,
  Mail,
  Lock,
  FileCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newAgent: AgentProfile) => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+2519');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [govIdFileName, setGovIdFileName] = useState('');
  const [profilePicFileName, setProfilePicFileName] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<AgentProfile | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !phone || !bankAccountNumber || !accountHolderName || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const newAgent: AgentProfile = {
      id: `AG-${Math.floor(1000 + Math.random() * 9000)}`,
      fullName,
      email,
      phone,
      bankAccountNumber,
      accountHolderName,
      status: 'pending', // Starts in 'pending' waiting approval as specified!
      governmentIdUrl: govIdFileName || 'Uploaded_Gov_ID.pdf',
      profilePicUrl: profilePicFileName || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80',
      registeredAt: new Date().toISOString(),
      walletBalance: 0,
      pendingBalance: 0,
      todaySalesCount: 0,
      todayCommission: 0,
      totalTicketsSold: 0,
      pendingWinnersCount: 0,
      activeGamesCount: 0,
    };

    // Save in storage
    const agents = StorageService.getAllAgents();
    agents.unshift(newAgent);
    StorageService.saveAllAgents(agents);
    StorageService.saveAgent(newAgent); // Make active agent

    StorageService.addAuditLog('AGENT_REGISTER', `New Agent Application submitted: ${fullName} (${phone})`);

    setCreatedAgent(newAgent);
    setSubmitted(true);
  };

  const handleFinish = () => {
    if (createdAgent) {
      onRegistered(createdAgent);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="text-center mb-6">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20 uppercase tracking-widest mb-2">
                Spain Game Agent Onboarding
              </span>
              <h2 className="text-2xl font-black text-white">Apply for Agent Account</h2>
              <p className="text-xs text-slate-400 mt-1">
                Sell tickets, create Solo Games, and earn 10% commission on Universal Games.
              </p>
            </div>

            {/* Approval Pipeline Banner */}
            <div className="mb-6 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-300">
              <p className="font-bold text-amber-400 mb-2 text-center uppercase tracking-wider text-[10px]">
                Registration Approval Pipeline
              </p>
              <div className="grid grid-cols-5 gap-1 text-center font-semibold">
                <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  1. Submit
                </div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">2. Waiting</div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">3. Review</div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">4. Approved</div>
                <div className="p-1.5 rounded-lg bg-slate-800 text-slate-400">5. Active</div>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Abebe Kebede"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="agent@spaingame.et"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+251911234567"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Bank Account Number *</label>
                  <input
                    type="text"
                    required
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    placeholder="1000284759201 (CBE / Telebirr)"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">Bank Account Holder Name *</label>
                  <input
                    type="text"
                    required
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    placeholder="Must match official bank account name"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Confirm Password *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Uploads Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
                <div className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-2xl text-center">
                  <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-200">Government ID Upload *</p>
                  <p className="text-[10px] text-slate-400 mb-2">Passport, Kebele ID, or Driver's License</p>
                  <input
                    type="file"
                    id="govId"
                    className="hidden"
                    onChange={(e) => setGovIdFileName(e.target.files?.[0]?.name || 'Government_ID.pdf')}
                  />
                  <label
                    htmlFor="govId"
                    className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    {govIdFileName ? `✓ ${govIdFileName}` : 'Select ID File'}
                  </label>
                </div>

                <div className="p-3 bg-slate-950 border border-dashed border-slate-700 rounded-2xl text-center">
                  <User className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-200">Profile Picture (Optional)</p>
                  <p className="text-[10px] text-slate-400 mb-2">Clear headshot photo</p>
                  <input
                    type="file"
                    id="profilePic"
                    className="hidden"
                    onChange={(e) => setProfilePicFileName(e.target.files?.[0]?.name || 'Photo.jpg')}
                  />
                  <label
                    htmlFor="profilePic"
                    className="inline-block px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-bold cursor-pointer transition-colors"
                  >
                    {profilePicFileName ? `✓ ${profilePicFileName}` : 'Select Photo'}
                  </label>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center space-x-2 transition-all transform hover:-translate-y-0.5"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Submit Registration to Admin</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Post-Submission Waiting Approval View */
          <div className="text-center py-6 space-y-6">
            <div className="w-20 h-20 bg-amber-500/20 border-2 border-amber-500 rounded-full flex items-center justify-center mx-auto text-amber-400 animate-pulse">
              <Clock className="w-10 h-10" />
            </div>

            <div>
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider">
                Registration Status: Waiting Approval
              </span>
              <h2 className="text-2xl font-black text-white mt-3">Application Under Admin Review</h2>
              <p className="text-xs text-slate-300 max-w-md mx-auto mt-2 leading-relaxed">
                Thank you, <span className="text-amber-300 font-bold">{createdAgent?.fullName}</span>. Your Agent Application (<span className="font-mono text-amber-400">{createdAgent?.id}</span>) has been submitted to Spain Game Admin.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span>Account Holder:</span>
                <span className="font-bold text-white">{createdAgent?.accountHolderName}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Bank Account:</span>
                <span className="font-mono text-white">{createdAgent?.bankAccountNumber}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Phone Number:</span>
                <span className="font-semibold text-white">{createdAgent?.phone}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300 text-left">
              <p className="font-bold flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Testing Note for AI Studio Preview:</span>
              </p>
              <p className="mt-1 text-slate-300 text-[11px]">
                You can instantly approve this Agent Account at any time using the <span className="font-bold text-amber-400">"Admin Sandbox"</span> button located in the top navigation bar!
              </p>
            </div>

            <button
              onClick={handleFinish}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-2xl text-xs flex items-center justify-center space-x-2"
            >
              <span>Enter Agent Portal (Pending Approval State)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
