import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import BitMartLogo from "../components/BitMartLogo.png";

export default function SignUpPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();

      if (res.status === 409 && data.unverified) {
        setSuccess("You have already registered but not verified. Please check your email for the OTP code.");
        setTimeout(() => navigate("/verify-otp", { state: { email } }), 1200);
        return;
      }
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      setSuccess("OTP code sent to your email. Please verify to complete sign up.");
      setTimeout(() => navigate("/verify-otp", { state: { email } }), 1200);
    } catch {
      setError("Signup failed. Please try again.");
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
      <div className="absolute inset-0 bg-[#0c1022e6] backdrop-blur-[2px]" />

      <div className="relative z-10 w-full">
        <div className="mx-auto w-full max-w-[480px] rounded-3xl bg-white/90 backdrop-blur shadow-2xl border border-white/40 px-6 py-8 md:px-10 md:py-10">
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src={BitMartLogo}
              alt="BitMart Logo"
              className="w-40 md:w-48 select-none pointer-events-none"
              draggable={false}
            />
          </div>

          {/* Title */}
          <h2 className="mt-5 text-center text-2xl md:text-3xl font-extrabold tracking-tight text-[#232836]">
            Create Account
          </h2>

          {/* Form */}
          <form onSubmit={handleSignUp} className="mt-6 space-y-4 md:space-y-5">
            {/* Username */}
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm md:text-base font-semibold text-[#232836]">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                placeholder="Create your username"
                className="w-full h-12 rounded-xl px-4 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#1f2fff1f] focus:border-[#1f2fff] transition"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm md:text-base font-semibold text-[#232836]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Enter your email"
                className="w-full h-12 rounded-xl px-4 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#00eaff22] focus:border-[#00eaff] transition"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm md:text-base font-semibold text-[#232836]">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Create a password"
                className="w-full h-12 rounded-xl px-4 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#ffd70022] focus:border-[#ffd700] transition"
              />
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm md:text-base font-semibold text-[#232836]">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder="Re-enter your password"
                className="w-full h-12 rounded-xl px-4 bg-[#eef4ff] text-[#0f1224] placeholder-[#6b7280] border border-[#d7e3ff] focus:outline-none focus:ring-4 focus:ring-[#ffd70022] focus:border-[#ffd700] transition"
              />
            </div>

            {/* Alerts */}
            {error && (
              <div className="w-full rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm md:text-base text-red-600">
                {error}
              </div>
            )}
            {success && (
              <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm md:text-base text-emerald-700">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="mt-1 w-full h-12 md:h-12 rounded-xl font-extrabold text-base md:text-lg tracking-wide shadow-lg border-0 outline-none transition active:scale-[.99]"
              style={{
                background:
                  "linear-gradient(90deg,#00eaff 0%,#1f2fff 55%,#ffd700 100%)",
                color: "#141726",
                letterSpacing: "0.02em",
                boxShadow: "0 10px 24px rgba(31,47,255,0.12)",
              }}
            >
              Register
            </button>
          </form>

          {/* Terms */}
          <p className="mt-7 text-center text-[11px] md:text-xs text-gray-600 font-medium leading-relaxed">
            By signing up, you agree to the{" "}
            <a className="text-[#00eaff] hover:underline" href="/" target="_blank" rel="noreferrer">
              Terms of Use
            </a>
            ,{" "}
            <a className="text-[#00eaff] hover:underline" href="/" target="_blank" rel="noreferrer">
              Privacy Notice
            </a>{" "}
            and{" "}
            <a className="text-[#00eaff] hover:underline" href="/" target="_blank" rel="noreferrer">
              Cookie Notice
            </a>
            .
          </p>

          {/* Login Link */}
          <div className="mt-4 flex justify-center">
            <Link
              to="/login"
              className="text-sm md:text-base font-bold text-[#1f2fff] hover:text-[#00eaff] hover:underline"
            >
              Already have an account? Login
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
