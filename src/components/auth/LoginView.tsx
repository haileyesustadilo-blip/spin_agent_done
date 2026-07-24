import React, { useState } from 'react';
import { AgentProfile } from '../../types';
import { StorageService } from '../../services/storage';
import {
  ShieldCheck,
  Phone,
  Mail,
  Lock,
  ArrowRight,
  UserPlus,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

interface LoginViewProps {
  onLoginSuccess: (agent: AgentProfile) => void;
  onOpenRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onOpenRegister,
}) => {
  const [identifier, setIdentifier] = useState('+251911234567');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp' | 'forgot_password'>('credentials');
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!identifier || !password) {
      setError('Please enter your phone number / email and password.');
      return;
    }

    // Advance to 2FA / OTP verification step as specified
    setStep('otp');
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (otpCode.trim().length < 4) {
      setError('Please enter valid 6-digit OTP (Try: 123456).');
      return;
    }

    const agent = StorageService.getAgent();
    StorageService.addAuditLog('AGENT_LOGIN', `Agent ${agent.fullName} logged in successfully`);
    onLoginSuccess(agent);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
  };

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden text-slate-300">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-md bg-[#16191F] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-emerald-500 text-[#0F1115] font-bold text-2xl mb-3 shadow-md">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            SPAIN GAME AGENT PORTAL
          </h1>
          <p className="text-xs text-slate-400 mt-1">Authorized Ticket Seller & Solo Game Portal</p>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Phone Number or Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="+251911234567 or agent@spaingame.et"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                <button
                  type="button"
                  onClick={() => setStep('forgot_password')}
                  className="text-xs text-amber-400 hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-amber-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-[#0F1115] font-bold rounded-xl text-xs shadow-lg flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <span>Continue to Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* OTP Verification Step */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify} className="space-y-4">
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center">
              <KeyRound className="w-8 h-8 text-amber-400 mx-auto mb-1" />
              <h3 className="font-bold text-sm text-white">OTP Verification</h3>
              <p className="text-[11px] text-slate-300 mt-1">
                A 6-digit security code was sent to <span className="font-semibold text-amber-300">{identifier}</span>
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-1">(Demo Code: 123456)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-center">
                Enter 6-Digit Security Code
              </label>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="1 2 3 4 5 6"
                className="w-full py-3 text-center tracking-[1em] font-mono text-lg font-bold bg-slate-800 border border-slate-700 rounded-xl text-amber-400 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Login to Agent Dashboard</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('credentials')}
              className="w-full text-center text-xs text-slate-400 hover:text-white pt-2"
            >
              ← Back to Credentials
            </button>
          </form>
        )}

        {/* Forgot Password Step */}
        {step === 'forgot_password' && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-sm text-white">Reset Agent Password</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your registered phone or email to receive password reset link.
              </p>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-xs font-semibold text-emerald-300">
                  Password reset link sent to your registered contact!
                </p>
                <button
                  onClick={() => setStep('credentials')}
                  className="text-xs text-amber-400 hover:underline font-bold"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter phone number or email"
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs"
                >
                  Send Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => setStep('credentials')}
                  className="w-full text-center text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        )}

        {/* Divider & Register Link */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400 mb-2">Want to become a Spain Game Ticket Agent?</p>
          <button
            onClick={onOpenRegister}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition-all"
          >
            <UserPlus className="w-4 h-4 text-amber-400" />
            <span>Apply for New Agent Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
