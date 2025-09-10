import React from 'react';

const StatItem = ({ label, value }) => (
    <div>
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-semibold text-white">{value}</div>
    </div>
);

export default function CoinStatsCard({ stats }) {
    // This guard clause now checks more carefully if the necessary data exists.
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
    const symbol = stats.symbol || 'COIN';

    const isPositive = change >= 0;

    return (
        <div className="w-full bg-[#1C2127] p-4 rounded-lg my-4">
            <div className="grid grid-cols-3 gap-4">
                {/* Main Price Info */}
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
                
                {/* 24h High/Low */}
                <div className="col-span-1 flex flex-col justify-center gap-2">
                    <StatItem label="24h High" value={high24h.toLocaleString()} />
                    <StatItem label="24h Low" value={low24h.toLocaleString()} />
                </div>

                {/* 24h Volume */}
                <div className="col-span-1 flex flex-col justify-center gap-2">
                    <StatItem label={`24h Vol(${symbol})`} value={"-"} /> 
                    <StatItem label="24h Vol(USDT)" value={`${(volumeUsdt / 1_000_000).toFixed(2)}M`} />
                </div>
            </div>
        </div>
    );
}