import React, { useState, useEffect } from "react";
import axios from "axios";
import { AnimatePresence } from "framer-motion";
import { MAIN_API_BASE } from "../config";
import { Menu, TrendingUp, TrendingDown } from 'lucide-react';
import BitMartLogo from "../components/BitMartLogo.png";
import { useParams } from 'react-router-dom';

// Import all necessary modal and sub-components
import BinaryTradeModal from '../components/BinaryTradeModal';
import BinaryResultModal from '../components/BinaryResultModal';
import CoinSelectMenu from '../components/CoinSelectMenu';
import CountdownModal from '../components/CountdownModal';
import BeautifulLoader from "../components/BeautifulLoader";
import OrderBTC from "../components/orderbtc";

const COINS = [
  { symbol: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT" },
  { symbol: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT" },
  { symbol: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT" },
  { symbol: "XRP", name: "Ripple", tv: "BINANCE:XRPUSDT" },
  { symbol: "TON", name: "Toncoin", tv: "BINANCE:TONUSDT" },
];

// --- Helper Functions (Unchanged) ---
function persistTradeState(tradeState) {
  if (tradeState) localStorage.setItem("activeTrade", JSON.stringify(tradeState));
  else localStorage.removeItem("activeTrade");
}
function loadTradeState() {
  try {
    const saved = localStorage.getItem("activeTrade");
    if (!saved) return null;
    const trade = JSON.parse(saved);
    return trade.endAt > Date.now() ? trade : null;
  } catch { return null; }
}
function createTradeState(trade_id, user_id, duration, amount, symbol, direction) {
  const endAt = Date.now() + duration * 1000;
  return { trade_id, user_id, duration, endAt, amount, symbol, direction };
}
const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split(".")[1])); } 
  catch { return {}; }
};

// --- Child Component for Coin Statistics ---
const CoinStatsDisplay = ({ stats }) => {
    if (!stats) {
        return <div className="h-[76px]"></div>; // This empty div holds the space without showing a loader
    }
    const price = stats.quote.USD.price;
    const change = stats.quote.USD.percent_change_24h;
    const isPositive = change >= 0;

    return (
        <div className="flex justify-between items-start p-4">
            <div>
                <p className="text-3xl font-bold tracking-tighter text-white">
                    {price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </p>
                <p className={`text-lg font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                </p>
            </div>
            <div className="text-right text-sm text-gray-400">
                <p>24h High: <span className="font-semibold text-gray-200">{stats.high_24h.toLocaleString()}</span></p>
                <p>24h Low: <span className="font-semibold text-gray-200">{stats.low_24h.toLocaleString()}</span></p>
                <p>24h Vol: <span className="font-semibold text-gray-200">{(stats.quote.USD.volume_24h / 1_000_000).toFixed(2)}M</span></p>
            </div>
        </div>
    );
};


export default function TradePage() {
    const [modalView, setModalView] = useState('none');
    const [isCoinMenuOpen, setIsCoinMenuOpen] = useState(false);
    const [tradeDirection, setTradeDirection] = useState(null);
    const { symbol } = useParams(); // Get symbol from URL

// Find the coin from our COINS array based on the URL symbol, or default to BTC
const getInitialCoin = () => {
    if (symbol) {
        const foundCoin = COINS.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
        if (foundCoin) return foundCoin;
    }
    return COINS[0]; // Default to BTC
};

    const [selectedCoin, setSelectedCoin] = useState(getInitialCoin());

   // Effect to update the coin if the URL parameter changes while on the page
    useEffect(() => {
    setSelectedCoin(getInitialCoin());
    }, [symbol]);
    const [balance, setBalance] = useState(0);
    const [loadingChart, setLoadingChart] = useState(true);
    const [allCoinStats, setAllCoinStats] = useState([]);
    
    const [tradeState, setTradeState] = useState(loadTradeState());
    const [tradeDetail, setTradeDetail] = useState(null);
    const [waitingForResult, setWaitingForResult] = useState(false);
    
    const token = localStorage.getItem("token");
    const currentCoinStats = allCoinStats.find(c => c.symbol === selectedCoin.symbol) || null;
    const coinPrice = currentCoinStats ? currentCoinStats.quote.USD.price : null;

    useEffect(() => {
        const fetchAllStats = () => {
            axios.get(`${MAIN_API_BASE}/prices`)
                .then(res => setAllCoinStats(res.data.data || []))
                .catch(error => console.error("Failed to fetch coin stats", error));
        };
        fetchAllStats();
        const interval = setInterval(fetchAllStats, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchBalance = () => {
        if (!token) return;
        axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                const usdtAsset = (res.data.assets || []).find(a => a.symbol === 'USDT');
                if (usdtAsset) setBalance(parseFloat(usdtAsset.balance));
            })
            .catch(err => console.error("Failed to fetch balance:", err));
    };
    useEffect(fetchBalance, [token, tradeDetail]);

    useEffect(() => {
        setLoadingChart(true);
        const scriptId = 'tradingview-widget-script';
        let script = document.getElementById(scriptId);
        if(script) script.remove();

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
                    backgroundColor: "rgba(0,0,0,0)",
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
                setTimeout(() => setLoadingChart(false), 1400);
            }
        };
        document.body.appendChild(script);

        return () => {
            document.getElementById(scriptId)?.remove();
        };
    }, [selectedCoin]);

    const pollResult = async (trade_id, user_id) => {
        let tries = 0, trade = null;
        while (tries < 10 && (!trade || trade.result === "PENDING")) {
            try {
                const res = await axios.get(`${MAIN_API_BASE}/trade/history/${user_id}`, { headers: { Authorization: `Bearer ${token}` } });
                trade = res.data.find((t) => t.id === trade_id);
                if (trade && trade.result !== "PENDING") break;
            } catch {}
            await new Promise((r) => setTimeout(r, 1500));
            tries++;
        }
        setWaitingForResult(false);
        setTradeState(null);
        persistTradeState(null);
        if (trade && trade.result !== "PENDING") {
            setTradeDetail(trade);
            setModalView('result');
        } else {
            alert("Could not retrieve trade result. Please check your trade history.");
        }
    };

    const onTimerComplete = async () => {
        if (!tradeState) return;
        setWaitingForResult(true);
        await pollResult(tradeState.trade_id, tradeState.user_id);
    };
    
    const executeTrade = async ({ amount, duration, profitPercentage }) => {
        setModalView('none');
        if (!coinPrice || !token || tradeState) {
            alert(!token ? "Please log in to trade." : "A trade is already active.");
            return;
        }

        const user_id = parseJwt(token).id;
        try {
            const res = await axios.post(`${MAIN_API_BASE}/trade`, {
                user_id,
                direction: tradeDirection.toUpperCase(),
                amount: Number(amount),
                duration: Number(duration),
                symbol: selectedCoin.symbol,
                client_price: Number(coinPrice),
                profit_percentage: profitPercentage,
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (!res.data.trade_id) throw new Error("Backend did not return a trade_id");

            const newTradeState = createTradeState(res.data.trade_id, user_id, duration, amount, selectedCoin.symbol, tradeDirection.toUpperCase());
            setTradeState(newTradeState);
            persistTradeState(newTradeState);
        } catch (err) {
            alert(`Trade failed: ${err.response?.data?.error || err.message}`);
        }
    };

    const handleOpenTradeModal = (direction) => {
        if (tradeState) return;
        setTradeDirection(direction);
        setModalView('trade');
    };
    
    useEffect(() => {
        if (tradeState) {
            setModalView('countdown');
        }
    }, [tradeState]);

    return (
        <div className="w-full max-w-full min-h-screen bg-[#0b1020] text-white overflow-x-hidden">
            
            {/* --- Header --- */}
            <header className="sticky top-0 z-20 bg-[#0b1020]/80 backdrop-blur-md p-4 flex items-center justify-between border-b border-gray-800">
                <h1 className="text-xl font-semibold text-white">Binary Trading</h1>
                <button 
                    onClick={() => setIsCoinMenuOpen(true)} 
                    disabled={!!tradeState}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1C2127] text-white font-bold text-base disabled:opacity-50 transition-colors hover:bg-gray-700"
                >
                    <Menu size={18} />
                    {selectedCoin.symbol}/USDT
                </button>
            </header>
            
            <main className="pb-40">
                <CoinStatsDisplay stats={currentCoinStats} />

                {/* --- Trading View Chart --- */}
                <div className="relative w-full h-[40vh] min-h-[350px] px-4">
                    <div id="tradingview_chart_container" className="w-full h-full" />
                    {loadingChart && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0b1020]">
                            <BeautifulLoader text="Refreshing Price..." />
                        </div>
                    )}
                </div>

                 {/* --- Order Book --- */}
                <div className="mt-6 px-4">
                    <OrderBTC />
                </div>
            </main>
            
            {/* --- Fixed Buy/Sell Buttons --- */}
            <div 
                className="fixed bottom-[65px] left-0 right-0 z-10 bg-gradient-to-t from-[#0b1020] via-[#0b1020] to-transparent pt-8 px-4 pb-4"
                style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => handleOpenTradeModal('buy')} 
                        disabled={!!tradeState} 
                        className="w-full py-4 rounded-xl font-bold text-lg bg-green-500 hover:bg-green-600 disabled:bg-gray-700 disabled:text-gray-400 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <TrendingUp size={22}/>
                        Buy Long
                    </button>
                    <button 
                        onClick={() => handleOpenTradeModal('sell')} 
                        disabled={!!tradeState} 
                        className="w-full py-4 rounded-xl font-bold text-lg bg-red-500 hover:bg-red-600 disabled:bg-gray-700 disabled:text-gray-400 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2"
                    >
                        <TrendingDown size={22}/>
                        Sell Short
                    </button>
                </div>
            </div>

            {/* --- Modals --- */}
            <AnimatePresence>
                {modalView === 'trade' && (
                    <BinaryTradeModal direction={tradeDirection} balance={balance} onClose={() => setModalView('none')} onConfirm={executeTrade} />
                )}
                {modalView === 'countdown' && tradeState && (
                    <CountdownModal tradeDetails={tradeState} isWaiting={waitingForResult} onComplete={onTimerComplete} />
                )}
                {modalView === 'result' && tradeDetail && (
                    <BinaryResultModal tradeDetail={tradeDetail} onClose={() => { setTradeDetail(null); setModalView('none'); }} />
                )}
                {isCoinMenuOpen && (
                    <CoinSelectMenu 
                        isOpen={isCoinMenuOpen} 
                        onClose={() => setIsCoinMenuOpen(false)} 
                        onSelectCoin={(coin) => {
                            setSelectedCoin(coin);
                            setIsCoinMenuOpen(false);
                        }} 
                        currentCoinSymbol={selectedCoin.symbol} 
                        disabled={!!tradeState} 
                    />
                )}
            </AnimatePresence>
        </div>
    );
}