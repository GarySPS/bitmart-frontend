import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { MAIN_API_BASE } from "../config";
import Card from "../components/card";
import BitMartLogo from "../components/BitMartLogo.png";
import ReactCodesInput from "react-codes-input";

/* ---------- Inline Terms modal (updated) ---------- */
function TermsModal({ open, onAgree }) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div className="relative z-10 w-[92%] max-w-2xl bg-[#0f1422] text-gray-200 border border-[#24314a] rounded-2xl shadow-2xl">
        <div className="px-6 py-5 border-b border-[#24314a]">
          <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-500 to-teal-400">
            Terms &amp; Conditions
          </h2>
          <p className="text-xs text-gray-400 mt-1">Last updated: 18 Aug 2025</p>
        </div>

        <div className="max-h-[60vh] overflow-y-auto px-6 py-5 space-y-4 text-sm leading-6">
          <p>
            By tapping <b>Agree</b>, you confirm that you have read and accept BitMart’s
            Terms &amp; Conditions. Key points:
          </p>

          <ol className="list-decimal pl-5 space-y-3">
            <li>
              <b>Terms &amp; Conditions</b> — New user startup requires <b>100 USDT</b>.
            </li>

            <li>
              <b>Account Security</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Do not disclose your password; platform is not responsible for losses caused by disclosure.</li>
                <li>Avoid using birthday, ID number, or phone number as withdrawal/login passwords.</li>
                <li>If you forget your password(s), contact online support to reset.</li>
                <li>Confidentiality agreement applies between user and company.</li>
              </ul>
            </li>

            <li>
              <b>Funds</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>All funds are processed by the system (no manual operations) to avoid losses.</li>
                <li>Accidental loss due to <b>BitMart’s own mistake</b>: the platform takes full responsibility.</li>
              </ul>
            </li>

            <li>
              <b>Deposit</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Top-up amount is chosen by the user.</li>
                <li>Get and confirm the deposit address from your own trading account before depositing.</li>
                <li>Platform is not responsible for losses caused by an incorrect wallet address entered by the user.</li>
              </ul>
            </li>

            <li>
              <b>Withdrawal</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>First withdrawal for new users: <b>$100</b>.</li>
                <li>As you trade more and become an old user: daily limit <b>$2,000</b>.</li>
                <li>Withdrawals &gt; <b>$10,000</b> require opening a large-channel account for fund safety.</li>
              </ul>
            </li>

            <li>
              <b>Hours of Operation</b>
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Platform opening hours: <b>27/4</b>.</li>
                <li>Online customer service: <b>10:00–22:00</b>.</li>
                <li>Withdrawal time: <b>09:00–22:00</b> (UTC-4).</li>
                <li>Final interpretation right belongs to <b>BitMart LTD</b>.</li>
              </ul>
            </li>
          </ol>

          <p className="text-xs text-gray-400">
            Read the full version any time at{" "}
            <a href="/terms" className="underline text-blue-300">
              Terms &amp; Conditions
            </a>
            .
          </p>
        </div>

        <div className="px-6 py-5 border-t border-[#24314a] flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onAgree}
            className="h-11 px-6 rounded-xl font-extrabold tracking-wide shadow-md transition-all"
            style={{
              background:
                "linear-gradient(90deg,#00eaff 0%,#1f2fff 53%,#ffd700 100%)",
              color: "#232836",
              letterSpacing: 1.2,
              boxShadow: "0 2px 16px #1f2fff14, 0 1.5px 0 #ffd70044",
              border: "none",
              outline: "none",
              fontSize: "1.05rem",
            }}
          >
            Agree &amp; Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [showTerms, setShowTerms] = useState(false);
  const pinWrapperRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.email) setEmail(location.state.email);
  }, [location]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setError("");
    setSuccess("");
    setResendSuccess("");
    if (!email || otp.length < 6) {
      setError("Enter your email and the 6-digit code.");
      return;
    }
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect OTP. Please try again.");
        setOtp("");
        return;
      }
      setSuccess(data.message || "Email verified!");
      // Instead of navigating to login, open Terms modal immediately
      setShowTerms(true);
    } catch (err) {
      setError("Verification failed. Try again.");
      setOtp("");
    }
  };

  const handleResend = async () => {
    setError("");
    setResendSuccess("");
    setResendLoading(true);
    try {
      const res = await fetch(`${MAIN_API_BASE}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to resend code.");
      } else {
        setResendSuccess("OTP code resent! Check your email.");
        setResendTimer(60);
      }
    } catch (err) {
      setError("Failed to resend code. Try again.");
    }
    setResendLoading(false);
  };

 const onAgree = () => {
   navigate("/", { replace: true }); // go home; nothing stored
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
      <div
        className="absolute inset-0 bg-[#181c2cbb] backdrop-blur-[2px]"
        style={{ zIndex: 1 }}
      />
      <div className="relative z-10 w-full flex flex-col items-center">
        <Card
          className="rounded-2xl shadow-2xl border-0 bg-white/90 mx-auto"
          style={{
            width: "100%",
            maxWidth: "400px",
            minWidth: 0,
            padding: "2.1rem 2rem 1.7rem 2rem",
            margin: "0 auto",
            boxSizing: "border-box",
          }}
        >
          <div className="flex items-center justify-center w-full mb-6 mt-[-10px]">
            <img
              src={BitMartLogo}
              alt="BitMart Logo"
              className="block select-none pointer-events-none"
              style={{
                width: "88%",
                maxWidth: 190,
                minWidth: 110,
                height: "auto",
                objectFit: "contain",
              }}
              draggable={false}
            />
          </div>
          <div
            className="mb-1 text-2xl font-extrabold text-center text-[#232836]"
            style={{ letterSpacing: 1.1 }}
          >
            Check your email to verify
          </div>
          <p
            className="text-base text-[#1f2fff] text-center mb-6 font-medium tracking-wide"
            style={{ opacity: 0.74 }}
          >
            Enter the 6-digit code sent to your email below.
          </p>
          <form onSubmit={handleVerify}>
            <input
              className="mb-4 w-full py-3 px-4 rounded-xl border border-[#bee3f8] bg-[#eaf1fb] text-base font-medium text-[#232836] focus:outline-none focus:border-[#1f2fff] transition"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={!!email}
              style={{
                maxWidth: 290,
                fontSize: "1.06rem",
                marginLeft: "auto",
                marginRight: "auto",
                display: "block",
              }}
            />

            <div className="flex justify-center mb-3">
              <ReactCodesInput
                classNameComponent="react-codes-custom"
                classNameWrapper="flex justify-center gap-2"
                classNameCodeWrapper="w-11 h-12 flex-none border-0"
                classNameEnteredValue="text-2xl font-bold text-[#1f2fff] tracking-widest"
                classNameCode="border-2 border-[#bee3f8] bg-[#f9fbfd] rounded-xl text-center text-2xl focus:border-[#00eaff] transition"
                classNameCodeWrapperFocus="shadow-[0_0_0_2px_#00eaff88]"
                initialFocus={true}
                wrapperRef={pinWrapperRef}
                placeholder="______"
                id="pin"
                codeLength={6}
                type="number"
                hide={false}
                value={otp}
                onChange={setOtp}
                inputMode="numeric"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-500 rounded-md px-3 py-2 text-center text-base w-full max-w-[290px] mx-auto mb-2">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 rounded-md px-3 py-2 text-center text-base w-full max-w-[290px] mx-auto mb-2">
                {success}
              </div>
            )}
            {resendSuccess && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-md px-3 py-2 text-center text-base w-full max-w-[290px] mx-auto mb-2">
                {resendSuccess}
              </div>
            )}

            <button
              className="h-12 rounded-xl font-extrabold text-lg tracking-wide shadow-md transition-all block mx-auto mt-2"
              type="submit"
              style={{
                width: "100%",
                maxWidth: 290,
                minWidth: 110,
                background:
                  "linear-gradient(90deg,#00eaff 0%,#1f2fff 53%,#ffd700 100%)",
                color: "#232836",
                letterSpacing: 1.2,
                boxShadow: "0 2px 16px #1f2fff14, 0 1.5px 0 #ffd70044",
                border: "none",
                outline: "none",
                fontSize: "1.1rem",
              }}
              disabled={otp.length < 6 || !email}
              onMouseDown={(e) => {
                e.target.style.filter = "brightness(0.93)";
              }}
              onMouseUp={(e) => {
                e.target.style.filter = "";
              }}
              onMouseLeave={(e) => {
                e.target.style.filter = "";
              }}
            >
              Verify
            </button>
          </form>

          <div className="flex justify-center items-center mt-4 mb-2 text-base text-[#1f2fff] font-bold">
            <button
              type="button"
              onClick={handleResend}
              className="hover:underline disabled:opacity-60"
              disabled={resendLoading || resendTimer > 0}
              style={{
                fontSize: "1rem",
                padding: 0,
                background: "none",
                border: "none",
                color: "#1f2fff",
                cursor: resendLoading || resendTimer > 0 ? "default" : "pointer",
              }}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : resendLoading
                ? "Sending..."
                : "Resend OTP"}
            </button>
          </div>

          <div className="flex justify-center items-center mt-7 text-base text-[#1f2fff] font-bold">
            <Link to="/login" className="hover:underline hover:text-[#00eaff] transition">
              Back to login
            </Link>
          </div>
        </Card>
      </div>

      {/* Glow + responsive tweaks */}
      <style>
        {`
        @media (max-width: 480px) {
          .responsive-card { max-width: 340px !important; padding-left: 1.1rem !important; padding-right: 1.1rem !important; }
          .responsive-input { max-width: 200px !important; font-size: 0.98rem !important; }
          .responsive-button { max-width: 200px !important; font-size: 1rem !important; }
        }
        @keyframes logoGlow { 0% { filter: drop-shadow(0 0 16px #00eaff99); } 48% { filter: drop-shadow(0 0 52px #00eaff66); } 100% { filter: drop-shadow(0 0 16px #00eaff99); } }
        img[alt="BitMart Logo"] { animation: logoGlow 2.8s ease-in-out infinite alternate; }
        `}
      </style>

      {/* Terms modal */}
      <TermsModal open={showTerms} onAgree={onAgree} />
    </div>
  );
}
