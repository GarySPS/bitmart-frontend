import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function BinaryTradeModal({ direction, onClose, onConfirm, balance }) {
  const [duration, setDuration] = useState(30);
  const [amount, setAmount] = useState('100');

  // NEW: Added profit percentage to each duration

const durations = [
  { seconds: 15, profit: 30 },
  { seconds: 30, profit: 50 },
  { seconds: 60, profit: 70 },
  { seconds: 120, profit: 100 },
];
  const quickAmounts = [25, 50, 100, 250, 500];

  const handleConfirm = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }
    // Pass back the number of seconds
    onConfirm({ amount: Number(amount), duration: duration });
  };
  
  // Find the selected profit for display
  const selectedProfit = durations.find(d => d.seconds === duration)?.profit || 0;

  return (
    // CHANGED: items-center to float the modal in the middle
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      {/* CHANGED: rounded-2xl for all corners, and added max-w-sm */}
      <div className="bg-[#1C2127] w-full max-w-sm rounded-2xl p-5 flex flex-col text-white animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${direction === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            {direction === 'buy' ? 'Buy Long (Up)' : 'Sell Short (Down)'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* MODIFIED: Duration Selection with Profit % */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">Select Period</label>
          <div className="grid grid-cols-4 gap-3">
            {durations.map((d) => (
              <button
                key={d.seconds}
                onClick={() => setDuration(d.seconds)}
                className={`py-2 rounded-lg font-semibold transition flex flex-col items-center justify-center ${duration === d.seconds ? 'bg-[#3af0ff] text-black ring-2 ring-white/50' : 'bg-[#2A3139] text-gray-200'}`}
              >
                <span className="text-lg">{d.seconds}s</span>
                <span className="text-xs opacity-80">+{d.profit}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
              Amount (USDT)
              {/* Added a dynamic profit calculation */}
              <span className="text-green-400 ml-2 font-semibold">
                Profit: +${(Number(amount) * (selectedProfit / 100)).toFixed(2)}
              </span>
          </label>
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