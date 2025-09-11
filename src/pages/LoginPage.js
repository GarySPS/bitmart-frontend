import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import BitMartLogo from "../components/BitMartLogo.png";
import DatabaseErrorCard from "../components/DatabaseErrorCard";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (res.status === 403 && data.error && data.error.toLowerCase().includes("verify your email")) {
        navigate("/verify-otp", { state: { email } });
        return;
      }
      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/wallet");
    } catch {
      setError("Platform is under scheduled maintenance. Please try again soon.");
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex items-center justify-center px-4 py-10 md:py-14"
      style={{
        backgroundImage: 'url("/bitmart.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* overlay */}
      <div className="absolute inset-0 bg-[#0c1022e6] backdrop-blur-[2px]" />

      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-[480px] rounded-3xl bg-white/90 backdrop-blur shadow-2xl border border-white/40 px-6 py-8 md:px-10 md:py-10">
          {/* logo */}
          <div className="flex justify-center">
            <img
              src={BitMartLogo}
              alt="BitMart Logo"
              className="w-40 md:w-48 select-none pointer-events-none"
              draggable={false}
            />
          </div>

          <form onSubmit={handleLogin} className="mt-6 space-y-5">
            {/* Email/Username */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm md:text-base font-semibold text-[#232836]">
                Username or Email
              </label>
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                placeholder="yourname or you@email.com"
                className="w-full h-12 rounded-xl px-4 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#00eaff22] focus:border-[#00eaff] transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm md:text-base font-semibold text-[#232836]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full h-12 rounded-xl px-4 pr-12 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#ffd70022] focus:border-[#ffd700] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md px-2 py-1 text-xs font-semibold text-[#232836] bg-white/70 border border-gray-200 hover:bg-white shadow-sm"
                >
                  {showPwd ? "Hide" : "Show"}
                </button>
              </div>
              <div className="flex justify-end">
                <Link
                  to="/forgot"
                  className="text-xs md:text-sm font-semibold text-[#1f2fff] hover:text-[#00eaff] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Errors */}
            {error &&
              (error.toLowerCase().includes("maintain") || error.toLowerCase().includes("database") ? (
                <DatabaseErrorCard />
              ) : (
                <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm md:text-base text-red-600">
                  {error}
                </div>
              ))}

            {/* Submit */}
            <button
              type="submit"
              className="w-full h-12 md:h-12 rounded-xl font-extrabold text-base md:text-lg tracking-wide shadow-lg border-0 outline-none transition active:scale-[.99]"
              style={{
                background:
                  "linear-gradient(90deg,#00eaff 0%,#1f2fff 55%,#ffd700 100%)",
                color: "#141726",
                letterSpacing: "0.02em",
                boxShadow: "0 10px 24px rgba(31,47,255,0.12)",
              }}
            >
              Login
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px w-full bg-gradient-to-r from-transparent via-[#dbe3ff] to-transparent" />
          </div>

{/* Support */}
<div className="grid grid-cols-1 gap-2">
  <a
    href="https://t.me/bitmartsingapore"
    target="_blank"
    rel="noopener noreferrer"
    className="rounded-xl px-3 py-2 text-center text-sm md:text-base font-bold text-white bg-[#229ED9] hover:bg-[#178fca] transition shadow"
  >
    Telegram
  </a>
</div>

<div className="mt-5 flex justify-center">
  <Link
    to="/signup"
    className="text-sm md:text-base font-bold text-[#1f2fff] hover:text-[#00eaff] hover:underline"
  >
    New here? Create an account
  </Link>
</div>

        </div>
      </div>

      {/* Subtle logo glow */}
      <style>
        {`
          @keyframes logoGlow {
            0% { filter: drop-shadow(0 0 12px rgba(0,234,255,.55)); }
            50% { filter: drop-shadow(0 0 36px rgba(0,234,255,.35)); }
            100% { filter: drop-shadow(0 0 12px rgba(0,234,255,.55)); }
          }
          img[alt="BitMart Logo"] { animation: logoGlow 3s ease-in-out infinite; }
        `}
      </style>
    </div>
  );
}
