import React from 'react';

// A small change here to right-align the text
const StatItem = ({ label, value }) => (
    <div>
        <div className="text-xs text-gray-400 text-right">{label}</div>
        <div className="text-sm font-semibold text-white text-right">{value}</div>
    </div>
);

export default function CoinStatsCard({ stats }) {
    if (!stats || !stats.quote || !stats.quote.USD) {
        return (
            <div className="w-full bg-[#1C2127] p-4 rounded-lg my-4 text-center text-gray-400">
                Loading stats...
            </div>
        );
    }
    
    // Safely get all values
    const price = stats.quote.USD.price ?? 0;
    const change = stats.quote.USD.percent_change_24h ?? 0;
    const high24h = stats.high_24h ?? 0;
    const low24h = stats.low_24h ?? 0;
    const volumeUsdt = stats.quote.USD.volume_24h ?? 0;

    const isPositive = change >= 0;

    return (
        <div className="w-full bg-[#1C2127] p-4 rounded-lg my-4">
            {/* Grid layout changed from 3 columns to 2 */}
            <div className="grid grid-cols-2 gap-4">
                
                {/* Left Side: Main Price Info (Unchanged) */}
                <div className="col-span-1 flex flex-col justify-center">
                    <div className={`text-2xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                        {price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-300">
                        ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        <span className={`ml-2 font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                           {isPositive ? '+' : ''}{change.toFixed(2)}%
                        </span>
                    </div>
                </div>
                
                {/* Right Side: Rearranged into 3 rows */}
                <div className="col-span-1 flex flex-col justify-between">
                    <StatItem label="24h High" value={high24h.toLocaleString()} />
                    <StatItem label="24h Low" value={low24h.toLocaleString()} />
                    <StatItem label="24h Vol(USDT)" value={`${(volumeUsdt / 1_000_000).toFixed(2)}M`} />
                </div>

            </div>
        </div>
    );
}