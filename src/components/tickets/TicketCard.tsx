import React, { useEffect, useState } from 'react';
import { Ticket } from '../../types';
import QRCode from 'qrcode';
import { Sparkles, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

interface TicketCardProps {
  ticket: Ticket;
  onPrint?: () => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onPrint }) => {
  const [qrUrl, setQrUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(
      ticket.qrData,
      {
        width: 180,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrUrl(url);
        }
      }
    );
  }, [ticket]);

  return (
    <div className="w-full max-w-md mx-auto bg-slate-950 text-slate-900 rounded-3xl p-1 shadow-2xl overflow-hidden border border-amber-500/30">
      {/* Outer Golden Ticket Container */}
      <div className="bg-gradient-to-b from-amber-50 via-white to-amber-50 p-6 rounded-[22px] relative border border-amber-200">
        {/* Top Watermark / Brand Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-900/10 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center font-black text-amber-400 text-sm">
              SG
            </div>
            <div>
              <p className="font-black text-xs tracking-wider text-slate-900 uppercase">SPAIN GAME OFFICIAL TICKET</p>
              <p className="text-[10px] text-slate-500 font-semibold">{ticket.gameName}</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-amber-500/20 text-amber-900 font-black text-[10px] rounded-full uppercase border border-amber-400/40">
            {ticket.gameType}
          </span>
        </div>

        {/* Selected Lucky Number Big Banner */}
        <div className="bg-slate-950 text-white p-4 rounded-2xl text-center shadow-inner mb-4 relative overflow-hidden">
          <div className="absolute top-1 right-2 text-[10px] font-mono text-amber-400 opacity-60">LUCKY PICK</div>
          <p className="text-[11px] text-slate-400 uppercase font-bold tracking-widest">SELECTED NUMBER</p>
          <p className="text-4xl sm:text-5xl font-black tracking-widest text-amber-400 font-mono my-1">
            {ticket.selectedNumber}
          </p>
          <p className="text-[10px] text-slate-400">
            Ticket Price: <span className="font-bold text-white">{ticket.ticketPrice} Birr</span>
          </p>
        </div>

        {/* Player & Ticket ID Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs mb-4 p-3 bg-slate-100/80 rounded-xl border border-slate-200/80 font-medium">
          {ticket.gameType !== 'solo' ? (
            <>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Player Name</p>
                <p className="font-bold text-slate-900 truncate">{ticket.playerName || 'Walk-in Player'}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Player Phone</p>
                <p className="font-mono font-bold text-slate-800">{ticket.playerPhone || 'N/A'}</p>
              </div>
            </>
          ) : (
            <div>
              <p className="text-[10px] text-slate-500 uppercase font-semibold">Game Mode</p>
              <p className="font-bold text-slate-900 truncate">Solo Game (Seat #{ticket.selectedNumber})</p>
            </div>
          )}
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Ticket Serial ID</p>
            <p className="font-mono font-black text-amber-700">{ticket.id}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-semibold">Purchase Date</p>
            <p className="text-[10px] font-bold text-slate-700">
              {new Date(ticket.purchaseDate).toLocaleDateString()} {new Date(ticket.purchaseDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* 17 Digit ID Number Display */}
        <div className="p-2.5 bg-amber-100/60 rounded-xl border border-amber-300/60 text-center mb-4">
          <p className="text-[9px] uppercase font-bold text-amber-900 tracking-wider">
            17-Digit Verification Security Code
          </p>
          <p className="font-mono text-xs sm:text-sm font-black tracking-widest text-slate-950 mt-0.5">
            {ticket.seventeenDigitId}
          </p>
        </div>

        {/* Tear Line / Dashed Border */}
        <div className="my-4 border-b-2 border-dashed border-slate-400 relative">
          <div className="absolute -left-8 -top-3 w-6 h-6 rounded-full bg-slate-950" />
          <div className="absolute -right-8 -top-3 w-6 h-6 rounded-full bg-slate-950" />
        </div>

        {/* QR Code & Verification Block */}
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-1 text-[10px] text-slate-600">
            <p className="font-bold text-slate-900">Agent: {ticket.agentName}</p>
            <p>Agent ID: {ticket.agentId}</p>
            <p className="flex items-center text-emerald-700 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
              Verified Authentic Ticket
            </p>
          </div>

          <div className="text-center">
            {qrUrl ? (
              <img src={qrUrl} alt="Ticket QR" className="w-20 h-20 rounded-lg shadow-sm border border-slate-300" />
            ) : (
              <div className="w-20 h-20 bg-slate-200 animate-pulse rounded-lg" />
            )}
            <span className="text-[8px] font-mono text-slate-500 mt-1 block">SCAN QR TO VERIFY</span>
          </div>
        </div>

        {/* Print Button Option */}
        {onPrint && (
          <button
            onClick={onPrint}
            className="w-full mt-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <Printer className="w-4 h-4" />
            <span>Print Thermal Ticket Receipt</span>
          </button>
        )}
      </div>
    </div>
  );
};
