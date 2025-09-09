import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import BitMartLogo from "../components/BitMartLogo.png";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import Field from "../components/field";
import Tooltip from "../components/tooltip";
import Icon from "../components/icon";
import TimerBar from "../components/TimerBar";
import OrderBTC from "../components/orderbtc";
import { useTranslation } from "react-i18next";

/* ---------------- Coins (unchanged logics) ---------------- */
const COINS = [
  { symbol: "BTC", name: "Bitcoin", tv: "BINANCE:BTCUSDT", api: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", tv: "BINANCE:ETHUSDT", api: "ethereum" },
  { symbol: "SOL", name: "Solana", tv: "BINANCE:SOLUSDT", api: "solana" },
  { symbol: "XRP", name: "Ripple", tv: "BINANCE:XRPUSDT", api: "ripple" },
  { symbol: "TON", name: "Toncoin", tv: "BINANCE:TONUSDT", api: "toncoin" },
];

/* ---------------- Local storage helpers (unchanged) ---------------- */
function persistTradeState(tradeState) {
  if (tradeState) localStorage.setItem("activeTrade", JSON.stringify(tradeState));
  else localStorage.removeItem("activeTrade");
}
function loadTradeState() {
  try {
    return JSON.parse(localStorage.getItem("activeTrade") || "null");
  } catch {
    return null;
  }
}
function createTradeState(trade_id, user_id, duration) {
  const endAt = Date.now() + duration * 1000;
  return { trade_id, user_id, duration, endAt };
}

export default function TradePage() {
  const { t } = useTranslation();

  /* ---------------- State (unchanged) ---------------- */
  const [selectedCoin, setSelectedCoin] = useState(COINS[0]);
  const [coinPrice, setCoinPrice] = useState(null);

  const [amount, setAmount] = useState(100);
  const [duration, setDuration] = useState(30);
  const [direction, setDirection] = useState("BUY");
  const [timerActive, setTimerActive] = useState(false);
  const [tradeResult, setTradeResult] = useState(null);
  const [tradeDetail, setTradeDetail] = useState(null);
  const [fetchError, setFetchError] = useState(false);
  const [tradeState, setTradeState] = useState(null);
  const [timerKey, setTimerKey] = useState(0);
  const [waitingResult, setWaitingResult] = useState(false);
  const [loadingChart, setLoadingChart] = useState(true);

  // --- pretty toast ---
const [toast, setToast] = useState(null); // { text, type, id }
const showToast = (text, type = "error") => {
  const id = Math.random();
  setToast({ text, type, id });
  setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 2000);
};


  /* ---------------- Restore active trade (unchanged) ---------------- */
  useEffect(() => {
    const saved = loadTradeState();
    if (saved && saved.endAt > Date.now()) {
      const remaining = Math.ceil((saved.endAt - Date.now()) / 1000);
      const adjustedTradeState = { ...saved, duration: remaining };
      setTradeState(adjustedTradeState);
      setTimerActive(true);
      setTradeDetail(null);
      setTradeResult(null);
      setTimerKey(Math.random());
    }
  }, []);

  /* ---------------- Price polling (unchanged) ---------------- */
  useEffect(() => {
    let interval;
    const fetchPrice = async () => {
      try {
        const res = await axios.get(`${MAIN_API_BASE}/prices/${selectedCoin.symbol}`);
        setCoinPrice(Number(res.data?.price));
        setFetchError(false);
      } catch {
        setCoinPrice(null);
        setFetchError(true);
      }
    };
    fetchPrice();
    interval = setInterval(fetchPrice, 5000);
    return () => clearInterval(interval);
  }, [selectedCoin]);

  /* ---------------- TradingView loader (unchanged) ---------------- */
  useEffect(() => {
    setLoadingChart(true);
    const script = document.createElement("script");
    script.id = "tradingview-widget-script";
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          container_id: "tradingview_chart_container",
          width: "100%",
          height: 420,
          symbol: selectedCoin.tv,
          interval: "15",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0f0f16",
          backgroundColor: "#101726",
          enable_publishing: false,
          allow_symbol_change: false,
          hide_top_toolbar: false,
          hide_legend: false,
          hide_side_toolbar: true,
          withdateranges: true,
          details: false,
          studies: [],
          overrides: {},
          loading_screen: { backgroundColor: "#101726", foregroundColor: "#ffd700" },
        });
        setTimeout(() => setLoadingChart(false), 1400);
      }
    };
    document.body.appendChild(script);
    return () => {
      const sc = document.getElementById("tradingview-widget-script");
      if (sc) sc.remove();
      const container = document.getElementById("tradingview_chart_container");
      if (container) container.innerHTML = "";
    };
  }, [selectedCoin]);

  /* ---------------- Result polling (unchanged) ---------------- */
  async function pollResult(trade_id, user_id) {
    let tries = 0,
      trade = null;
    const token = localStorage.getItem("token");
    while (tries < 6 && (!trade || trade.result === "PENDING")) {
      try {
        const his = await axios.get(`${MAIN_API_BASE}/trade/history/${user_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        trade = his.data.find((t) => t.id === trade_id);
        if (trade && trade.result !== "PENDING") break;
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
      tries++;
    }
    setTimerActive(false);
    setTradeState(null);
    persistTradeState(null);
    if (trade && trade.result !== "PENDING") {
      setTradeResult(trade.result === "WIN" ? trade.profit : -Math.abs(trade.profit));
      setTradeDetail(trade);
    } else {
      setTradeResult(null);
      setTradeDetail(null);
      showToast(t("trade_result_not_ready", "Trade result not ready, please check history!"), "info");
    }
  }

  const onTimerComplete = async () => {
    setWaitingResult(true);
    if (!tradeState) return;
    await pollResult(tradeState.trade_id, tradeState.user_id);
    setTradeState(null);
    setTimerActive(false);
    setWaitingResult(false);
    setTimerKey(Math.random());
    return { shouldRepeat: false, delay: 0 };
  };

  /* ---------------- Execute trade (unchanged) ---------------- */
  const executeTrade = async () => {
    if (!coinPrice || timerActive) return;
    setTimerActive(true);
    setTradeResult(null);
    setTradeDetail(null);

    const token = localStorage.getItem("token");
    if (!token) {
      showToast(t("please_login", "Please log in to trade."), "warning");
      setTimerActive(false);
      return;
    }

    function parseJwt(token) {
      try {
        return JSON.parse(atob(token.split(".")[1]));
      } catch {
        return {};
      }
    }

    const payload = parseJwt(token);
    const user_id = payload.id;

    const endAt = Date.now() + duration * 1000;
    const temp = { trade_id: "temp", user_id, duration, endAt };

    setTradeState(temp);
    setTimerKey(Math.random());

    try {
      const res = await axios.post(
        `${MAIN_API_BASE}/trade`,
        {
          user_id,
          direction: direction.toUpperCase(),
          amount: Number(amount),
          duration: Number(duration),
          symbol: selectedCoin.symbol,
          client_price: Number(coinPrice) || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.data.trade_id) throw new Error("Failed to start trade");
      const { trade_id } = res.data;

      setTradeState((prev) => (prev ? { ...prev, trade_id } : createTradeState(trade_id, user_id, duration)));
      persistTradeState({ trade_id, user_id, duration, endAt });
    } catch (err) {
      setTimerActive(false);
      setTradeResult(null);
      setTradeDetail(null);
      persistTradeState(null);
      showToast(`${t("trade_failed", "Trade failed")}: ${err.response?.data?.error || err.message}`, "error");
    }
  };

  /* ------------------- UI / THEME ------------------- */
  const QuickBtn = ({ label, onClick, active }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition
        ${active ? "bg-slate-900 text-white shadow" : "bg-white/70 text-slate-700 ring-1 ring-slate-200 hover:bg-white"}
      `}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    className="w-full max-w-full px-3 pt-5 overflow-x-hidden"
  >
      {/* soft overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }} className="w-full">
        <div className="w-full max-w-[1300px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-7 lg:gap-8">
          {/* ---------------- Left: Chart & selectors ---------------- */}
          <div className="w-full">

{/* coin selector — no background card, just buttons */}
<div className="mb-3">
  {/* Desktop: centered row */}
  <div className="hidden md:flex items-center justify-center gap-3 min-h-[44px] leading-none">
    {COINS.map((coin) => {
      const active = selectedCoin.symbol === coin.symbol;
      return (
        <button
          key={coin.symbol}
          onClick={() => setSelectedCoin(coin)}
          disabled={timerActive}
          className={`px-5 py-2 rounded-full font-extrabold text-base transition-all
            ${active ? "bg-[#2474ff] text-white shadow-lg scale-[1.03]" : "bg-[#141a2b] text-[#8fb3ff] hover:text-white hover:bg-[#1a2240]"}
          `}
          style={{ border: active ? "2px solid #5aa0ff" : "1px solid #1e2747", minWidth: 120 }}
        >
          {coin.symbol}/USDT
        </button>
      );
    })}
    <span className="flex items-center gap-2 text-sky-200/80 text-sm leading-none">
      <Icon name="activity" className="w-4 h-4" />
      {t("live_price", "Live price feed")}
    </span>
  </div>

  {/* Mobile: horizontal snap row */}
  <div className="-mx-1 md:hidden">
    <div
      className="flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory no-scrollbar"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {COINS.map((coin) => {
        const active = selectedCoin.symbol === coin.symbol;
        return (
          <button
            key={coin.symbol}
            onClick={() => setSelectedCoin(coin)}
            disabled={timerActive}
            className={`shrink-0 snap-start px-4 py-2 rounded-full font-extrabold text-sm transition-all
              ${active ? "bg-[#2474ff] text-white shadow-lg scale-[1.03]" : "bg-[#141a2b] text-[#8fb3ff] hover:text-white hover:bg-[#1a2240]"}
            `}
            style={{ border: active ? "2px solid #5aa0ff" : "1px solid #1e2747", minWidth: 108 }}
          >
            {coin.symbol}/USDT
          </button>
        );
      })}
    </div>
    <div className="mt-1 flex justify-center items-center gap-2 text-sky-200/80 text-xs leading-none">
      <Icon name="activity" className="w-4 h-4" />
      {t("live_price", "Live price feed")}
    </div>
  </div>
</div>

            {/* chart box */}
            <div className="relative w-full rounded-2xl shadow-2xl bg-gradient-to-br from-[#141a2b] via-[#0f1424] to-[#0b1020] border border-[#1a2343] overflow-hidden">
              <div id="tradingview_chart_container" className="w-full h-[420px]" />
              {loadingChart && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#0c1323e6] backdrop-blur-sm">
                  <svg className="animate-spin mb-4" width="54" height="54" viewBox="0 0 54 54" fill="none">
                    <circle cx="27" cy="27" r="24" stroke="#2474ff44" strokeWidth="5" />
                    <path d="M51 27a24 24 0 1 1-48 0" stroke="#FFD700" strokeWidth="5" strokeLinecap="round" />
                  </svg>
                  <div className="text-lg font-bold text-sky-100">{t("refreshing_price", "Refreshing Price...")}</div>
                </div>
              )}

{/* floating price pill – compact version */}
<div className="absolute right-[88px] top-[46px] md:right-3 md:top-3 z-10">
  <div className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm ring-1 ring-white/10 text-white font-medium shadow-sm">
    <div className="text-[9px] uppercase tracking-wide text-white/60 leading-none">
      {selectedCoin.symbol}/USDT
    </div>
    <div className="text-sm tabular-nums font-bold leading-tight">
      {typeof coinPrice === "number" && !isNaN(coinPrice)
        ? "$" + coinPrice.toLocaleString(undefined, { maximumFractionDigits: 3 })
        : fetchError
        ? t("api_error", "API Error")
        : t("loading", "Loading...")}
    </div>
  </div>
</div>
            </div>

{/* quick hints (centered) */}
<div className="mt-5 flex justify-center gap-4 flex-wrap">
  <Card className="px-6 py-4 rounded-xl border border-slate-800/40 bg-[#0f1528]/60 text-sky-200 flex items-center justify-center text-base font-semibold shadow-md">
    <Icon name="clock" className="mr-2 text-sky-400" />
    {t("fast_settlement", "Fast settlement")}
  </Card>
  <Card className="px-6 py-4 rounded-xl border border-slate-800/40 bg-[#0f1528]/60 text-sky-200 flex items-center justify-center text-base font-semibold shadow-md">
    <Icon name="zap" className="mr-2 text-sky-400" />
    {t("realtime_feed", "Realtime feed")}
  </Card>
</div>
          </div>

          {/* ---------------- Right: Trade panel ---------------- */}
          <Card className="w-full px-5 py-6 rounded-2xl shadow-xl border border-[#e7ecff] bg-gradient-to-br from-[#f2f6ff] via-[#f8fbff] to-[#fafffb]">
            {/* header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-500">{t("pair", "Pair")}</span>
                <span
                  className="font-extrabold text-[1.6rem] tracking-wide"
                  style={{
                    background: "linear-gradient(92deg, #1e2fff 0%, #00eaff 60%, #ffd700 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {selectedCoin.symbol}/USDT
                </span>
              </div>
              <img src={BitMartLogo} alt="BitMart" className="h-9 w-auto ml-4" />
            </div>

            {/* direction */}
            <div className="mb-4">
              <div className="flex items-center gap-2 text-slate-600 font-semibold">
                {t("Trade")} <Tooltip title={t("trade_direction_tooltip", "Buy = price up. Sell = price down.")} />
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  className={`h-11 rounded-xl font-semibold shadow transition-all
                    ${direction === "BUY" ? "bg-emerald-500 text-white shadow-emerald-300/40" : "bg-white ring-1 ring-slate-200 text-emerald-600 hover:bg-emerald-50"}
                  `}
                  disabled={timerActive}
                  onClick={() => setDirection("BUY")}
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Icon name="arrow-up" /> {t("buy")}
                  </span>
                </button>
                <button
                  className={`h-11 rounded-xl font-semibold shadow transition-all
                    ${direction === "SELL" ? "bg-rose-500 text-white shadow-rose-300/40" : "bg-white ring-1 ring-slate-200 text-rose-600 hover:bg-rose-50"}
                  `}
                  disabled={timerActive}
                  onClick={() => setDirection("SELL")}
                >
                  <span className="inline-flex items-center gap-2 justify-center">
                    <Icon name="arrow-down" /> {t("sell")}
                  </span>
                </button>
              </div>
            </div>

            {/* price */}
            <div className="mb-4 flex items-center gap-2 text-slate-600 font-semibold">
              <Icon name="dollar-sign" className="w-5 h-5" />
              {t("Current Price")}:{" "}
              {typeof coinPrice === "number" && !isNaN(coinPrice) ? (
                <span className="text-slate-900 font-extrabold text-lg ml-1">
                  ${coinPrice.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                </span>
              ) : fetchError ? (
                <span className="text-rose-600 ml-1">{t("api_error", "API Error")}</span>
              ) : (
                <span className="text-slate-400 ml-1">{t("loading", "Loading...")}</span>
              )}
            </div>

            {/* amount */}
            <div className="mb-2">
              <Field
                label={t("amount") + " (USDT)"}
                type="number"
                min={1}
                value={amount}
                disabled={timerActive}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                icon="dollar-sign"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[25, 50, 100, 250, 500].map((v) => (
                  <QuickBtn key={v} label={`$${v}`} active={amount === v} onClick={() => setAmount(v)} />
                ))}
              </div>
            </div>

            {/* duration */}
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-600">{t("Duration")} ({t("seconds", "sec")})</label>
                <div className="text-lg font-bold text-slate-900">{duration}{t("seconds_short", "s")}</div>
              </div>
              <input
                type="range"
                min={5}
                max={120}
                step={1}
                value={duration}
                disabled={timerActive}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full accent-sky-600"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {[15, 30, 60, 120].map((d) => (
                  <QuickBtn key={d} label={`${d}${t("seconds_short", "s")}`} active={duration === d} onClick={() => setDuration(d)} />
                ))}
              </div>
            </div>

            {/* invest */}
            <button
              className={`w-full h-12 mt-2 rounded-xl font-extrabold text-lg shadow transition-all
                ${timerActive ? "bg-slate-300 text-slate-600 cursor-not-allowed" : "bg-slate-900 text-white hover:scale-[1.02]"}
              `}
              disabled={timerActive || !coinPrice}
              onClick={executeTrade}
            >
              {timerActive ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="22" height="22" viewBox="0 0 44 44" fill="none">
                    <circle cx="22" cy="22" r="20" stroke="#2474ff44" strokeWidth="4" />
                    <path d="M42 22a20 20 0 1 1-40 0" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  {t("investing")}
                </span>
              ) : (
                t("invest")
              )}
            </button>

{/* timer / waiting */}
<AnimatePresence>
  {timerActive && tradeState && !waitingResult && (
    <motion.div
      key="timer"
      initial={{ opacity: 0, scale: 0.97, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 24 }}
      transition={{ duration: 0.32, type: "spring" }}
      className="flex flex-col items-center mt-6 w-full"
    >
      <TimerBar key={timerKey} endAt={tradeState.endAt} onComplete={onTimerComplete} />
    </motion.div>
  )}
  {waitingResult && (
    <motion.div
      key="waiting"
      initial={{ opacity: 0, scale: 0.97, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, y: 24 }}
      transition={{ duration: 0.32, type: "spring" }}
      className="flex flex-col items-center mt-7 w-full"
    >
      <div className="flex flex-col items-center justify-center min-h-[130px]">
        <svg className="animate-spin mb-4" width="44" height="44" viewBox="0 0 44 44" fill="none">
          <circle cx="22" cy="22" r="20" stroke="#2474ff44" strokeWidth="4" />
          <path d="M42 22a20 20 0 1 1-40 0" stroke="#FFD700" strokeWidth="4" strokeLinecap="round" />
        </svg>
        <div className="text-lg font-bold text-slate-900">{t("processing_trade", "Processing your trade and updating your balance...")}</div>
        <div className="text-slate-500 mt-1 text-base font-medium text-center">
          {t("please_wait", "Please wait while your trade settles and funds update in your wallet.")}
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

{/* toast – always global */}
<AnimatePresence>
  {toast && (
    <motion.div
      key={toast.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.25 }}
      className="fixed bottom-[calc(env(safe-area-inset-bottom)+20px)] left-1/2 -translate-x-1/2 z-[9999]"
      role="status" aria-live="polite"
    >
      <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-2xl ring-1 ring-white/15 text-white backdrop-blur
        ${toast.type === "error" ? "bg-rose-600/90" : toast.type === "warning" ? "bg-amber-600/90" : "bg-slate-900/90"}`}>
        <Icon name={toast.type === "error" ? "close" : toast.type === "warning" ? "clock" : "activity"} className="w-5 h-5" />
        <span className="text-sm font-semibold">{toast.text}</span>
      </div>
    </motion.div>
  )}
</AnimatePresence>


            {/* result box */}
            <AnimatePresence>
              {tradeDetail && !timerActive && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 32, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 32, scale: 0.97 }}
                  transition={{ duration: 0.36, type: "spring" }}
                >
                  <Card
                    className={`mt-6 px-8 py-7 rounded-2xl shadow-xl border-2 transition-all duration-300
                      flex flex-col items-center justify-center
                      ${
                        tradeDetail.result === "WIN"
                          ? "bg-gradient-to-br from-[#eaffec] to-[#d2ffd9] border-green-400"
                          : "bg-gradient-to-br from-[#fff1f1] to-[#ffe4e4] border-red-400"
                      }`}
                    style={{ minWidth: "290px", maxWidth: "370px", marginLeft: "auto", marginRight: "auto" }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2 w-full">
                      {tradeDetail.result === "WIN" ? (
                        <span className="bg-green-500/90 text-white rounded-full px-6 py-2 text-lg font-extrabold shadow text-center">
                          {t("win", "WIN")}
                        </span>
                      ) : (
                        <span className="bg-red-500/90 text-white rounded-full px-6 py-2 text-lg font-extrabold shadow text-center">
                          {t("loss", "LOSS")}
                        </span>
                      )}
                      <Icon name={tradeDetail.result === "WIN" ? "check" : "close"} className={`w-7 h-7 ${tradeDetail.result === "WIN" ? "text-green-600" : "text-red-600"}`} />
                    </div>

                    <div className="mt-1 text-3xl font-extrabold text-neutral-800 text-center">
                      {tradeDetail.result === "WIN"
                        ? `+ $${Math.abs(tradeDetail.profit).toFixed(2)}`
                        : `- $${Math.abs(tradeDetail.profit).toFixed(2)}`}
                    </div>

                    <div className="mt-2 w-full flex flex-col items-center justify-center">
                      <div className="text-base font-medium text-neutral-600 text-center">
                        {t("entry", "Entry")}:{" "}
                        <span className="font-bold text-neutral-900">
                          {!isNaN(Number(tradeDetail.start_price))
                            ? `$${Number(tradeDetail.start_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                            : "—"}
                        </span>
                      </div>
                      <div className="text-base font-medium text-neutral-600 text-center">
                        {t("result", "Result")}:{" "}
                        <span className="font-bold text-neutral-900">
                          {!isNaN(Number(tradeDetail.result_price))
                            ? `$${Number(tradeDetail.result_price).toLocaleString(undefined, { maximumFractionDigits: 6 })}`
                            : "—"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-neutral-400 font-semibold tracking-wide text-center">
                        {t("duration")}: {tradeDetail.duration}
                        {t("seconds_short", "s")}
                      </div>
                      <div className="mt-1 text-xs text-neutral-400 text-center">
                        {tradeDetail.result === "WIN"
                          ? t("profit_credited", "Profit credited to your wallet")
                          : t("loss_deducted", "Loss deducted from your wallet")}
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>

          {/* Orders strip beneath on small screens */}
          <div className="lg:col-span-2 mt-2">
            <div className="w-full flex justify-center">
              <div className="max-w-5xl w-full px-1 md:px-2">
                <OrderBTC />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}