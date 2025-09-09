import React from "react";

export default function GuidePage() {
  return (
    <div className="min-h-screen flex flex-col items-center py-10 px-2 bg-gradient-to-br from-[#181b25] via-[#191e29] to-[#181b25]">
      <div className="w-full max-w-lg bg-white/90 rounded-2xl shadow-xl p-6 md:p-10 flex flex-col items-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center text-blue-700">
          How to Install BitMart on iPhone
        </h1>
        <ol className="w-full flex flex-col gap-8">
          {/* Step 1 */}
          <li className="flex flex-col items-center">
            <div className="text-lg font-semibold mb-2 text-gray-900">
              Step 1: Tap the <span className="font-bold">Share</span> button
            </div>
            <img
              src="/ios-step1.png"
              alt="Step 1: Tap Share button"
              className="w-full rounded-xl border mb-2 shadow"
              style={{ maxWidth: 320 }}
            />
            <p className="text-center text-gray-600">
              At the bottom of Safari, tap the <span className="font-bold">Share</span> icon (the square with an arrow pointing up).
            </p>
          </li>
          {/* Step 2 */}
          <li className="flex flex-col items-center">
            <div className="text-lg font-semibold mb-2 text-gray-900">
              Step 2: Tap <span className="font-bold">Add to Home Screen</span>
            </div>
            <img
              src="/ios-step2.png"
              alt="Step 2: Add to Home Screen"
              className="w-full rounded-xl border mb-2 shadow"
              style={{ maxWidth: 320 }}
            />
            <p className="text-center text-gray-600">
              Scroll down and find <span className="font-bold">Add to Home Screen</span>. Tap it.
            </p>
          </li>
          {/* Step 3 */}
          <li className="flex flex-col items-center">
            <div className="text-lg font-semibold mb-2 text-gray-900">
              Step 3: Tap <span className="font-bold">Add</span>
            </div>
            <img
              src="/ios-step3.png"
              alt="Step 3: Confirm Add"
              className="w-full rounded-xl border mb-2 shadow"
              style={{ maxWidth: 320 }}
            />
            <p className="text-center text-gray-600">
              Tap <span className="font-bold">Add</span> at the top right.  
              BitMart will appear on your home screen like an app!
            </p>
          </li>
        </ol>
        <div className="mt-10 text-center text-gray-500">
          Having trouble?  
          <a
            href="mailto:support@bitmart.top"
            className="ml-2 underline text-blue-600"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
