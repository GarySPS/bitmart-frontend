import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function BinaryTradeModal({ direction, onClose, onConfirm, balance }) {
  const [duration, setDuration] = useState(30);
  const [amount, setAmount] = useState('100');

  const durations = [15, 30, 60, 120];
  const quickAmounts = [25, 50, 100, 250, 500];

  const handleConfirm = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    onConfirm({ amount: Number(amount), duration });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-end z-50">
      <div className="bg-[#1C2127] w-full max-w-md rounded-t-2xl p-5 flex flex-col text-white animate-slide-up">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${direction === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            {direction === 'buy' ? 'Buy Long (Up)' : 'Sell Short (Down)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Duration Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Period</label>
          <div className="grid grid-cols-4 gap-3">
            {durations.map((d) => (
              <button
                key={d}
                onClick={() => setDuration(d)}
                className={`py-3 rounded-lg font-semibold transition ${duration === d ? 'bg-[#3af0ff] text-black ring-2 ring-white/50' : 'bg-[#2A3139] text-gray-200'}`}
              >
                {d}s
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Amount (USDT)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Least 10 USDT"
            className="w-full bg-[#2A3139] p-3 rounded-lg text-white font-bold text-lg border border-transparent focus:border-[#3af0ff] focus:ring-0"
          />
        </div>
        
        {/* Quick Amount Selection */}
        <div className="grid grid-cols-5 gap-3 mb-4">
            {quickAmounts.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={`py-2 rounded-lg font-semibold transition ${amount === String(a) ? 'bg-gray-500 text-white' : 'bg-[#2A3139] text-gray-200'}`}
              >
                ${a}
              </button>
            ))}
        </div>

        <div className="text-sm text-gray-400 mb-4">
            Available Balance: {Number(balance || 0).toFixed(2)} USDT
        </div>

        {/* Confirm Button */}
        <button
          onClick={handleConfirm}
          className={`w-full py-4 rounded-xl font-bold text-lg transition ${direction === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}