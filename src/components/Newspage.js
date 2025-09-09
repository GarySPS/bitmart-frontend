import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Image from "./image";

/* ---------------- Skeleton ---------------- */
function NewsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
      {[1, 2, 3, 4].map((k) => (
        <div
          key={k}
          className="rounded-2xl p-6 md:p-7 border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] animate-pulse"
          style={{ minHeight: "26rem" }}
        >
          <div className="h-6 w-3/5 bg-white/30 rounded mb-4" />
          <div className="h-[12rem] w-full bg-white/20 rounded-xl mb-4" />
          <div className="h-4 w-4/5 bg-white/25 rounded mb-2" />
          <div className="h-3 w-1/3 bg-white/20 rounded" />
        </div>
      ))}
    </div>
  );
}

/* ---------------- Utils ---------------- */
function stripHtml(str = "") {
  return str.replace(/(<([^>]+)>)/gi, "");
}
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/* ============================================================ */

export default function NewsPage() {
  const { t } = useTranslation();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchNews() {
      setLoading(true);
      try {
        const rssUrl = "https://cointelegraph.com/rss";
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(
          rssUrl
        )}`;
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (!cancelled) setNews(data.items || []);
      } catch {
        if (!cancelled) setNews([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchNews();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!q.trim()) return news;
    const needle = q.toLowerCase();
    return news.filter((n) => {
      const title = (n.title || "").toLowerCase();
      const desc = stripHtml(n.description || "").toLowerCase();
      return title.includes(needle) || desc.includes(needle);
    });
  }, [news, q]);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center px-3 pt-8 pb-14 font-sans"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center/cover fixed',
      }}
    >
      {/* soft overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(120deg,#0b1020f0_0%,#0d1220d8_60%,#0a101dd1_100%)]" />

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="mb-7 md:mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl/md:text-4xl font-black tracking-tight text-white drop-shadow">
              {t("Latest News", "Latest News")}
            </h1>
            <p className="text-white/70 mt-1">
              {t(
                "Hand-picked headlines from CoinTelegraph, updated frequently.",
                "Hand-picked headlines from CoinTelegraph, updated frequently."
              )}
            </p>
          </div>

          {/* Search (client-only) */}
          <div className="w-full md:w-[320px]">
            <label className="sr-only" htmlFor="news-search">
              {t("Search")}
            </label>
            <div className="relative">
              <input
                id="news-search"
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("Search articles…")}
                className="w-full h-11 pl-10 pr-3 rounded-xl bg-white/90 text-slate-900 placeholder:text-slate-400 ring-1 ring-white/40 focus:ring-2 focus:ring-sky-300 outline-none"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <NewsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 md:py-24 text-lg text-white/70">
            {q
              ? t("No results for your search.", "No results for your search.")
              : t("no_news", "No news available right now.")}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {filtered.map((article) => {
              const cover =
                article.thumbnail ||
                (article.enclosure && article.enclosure.link) ||
                "/news-fallback.jpg";
              const clean = stripHtml(article.description || "");
              const excerpt = clean.length > 260 ? clean.slice(0, 257) + "…" : clean;

              return (
                <article
                  key={article.guid}
                  className="rounded-2xl p-6 md:p-7 border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-transform hover:scale-[1.01]"
                  style={{ minHeight: "26rem" }}
                >
                  <header className="flex items-start gap-3 mb-4">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-bold text-white hover:underline decoration-sky-300/60 decoration-2 underline-offset-2 line-clamp-2"
                    >
                      {article.title}
                    </a>
                    <span className="ml-auto px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 text-xs font-semibold ring-1 ring-sky-300/30">
                      CoinTelegraph
                    </span>
                  </header>

                  <div className="mb-4 w-full rounded-xl overflow-hidden relative aspect-video bg-white/10 ring-1 ring-white/10">
                    <Image
                      className="object-cover w-full h-full transition-transform hover:scale-105 duration-300"
                      src={cover}
                      alt={article.title || ""}
                      style={{ background: "#0e1627" }}
                    />
                  </div>

                  <div className="flex items-center gap-2 mb-3 text-xs text-white/60">
                    <span>{formatDate(article.pubDate)}</span>
                  </div>

                  <p className="text-[15px] leading-relaxed text-white/85 md:line-clamp-3">
                    {excerpt}
                  </p>

                  <div className="mt-5">
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center h-10 px-4 rounded-lg font-semibold bg-white text-slate-900 hover:bg-slate-100 transition"
                      aria-label={t("Read full article")}
                    >
                      {t("Read more", "Read more")}
                      <svg
                        className="ml-2"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M7 17L17 7M17 7H9M17 7v8"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
