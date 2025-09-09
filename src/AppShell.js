import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TradePage from './pages/TradePage';
import Dashboard from './pages/Dashboard';
import TradeHistory from './pages/TradeHistory';
import ProfilePage from './pages/ProfilePage';
import WalletPage from "./pages/WalletPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyOTPPage from "./pages/VerifyOTPPage";
import AboutUs from "./pages/AboutUs";
import NavBar from './components/navbar';
import BottomNavBar from './components/BottomNavBar';
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NewsPage from "./components/Newspage";
import GuidePage from './pages/GuidePage'; 
import TermsAndConditions from "./pages/TermsAndConditions";
import './i18n';

function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function AppShell() {
  const { t } = useTranslation();
  const location = useLocation();
  const hideHeader = ["/login", "/signup", "/verify-otp", "/forgot"].some((p) =>
  location.pathname.startsWith(p)
);

  const [showIOSModal, setShowIOSModal] = useState(false);

  const modalStyles = {
    background: isDarkMode() ? "#191c24" : "white",
    color: isDarkMode() ? "#fff" : "#222",
    padding: 24,
    borderRadius: 16,
    maxWidth: 340,
    width: "90vw",
    textAlign: "center",
    boxShadow: "0 6px 24px 0 rgba(0,0,0,.13)",
    transition: "opacity 0.3s",
    position: "relative"
  };

  return (
    <div className="h-screen w-full relative">
      <div
        style={{
          position: "fixed",
          zIndex: -1,
          inset: 0,
          background: `linear-gradient(120deg, #15192ae0 0%, #181c25bb 70%, #101622cc 100%), url("/bitmart.jpg") center center / cover no-repeat fixed`,
          pointerEvents: "none",
        }}
      />
      
      <div className={`h-full w-full ${hideHeader ? "flex flex-col" : "grid grid-rows-[auto_1fr_auto]"}`}>
        
        {!hideHeader && <NavBar />}

        <main className="overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/trade-history" element={<TradeHistory />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/verify-otp" element={<VerifyOTPPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/forgot" element={<ForgotPasswordPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/guide" element={<GuidePage />} />
            <Route path="/terms" element={<TermsAndConditions />} />
          </Routes>
        </main>
        
        {!hideHeader && <BottomNavBar />}
      </div>

      {showIOSModal && (
        <div
          style={{
            position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
            background: "rgba(0,0,0,0.7)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 9999,
            animation: "fadein .3s"
          }}
          onClick={() => setShowIOSModal(false)}
        >
          <div
            style={modalStyles}
            onClick={e => e.stopPropagation()}
          >
            <h2 className="text-lg font-bold mb-2">{t('installOnIOS')}</h2>
            <ol style={{ textAlign: "left", margin: "16px 0", fontSize: 15, lineHeight: "1.6" }}>
              <li>{t('step1')} <span role="img" aria-label="Share">🔗</span></li>
              <li>{t('step2')}</li>
              <li>{t('step3')}</li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              style={{
                background: "#2563eb", color: "white", padding: "8px 16px",
                borderRadius: 8, border: "none", marginTop: 10, fontWeight: 500,
                fontSize: 15, boxShadow: "0 2px 10px 0 rgba(37,99,235,0.08)",
                transition: "background 0.2s"
              }}
              className="hover:bg-blue-600"
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppShell;