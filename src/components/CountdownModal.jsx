import React from 'react';
import TimerBar from './TimerBar'; // Your existing TimerBar component

export default function CountdownModal({ tradeDetails, onComplete, isWaiting }) {
  const { direction, amount, symbol, endAt } = tradeDetails;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50 p-4">
      <div className="bg-[#1C2127] w-full max-w-sm rounded-2xl p-6 flex flex-col items-center text-white animate-scale-in">
        
        {/* Shows "Processing..." after timer finishes */}
        {isWaiting ? (
          <>
            <svg className="animate-spin mb-4" width="54" height="54" viewBox="0 0 54 54" fill="none">
              <circle cx="27" cy="27" r="24" stroke="#2474ff44" strokeWidth="5" />
              <path d="M51 27a24 24 0 1 1-48 0" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
            </svg>
            <h2 className="text-2xl font-bold mb-2 text-gray-300">
              Processing Result...
            </h2>
          </>
        ) : (
          <>
            <h2 className={`text-2xl font-bold mb-2 ${direction === 'BUY' ? 'text-green-400' : 'text-red-400'}`}>
              {direction === 'BUY' ? 'Buying Long (Up)' : 'Selling Short (Down)'}
            </h2>
            <p className="text-lg text-gray-300 mb-4">
              {amount} USDT on {symbol}/USDT
            </p>
            <TimerBar endAt={endAt} onComplete={onComplete} />
            <p className="text-sm text-gray-400 mt-4 text-center">
              Waiting for the trade period to complete.
            </p>
          </>
        )}
      </div>
    </div>
  );
}