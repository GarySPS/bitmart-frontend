import React, { useState } from "react";
import { MAIN_API_BASE } from '../config';
import { useNavigate } from "react-router-dom";
import BitMartLogo from "../components/BitMartLogo.png";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState(1); // 1: email, 2: otp+password, 3: done
  const [otp, setOtp] = useState("");
  const [newPw, setNewPw] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Request OTP
  const handleRequestOtp = async e => {
    e.preventDefault();
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setStep(2);
        setMsg("OTP sent to your email.");
      } else {
        setErr(data.error || "Failed to send OTP.");
      }
    } catch (err) {
      setLoading(false);
      setErr("Network error.");
    }
  };

  // Step 2: Reset password with OTP
  const handleResetPw = async e => {
    e.preventDefault();
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword: newPw })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setStep(3);
        setMsg("Password changed! You can now log in.");
      } else {
        setErr(data.error || "Failed to reset password.");
      }
    } catch {
      setLoading(false);
      setErr("Network error.");
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setMsg(""); setErr(""); setLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        setMsg("OTP resent to your email.");
      } else {
        setErr(data.error || "Failed to resend OTP.");
      }
    } catch {
      setLoading(false);
      setErr("Network error.");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative px-2 py-4"
      style={{
        backgroundImage: 'url("/bitmart.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Blurred overlay */}
      <div className="absolute inset-0 bg-[#181c2cbb] backdrop-blur-[2px]" style={{ zIndex: 1 }} />
      {/* Centered Card */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <div
          className="w-full rounded-2xl shadow-2xl border-0 bg-white/90 mx-auto"
          style={{
            maxWidth: "410px",
            minWidth: 0,
            padding: "2.2rem 2rem 1.8rem 2rem",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          {/* Logo with Glow */}
          <div className="flex items-center justify-center w-full mb-6 mt-[-10px]">
            <img
              src={BitMartLogo}
              alt="BitMart Logo"
              className="block select-none pointer-events-none"
              style={{
                width: "90%",
                maxWidth: 180,
                minWidth: 110,
                height: "auto",
                objectFit: "contain"
              }}
              draggable={false}
            />
          </div>
          <h2 className="font-extrabold text-2xl mb-7 text-[#1f2fff] text-center tracking-tight">
            Reset Password
          </h2>

          {/* --- Step 1: Email --- */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-5 items-center w-full">
              <div className="w-full flex flex-col items-center">
                <label className="block text-lg font-bold text-[#232836] mb-1 w-full text-left">Email</label>
                <input
                  type="email"
                  className="w-full h-12 rounded-xl px-4 bg-[#eaf1fb] text-base font-medium border border-[#c9e3fc] focus:border-[#00eaff] focus:ring-2 focus:ring-[#1f2fff22] outline-none transition"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  autoFocus
                  style={{ maxWidth: 300, fontSize: "1.05rem" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl font-extrabold text-lg tracking-wide shadow-md transition-all block mx-auto w-full"
                style={{
                  width: "100%",
                  maxWidth: 300,
                  minWidth: 110,
                  background: "linear-gradient(90deg,#00eaff 0%,#1f2fff 53%,#ffd700 100%)",
                  color: "#232836",
                  letterSpacing: 1.2,
                  boxShadow: "0 2px 16px #1f2fff14, 0 1.5px 0 #ffd70044",
                  border: "none",
                  outline: "none",
                  fontSize: "1.08rem"
                }}
                onMouseDown={e => { e.target.style.filter = "brightness(0.93)"; }}
                onMouseUp={e => { e.target.style.filter = ""; }}
                onMouseLeave={e => { e.target.style.filter = ""; }}
              >
                {loading ? "Sending OTP..." : "Request OTP"}
              </button>
            </form>
          )}

          {/* --- Step 2: OTP + new password --- */}
          {step === 2 && (
            <form onSubmit={handleResetPw} className="flex flex-col gap-5 items-center w-full">
              <div className="w-full flex flex-col items-center">
                <label className="block text-lg font-bold text-[#232836] mb-1 w-full text-left">OTP Code</label>
                <input
                  type="text"
                  className="w-full h-12 rounded-xl px-4 bg-[#eaf1fb] text-base font-medium border border-[#c9e3fc] focus:border-[#00eaff] transition outline-none"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  required
                  placeholder="Enter OTP sent to email"
                  autoFocus
                  maxLength={8}
                  style={{ maxWidth: 210, fontSize: "1.03rem" }}
                />
                <button
                  type="button"
                  className="mt-1 text-sm text-[#1f2fff] hover:underline"
                  onClick={handleResendOtp}
                  disabled={loading}
                  style={{
                    background: "none", border: "none", padding: 0, fontWeight: 600, marginLeft: 2
                  }}
                >
                  Resend OTP
                </button>
              </div>
              <div className="w-full flex flex-col items-center">
                <label className="block text-lg font-bold text-[#232836] mb-1 w-full text-left">New Password</label>
                <input
                  type="password"
                  className="w-full h-12 rounded-xl px-4 bg-[#eaf1fb] text-base font-medium border border-[#c9e3fc] focus:border-[#ffd700] focus:ring-2 focus:ring-[#ffd70044] outline-none transition"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  required
                  placeholder="Enter new password"
                  style={{ maxWidth: 300, fontSize: "1.05rem" }}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="h-12 rounded-xl font-extrabold text-lg tracking-wide shadow-md transition-all block mx-auto w-full"
                style={{
                  width: "100%",
                  maxWidth: 300,
                  minWidth: 110,
                  background: "linear-gradient(90deg,#00eaff 0%,#1f2fff 53%,#ffd700 100%)",
                  color: "#232836",
                  letterSpacing: 1.2,
                  boxShadow: "0 2px 16px #1f2fff14, 0 1.5px 0 #ffd70044",
                  border: "none",
                  outline: "none",
                  fontSize: "1.08rem"
                }}
                onMouseDown={e => { e.target.style.filter = "brightness(0.93)"; }}
                onMouseUp={e => { e.target.style.filter = ""; }}
                onMouseLeave={e => { e.target.style.filter = ""; }}
              >
                {loading ? "Changing..." : "Change Password"}
              </button>
            </form>
          )}

          {/* --- Step 3: Done --- */}
          {step === 3 && (
            <div className="text-center space-y-6">
              <div className="text-green-600 font-bold text-lg">{msg}</div>
              <button
                className="h-12 rounded-xl font-extrabold text-lg tracking-wide shadow-md transition-all block mx-auto w-full"
                style={{
                  width: "100%",
                  maxWidth: 260,
                  minWidth: 100,
                  background: "linear-gradient(90deg,#00eaff 0%,#1f2fff 53%,#ffd700 100%)",
                  color: "#232836",
                  letterSpacing: 1.2,
                  boxShadow: "0 2px 16px #1f2fff14, 0 1.5px 0 #ffd70044",
                  border: "none",
                  outline: "none",
                  fontSize: "1.06rem"
                }}
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          )}

          {(msg || err) && step !== 3 && (
            <div className={`mt-5 text-center rounded-md py-2 px-4 ${msg ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
              {msg || err}
            </div>
          )}
        </div>
      </div>
      {/* Logo Glow Animation */}
      <style>
        {`
        @media (max-width: 480px) {
          .responsive-card {
            max-width: 340px !important;
            padding-left: 1.1rem !important;
            padding-right: 1.1rem !important;
          }
        }
        @keyframes logoGlow {
          0% { filter: drop-shadow(0 0 16px #00eaff99); }
          48% { filter: drop-shadow(0 0 52px #00eaff66); }
          100% { filter: drop-shadow(0 0 16px #00eaff99); }
        }
        img[alt="BitMart Logo"] {
          animation: logoGlow 2.8s ease-in-out infinite alternate;
        }
        `}
      </style>
    </div>
  );
}
