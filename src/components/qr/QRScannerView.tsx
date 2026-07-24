import React, { useState } from 'react';
import { StorageService } from '../../services/storage';
import { Ticket } from '../../types';
import {
  QrCode,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Camera,
  Upload,
  Trophy,
  DollarSign,
  ShieldCheck,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface QRScannerViewProps {
  tickets: Ticket[];
  onRefresh: () => void;
}

export const QRScannerView: React.FC<QRScannerViewProps> = ({ tickets, onRefresh }) => {
  const [query, setQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    result: 'VALID WINNER' | 'INVALID TICKET' | 'ALREADY CLAIMED' | 'NON WINNER' | 'VALID UNCLAIMED';
    ticket?: Ticket;
    message: string;
  } | null>(null);

  const [claimedMessage, setClaimedMessage] = useState('');

  const handleVerify = (inputQuery: string) => {
    setClaimedMessage('');
    if (!inputQuery.trim()) return;

    const res = StorageService.verifyTicket(inputQuery.trim());
    setVerificationResult(res);
  };

  const handleDisbursePrize = (ticketId: string) => {
    try {
      const updated = StorageService.claimWinnerPrize(ticketId);
      setClaimedMessage(`Prize disbursement of ${updated.prizeAmount} Birr completed for Ticket ${updated.id}!`);
      setVerificationResult({
        result: 'ALREADY CLAIMED',
        ticket: updated,
        message: `Prize paid out on ${new Date(updated.claimedAt!).toLocaleString()}`,
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to disburse prize');
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Header */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-300 mb-2">
          <QrCode className="w-3.5 h-3.5 text-emerald-400" />
          <span>QR Scanner & 17-Digit ID Verification</span>
        </div>
        <h1 className="text-2xl font-black text-white">Winner Verification Engine</h1>
        <p className="text-xs text-slate-400 mt-1">
          Scan ticket QR codes or enter 17-digit ID numbers to verify winning tickets and disburse payouts.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scanner & Manual Input Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <h2 className="font-bold text-sm text-white flex items-center space-x-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Scan Ticket or Enter ID</span>
          </h2>

          {/* Camera Feed Simulator */}
          <div className="relative bg-slate-950 border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center overflow-hidden">
            {cameraActive ? (
              <div className="relative aspect-video bg-black rounded-xl overflow-hidden flex flex-col items-center justify-center border border-amber-500/50">
                <div className="absolute inset-0 bg-amber-500/10 animate-pulse pointer-events-none" />
                <div className="w-48 h-48 border-2 border-amber-400 rounded-2xl relative flex items-center justify-center">
                  <div className="w-full h-0.5 bg-amber-400 animate-ping" />
                </div>
                <p className="text-[11px] text-amber-300 font-bold mt-2 z-10">
                  Align Ticket QR Code inside frame...
                </p>
                <button
                  onClick={() => setCameraActive(false)}
                  className="mt-3 px-3 py-1 bg-slate-800 text-xs rounded-lg text-slate-300"
                >
                  Stop Scanner
                </button>
              </div>
            ) : (
              <div className="py-6 space-y-3">
                <QrCode className="w-12 h-12 text-amber-400 mx-auto opacity-80" />
                <div>
                  <p className="font-bold text-xs text-slate-200">Camera QR Scanner System</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to activate live camera or select test ticket below
                  </p>
                </div>
                <button
                  onClick={() => setCameraActive(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
                >
                  Start Camera Scanner
                </button>
              </div>
            )}
          </div>

          {/* Manual Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(query);
            }}
            className="space-y-3"
          >
            <label className="block text-xs font-semibold text-slate-300">
              Manual Ticket ID or 17-Digit Verification Code
            </label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. TK56874 or 48392018472930182"
                  className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Verify Ticket
              </button>
            </div>
          </form>

          {/* Demo Quick Click Barcodes */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
            <p className="font-bold text-amber-300 text-[11px] uppercase tracking-wider">
              Quick Test Verification Samples
            </p>
            <div className="space-y-1.5">
              {tickets.slice(0, 3).map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setQuery(t.seventeenDigitId);
                    handleVerify(t.seventeenDigitId);
                  }}
                  className="w-full p-2 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 text-left flex items-center justify-between text-[11px] transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-amber-300">{t.id}</span> •{' '}
                    <span className="text-slate-300">{t.playerName}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                      t.status === 'winner_unclaimed'
                        ? 'bg-purple-500/20 text-purple-300'
                        : t.status === 'claimed'
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {t.status}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Verification Result Output Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h2 className="font-bold text-sm text-white mb-4">Verification Result</h2>

            {claimedMessage && (
              <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 font-bold flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{claimedMessage}</span>
              </div>
            )}

            {verificationResult ? (
              <div className="space-y-4">
                {/* Result Status Banner */}
                {verificationResult.result === 'VALID WINNER' && (
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500 text-center space-y-2">
                    <Trophy className="w-10 h-10 text-emerald-400 mx-auto" />
                    <span className="px-3 py-1 bg-emerald-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-widest">
                      VALID WINNER!
                    </span>
                    <p className="text-sm font-bold text-white mt-1">{verificationResult.message}</p>
                  </div>
                )}

                {verificationResult.result === 'INVALID TICKET' && (
                  <div className="p-4 rounded-2xl bg-rose-500/10 border-2 border-rose-500 text-center space-y-2">
                    <XCircle className="w-10 h-10 text-rose-400 mx-auto" />
                    <span className="px-3 py-1 bg-rose-500 text-white font-black rounded-full text-xs uppercase tracking-widest">
                      INVALID TICKET
                    </span>
                    <p className="text-xs text-rose-300 mt-1">{verificationResult.message}</p>
                  </div>
                )}

                {verificationResult.result === 'ALREADY CLAIMED' && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500 text-center space-y-2">
                    <AlertCircle className="w-10 h-10 text-amber-400 mx-auto" />
                    <span className="px-3 py-1 bg-amber-500 text-slate-950 font-black rounded-full text-xs uppercase tracking-widest">
                      ALREADY CLAIMED
                    </span>
                    <p className="text-xs text-amber-300 mt-1">{verificationResult.message}</p>
                  </div>
                )}

                {verificationResult.result === 'NON WINNER' && (
                  <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-center space-y-2">
                    <ShieldCheck className="w-10 h-10 text-slate-400 mx-auto" />
                    <span className="px-3 py-1 bg-slate-700 text-slate-300 font-bold rounded-full text-xs uppercase tracking-widest">
                      NON-WINNING TICKET
                    </span>
                    <p className="text-xs text-slate-400 mt-1">{verificationResult.message}</p>
                  </div>
                )}

                {/* Inspected Ticket Details Card */}
                {verificationResult.ticket && (
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 font-medium">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Ticket ID:</span>
                      <span className="font-mono font-bold text-amber-400">
                        {verificationResult.ticket.id}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">17-Digit ID:</span>
                      <span className="font-mono text-white">{verificationResult.ticket.seventeenDigitId}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Player Name:</span>
                      <span className="font-bold text-white">{verificationResult.ticket.playerName}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Player Phone:</span>
                      <span className="font-mono text-slate-300">{verificationResult.ticket.playerPhone}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span className="text-slate-400">Selected Number:</span>
                      <span className="font-mono font-black text-amber-400">
                        #{verificationResult.ticket.selectedNumber}
                      </span>
                    </div>

                    {verificationResult.ticket.prizeAmount && (
                      <div className="flex justify-between pt-1 text-sm font-bold text-emerald-400">
                        <span>Prize Amount:</span>
                        <span>{verificationResult.ticket.prizeAmount.toLocaleString()} Birr</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Disburse Prize Button */}
                {verificationResult.result === 'VALID WINNER' && verificationResult.ticket && (
                  <button
                    onClick={() => handleDisbursePrize(verificationResult.ticket!.id)}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-2xl text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Confirm Winner & Disburse {verificationResult.ticket.prizeAmount} Birr</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 text-xs">
                Scan a ticket QR code or click a test sample to display verification results.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
