import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newsHeadlines, setNewsHeadlines] = useState([]);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("mcap"); // mcap | volume | change | price | name

  /* ---------- [OPTIMIZED] prices fetch ---------- */
  useEffect(() => {
    // 1. Immediately try to load prices from localStorage for a fast initial render.
    try {
      const raw = localStorage.getItem("nc_coins");
      if (raw) {
        const cachedCoins = JSON.parse(raw);
        if (Array.isArray(cachedCoins) && cachedCoins.length > 0) {
            setCoins(cachedCoins);
            setLoading(false); // We have cached data, so we're not "loading" anymore.
        }
      }
    } catch {}

    // 2. Define a single, reliable function to fetch fresh prices.
    const fetchPrices = async () => {
      try {
        // We only need to call one endpoint. The backend provides the full list.
        const response = await fetch(`${MAIN_API_BASE}/prices`);
        
        // Check if the server responded with an error code like 503
        if (!response.ok) {
            console.error("Failed to fetch prices:", response.status, response.statusText);
            // Don't update coins, just let the stale data (if any) remain.
            return; 
        }

        const data = await response.json();
        const freshCoins = data?.data || [];

        // 3. If we got new data, update the state and localStorage.
        if (freshCoins.length) {
          setCoins(freshCoins);
          localStorage.setItem("nc_coins", JSON.stringify(freshCoins));
        }
      } catch (error) {
        // This catches network errors (e.g., server is completely down).
        console.error("Network error fetching prices:", error);
      } finally {
        // Ensure loading is always turned off after the first attempt.
        setLoading(false);
      }
    };

    // 4. Fetch immediately on component mount, then set an interval for updates.
    fetchPrices();
    const interval = setInterval(fetchPrices, 15000); // Fetch every 15 seconds

    // 5. Clean up the interval when the component unmounts.
    return () => clearInterval(interval);
  }, []); // The empty dependency array ensures this runs only once on mount.

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
          return (bu.market_cap || 0) - (au.market_cap || 0);
      }
    });
    return list;
  }, [coins, query, sortBy]);

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
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-3 pb-24"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center/cover fixed',
      }}
    >
      <div className="fixed inset-0 bg-[linear-gradient(120deg,#0b1020f0_0%,#0d1220d8_60%,#0a101dd1_100%)] pointer-events-none" />
      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6">

        {/* ---- Market Ticker (Moved to top) ---- */}
        <MarketTicker allCoins={coins} />
        
        {/* ---- Main Market Table ---- */}
        <Card className="p-0 overflow-hidden rounded-2xl shadow-lg border border-slate-100">
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 px-4 py-4 md:px-6 md:py-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-6">
              <div>
                <div className="text-slate-500 text-sm">Global Market Cap</div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {formatBigNum(totalMcap)}
                </div>
              </div>
              <div>
                <div className="text-slate-500 text-sm">24h Volume</div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {formatBigNum(totalVol)}
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:col-span-1">
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
                    placeholder="Search coin..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-sm md:text-base">
              <colgroup>
                <col className="w-24" />
                <col />
                <col className="w-28" />
                <col className="w-40" />
                <col className="w-28" />
                <col className="w-44" />
                <col className="w-44" />
              </colgroup>
              <thead className="bg-white sticky top-0 z-10">
                <tr className="text-left text-slate-600 border-y border-slate-100">
                  <th className="py-3.5 px-3 text-center">#</th>
                  <th className="py-3.5 px-3">Name</th>
                  <th className="py-3.5 px-3">Symbol</th>
                  <th className="py-3.5 px-3 text-right">Price</th>
                  <th className="py-3.5 px-3">24h</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">24h Volume</th>
                  <th className="py-3.5 px-3 text-right whitespace-nowrap">Market Cap</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loading
                  ? Array.from({ length: 12 }).map((_, i) => <SkeletonRow i={i} key={i} />)
                  : display.map((coin, idx) => {
                      const u = coin.quote?.USD || {};
                      const change = typeof u.percent_change_24h === "number" ? u.percent_change_24h : null;
                      return (
                        <tr 
                          key={coin.id || coin.symbol || idx} 
                          className="group border-b border-slate-100 hover:bg-slate-100/80 transition-colors cursor-pointer" 
                          style={{ height: 64 }} 
                          onClick={() => navigate(`/trade/${coin.symbol}`)}
                        >
                          <td className="py-3 px-3">
                            <div className="flex items-center">
                              <span className="text-slate-400 text-xs font-medium w-8 tabular-nums text-right mr-2">{String(idx + 1).padStart(2, "0")}</span>
                              <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center">
                                <img src={`https://assets.coincap.io/assets/icons/${coin.symbol?.toLowerCase()}@2x.png`} onError={(e) => { e.currentTarget.style.opacity = "0"; }} alt={coin.symbol} className="w-8 h-8 object-contain" />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-800">{coin.name || "--"}</span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-100 text-slate-500 ring-1 ring-slate-200">#{coin.cmc_rank || idx + 1}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="font-mono text-slate-700 bg-slate-50 ring-1 ring-slate-200 px-2 py-1 rounded-md inline-block w-20 text-center">{coin.symbol}</span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold tabular-nums">
                            {typeof u.price === "number" ? "$" + u.price.toLocaleString(undefined, { maximumFractionDigits: 6 }) : "--"}
                          </td>
                          <td className="py-3 px-3">
                            {change === null ? (<span className="text-slate-400">--</span>) : (
                              <span className={`inline-flex items-center justify-center min-w-[84px] px-2 py-1 rounded-lg text-sm font-semibold ${pctClass(change)}`}>
                                {change > 0 ? "+" : ""}{change.toFixed(2)}%
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">
                            <span className="inline-block px-2 py-1 rounded-md bg-slate-50 ring-1 ring-slate-200">{u.volume_24h ? formatBigNum(u.volume_24h) : "--"}</span>
                          </td>
                          <td className="py-3 px-3 text-right tabular-nums">
                            <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 ring-1 ring-emerald-200 text-emerald-700 font-medium">{u.market_cap ? formatBigNum(u.market_cap) : "--"}</span>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          </div>
        </Card>
        
        {/* ---- News Ticker ---- */}
        <Card className="p-0 rounded-2xl shadow-lg border border-slate-100">
          <div className="px-3 md:px-4 py-4">
            <NewsTicker news={newsHeadlines.length ? newsHeadlines : ["Loading latest crypto headlines..."]}/>
          </div>
        </Card>
      </div>
    </div>
  );
}