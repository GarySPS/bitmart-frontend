// src/components/MarketTicker.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

const TickerCard = ({ coin, onNavigate }) => {
    if (!coin || !coin.quote || !coin.quote.USD) return null;

    const price = coin.quote.USD.price;
    const change = coin.quote.USD.percent_change_24h;
    const isPositive = change >= 0;

    return (
        <div
            onClick={() => onNavigate(coin.symbol)}
            className="flex-shrink-0 w-40 h-32 bg-[#1C2127] rounded-xl shadow-lg p-4 flex flex-col justify-between cursor-pointer snap-start border border-gray-700/50 hover:border-blue-500 transition-all duration-200"
        >
            <div>
                <div className="flex items-center gap-2">
                     <img
                        src={`https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`}
                        alt={coin.symbol}
                        className="w-7 h-7"
                    />
                    <span className="font-bold text-white text-lg">{coin.symbol}</span>
                </div>
            </div>
            <div>
                <p className="font-semibold text-white text-md truncate">
                    {price.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                </p>
                <p className={`font-bold text-lg ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </p>
            </div>
        </div>
    );
};

export default function MarketTicker({ allCoins }) {
    const navigate = useNavigate();
    const handleNavigate = (symbol) => navigate(`/trade/${symbol}`);
    
    // Filter for only the coins we want to show in the ticker
    const tickerCoins = ['BTC', 'ETH', 'SOL', 'XRP', 'TON'];
    const filteredCoins = allCoins.filter(c => tickerCoins.includes(c.symbol))
                                  .sort((a, b) => tickerCoins.indexOf(a.symbol) - tickerCoins.indexOf(b.symbol));

    return (
        <div className="w-full">
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory no-scrollbar">
                {filteredCoins.length > 0 ? (
                    filteredCoins.map(coin => <TickerCard key={coin.symbol} coin={coin} onNavigate={handleNavigate} />)
                ) : (
                    // Skeleton loaders
                    Array.from({ length: 5 }).map((_, i) => (
                         <div key={i} className="flex-shrink-0 w-40 h-32 bg-[#1C2127] rounded-xl p-4 animate-pulse border border-gray-700/50"></div>
                    ))
                )}
            </div>
        </div>
    );
}