import React, { useEffect, useState } from "react";
import { MAIN_API_BASE } from "../config";

function generateOrderBook(midPrice) {
  // Generate mock order book data
  const bids = Array.from({ length: 14 }).map((_, i) => ({
    price: (midPrice - 20 - i * 30).toLocaleString(),
    amount: (Math.random() * 1 + 0.01).toFixed(5),
  }));
  const asks = Array.from({ length: 14 }).map((_, i) => ({
    price: (midPrice + 20 + i * 30).toLocaleString(),
    amount: (Math.random() * 1 + 0.01).toFixed(5),
  }));
  return { bids, asks };
}

export default function OrderBTC() {
  const [btcPrice, setBtcPrice] = useState(null);
  const [bids, setBids] = useState([]);
  const [asks, setAsks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timer;
    const fetchPrice = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${MAIN_API_BASE}/price/BTC`);
        const data = await res.json();
        const price = data.price;
        setBtcPrice(price);
        const { bids, asks } = generateOrderBook(price);
        setBids(bids);
        setAsks(asks);
        setLoading(false);
      } catch (err) {
        setLoading(false);
      }
    };
    fetchPrice();
    timer = setInterval(fetchPrice, 5000);
    return () => clearInterval(timer);
  }, []);

  // For nice table alignment, use same length for bids/asks (take shorter)
  const rowCount = Math.min(bids.length, asks.length);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 rounded-2xl bg-[#15161e] border border-[#242630] shadow-lg">
      {/* Top Tabs */}
      <div className="flex items-center px-6 pt-5 pb-2 border-b border-[#23232c]">
        <span className="text-white font-bold text-lg mr-8 border-b-2 border-blue-500 pb-1 cursor-pointer">Order Book</span>
        <span className="text-gray-500 font-medium text-lg pb-1 cursor-pointer">Trades</span>
      </div>

      {/* Pair + Price */}
      <div className="flex justify-between items-center px-6 mt-4 mb-2">
        <span className="text-gray-400 text-sm font-semibold">BTC/USDT</span>
        <span className="bg-yellow-100 px-3 py-1 rounded-xl font-bold text-yellow-700 text-xs shadow ml-2">BitMart</span>
      </div>

      {/* Table Headers */}
      <div className="flex items-center px-6 pb-2 pt-1 text-xs font-bold text-gray-500 border-b border-[#23232c]">
        <div className="w-1/4 text-left">Bid Size</div>
        <div className="w-1/4 text-left">Bid Price</div>
        <div className="w-1/4 text-right">Ask Price</div>
        <div className="w-1/4 text-right">Ask Size</div>
      </div>

      {/* Table Body */}
      <div className="h-[420px] overflow-y-auto px-6 py-3 font-mono bg-[#161926]">
        {loading ? (
          <div className="text-center text-gray-400 py-12 text-base">Loading...</div>
        ) : (
          Array.from({ length: rowCount }).map((_, i) => (
            <div
              className="flex items-center py-[2.5px] text-[13px] border-b border-[#212130] gap-x-2 sm:gap-x-4"
              key={i}
            >
              {/* Bid Size */}
              <div className="w-1/4 min-w-0 truncate text-left text-gray-400 pr-1">{bids[i]?.amount}</div>
              {/* Bid Price */}
              <div className="w-1/4 min-w-0 truncate text-left font-bold text-green-500 pr-1">{bids[i]?.price}</div>
              {/* Ask Price */}
              <div className="w-1/4 min-w-0 truncate text-right font-bold text-red-500 pl-1">{asks[i]?.price}</div>
              {/* Ask Size */}
              <div className="w-1/4 min-w-0 truncate text-right text-gray-400 pl-1">{asks[i]?.amount}</div>
            </div>
          ))
        )}
      </div>

      {/* Center Price */}
      <div className="text-center my-4">
        <span className="inline-block text-[15px] font-bold text-blue-300 bg-blue-900/30 px-6 py-2 rounded-lg shadow">
          {btcPrice ? `Live Price: $${btcPrice.toLocaleString()}` : "Loading..."}
        </span>
      </div>

      {/* Footer */}
      <div className="text-right pb-3 px-6 text-[13px] text-gray-500 font-medium tracking-wide opacity-80">
        Live order • BitMart
      </div>
    </div>
  );
}
