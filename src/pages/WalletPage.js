//src>pages>WalletPage.js
import { MAIN_API_BASE, ADMIN_API_BASE } from '../config';
import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
const coinData = [
  { symbol: "USDT", name: "Tether" },
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "XRP", name: "Ripple" },
  { symbol: "TON", name: "Toncoin" },
];
const coinSymbols = coinData.map(c => c.symbol); // Keep this line for other parts of the code that use the simple array
const depositNetworks = { USDT: "TRC20", BTC: "BTC", ETH: "ETH", SOL: "SOL", XRP: "XRP", TON: "TON" };
const usdtNetworks = ["TRC20", "USDC-ETH", "ERC20"];
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

export default function WalletPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");

  const [userId, setUserId] = useState(null);
  const [prices, setPrices] = useState({});
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
  const [depositInfo, setDepositInfo] = useState({});
  const [fileLocked, setFileLocked] = useState(false);
  const [selectedUsdtNetwork, setSelectedUsdtNetwork] = useState("TRC20");
  const [selectedWithdrawNetwork, setSelectedWithdrawNetwork] = useState("TRC20");
  const [authChecked, setAuthChecked] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [totalUsd, setTotalUsd] = useState(0);
  const [depositBusy, setDepositBusy] = useState(false);
  const [withdrawBusy, setWithdrawBusy] = useState(false);
  const [depositToast, setDepositToast] = useState("");
  const [withdrawToast, setWithdrawToast] = useState("");
  const [showConvertModal, setShowConvertModal] = useState(false); 
  const [showCoinSelectionModal, setShowCoinSelectionModal] = useState(false);
  const [showWithdrawCoinSelectionModal, setShowWithdrawCoinSelectionModal] = useState(false);

  const fetchBalances = useCallback(() => {
    if (!token || !userId) return;
    axios.get(`${MAIN_API_BASE}/balance`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setBalances(res.data.assets || []))
      .catch(() => setBalances([]));
  }, [token, userId]);

  const activeDepositInfo = useMemo(() => {
    if (!depositInfo[selectedDepositCoin]) return { address: t("wallet_address_loading"), qr: null };
    
    if (selectedDepositCoin === 'USDT') {
      return depositInfo.USDT?.[selectedUsdtNetwork] || { address: t("wallet_address_unavailable"), qr: null };
    }
    
    const network = depositNetworks[selectedDepositCoin];
    return depositInfo[selectedDepositCoin]?.[network] || { address: t("wallet_address_unavailable"), qr: null };
  }, [selectedDepositCoin, selectedUsdtNetwork, depositInfo, t]);

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

  const userDepositHistory = depositHistory.filter(d => userId && Number(d.user_id) === Number(userId));
  const userWithdrawHistory = withdrawHistory.filter(w => userId && Number(w.user_id) === Number(userId));
  const allHistory = useMemo(() => [
    ...userDepositHistory.map(d => ({ ...d, type: "Deposit" })),
    ...userWithdrawHistory.map(w => ({ ...w, type: "Withdraw" })),
  ].sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date)), [userDepositHistory, userWithdrawHistory]);

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
    if (!token || token === "undefined" || !userId || typeof userId === "undefined") {
      setIsGuest(true);
    }
  }, [authChecked, token, userId]);

  useEffect(() => {
    if (!authChecked) return;
    if (isGuest) {
      navigate("/login", { replace: true });
    }
  }, [authChecked, isGuest, navigate]);

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
  }, []);

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
  }, [fromCoin, toCoin]);

  useEffect(() => {
    axios.get(`${MAIN_API_BASE}/deposit-addresses`)
      .then(res => {
        const info = {};
        res.data.forEach(row => {
          if (!info[row.coin]) {
            info[row.coin] = {};
          }
          const network = row.network || row.coin;
          
          let qrUrl = null;
          if (row.qr_url && row.qr_url.startsWith("/uploads")) {
            qrUrl = `${ADMIN_API_BASE}${row.qr_url}`;
          } else if (row.qr_url) {
            qrUrl = row.qr_url;
          }

          info[row.coin][network] = {
            address: row.address,
            qr: qrUrl,
          };
        });
        setDepositInfo(info);
      })
      .catch(() => {
        setDepositInfo({});
      });
  }, []);

  useEffect(() => {
    if (!token || !userId) return;
    fetchBalances();
    axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setDepositHistory(res.data)).catch(() => setDepositHistory([]));
    axios.get(`${MAIN_API_BASE}/withdrawals`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setWithdrawHistory(res.data)).catch(() => setWithdrawHistory([]));
  }, [token, userId, fetchBalances]);

  const openModal = useCallback((type, coin) => setModal({ open: true, type, coin }), []);
  const closeModal = () => setModal({ open: false, type: "", coin: "" });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const action = params.get("action");
    const coin = params.get("coin"); // Keep for direct links if needed

    // Handle navigation from ProfilePage
    if (action === "deposit" && !coin) {
      setShowCoinSelectionModal(true);
    }
    if (action === "withdraw" && !coin) {
      setShowWithdrawCoinSelectionModal(true);
    }

    // Handle direct links that might include a coin
    if (action === "deposit" && coin) {
      setSelectedDepositCoin(coin);
      openModal("deposit", coin);
    }
    if (action === "withdraw" && coin) {
      setSelectedWithdrawCoin(coin);
      openModal("withdraw", coin);
    }
    
    if (action === "convert") {
      setShowConvertModal(true);
    }
  }, [location, openModal]);

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

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (depositBusy) return;
    setDepositBusy(true);

    const depositAddress = activeDepositInfo.address;
    if (!depositAddress || depositAddress.includes("unavailable") || depositAddress.includes("loading")) {
      setDepositToast("Deposit address not found. Contact support.");
      setTimeout(() => setDepositToast(""), 2500);
      setDepositBusy(false);
      return;
    }

    const network = selectedDepositCoin === 'USDT' 
      ? selectedUsdtNetwork 
      : depositNetworks[selectedDepositCoin];

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
        network: network,
      }, { headers: { Authorization: `Bearer ${token}` } });

      setDepositToast(t("Deposit Submitted") || "Deposit Submitted");
      setDepositAmount("");
      setDepositScreenshot(null);
      setFileLocked(false);
      
      axios.get(`${MAIN_API_BASE}/deposits`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setDepositHistory(res.data));

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

    // Determine the selected network
    const network = selectedWithdrawCoin === 'USDT' 
      ? selectedWithdrawNetwork 
      : depositNetworks[selectedWithdrawCoin];

    try {
      const res = await axios.post(`${MAIN_API_BASE}/withdraw`, {
        user_id: userId,
        coin: selectedWithdrawCoin,
        amount: withdrawForm.amount,
        address: withdrawForm.address,
        network: network, // Send the network to the backend
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
      // Reset the form and the new network state
      setTimeout(() => { 
        setWithdrawForm({ address: "", amount: "" }); 
        setSelectedWithdrawNetwork("TRC20"); // Reset network
        setWithdrawToast(""); 
        closeModal(); 
      }, 1400);
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

  if (!authChecked || isGuest) return null;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-6 pb-14"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          zIndex: 0,
          background: "linear-gradient(120deg, #0b1020f0 0%, #0d1220d8 60%, #0a101dd1 100%)",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }} className="w-full max-w-7xl">
        <div className="w-full grid grid-cols-1 lg:grid-cols-[minmax(320px,380px),1fr] gap-6 md:gap-8 items-stretch">
          <Card className="rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden h-full">
            <div className="w-full h-full min-h-[180px] md:min-h-[220px] flex items-center justify-center
                        px-4 sm:px-6 bg-gradient-to-br from-indigo-50 via-sky-50 to-emerald-50">
              <div className="flex flex-col items-center gap-1 w-full">
                <div className="text-center text-slate-500 text-xs sm:text-sm font-semibold">
                  {t("total_balance")}
                </div>
                <div
                  className="w-full max-w-full px-1 text-center font-extrabold text-slate-900 tabular-nums leading-[1.1] tracking-tight break-all text-[clamp(1.5rem,5.2vw,2.75rem)]"
                >
                  {fmtUSD(totalUsd)}
                </div>

{/* --- Action Buttons --- */}
<div className="mt-5 grid grid-cols-3 gap-3 w-full max-w-xs mx-auto">
  <button
    className="h-11 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-50 transition flex flex-col items-center justify-center"
    onClick={() => setShowCoinSelectionModal(true)}
  >
    <Icon name="download" className="w-5 h-5 mb-0.5" />
    <span>{t("deposit")}</span>
  </button>
  <button
    className="h-11 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition flex flex-col items-center justify-center"
    onClick={() => setShowWithdrawCoinSelectionModal(true)}
  >
    <Icon name="upload" className="w-5 h-5 mb-0.5" />
    <span>{t("withdraw")}</span>
  </button>
  <button
    className="h-11 rounded-xl bg-white ring-1 ring-slate-200 text-sm font-bold text-slate-800 hover:bg-slate-50 transition flex flex-col items-center justify-center"
    onClick={() => setShowConvertModal(true)}
  >
    <span>{t("convert")}</span>
  </button>
</div>
              </div>
            </div>
          </Card>
          <Card className="rounded-3xl shadow-xl border border-slate-100 p-0 overflow-hidden">
            <div className="px-5 py-5">
              <div className="text-slate-700 font-semibold">{t("my_assets")}</div>
            </div>
            <div className="flex flex-col gap-2 p-3">
              {balances.map(({ symbol, balance }) => (
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

      {/* ===== NEW COIN SELECTION MODAL ===== */}
    <Modal visible={showCoinSelectionModal} onClose={() => setShowCoinSelectionModal(false)}>
      <div className="p-1 w-full max-w-sm">
        <h3 className="text-xl font-bold my-3 text-slate-900 text-center">{t('select_coin_to_deposit', 'Select Coin to Deposit')}</h3>
        <div className="flex flex-col">
          {coinData.map(({ symbol, name }) => (
            <button
              key={symbol}
              onClick={() => {
                setSelectedDepositCoin(symbol);
                setShowCoinSelectionModal(false);
                openModal('deposit', symbol);
              }}
              className="flex items-center w-full p-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition text-left"
            >
              <Icon name={symbol.toLowerCase()} className="w-9 h-9 mr-4" />
              <div className="flex-1">
                <div className="font-bold text-slate-800">{name}</div>
                <div className="text-sm text-slate-500">{symbol}</div>
              </div>
              <Icon name="chevron-right" className="w-5 h-5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
    </Modal>

<Modal visible={showWithdrawCoinSelectionModal} onClose={() => setShowWithdrawCoinSelectionModal(false)}>
  <div className="p-1 w-full max-w-sm">
    <h3 className="text-xl font-bold my-3 text-slate-900 text-center">
      {t('select_coin_to_withdraw', 'Select Coin to Withdraw')}
    </h3>
    <div className="flex flex-col">
      {coinData.map(({ symbol, name }) => (
        <button
          key={symbol}
          onClick={() => {
            setSelectedWithdrawCoin(symbol);
            setShowWithdrawCoinSelectionModal(false);
            openModal('withdraw', symbol);
          }}
          className="flex items-center w-full p-4 border-b border-slate-200 last:border-b-0 hover:bg-slate-50 transition text-left"
        >
          <Icon name={symbol.toLowerCase()} className="w-9 h-9 mr-4" />
          <div className="flex-1">
            <div className="font-bold text-slate-800">{name}</div>
            <div className="text-sm text-slate-500">{symbol}</div>
          </div>
          <Icon name="chevron-right" className="w-5 h-5 text-slate-400" />
        </button>
      ))}
    </div>
  </div>
</Modal>

    <Modal visible={modal.open && modal.type === "deposit"} onClose={closeModal}>
      <form onSubmit={handleDepositSubmit} className="flex flex-col items-center p-3 text-center w-full max-w-xs mx-auto">
        <div className="text-2xl font-bold mb-4 text-slate-900">
          {t("deposit")}
        </div>
        
        <div className="relative w-full max-w-[180px] aspect-square mb-4 rounded-2xl bg-white ring-1 ring-slate-200 flex items-center justify-center overflow-hidden p-3">
          {activeDepositInfo.qr ? (
            <img src={activeDepositInfo.qr} alt={t("deposit_qr")} className="max-w-full max-h-full object-contain" />
          ) : (
            <QRCodeCanvas value={activeDepositInfo.address || ""} size={160} bgColor="#ffffff" fgColor="#000000" />
          )}
        </div>

       <div className="w-full space-y-4 text-left">
          {selectedDepositCoin === 'USDT' ? (
            <div>
              <label className="block text-slate-600 font-medium mb-2 text-sm text-center">{t("network", "Network")}</label>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
                {usdtNetworks.map(net => (
                  <button
                    key={net}
                    type="button"
                    onClick={() => setSelectedUsdtNetwork(net)}
                    className={`w-full rounded-lg py-2 text-sm font-bold whitespace-nowrap transition-all duration-200
                      ${selectedUsdtNetwork === net
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-transparent text-slate-600 hover:bg-slate-200'
                      }`
                    }
                  >
                    {net}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-600 font-medium text-sm">{t("network")}: <span className="font-semibold text-slate-900">{depositNetworks[selectedDepositCoin]}</span></div>
          )}
        </div>

        <div className="text-slate-600 font-medium text-sm mt-4">{t("deposit_address", "Deposit Address")}</div>
        <div className="flex items-center gap-2 justify-center mt-1 w-full">
          <span className="font-mono bg-slate-100 ring-1 ring-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700 w-full truncate">
            {activeDepositInfo.address}
          </span>
          <button
            type="button"
            className="h-10 px-3 rounded-lg bg-slate-900 text-white text-sm font-semibold flex items-center gap-1.5 flex-shrink-0"
            onClick={() => { navigator.clipboard.writeText(activeDepositInfo.address); setDepositToast(t("copied")); }}
          >
            <Icon name="copy" className="w-4 h-4" /><span>{t("copy")}</span>
          </button>
        </div>

        <div className="w-full space-y-4 mt-4 text-left">
          <Field
            label={t("deposit_amount_with_coin", { coin: selectedDepositCoin })}
            type="number" min={0} step="any"
            value={depositAmount}
            onChange={e => setDepositAmount(e.target.value)}
            required
            icon="dollar-sign"
          />
          <div>
            <label className="block text-slate-600 font-medium mb-1 text-sm">{t("upload_screenshot")}</label>
            <div className="relative">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={e => { setDepositScreenshot(e.target.files[0]); setFileLocked(true); }} required className="absolute inset-0 opacity-0 z-50 cursor-pointer" disabled={fileLocked} />
              <div className={`truncate w-full text-sm font-semibold text-center px-4 py-3 rounded-xl transition-colors ${fileLocked ? "bg-slate-400 text-white cursor-not-allowed" : "bg-slate-900 text-white hover:opacity-95 cursor-pointer"}`}>
                {fileLocked ? t("screenshot_uploaded") : t("choose_file")}
              </div>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 ring-1 ring-slate-200 rounded-lg px-3 py-2 mt-4 text-center w-full">
          {t("for_your_safety_submit_screenshot")}
          <span className="block text-amber-600 font-semibold">{t("proof_ensures_support")}</span>
        </div>

        <div className="relative w-full mt-5">
          <button
            type="submit"
            disabled={depositBusy || !depositAmount || !depositScreenshot}
            className={`w-full h-12 rounded-xl text-white text-lg font-extrabold transition ${depositBusy ? "bg-slate-500 cursor-not-allowed" : "bg-slate-900 hover:scale-[1.02]"}`}
          >
            {depositBusy ? (t("submitting") || "Submitting...") : t("submit")}
          </button>
          {depositToast && (
            <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-[70]">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl bg-slate-900/95 backdrop-blur text-white font-semibold ring-1 ring-white/15">
                <Icon name="check" className="w-5 h-5" />
                <span>{depositToast}</span>
              </div>
            </div>
          )}
        </div>
      </form>
    </Modal>
      <Modal visible={modal.open && modal.type === "withdraw"} onClose={closeModal}>
    <form onSubmit={handleWithdraw} className="flex flex-col p-3 text-center w-full max-w-xs mx-auto">
        <div className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 self-center">
            <Icon name="upload" className="w-6 h-6" /> {t("Withdraw", { coin: selectedWithdrawCoin })}
        </div>
        <div className="w-full space-y-4 text-left">
          {selectedWithdrawCoin === 'USDT' ? (
  <div>
    <label className="block text-slate-600 font-medium mb-2 text-sm text-center">{t("network", "Network")}</label>
    <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
      {usdtNetworks.map(net => (
        <button
          key={net}
          type="button"
          onClick={() => setSelectedWithdrawNetwork(net)}
          className={`w-full rounded-lg py-2 text-xs font-bold transition-all duration-200 truncate px-1
            ${selectedWithdrawNetwork === net
              ? 'bg-slate-900 text-white shadow'
              : 'bg-transparent text-slate-600 hover:bg-slate-200'
            }`
          }
          title={net} // Show full name on hover
        >
          {net}
        </button>
      ))}
    </div>
  </div>
) : (
  <div className="text-center text-slate-600 font-medium text-sm">{t("network")}: <span className="font-semibold text-slate-900">{depositNetworks[selectedWithdrawCoin]}</span></div>
)}
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
        </div>
        <div className="text-xs text-amber-700 bg-amber-50 ring-1 ring-amber-200 rounded-lg px-3 py-2 mt-4 text-center w-full">
            {t("double_check_withdraw")}
        </div>
        <div className="relative w-full mt-4">
            <button
                type="submit"
                disabled={withdrawBusy || !withdrawForm.address || !withdrawForm.amount}
                className={`w-full h-11 rounded-xl text-white text-base font-extrabold transition ${withdrawBusy ? "bg-slate-500 cursor-not-allowed" : "bg-slate-900 hover:scale-[1.02]"}`}
            >
                {withdrawBusy ? (t("submitting") || "Submitting...") : t("submit_withdraw")}
            </button>
            {withdrawToast && (
                <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-[70]">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-full shadow-2xl bg-slate-900/95 backdrop-blur text-white font-semibold ring-1 ring-white/15">
                        <Icon name="check" className="w-5 h-5" />
                        <span>{withdrawToast}</span>
                    </div>
                </div>
            )}
        </div>
    </form>
</Modal>

    {/* ===== NEW CONVERT MODAL ===== */}
    <Modal visible={showConvertModal} onClose={() => setShowConvertModal(false)}>
      <div className="p-2">
        <div className="flex items-center gap-2 text-slate-800 text-2xl font-extrabold mb-4">
          <Icon name="swap" className="w-7 h-7" /> {t("convert_crypto")}
        </div>
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

            <div className="flex items-center justify-center -my-2 z-10">
              <button
                type="button"
                onClick={swap}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800 transition-all duration-200 ease-in-out transform hover:scale-105"
                aria-label="Swap currencies"
              >
                <Icon name="swap" className="w-5 h-5" />
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
    </Modal>
    </div>
  );
}