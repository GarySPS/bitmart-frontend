import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { MAIN_API_BASE } from "../config";
import Icon from "../components/icon";
import OrderBTC from "../components/orderbtc";
import { useTranslation } from "react-i18next";
import { Menu } from 'lucide-react';

import BinaryTradeModal from '../components/BinaryTradeModal';
import BinaryResultModal from '../components/BinaryResultModal';
import CoinSelectMenu from '../components/CoinSelectMenu';
import CoinStatsCard from '../components/CoinStatsCard'; // <-- Import the new component

const COINS = [
  { symbol: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT" },
  { symbol: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT" },
  { symbol: "XRP", name: "Ripple", tv: "BINANCE:XRPUSDT" },
  { symbol: "TON", name: "Toncoin", tv: "BINANCE:TONUSDT" },
];

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split(".")[1])); } 
  catch { return {}; }
};

const TradingViewChart = ({ loading, onLoaded }) => {
    useEffect(() => {
        const timer = setTimeout(() => onLoaded(), 1500);
        return () => clearTimeout(timer);
    }, [onLoaded]);

    return (
        <div className="relative w-full h-[420px] rounded-lg bg-[#101726] border border-[#1a2343]">
            <div id="tradingview_chart_container" className="w-full h-full" />
            {loading && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c1323e6] backdrop-blur-sm">
                    <svg className="animate-spin mb-4" width="54" height="54" viewBox="0 0 54 54" fill="none">
                        <circle cx="27" cy="27" r="24" stroke="#2474ff44" strokeWidth="5" />
                        <path d="M51 27a24 24 0 1 1-48 0" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
                    </svg>
                    <div className="text-lg font-bold text-sky-100">Loading Chart...</div>
                </div>
            )}
        </div>
    );
};

export default function TradePage() {
    const { t } = useTranslation();
    const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
    const [isCoinMenuOpen, setIsCoinMenuOpen] = useState(false);
    const [tradeDirection, setTradeDirection] = useState(null);
    const [isTrading, setIsTrading] = useState(false);
    const [countdown, setCountdown] = useState(0);
    const [tradeResultDetail, setTradeResultDetail] = useState(null);
    const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
    const [balance, setBalance] = useState(0);
    const [loadingChart, setLoadingChart] = useState(true);
    const [toast, setToast] = useState(null);
    
    // NEW STATE for all coin statistics
    const [allCoinStats, setAllCoinStats] = useState([]);
    const token = localStorage.getItem("token");

    // DERIVED STATE: find the stats for the currently selected coin
    const currentCoinStats = allCoinStats.find(c => c.symbol === selectedCoin.symbol) || null;
    const coinPrice = currentCoinStats ? currentCoinStats.quote.USD.price : null;

    useEffect(() => {
        const fetchBalance = () => {
            if (!token) return;
            axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
                .then(res => {
                    const usdtAsset = (res.data.assets || []).find(a => a.symbol === 'USDT');
                    if (usdtAsset) setBalance(parseFloat(usdtAsset.balance));
                })
                .catch(err => console.error("Failed to fetch balance:", err));
        };
        fetchBalance();
    }, [token]);

    // MODIFIED DATA FETCHING: Fetches all coins' detailed stats
    useEffect(() => {
        const fetchAllStats = async () => {
            try {
                const res = await axios.get(`${MAIN_API_BASE}/prices`);
                setAllCoinStats(res.data.data || []);
            } catch (error) {
                console.error("Failed to fetch coin stats", error);
            }
        };
        fetchAllStats();
        const interval = setInterval(fetchAllStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        setLoadingChart(true);
        const scriptId = 'tradingview-widget-script';
        let script = document.getElementById(scriptId);
        if (script) script.remove();
        
        script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://s3.tradingview.com/tv.js";
        script.async = true;
        script.onload = () => {
            if (window.TradingView && document.getElementById("tradingview_chart_container")) {
                new window.TradingView.widget({
                    container_id: "tradingview_chart_container",
                    autosize: true,
                    symbol: selectedCoin.tv,
                    interval: "1",
                    timezone: "Etc/UTC",
                    theme: "dark",
                    style: "1",
                    locale: "en",
                    toolbar_bg: "#101726",
                    backgroundColor: "#101726",
                    enable_publishing: false,
                    allow_symbol_change: false,
                    hide_top_toolbar: true,
                    hide_legend: true,
                    hide_side_toolbar: true,
                    withdateranges: false,
                    details: false,
                    studies: [],
                    overrides: {},
                    loading_screen: { backgroundColor: "#101726" },
                });
            }
        };
        document.body.appendChild(script);
        return () => {
            let existingScript = document.getElementById(scriptId);
            if (existingScript) existingScript.remove();
        };
    }, [selectedCoin]);

    const showToast = (text, type = "error") => {
        const id = Math.random();
        setToast({ text, type, id });
        setTimeout(() => setToast(t => (t && t.id === id ? null : t)), 2500);
    };

    const handleOpenTradeModal = (direction) => {
        if (isTrading) return;
        setTradeDirection(direction);
        setIsTradeModalOpen(true);
    };

    const handleConfirmTrade = async ({ amount, duration }) => {
        setIsTradeModalOpen(false);
        if (!coinPrice || isTrading || !token) {
            showToast(!token ? "Please log in to trade." : "A trade is already active.", "warning");
            return;
        }
        setIsTrading(true);
        setCountdown(duration);

        try {
            const res = await axios.post(`${MAIN_API_BASE}/trade`, {
                direction: tradeDirection.toUpperCase(),
                amount: Number(amount),
                duration: Number(duration),
                symbol: selectedCoin.symbol,
                client_price: Number(coinPrice),
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (!res.data.trade_id) throw new Error("Failed to start trade");
            setTimeout(() => pollForResult(res.data.trade_id), duration * 1000);

        } catch (err) {
            setIsTrading(false);
            setCountdown(0);
            showToast(`Trade failed: ${err.response?.data?.error || err.message}`, "error");
        }
    };

    const pollForResult = (trade_id) => {
        const user_id = parseJwt(token).id;
        let tries = 0;
        const interval = setInterval(async () => {
            tries++;
            if (tries > 10) {
                clearInterval(interval);
                setIsTrading(false);
                showToast("Result timed out. Please check your trade history.", "info");
                return;
            }
            try {
                const res = await axios.get(`${MAIN_API_BASE}/trade/history/${user_id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const trade = res.data.find(t => t.id === trade_id);
                if (trade && trade.result !== "PENDING") {
                    clearInterval(interval);
                    setIsTrading(false);
                    setTradeResultDetail(trade);
                    axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
                        .then(balRes => {
                            const usdtAsset = (balRes.data.assets || []).find(a => a.symbol === 'USDT');
                            if (usdtAsset) setBalance(parseFloat(usdtAsset.balance));
                        });
                }
            } catch (error) {
                 console.error("Polling error:", error);
            }
        }, 1500);
    };
    
    useEffect(() => {
        if (!isTrading || countdown <= 0) return;
        const timer = setInterval(() => setCountdown(prev => (prev > 0 ? prev - 1 : 0)), 1000);
        return () => clearInterval(timer);
    }, [isTrading, countdown]);

    return (
        <div className="w-full max-w-full min-h-screen bg-[#0b1020] text-white px-2 pt-4 pb-20 overflow-x-hidden">
            <div className="sticky top-0 z-10 bg-[#0b1020] py-3 px-2 flex items-center justify-between">
                <button 
                    onClick={() => setIsCoinMenuOpen(true)} 
                    disabled={isTrading}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1C2127] text-white font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Menu size={20} />
                    {selectedCoin.symbol}/USDT
                    <Icon name="chevron-down" className="w-5 h-5 ml-1" />
                </button>
            </div>

            {/* NEW STATS CARD IS ADDED HERE */}
            <CoinStatsCard stats={currentCoinStats} />

            <TradingViewChart key={selectedCoin.symbol} loading={loadingChart} onLoaded={() => setLoadingChart(false)} />
            
            {isTrading && (
                <div className="mt-4 p-4 rounded-lg bg-black/30 text-center animate-pulse">
                    <p className="font-semibold text-gray-300">Trading in progress...</p>
                    <p className="text-4xl font-bold text-[#3af0ff]">{countdown}s</p>
                </div>
            )}
            
            <div className="fixed left-0 right-0 bg-[#1C2127] p-4 border-t border-gray-700 grid grid-cols-2 gap-4 z-40"
                 style={{ bottom: 'calc(65px + env(safe-area-inset-bottom))' }}>
                <button
                    onClick={() => handleOpenTradeModal('buy')}
                    disabled={isTrading}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-600 transition"
                >
                    Buy Long
                </button>
                <button
                    onClick={() => handleOpenTradeModal('sell')}
                    disabled={isTrading}
                    className="w-full py-4 rounded-xl font-bold text-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-600 transition"
                >
                    Sell Short
                </button>
            </div>
            
            <div className="mt-6 pb-24">
                <OrderBTC />
            </div>

            <AnimatePresence>
                {isTradeModalOpen && (
                    <BinaryTradeModal
                        direction={tradeDirection}
                        balance={balance}
                        onClose={() => setIsTradeModalOpen(false)}
                        onConfirm={handleConfirmTrade}
                    />
                )}
                {tradeResultDetail && (
                    <BinaryResultModal 
                        tradeDetail={tradeResultDetail}
                        onClose={() => setTradeResultDetail(null)}
                    />
                )}
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[99]"
                    >
                        <div className={`px-4 py-2 rounded-lg text-white font-semibold ${toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
                            {toast.text}
                        </div>
                    </motion.div>
                )}
                {isCoinMenuOpen && (
                    <CoinSelectMenu
                        isOpen={isCoinMenuOpen}
                        onClose={() => setIsCoinMenuOpen(false)}
                        onSelectCoin={(coin) => setSelectedCoin(coin)}
                        currentCoinSymbol={selectedCoin.symbol}
                        disabled={isTrading}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}