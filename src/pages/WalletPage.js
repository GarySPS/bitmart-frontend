import { MAIN_API_BASE, ADMIN_API_BASE } from '../config';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Card from "../components/card";
import Field from "../components/field";
import Modal from "../components/modal";
import Icon from "../components/icon";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://epwhsyfcppenaxhrhfpy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVwd2hzeWZjcHBlbmF4aHJoZnB5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzQxNjUyOSwiZXhwIjoyMDcyOTkyNTI5fQ.6qzBXe3IcdYF8FKSa83byRyydFImR0zmcm2JZnJA1hw";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/* ---------------- helpers (UI only) ---------------- */
const coinSymbols = ["USDT", "BTC", "ETH", "SOL", "XRP", "TON"];
const depositNetworks = { USDT: "TRC20", BTC: "BTC", ETH: "ERC20", SOL: "SOL", XRP: "XRP", TON: "TON" };
const fmtUSD = (n) => "$" + Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* ---------------- uploads ---------------- */
async function uploadDepositScreenshot(file, userId) {
  if (!file) return null;
  const filePath = `${userId}-${Date.now()}-${file.name}`;
  const { error } = await supabase.storage.from('deposit').upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;
  return filePath;
}
async function getSignedUrl(path, bucket) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const filename = path.split('/').pop();
  const res = await axios.get(`${MAIN_API_BASE}/upload/${bucket}/signed-url/${filename}`);
  return res.data.url;
}

export default function WalletPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [userId, setUserId] = useState(null);
  const [prices, setPrices] = useState({});
  // preload last known prices so page never starts at $0
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nc_prices");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setPrices(parsed);
      }
    } catch {}
  }, []);

  const [balances, setBalances] = useState([]);
  const [depositHistory, setDepositHistory] = useState([]);
  const [withdrawHistory, setWithdrawHistory] = useState([]);
  const [modal, setModal] = useState({ open: false, type: "", coin: "" });
  const [toast, setToast] = useState("");
  const [selectedDepositCoin, setSelectedDepositCoin] = useState("USDT");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositScreenshot, setDepositScreenshot] = useState(null);
  const fileInputRef = useRef();
  const [selectedWithdrawCoin, setSelectedWithdrawCoin] = useState("USDT");
  const [withdrawForm, setWithdrawForm] = useState({ address: "", amount: "" });
  const [withdrawMsg, setWithdrawMsg] = useState("");
  const [fromCoin, setFromCoin] = useState("USDT");
  const [toCoin, setToCoin] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [walletAddresses, setWalletAddresses] = useState({});
  const [walletQRCodes, setWalletQRCodes] = useState({});
  const [fileLocked, setFileLocked] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [historyScreenshots, setHistoryScreenshots] = useState({});
  const [totalUsd, setTotalUsd] = useState(0);
  // lock + inline toasts
const [depositBusy, setDepositBusy] = useState(false);
const [withdrawBusy, setWithdrawBusy] = useState(false);
const [depositToast, setDepositToast] = useState("");
const [withdrawToast, setWithdrawToast] = useState("");


  /* ---------------- history merge (unchanged logic) ---------------- */
  const userDepositHistory = depositHistory.filter(d => userId && Number(d.user_id) === Number(userId));
  const userWithdrawHistory = withdrawHistory.filter(w => userId && Number(w.user_id) === Number(userId));
  const allHistory = [
    ...userDepositHistory.map(d => ({ ...d, type: "Deposit" })),
    ...userWithdrawHistory.map(w => ({ ...w, type: "Withdraw" })),
  ].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date));

  useEffect(() => {
    if (!balances.length) { setTotalUsd(0); return; }
    if (!Object.keys(prices).length) { return; }
    let sum = 0;
    balances.forEach(({ symbol, balance }) => {
      const coinPrice = prices[symbol] || (symbol === "USDT" ? 1 : 0);
      sum += Number(balance) * coinPrice;
    });
    setTotalUsd(sum);
  }, [balances, prices]);

  useEffect(() => {
    async function fetchHistoryScreenshots() {
      let shots = {};
      for (let row of allHistory) {
        if (row.screenshot) {
          if (!row.screenshot.includes("/")) {
            shots[row.id] = `https://zgnefojwdijycgcqngke.supabase.co/storage/v1/object/public/deposit/${encodeURIComponent(row.screenshot)}`;
          } else if (row.screenshot.startsWith("/uploads/")) {
            shots[row.id] = `${MAIN_API_BASE}${row.screenshot}`;
          } else if (row.screenshot.startsWith("http")) {
            shots[row.id] = row.screenshot;
          }
        }
      }
      setHistoryScreenshots(shots);
    }
    fetchHistoryScreenshots();
  }, [JSON.stringify(allHistory)]);

  /* ---------------- auth / redirects (unchanged) ---------------- */
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch {
        setUserId(null);
      }
    } else {
      setUserId(null);
    }
    setAuthChecked(true);
  }, [token]);

  useEffect(() => {
    if (!authChecked) return;
    if (!token || token === "undefined" || !userId || userId === "undefined") {
      setIsGuest(true);
    }
  }, [authChecked, token, userId]);

  useEffect(() => {
    if (!authChecked) return;
    if (isGuest) {
      navigate("/login", { replace: true });
    }
  }, [authChecked, isGuest, navigate]);

  /* ---------------- live prices (unchanged) ---------------- */
  useEffect(() => {
    let stopped = false;
    const load = async () => {
      try {
        const res = await axios.get(`${MAIN_API_BASE}/prices`);
        if (stopped) return;
        let map = res.data?.prices;
        if (!map || !Object.keys(map).length) {
          map = {};
          (res.data?.data || []).forEach(c => {
            if (c?.symbol) map[c.symbol] = c?.quote?.USD?.price;
          });
        }
        if (map && Object.keys(map).length) {
          setPrices(prev => {
            const next = { ...prev, ...map };
            try { localStorage.setItem("nc_prices", JSON.stringify(next)); } catch {}
            return next;
          });
        }
      } catch {}
    };
    load();
    const id = setInterval(load, 10_000);
    return () => { stopped = true; clearInterval(id); };
  }, [MAIN_API_BASE]);

  useEffect(() => {
    let canceled = false;
    const refreshPair = async () => {
      try {
        const [a, b] = await Promise.all([
          axios.get(`${MAIN_API_BASE}/prices/${fromCoin}`),
          axios.get(`${MAIN_API_BASE}/prices/${toCoin}`)
        ]);
        if (canceled) return;
        const pa = Number(a.data?.price);
        const pb = Number(b.data?.price);
        setPrices(prev => {
          const next = { ...prev };
          if (Number.isFinite(pa) && pa > 0) next[fromCoin] = pa;
          if (Number.isFinite(pb) && pb > 0) next[toCoin] = pb;
          try { localStorage.setItem("nc_prices", JSON.stringify(next)); } catch {}
          return next;
        });
      } catch {}
    };
    refreshPair();
    const id = setInterval(refreshPair, 10_000);
    return () => { canceled = true; clearInterval(id); };
  }, [fromCoin, toCoin, MAIN_API_BASE]);

  /* ---------------- wallet & histories (unchanged) ---------------- */
  useEffect(() => {
    axios.get(`${MAIN_API_BASE}/deposit-addresses`)
      .then(res => {
        console.log("RECEIVED DEPOSIT ADDRESSES:", res.data);
        const addresses = {};
        const qrcodes = {};
        res.data.forEach(row => {
          addresses[row.coin] = row.address;
          if (row.qr_url && row.qr_url.startsWith("/uploads")) {
            qrcodes[row.coin] = `${ADMIN_API_BASE}${row.qr_url}`;
          } else if (row.qr_url) {
            qrcodes[row.coin] = row.qr_url;
          } else {
            qrcodes[row.coin] = null;
          }
        });
        setWalletAddresses(addresses);
        setWalletQRCodes(qrcodes);
      })
      .catch(() => {
        setWalletAddresses({});
        setWalletQRCodes({});
      });
  }, []);

  useEffect(() => {
    if (!token || !userId) return;
    fetchBalances();
    axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDepositHistory(res.data)).catch(() => setDepositHistory([]));
    axios.get(`${MAIN_API_BASE}/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWithdrawHistory(res.data)).catch(() => setWithdrawHistory([]));
  }, [token, userId]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const coin = params.get("coin");
    if (action === "deposit" && coin) { setSelectedDepositCoin(coin); openModal("deposit", coin); }
    if (action === "withdraw" && coin) openModal("withdraw", coin);
    if (action === "convert") {
      const el = document.getElementById("convert-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(""), 1200); return () => clearTimeout(t); }
  }, [toast]);

  useEffect(() => {
    if (!amount || isNaN(amount)) { setResult(""); return; }
    if (fromCoin === toCoin) { setResult(""); return; }
    if (!prices[fromCoin] || !prices[toCoin]) { setResult(""); return; }
    const usdValue = parseFloat(amount) * prices[fromCoin];
    const receive = usdValue / prices[toCoin];
    setResult(receive.toFixed(toCoin === "BTC" ? 6 : toCoin === "ETH" ? 4 : 3));
  }, [fromCoin, toCoin, amount, prices]);

  function fetchBalances() {
    if (!token || !userId) return;
    axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBalances(res.data.assets || []))
      .catch(() => setBalances([]));
  }

  const openModal = (type, coin) => setModal({ open: true, type, coin });
  const closeModal = () => setModal({ open: false, type: "", coin: "" });

const handleDepositSubmit = async (e) => {
  e.preventDefault();
  if (depositBusy) return;
  setDepositBusy(true);

  const depositAddress = walletAddresses[selectedDepositCoin];
  if (!depositAddress) {
    setDepositToast("Deposit address not found. Contact support.");
    setTimeout(() => setDepositToast(""), 2500);
    setDepositBusy(false);
    return;
  }

  try {
    let screenshotUrl = null;
    if (depositScreenshot) {
      screenshotUrl = await uploadDepositScreenshot(depositScreenshot, userId);
    }
    await axios.post(`${MAIN_API_BASE}/deposit`, {
      coin: selectedDepositCoin,
      amount: depositAmount,
      address: depositAddress,
      screenshot: screenshotUrl,
    }, { headers: { Authorization: `Bearer ${token}` } });

    setDepositToast(t("Deposit Submitted") || "Deposit Submitted");
    setDepositAmount("");
    setDepositScreenshot(null);
    setFileLocked(false);

    // refresh list
    axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDepositHistory(res.data));

    // close after short delay
    setTimeout(() => { setDepositToast(""); closeModal(); }, 1400);
  } catch (err) {
    const errorMsg = err.response?.data?.error || t("deposit_failed");
    setDepositToast(errorMsg);
    console.error("Deposit submission error:", err);
    setTimeout(() => setDepositToast(""), 2500);
  } finally {
    setDepositBusy(false);
  }
};
const handleWithdraw = async (e) => {
  e.preventDefault();
  if (withdrawBusy) return;
  setWithdrawBusy(true);
  try {
    const res = await axios.post(`${MAIN_API_BASE}/withdraw`, {
      user_id: userId,
      coin: selectedWithdrawCoin,
      amount: withdrawForm.amount,
      address: withdrawForm.address,
    }, { headers: { Authorization: `Bearer ${token}` } });

    if (res.data && res.data.success) {
      setWithdrawToast(t("Withdraw Submitted") || "Withdraw Submitted");
      axios.get(`${MAIN_API_BASE}/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => setWithdrawHistory(r.data));
      fetchBalances();
    } else {
      setWithdrawToast(t("withdraw_failed"));
    }
  } catch (err) {
    setWithdrawToast(err.response?.data?.error || t("withdraw_failed"));
    console.error(err);
  } finally {
    setTimeout(() => { setWithdrawForm({ address: "", amount: "" }); setWithdrawToast(""); closeModal(); }, 1400);
    setWithdrawBusy(false);
  }
};

  const swap = () => { setFromCoin(toCoin); setToCoin(fromCoin); setAmount(""); setResult(""); };

  const handleConvert = async e => {
    e.preventDefault();
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0 || fromCoin === toCoin) return;
    try {
      const res = await axios.post(`${MAIN_API_BASE}/convert`, {
        from_coin: fromCoin, to_coin: toCoin, amount: parseFloat(amount)
      }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data && res.data.success) {
        setSuccessMsg(t("Convert Successful", {
          amount: amount, fromCoin,
          received: Number(res.data.received).toLocaleString(undefined, { maximumFractionDigits: 6 }),
          toCoin,
        }));
        fetchBalances();
      } else {
        setSuccessMsg(t("Convert Failed"));
      }
    } catch (err) {
      setSuccessMsg(err.response?.data?.error || t("convert_failed"));
    }
    setTimeout(() => setSuccessMsg(""), 1800);
    setAmount(""); setResult("");
  };

  // --- MAIN RENDER ---
  if (!authChecked) return null;
  if (isGuest) return null;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-6 pb-14"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      {/* overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }} className="w-full max-w-7xl">
        {/* ===== Top row: balance + assets ===== */}
<div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,380px),1fr] gap-6 md:gap-8 items-stretch">

<Card className="rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden h-full">
  <div className="w-full h-full min-h-[180px] md:min-h-[220px] flex items-center justify-center
                   px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="text-center text-slate-500 text-xs sm:text-sm font-semibold">
        {t("total_balance")}
      </div>

      {/* key: clamp + break-all + leading + full width */}
      <div
        className="
          w-full max-w-full px-1 text-center font-extrabold text-slate-900 tabular-nums
          leading-[1.1] tracking-tight break-all
          text-[clamp(1.5rem,5.2vw,2.75rem)]
        "
      >
        {fmtUSD(totalUsd)}
      </div>

      {/* --- Add this section for the buttons --- */}
      <div className="mt-4 flex gap-4 w-full justify-center">
        <button
          className="h-10 px-6 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:scale-[1.02] transition"
          onClick={() => openModal("deposit", "USDT")}
        >
          <span className="inline-flex items-center gap-1"><Icon name="download" />{t("deposit")}</span>
        </button>
        <button
          className="h-10 px-6 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
          onClick={() => openModal("withdraw", "USDT")}
        >
          <span className="inline-flex items-center gap-1"><Icon name="upload" />{t("withdraw")}</span>
        </button>
      </div>
      {/* -------------------------------------- */}
    </div>
  </div>
</Card>

          {/* Assets polished list */}
          <Card className="rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden">
            <div className="px-5 py-5">
              <div className="text-slate-700 font-semibold">{t("my_assets")}</div>
            </div>
            <div className="flex flex-col gap-2 p-3">
              {balances.map(({ symbol, icon, balance }) => (
                <div
                  key={symbol}
                  className="w-full bg-white rounded-2xl ring-1 ring-slate-100 hover:bg-slate-50/60 transition-colors p-4 md:p-5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon name={symbol?.toLowerCase() || "coin"} className="w-8 h-8 md:w-10 md:h-10" />
                      <div>
                        <div className="text-lg md:text-xl font-extrabold text-slate-900">{symbol}</div>
                        <div className="text-sm text-slate-500 font-medium leading-tight">{t("balance")}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base md:text-lg font-bold text-slate-800 tabular-nums">
                        {Number(balance).toLocaleString(undefined, {
                          minimumFractionDigits: symbol === "BTC" ? 6 : 2,
                          maximumFractionDigits: symbol === "BTC" ? 8 : 6,
                        })}
                      </div>
                      <div className="text-xs text-slate-600 font-medium leading-tight">
                        {(() => {
                          const p = prices[symbol] ?? (symbol === "USDT" ? 1 : undefined);
                          return p !== undefined ? fmtUSD(Number(balance) * p) : "--";
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ===== Polished Convert section ===== */}
        <Card id="convert-section" className="mt-8 rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden">
          <div className="relative z-10 p-5 md:p-6 bg-gradient-to-br from-fuchsia-50 via-sky-50 to-emerald-50">
            <div className="flex items-center gap-2 text-slate-800 text-xl md:text-2xl font-extrabold">
              <Icon name="swap" className="w-7 h-7" /> {t("convert_crypto")}
            </div>
          </div>
          <div className="px-5 py-5 md:px-6 md:py-6 relative z-10">
            <form onSubmit={handleConvert} className="space-y-4">
              <div className="flex flex-col gap-4 relative">
                <div className="relative">
                  <div className="text-sm text-slate-600 font-medium mb-1">{t("from")}</div>
                  <select
                    value={fromCoin}
                    onChange={e => {
                      setFromCoin(e.target.value);
                      if (e.target.value === "USDT") setToCoin("BTC"); else setToCoin("USDT");
                    }}
                    className="w-full px-4 py-3 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-200 outline-none transition-colors"
                  >
                    {coinSymbols.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>

                <div className="flex items-center justify-center -my-2">
                  <button
                    type="button"
                    onClick={swap}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-900 transition-all duration-200 ease-in-out transform hover:scale-105"
                    aria-label="Swap currencies"
                  >
                    <Icon name="swap" className="w-6 h-6" />
                  </button>
                </div>

                <div className="relative">
                  <div className="text-sm text-slate-600 font-medium mb-1">{t("to")}</div>
                  <select
                    value={toCoin}
                    onChange={e => setToCoin(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-200 outline-none transition-colors"
                  >
                    {fromCoin === "USDT"
                      ? coinSymbols.filter(c => c !== "USDT").map(c => <option key={c} value={c}>{c}</option>)
                      : <option value="USDT">USDT</option>}
                  </select>
                </div>
              </div>

              <Field
                label={t("amount_with_coin", { coin: fromCoin })}
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={t("enter_amount_with_coin", { coin: fromCoin })}
                icon="dollar-sign"
              />

              <div className="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-4 py-3 text-slate-700 font-medium">
                {t("you_will_receive")}:&nbsp;
                <span className="font-extrabold text-slate-900">
                  {result ? `${result} ${toCoin}` : "--"}
                </span>
              </div>

              <button
                type="submit"
                className="w-full h-12 rounded-xl bg-slate-900 text-white text-lg font-extrabold hover:scale-[1.02] transition"
                disabled={!amount || isNaN(amount) || fromCoin === toCoin || parseFloat(amount) <= 0}
              >
                {t("convert")}
              </button>

              {successMsg && (
                <div className="mt-2 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-lg px-4 py-3 text-center text-base font-semibold">
                  {successMsg}
                </div>
              )}
            </form>
          </div>
        </Card>

        {/* ===== History ===== */}
        <Card className="mt-8 rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden">
          <div className="px-5 py-4 md:px-6 md:py-5 bg-white/80">
            <div className="flex items-center gap-2 text-slate-800 text-xl font-extrabold">
              <Icon name="clock" className="w-6 h-6" /> {t("deposit_withdraw_history")}
            </div>
          </div>
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-left text-slate-600 border-y border-slate-100">
                  <th className="py-3.5 px-4">{t("type")}</th>
                  <th className="py-3.5 px-4 text-right">{t("amount")}</th>
                  <th className="py-3.5 px-4">{t("coin")}</th>
                  <th className="py-3.5 px-4">{t("date")}</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {(Array.isArray(allHistory) ? allHistory : []).map((row, idx) => (
                  <tr
                    key={row.type === "Deposit" ? `deposit-${row.id || idx}` : row.type === "Withdraw" ? `withdraw-${row.id || idx}` : idx}
                    className="group border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                    style={{ height: 60 }}
                  >
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ring-1 ${
                        row.type === "Deposit"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}>
                        <Icon name={row.type === "Deposit" ? "download" : "upload"} className="w-4 h-4" />
                        {t(row.type.toLowerCase())}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium">
                      {row.amount}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <span className="inline-flex items-center gap-2">
                        <Icon name={row.coin?.toLowerCase() || "coin"} className="w-5 h-5" />
                        {row.coin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : (row.date || "--")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* ===== Modals ===== */}
      <Modal visible={modal.open && modal.type === "deposit"} onClose={closeModal}>
        <form onSubmit={handleDepositSubmit} className="space-y-5 p-2">
          <div className="text-2xl font-bold mb-3 flex items-center gap-2 text-slate-900">
            <Icon name="download" className="w-7 h-7" /> {t("deposit")}
          </div>

          <select
            className="w-full px-4 py-3 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-200 outline-none"
            value={selectedDepositCoin}
            onChange={e => setSelectedDepositCoin(e.target.value)}
          >
            {coinSymbols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-[160px] aspect-square mb-3 rounded-xl bg-white ring-1 ring-slate-200 flex items-center justify-center overflow-hidden">
              {walletQRCodes[selectedDepositCoin] ? (
                <img
                  src={walletQRCodes[selectedDepositCoin].startsWith("/uploads")
                    ? `${ADMIN_API_BASE}${walletQRCodes[selectedDepositCoin]}`
                    : walletQRCodes[selectedDepositCoin]}
                  alt={t("deposit_qr")}
                  className="max-w-full max-h-full object-contain p-2"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              ) : null}
              {!walletQRCodes[selectedDepositCoin] && (
                <QRCodeCanvas value={walletAddresses[selectedDepositCoin] || ""} size={140} bgColor="#ffffff" fgColor="#000000" />
              )}
            </div>
          </div>

          <div className="text-slate-600 font-medium">{t("network")}: <span className="font-semibold text-slate-900">{depositNetworks[selectedDepositCoin]}</span></div>

          <div className="flex items-center gap-2 justify-center">
            <span className="font-mono bg-slate-50 ring-1 ring-slate-200 px-2 py-1 rounded text-sm max-w-[260px] overflow-x-auto">
              {walletAddresses[selectedDepositCoin]}
            </span>
            <button
              type="button"
              className="h-9 px-3 rounded-lg bg-slate-900 text-white text-sm font-semibold"
              onClick={() => { navigator.clipboard.writeText(walletAddresses[selectedDepositCoin]); setDepositToast(t("copied")); }}
            >
              <span className="inline-flex items-center gap-1"><Icon name="copy" />{t("copy")}</span>
            </button>
          </div>

          <Field
            label={t("deposit_amount_with_coin", { coin: selectedDepositCoin })}
            type="number"
            min={0}
            step="any"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            required
            icon="dollar-sign"
          />

          <div>
            <label className="block text-slate-600 font-medium mb-1">{t("upload_screenshot")}</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={e => { setDepositScreenshot(e.target.files[0]); setFileLocked(true); }}
                required
                className="absolute inset-0 opacity-0 z-50 cursor-pointer"
                disabled={fileLocked}
              />
              <div className={`truncate w-full text-sm text-white font-semibold text-center px-4 py-2 rounded-xl ${fileLocked ? "bg-slate-400 cursor-not-allowed" : "bg-slate-900 hover:opacity-95 cursor-pointer"}`}>
                {fileLocked ? t("screenshot_uploaded") : t("choose_file")}
              </div>
            </div>
          </div>

          <div className="text-sm text-slate-600 bg-slate-50 ring-1 ring-slate-200 rounded px-3 py-2">
            {t("for_your_safety_submit_screenshot")}
            <span className="block text-amber-600">{t("proof_ensures_support")}</span>
          </div>

<div className="relative">
  <button
    type="submit"
    disabled={depositBusy || !depositAmount || !depositScreenshot}
    className={`w-full h-12 rounded-xl text-white text-lg font-extrabold transition
      ${depositBusy ? "bg-slate-500 cursor-not-allowed" : "bg-slate-900 hover:scale-[1.02]"}`}
  >
    {depositBusy ? (t("submitting") || "Submitting...") : t("submit")}
  </button>

  {depositToast && (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[70]">
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl
                      bg-slate-900/95 backdrop-blur text-white font-semibold ring-1 ring-white/15">
        <Icon name="check" className="w-5 h-5" />
        <span>{depositToast}</span>
      </div>
    </div>
  )}
</div>
        </form>
      </Modal>

      <Modal visible={modal.open && modal.type === "withdraw"} onClose={closeModal}>
        <form onSubmit={handleWithdraw} className="space-y-5 p-2">
          <div className="text-2xl font-bold mb-3 flex items-center gap-2 text-slate-900">
            <Icon name="upload" className="w-7 h-7" /> {t("withdraw")}
          </div>
          <select
            className="w-full px-4 py-3 rounded-xl bg-white ring-1 ring-slate-200 focus:ring-2 focus:ring-sky-200 outline-none"
            value={selectedWithdrawCoin}
            onChange={e => setSelectedWithdrawCoin(e.target.value)}
          >
            {coinSymbols.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <div className="text-slate-600 font-medium">{t("network")}: <span className="font-semibold text-slate-900">{depositNetworks[selectedWithdrawCoin]}</span></div>

          <Field
            label={t("withdraw_to_address")}
            type="text"
            required
            placeholder={t("paste_recipient_address", { coin: selectedWithdrawCoin })}
            value={withdrawForm.address}
            onChange={e => setWithdrawForm(f => ({ ...f, address: e.target.value }))}
            icon="send"
          />
          <Field
            label={t("amount_with_coin", { coin: selectedWithdrawCoin })}
            type="number"
            min={0.0001}
            step="any"
            required
            placeholder={t("enter_amount_with_coin", { coin: selectedWithdrawCoin })}
            value={withdrawForm.amount}
            onChange={e => setWithdrawForm(f => ({ ...f, amount: e.target.value }))}
            icon="dollar-sign"
          />

          <div className="text-sm text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded px-3 py-2">{t("double_check_withdraw")}</div>

<div className="relative">
  <button
    type="submit"
    disabled={withdrawBusy || !withdrawForm.address || !withdrawForm.amount}
    className={`w-full h-12 rounded-xl text-white text-lg font-extrabold transition
      ${withdrawBusy ? "bg-slate-500 cursor-not-allowed" : "bg-slate-900 hover:scale-[1.02]"}`}
  >
    {withdrawBusy ? (t("submitting") || "Submitting...") : t("submit_withdraw")}
  </button>

  {withdrawToast && (
    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-[70]">
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl shadow-2xl
                      bg-slate-900/95 backdrop-blur text-white font-semibold ring-1 ring-white/15">
        <Icon name="check" className="w-5 h-5" />
        <span>{withdrawToast}</span>
      </div>
    </div>
  )}
</div>

          {withdrawMsg && (
            <div className="mt-2 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 rounded-lg px-4 py-2 text-center text-base font-semibold">
              {withdrawMsg}
            </div>
          )}
        </form>
      </Modal>

  </div>
  );
}