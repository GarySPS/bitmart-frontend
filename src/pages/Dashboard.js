import React, { useEffect, useMemo, useState } from "react";
import Card from "../components/card";
import NewsTicker from "../components/newsticker";
import { MAIN_API_BASE } from "../config";
import MarketTicker from "../components/MarketTicker";

/* ---------- helpers ---------- */
function formatBigNum(number) {
  if (!number || isNaN(number)) return "--";
  if (number >= 1e12) return "$" + (number / 1e12).toFixed(2) + "T";
  if (number >= 1e9) return "$" + (number / 1e9).toFixed(2) + "B";
  if (number >= 1e6) return "$" + (number / 1e6).toFixed(2) + "M";
  if (number >= 1e3) return "$" + (number / 1e3).toFixed(2) + "K";
  return "$" + Number(number).toLocaleString();
}
const pctClass = (v) =>
  v > 0
    ? "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200"
    : v < 0
    ? "text-rose-600 bg-rose-50 ring-1 ring-rose-200"
    : "text-slate-600 bg-slate-50 ring-1 ring-slate-200";

export default function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("mcap"); // mcap | volume | change | price | name

  /* ---------- prices (fetch >= 100) ---------- */
  useEffect(() => {
    try {
      const raw = localStorage.getItem("nc_coins");
      if (raw) setCoins(JSON.parse(raw));
    } catch {}

    const fetchPrices = async () => {
      try {
        // ask backend for lots (most CoinMarketCap-style proxies accept limit)
        const urls = [
          `${MAIN_API_BASE}/prices?limit=200`,
          `${MAIN_API_BASE}/prices?limit=150`,
          `${MAIN_API_BASE}/prices?limit=100`,
          `${MAIN_API_BASE}/prices`, // final fallback
        ];
        let freshCoins = [];
        for (const u of urls) {
          try {
            const r = await fetch(u);
            const j = await r.json();
            const arr = j?.data || [];
            if (arr.length > freshCoins.length) freshCoins = arr;
            if (freshCoins.length >= 100) break;
          } catch {}
        }

        if (freshCoins.length) {
          setCoins(() => {
            try {
              localStorage.setItem("nc_coins", JSON.stringify(freshCoins));
            } catch {}
            return freshCoins;
          });
        }
      } catch {
        /* keep last cache */
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 12000);
    return () => clearInterval(interval);
  }, []);

  /* ---------- news ---------- */
  useEffect(() => {
    async function fetchHeadlines() {
      try {
        const rssUrl = "https://cointelegraph.com/rss";
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          rssUrl
        )}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        setNewsHeadlines(
          (data.items || [])
            .slice(0, 10)
            .map((item) =>
              item.title.replace(/&#(\d+);/g, (m, code) =>
                String.fromCharCode(code)
              )
            )
        );
      } catch {
        setNewsHeadlines([]);
      }
    }
    fetchHeadlines();
  }, []);

  /* ---------- computed ---------- */
  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = coins.slice();
    if (q) {
      list = list.filter(
        (c) =>
          c.name?.toLowerCase().includes(q) ||
          c.symbol?.toLowerCase().includes(q)
      );
    }
    list.sort((a, b) => {
      const au = a.quote?.USD || {};
      const bu = b.quote?.USD || {};
      switch (sortBy) {
        case "price":
          return (bu.price || 0) - (au.price || 0);
        case "change":
          return (
            (bu.percent_change_24h || 0) - (au.percent_change_24h || 0)
          );
        case "volume":
          return (bu.volume_24h || 0) - (au.volume_24h || 0);
        case "name":
          return (a.name || "").localeCompare(b.name || "");
        default:
          // mcap
          return (bu.market_cap || 0) - (au.market_cap || 0);
      }
    });
    return list;
  }, [coins, query, sortBy]);

  // Always show up to 100 in the table
  const display = useMemo(
    () => filteredSorted.slice(0, 100),
    [filteredSorted]
  );

  const totalMcap = useMemo(
    () =>
      display.reduce(
        (sum, c) => sum + (c.quote?.USD?.market_cap || 0),
        0
      ),
    [display]
  );
  const totalVol = useMemo(
    () =>
      display.reduce(
        (sum, c) => sum + (c.quote?.USD?.volume_24h || 0),
        0
      ),
    [display]
  );

  /* ---------- skeleton ---------- */
  const SkeletonRow = ({ i }) => (
    <tr key={`sk-${i}`} className="animate-pulse border-b border-slate-100">
      <td className="py-4 px-3">
        <div className="w-8 h-8 rounded-full bg-slate-200" />
      </td>
      <td className="py-4 px-3">
        <div className="h-4 w-32 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3">
        <div className="h-4 w-14 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
      <td className="py-4 px-3">
        <div className="h-6 w-20 bg-slate-200 rounded" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
      <td className="py-4 px-3 text-right">
        <div className="h-4 w-24 bg-slate-200 rounded ml-auto" />
      </td>
    </tr>
  );

  return (
    <div className="w-full flex flex-col items-center px-3 pt-3 pb-6">
      <div className="w-full max-w-7xl mx-auto space-y-4">
        {/* ---- Top Stats ---- */}
        <Card className="p-0 overflow-hidden rounded-2xl shadow-lg border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 px-4 py-4 md:px-6 md:py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-slate-500 text-sm">
                  Global Market Cap 
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {formatBigNum(totalMcap)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-sm">
                  24h Volume 
                </div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {formatBigNum(totalVol)}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 outline-none focus:ring-2 focus:ring-sky-200"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="mcap">Sort by Market Cap</option>
                  <option value="volume">Sort by 24h Volume</option>
                  <option value="change">Sort by 24h Change</option>
                  <option value="price">Sort by Price</option>
                  <option value="name">Sort by Name</option>
                </select>

                <div className="relative">
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-2.5 pr-10 outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Search coin by name or symbol…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ---- Table ---- */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm md:text-base">
  <colgroup>
    <col className="w-24" />   {/* # + logo */}
    <col />                    {/* Name (flex) */}
    <col className="w-28" />   {/* Symbol */}
    <col className="w-40" />   {/* Price */}
    <col className="w-28" />   {/* 24h */}
    <col className="w-44" />   {/* 24h Volume */}
    <col className="w-44" />   {/* Market Cap */}
  </colgroup>
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-left text-slate-600 border-y border-slate-100">
                  <th className="py-3.5 px-3 text-center">#</th>
                  <th className="py-3.5 px-3">Name</th>
                  <th className="py-3.5 px-3">Symbol</th>
                  <th className="py-3.5 px-3 text-right">Price</th>
                  <th className="py-3.5 px-3">24h</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">
                    24h Volume
                  </th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">
                    Market Cap
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => (
                      <SkeletonRow i={i} key={i} />
                    ))
                  : display.map((coin, idx) => {
                      const u = coin.quote?.USD || {};
                      const change =
                        typeof u.percent_change_24h === "number"
                          ? u.percent_change_24h
                          : null;
                      return (
                        <tr
                          key={coin.id || coin.symbol || idx}
                          className="group border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                          style={{ height: 64 }}
                        >
                          {/* Rank / Logo */}
<td className="py-3 px-3">
  <div className="flex items-center">
    <span className="text-slate-400 text-xs font-medium w-8 tabular-nums text-right mr-2">
      {String(idx + 1).padStart(2, "0")}
    </span>
    <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
      <img
        src={`https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`}
        onError={(e) => { e.currentTarget.style.opacity = "0"; }}
        alt={coin.symbol}
        className="w-8 h-8 object-contain"
      />
    </div>
  </div>
</td>

                          {/* Name */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">
                                {coin.name || "--"}
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 ring-1 ring-slate-200">
                                #{coin.cmc_rank || idx + 1}
                              </span>
                            </div>
                          </td>

                          {/* Symbol */}
<td className="py-3 px-3">
  <span className="font-mono text-slate-700 bg-slate-50 ring-1 ring-slate-200 px-2 py-1 rounded-md inline-block w-20 text-center">
    {coin.symbol}
  </span>
</td>

                          {/* Price */}
                          <td className="py-3 px-3 text-right font-semibold tabular-nums">
                            {typeof u.price === "number"
                              ? "$" +
                                u.price.toLocaleString(undefined, {
                                  maximumFractionDigits: 6,
                                })
                              : "--"}
                          </td>

                          {/* 24h Change */}
                          <td className="py-3 px-3">
                            {change === null ? (
                              <span className="text-slate-400">--</span>
                            ) : (
                              <span
                                className={`inline-flex items-center justify-center min-w-[84px] px-2 py-1 rounded-lg text-sm font-semibold ${pctClass(
                                  change
                                )}`}
                              >
                                {change > 0 ? "+" : ""}
                                {change.toFixed(2)}%
                              </span>
                            )}
                          </td>

                          {/* Volume */}
                          <td className="py-3 px-3 text-right tabular-nums">
                            <span className="inline-block px-2 py-1 rounded-md bg-slate-50 ring-1 ring-slate-200">
                              {u.volume_24h ? formatBigNum(u.volume_24h) : "--"}
                            </span>
                          </td>

                          {/* Market Cap */}
                          <td className="py-3 px-3 text-right tabular-nums">
                            <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 font-medium">
                              {u.market_cap ? formatBigNum(u.market_cap) : "--"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* ---- NEW: Market Ticker ---- */}
<div className="mt-2">
    <MarketTicker allCoins={coins} />
</div>

{/* ---- News Ticker ---- */}
<Card className="p-0 rounded-2xl shadow-lg border border-slate-100">
          <div className="px-3 md:px-4 py-4">
            <NewsTicker
              news={
                newsHeadlines.length
                  ? newsHeadlines
                  : ["Loading latest crypto headlines..."]
              }
            />
          </div>
        </Card>
      </div>
    </div>
  );
}