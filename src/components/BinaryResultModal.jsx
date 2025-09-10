import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export default function BinaryResultModal({ tradeDetail, onClose }) {
  if (!tradeDetail) return null;

  const isWin = tradeDetail.result === 'WIN';
  const profit = Math.abs(tradeDetail.profit).toFixed(2);
  const direction = tradeDetail.direction === 'BUY' ? 'UP' : 'DOWN';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-[#1C2127] w-full max-w-sm rounded-2xl p-6 m-4 flex flex-col items-center text-white animate-scale-in">
        <div className="bg-green-500 rounded-full p-2 mb-4">
            <CheckCircle2 size={32} className="text-white" />
        </div>

        <h2 className="text-2xl font-bold mb-2">Trade Successful!</h2>
        
        <div className="text-center text-gray-300 font-medium mb-3">
            Direction: <span className={`font-bold ${direction === 'UP' ? 'text-green-400' : 'text-red-400'}`}>{direction}</span>
        </div>

        <div className="text-center mb-4">
            <p className="text-gray-400 text-sm">You earned</p>
            <p className={`text-4xl font-bold ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                {isWin ? '+' : '-'}${profit}
            </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 mt-2 rounded-xl font-bold text-lg bg-green-500 hover:bg-green-600 transition"
        >
          Continue Trading
        </button>
      </div>
    </div>
  );
}