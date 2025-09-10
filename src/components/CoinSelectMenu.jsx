import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const COINS = [
    { symbol: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT" },
    { symbol: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT" },
    { symbol: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT" },
    { symbol: "XRP", name: "Ripple", tv: "BINANCE:XRPUSDT" },
    { symbol: "TON", name: "Toncoin", tv: "BINANCE:TONUSDT" },
];

export default function CoinSelectMenu({ isOpen, onClose, onSelectCoin, currentCoinSymbol, disabled }) {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'tween', duration: 0.2 }}
                    className="fixed inset-0 bg-[#0b1020] z-50 flex flex-col pt-safe-top"
                >
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-white">Select Market</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4">
                        {COINS.map(coin => (
                            <button
                                key={coin.symbol}
                                onClick={() => {
                                    if (!disabled) {
                                        onSelectCoin(coin);
                                        onClose();
                                    }
                                }}
                                disabled={disabled}
                                className={`w-full flex items-center justify-between p-4 mb-2 rounded-lg 
                                            ${currentCoinSymbol === coin.symbol 
                                                ? 'bg-[#3af0ff] text-black font-bold' 
                                                : 'bg-[#1C2127] text-white hover:bg-[#2A3139]'}
                                            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                                            transition-colors`}
                            >
                                <span className="text-lg">{coin.name} ({coin.symbol})</span>
                                {currentCoinSymbol === coin.symbol && (
                                    <svg className="w-5 h-5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}