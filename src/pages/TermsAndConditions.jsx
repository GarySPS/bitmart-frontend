// src/pages/TermsAndConditions.jsx
import React from "react";

export default function TermsAndConditions() {
  return (
    <div
      className="min-h-screen w-full text-gray-200 pb-24"
      style={{
        background: 'url("/bitmart.jpg") no-repeat center center fixed',
        backgroundSize: "cover",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(120deg, #15192ae0 0%, #181c25bb 70%, #101622cc 100%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div className="relative z-10 max-w-4xl mx-auto px-5 py-10">
        <h1 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-blue-500 to-teal-400 mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: 18 Aug 2025</p>

        <div className="bg-[#151c2e]/80 border border-[#24314a] rounded-2xl p-6 md:p-8 space-y-6 text-sm leading-6">
          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              1. Terms &amp; Conditions
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; A new user
                startup requires <span className="font-semibold">100 USDT</span>.
              </li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              2. Account Security
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Please do not
                disclose your password to others, and the platform will not be
                responsible for any loss caused by it.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Users are not
                recommended to set their birthday password, ID card number, or
                mobile phone number as their withdrawal password or login
                password.
              </li>
              <li>
                <span className="font-semibold">(3)</span>&nbsp; If the user
                forgets the login password or withdrawal password, he/she can
                contact the online customer service to reset it.
              </li>
              <li>
                <span className="font-semibold">(4)</span>&nbsp; Confidentiality
                agreement between the user and the company.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">3. Funds</h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; In order to
                avoid loss of funds, all funds will be processed by the system
                and not manually operated.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; In case of
                accidental loss of funds, the platform will take full
                responsibility. (Just take only BitMart mistake)
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">4. Deposit</h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; The amount of
                top-up is selected by the User. We cannot determine the amount of
                the User&apos;s deposit.
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Users must
                obtain and confirm the address information he/she want to deposit
                from their own trading account before depositing funds.
              </li>
              <li>
                <span className="font-semibold">(3)</span>&nbsp; The platform is
                not responsible for any losses caused by users&apos; incorrect
                enter wallet addresses.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              5. Withdrawal
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; For new users,
                the first withdrawal amount is only $100. After that, as you
                trade more and become an old user, you can withdraw daily limit
                $2000. Withdrawal more than $10000 need to open the account large
                channel. Ensure the safety of funds.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">
              6. Hours of operation
            </h2>
            <ul className="space-y-1">
              <li>
                <span className="font-semibold">(1)</span>&nbsp; Platform opening
                hours: <span className="font-semibold">24/7</span>
              </li>
              <li>
                <span className="font-semibold">(2)</span>&nbsp; Online customer
                service hours: <span className="font-semibold">10:00 to 22:00</span>
              </li>
              <li>
                <span className="font-semibold">(3)</span>&nbsp; Platform
                withdrawal time: <span className="font-semibold">09:00–22:00</span>{" "}
                (UTC-4)
              </li>
              <li>
                <span className="font-semibold">(4)</span>&nbsp; The final
                interpretation right belongs to <span className="font-semibold">BitMart LTD</span>.
              </li>
            </ul>
          </section>

          {/* Contact (keep a simple contact at bottom if needed) */}
          <section>
            <h2 className="text-lg font-semibold text-teal-300 mb-2">Contact</h2>
            <p>
              Support:{" "}
              <a
                href="https://wa.me/16627053615"
                className="text-blue-400 underline"
              >
                WhatsApp +1 662 705 3615
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
