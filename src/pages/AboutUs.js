import React from "react";
import BitMartLogo from "../components/BitMartLogo.png";
import { useTranslation } from "react-i18next";

/* ---- Data (unchanged) ---- */
const team = [
  { name: "Ethan David", titleKey: "team_ceo", img: "/assets/avatar3.png", descKey: "team_ceo_desc" },
  { name: "Sophia Coppola", titleKey: "team_cto", img: "/assets/avatar2.png", descKey: "team_cto_desc" },
  { name: "Victor Wan", titleKey: "team_compliance", img: "/assets/avatar4.png", descKey: "team_compliance_desc" }
];

const certs = [
  { name: "ISO 27001:2022", img: "/assets/iso27001.png" },
  { name: "CyberTrust Award", img: "/assets/cybertrust.png" },
  { name: "KYC Verified", img: "/assets/kyc.png" },
  { name: "Smart Contract Audited", img: "/assets/smartcontract.png" }
];

/* ---- Small UI helpers ---- */
const GradientTitle = ({ children, className = "" }) => (
  <h2
    className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-sky-400 to-teal-300 tracking-tight ${className}`}
  >
    {children}
  </h2>
);

const GlassCard = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl shadow-[0_10px_35px_rgba(0,0,0,0.35)] ${className}`}>
    {children}
  </div>
);

export default function AboutUs() {
  const { t } = useTranslation();

return (
  // Added pb-24 to give bottom space so footer links stay above navbar
  <div className="relative z-10 w-full max-w-6xl mx-auto px-4 md:px-6 pt-10 pb-24">
    {/* Header */}
    <div className="flex items-center gap-3 mb-6">
      <img src={BitMartLogo} alt="BitMart" className="h-10 md:h-12 drop-shadow-xl" />
      <span className="px-3 py-1 rounded-full bg-white/10 text-white/90 text-xs font-semibold border border-white/10">
        {t("about_company_overview")}
      </span>
    </div>

    {/* Hero */}
    <div className="grid grid-cols-1 lg:grid-cols-[1.1fr,0.9fr] gap-6 lg:gap-10">
      <GlassCard className="p-6 md:p-8">
        <GradientTitle className="text-3xl md:text-4xl lg:text-5xl leading-tight">
          {t("about_trade_future_today")}
        </GradientTitle>
        <p className="mt-4 text-base md:text-lg text-white/85 leading-relaxed">
          {t("about_hero")}<br />
          {t("about_hero2")}<br />
          {t("about_hero3")}
        </p>
        <GradientTitle className="mt-6 text-2xl md:text-3xl">{t("about_trade_smarter")}</GradientTitle>
        <p className="mt-3 text-white/80">{t("about_join_arena")}</p>
        <GradientTitle className="mt-8 text-2xl md:text-3xl">{t("about_why_title")}</GradientTitle>
        <p className="mt-3 text-white/80">{t("about_why_desc")}</p>
      </GlassCard>

      <GlassCard className="p-6 md:p-8 flex flex-col justify-center">
        <GradientTitle className="text-3xl md:text-4xl mb-2">{t("about_mission")}</GradientTitle>
        <p className="text-white/90 font-semibold">{t("about_mission_1")}</p>
        <p className="mt-3 text-white/75 leading-relaxed">{t("about_mission_2")}</p>
        {/* Quick stats */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { k: "10M+", v: t("users", "Users") },
            { k: "150+", v: t("countries", "Countries") },
            { k: "24/7", v: t("support", "Support") }
          ].map((s) => (
            <div key={s.k} className="rounded-xl bg-white/5 border border-white/10 p-4 text-center">
              <div className="text-2xl font-black text-white">{s.k}</div>
              <div className="text-xs text-white/70">{s.v}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>

    {/* Company overview + values */}
    <div className="mt-10 grid grid-cols-1 lg:grid-cols-[1.2fr,0.8fr] gap-6 lg:gap-10">
      <GlassCard className="p-6 md:p-8">
        <h3 className="text-teal-300 text-2xl md:text-3xl font-extrabold mb-3">
          {t("about_company_overview")}
        </h3>
        <p className="text-white/90 font-semibold mb-2">{t("about_leading_force")}</p>
        <p className="text-white/75 leading-relaxed">{t("about_founded")}</p>
      </GlassCard>

      <GlassCard className="p-6 md:p-8">
        <h3 className="text-blue-300 text-xl md:text-2xl font-extrabold mb-5">{t("about_core_values")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="font-bold text-yellow-300">{t("about_integrity")}</div>
            <p className="text-white/70 text-sm">{t("about_integrity_desc")}</p>
          </div>
          <div>
            <div className="font-bold text-teal-300">{t("about_security")}</div>
            <p className="text-white/70 text-sm">{t("about_security_desc")}</p>
          </div>
          <div>
            <div className="font-bold text-sky-300">{t("about_innovation")}</div>
            <p className="text-white/70 text-sm">{t("about_innovation_desc")}</p>
          </div>
          <div>
            <div className="font-bold text-amber-300">{t("about_empowerment")}</div>
            <p className="text-white/70 text-sm">{t("about_empowerment_desc")}</p>
          </div>
        </div>
      </GlassCard>
    </div>

    {/* Team */}
    <div className="mt-12">
      <GradientTitle className="text-2xl md:text-3xl">{t("about_team")}</GradientTitle>
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {team.map((m) => (
          <GlassCard key={m.name} className="p-6 flex flex-col items-center text-center">
            <img
              src={m.img}
              alt={m.name}
              loading="lazy"
              className="w-28 h-28 rounded-full border-4 border-teal-400/70 shadow-md object-cover mb-3"
            />
            <div className="text-white font-bold text-lg">{m.name}</div>
            <div className="text-sky-300 text-sm font-semibold mb-2">{t(m.titleKey)}</div>
            <p className="text-white/70 text-sm leading-relaxed">{t(m.descKey)}</p>
          </GlassCard>
        ))}
      </div>
    </div>

    {/* Certifications */}
    <div className="mt-14">
      <h3 className="text-center text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 drop-shadow-md tracking-wide">
        {t("about_certifications")}
      </h3>
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10 justify-items-center">
        {certs.map((c) => (
          <div key={c.name} className="flex flex-col items-center">
            <img src={c.img} alt={c.name} loading="lazy" className="h-24 w-24 md:h-28 md:w-28 object-contain mb-2" />
            <div className="text-xs md:text-sm text-yellow-300/90 font-medium text-center">{c.name}</div>
          </div>
        ))}
      </div>
      <p className="text-center text-white/60 text-xs mt-6 max-w-2xl mx-auto">{t("about_certified")}</p>
    </div>

    {/* HQ / Contact */}
    <GlassCard className="mt-14 p-6 md:p-8">
      <h3 className="text-teal-300 text-xl md:text-2xl font-extrabold mb-3">{t("about_headquarters")}</h3>
      <div className="text-white/85 space-y-2">
        <div>
          <span className="font-semibold">{t("about_company")}</span>
          <br />
          Marina Bay Financial Centre Tower 2,
          <br />
          10 Marina Blvd, Singapore 018983.
          <br />
          +65 2936 0430
          <br />
          +65 1665 7939
        </div>
        <div>
          {t("about_support")}:{" "}
          <a
            href="https://wa.me/16627053615"
            target="_blank"
            rel="noreferrer"
            className="text-sky-300 underline underline-offset-2 hover:text-sky-200"
          >
            Telegram @bitmartsingapore
          </a>
        </div>
      </div>
    </GlassCard>

    {/* Footer links */}
    <div className="mt-10 flex justify-center gap-6 text-sm">
      <a href="/terms" className="text-white/80 hover:text-white underline underline-offset-2">
        Terms &amp; Conditions
      </a>
      <a
        href="https://wa.me/16627053615"
        target="_blank"
        rel="noreferrer"
        className="text-white/80 hover:text-white underline underline-offset-2"
      >
        Support
      </a>
    </div>
  </div>
);
}
