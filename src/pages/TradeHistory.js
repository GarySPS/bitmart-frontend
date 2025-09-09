import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import Tooltip from "../components/tooltip";
import Icon from "../components/icon";

/* ---------- helpers (UI only) ---------- */
const fmtUSD = (n, max = 2) =>
  typeof n === "number" && !isNaN(n)
    ? "$" + n.toLocaleString(undefined, { maximumFractionDigits: max })
    : "--";

const chipClass = (ok) =>
  ok === "WIN"
    ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
    : ok === "LOSE"
    ? "bg-rose-100 text-rose-700 ring-1 ring-rose-200"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";

export default function TradeHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI controls (client-side only; does not change your logic)
  const [resultFilter, setResultFilter] = useState("ALL"); // ALL | WIN | LOSE
  const [sortBy, setSortBy] = useState("time"); // time | profit | amount | duration
  const [sortDir, setSortDir] = useState("desc"); // desc | asc
  const [q, setQ] = useState(""); // simple search across id/direction/result

  /* ---------- fetch unchanged ---------- */
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setHistory([]);
      setLoading(false);
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
    if (!user_id) {
      setHistory([]);
      setLoading(false);
      return;
    }
    axios
      .get(`${MAIN_API_BASE}/trade/history/${user_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setHistory(res.data || []);
        setLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setLoading(false);
      });
  }, []);

  /* ---------- derive UI list ---------- */
  const rows = useMemo(() => {
    let list = Array.isArray(history) ? [...history] : [];

    // filter by WIN/LOSE
    if (resultFilter !== "ALL") {
      list = list.filter((t) => (t.result || "").toUpperCase() === resultFilter);
    }

    // simple search (id, direction, result)
    const query = q.trim().toLowerCase();
    if (query) {
      list = list.filter((t) => {
        const id = String(t.id || "").toLowerCase();
        const dir = String(t.direction || "").toLowerCase();
        const res = String(t.result || "").toLowerCase();
        return id.includes(query) || dir.includes(query) || res.includes(query);
      });
    }

    // sort
    list.sort((a, b) => {
      const av =
        sortBy === "profit"
          ? Number(a.profit) || 0
          : sortBy === "amount"
          ? Number(a.amount) || 0
          : sortBy === "duration"
          ? Number(a.duration) || 0
          : new Date(a.timestamp || 0).getTime();
      const bv =
        sortBy === "profit"
          ? Number(b.profit) || 0
          : sortBy === "amount"
          ? Number(b.amount) || 0
          : sortBy === "duration"
          ? Number(b.duration) || 0
          : new Date(b.timestamp || 0).getTime();

      return sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [history, resultFilter, sortBy, sortDir, q]);

  /* ---------- UI skeleton ---------- */
  const SkeletonRow = ({ i }) => (
    <tr key={`sk-${i}`} className="animate-pulse border-b border-slate-100">
      {Array.from({ length: 9 }).map((_, idx) => (
        <td key={idx} className="py-4 px-3">
          <div className="h-4 w-24 bg-slate-200 rounded" />
        </td>
      ))}
    </tr>
  );

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center py-8 px-3"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
        minHeight: "100vh",
        position: "relative",
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
        {/* header + controls */}
        <Card className="p-0 overflow-hidden rounded-2xl shadow-lg border border-slate-100 mb-4">
          <div className="bg-gradient-to-r from-indigo-50 via-sky-50 to-emerald-50 px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6">
              <div className="flex-1">
                <div className="text-slate-500 text-sm">Your Trades</div>
                <div className="text-2xl md:text-3xl font-semibold tracking-tight">
                  {rows.length.toLocaleString()} record{rows.length !== 1 ? "s" : ""}
                </div>
              </div>

              {/* filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                <div className="flex bg-white/80 rounded-xl ring-1 ring-slate-200 p-1">
                  {["ALL", "WIN", "LOSE"].map((k) => (
                    <button
                      key={k}
                      onClick={() => setResultFilter(k)}
                      className={`flex-1 h-9 rounded-lg text-sm font-semibold transition
                        ${
                          resultFilter === k
                            ? k === "WIN"
                              ? "bg-emerald-500 text-white"
                              : k === "LOSE"
                              ? "bg-rose-500 text-white"
                              : "bg-slate-900 text-white"
                            : "text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {k}
                    </button>
                  ))}
                </div>
                <select
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white/80 px-4 outline-none focus:ring-2 focus:ring-sky-200"
                  value={`${sortBy}:${sortDir}`}
                  onChange={(e) => {
                    const [by, dir] = e.target.value.split(":");
                    setSortBy(by);
                    setSortDir(dir);
                  }}
                >
                  <option value="time:desc">Newest first</option>
                  <option value="time:asc">Oldest first</option>
                  <option value="profit:desc">Profit high → low</option>
                  <option value="profit:asc">Profit low → high</option>
                  <option value="amount:desc">Amount high → low</option>
                  <option value="amount:asc">Amount low → high</option>
                  <option value="duration:desc">Duration high → low</option>
                  <option value="duration:asc">Duration low → high</option>
                </select>
                <div className="relative">
                  <input
                    className="w-full h-11 rounded-xl border border-slate-200 bg-white/80 px-4 pr-10 outline-none focus:ring-2 focus:ring-sky-200"
                    placeholder="Search id / direction / result…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    <Icon name="search" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* table / empty / loading */}
        {loading ? (
          <Card className="max-w-7xl mx-auto px-0 py-0 rounded-2xl shadow-lg border border-slate-100">
            <div className="w-full overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white sticky top-0 z-10">
                  <tr className="text-left text-slate-600 border-y border-slate-100">
                    {[
                      "#",
                      "Direction",
                      "Amount",
                      "Entry",
                      "Result",
                      "Result Price",
                      "Profit",
                      "Duration",
                      "Time",
                    ].map((h, i) => (
                      <th key={i} className="py-3.5 px-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>{Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} i={i} />)}</tbody>
              </table>
            </div>
          </Card>
        ) : rows.length === 0 ? (
          <Card className="max-w-xl mx-auto py-12 text-center rounded-2xl shadow-lg border border-slate-100 bg-white/70 backdrop-blur">
            <div className="text-slate-700 text-lg font-semibold">No trade history yet.</div>
            <div className="text-slate-500 mt-1">Your trades will appear here right after settlement.</div>
          </Card>
        ) : (
          <Card className="max-w-7xl mx-auto px-0 py-0 rounded-2xl shadow-lg border border-slate-100">
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-white sticky top-0 z-10">
                  <tr className="text-left text-slate-600 border-y border-slate-100">
                    <th className="py-3.5 px-3 text-center">#</th>
                    <th className="py-3.5 px-3 text-center">Direction</th>
                    <th className="py-3.5 px-3 text-right">Amount</th>
                    <th className="py-3.5 px-3 text-right">Entry</th>
                    <th className="py-3.5 px-3 text-center">
                      Result{" "}
                      <Tooltip title="Win: You gained profit. Lose: You lost your trade." />
                    </th>
                    <th className="py-3.5 px-3 text-right">Result Price</th>
                    <th className="py-3.5 px-3 text-right">Profit</th>
                    <th className="py-3.5 px-3 text-center">Duration</th>
                    <th className="py-3.5 px-3 text-center">Time</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {rows.map((t, idx) => {
                    const isBuy = String(t.direction).toUpperCase() === "BUY";
                    const res = String(t.result || "").toUpperCase();
                    return (
                      <tr
                        key={`trade-${t.id || idx}`}
                        className="group border-b border-slate-100 hover:bg-slate-50/60 transition-colors"
                        style={{ height: 64 }}
                      >
                        <td className="py-3 px-3 text-center font-mono text-slate-500">{t.id}</td>

                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ring-1 ${
                              isBuy
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                                : "bg-rose-50 text-rose-700 ring-rose-200"
                            }`}
                          >
                            <Icon name={isBuy ? "arrow-up" : "arrow-down"} className="w-4 h-4" />
                            {isBuy ? "BUY" : "SELL"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right font-medium tabular-nums">
                          {fmtUSD(Number(t.amount))}
                        </td>

                        <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                          {t.start_price != null && !isNaN(Number(t.start_price))
                            ? fmtUSD(Number(t.start_price), 6)
                            : "--"}
                        </td>

                        <td className="py-3 px-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-extrabold ${chipClass(res)}`}>
                            <Icon name={res === "WIN" ? "check" : res === "LOSE" ? "close" : "dot"} className="w-4 h-4" />
                            {res || "--"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right tabular-nums text-slate-700">
                          {t.result_price != null && !isNaN(Number(t.result_price))
                            ? fmtUSD(Number(t.result_price), 6)
                            : "--"}
                        </td>

                        <td
                          className={`py-3 px-3 text-right tabular-nums font-semibold ${
                            Number(t.profit) > 0
                              ? "text-emerald-600"
                              : Number(t.profit) < 0
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                          {(Number(t.profit) > 0 ? "+" : "") + fmtUSD(Number(t.profit))}
                        </td>

                        <td className="py-3 px-3 text-center text-slate-700">{Number(t.duration)}s</td>

                        <td className="py-3 px-3 text-center font-mono text-slate-500">
                          {t.timestamp ? new Date(t.timestamp).toLocaleString() : ""}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}