// src/components/BeautifulLoader.js
import React from "react";

export default function BeautifulLoader({ text = "Refreshing Price" }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px]">
      <svg className="animate-spin h-14 w-14 text-blue-400 mb-4" viewBox="0 0 50 50">
        <circle className="opacity-25" cx="25" cy="25" r="20" stroke="#222c40" strokeWidth="6" fill="none"/>
        <circle
          className="opacity-90"
          cx="25"
          cy="25"
          r="20"
          stroke="#4f9fff"
          strokeWidth="6"
          strokeDasharray="100"
          strokeDashoffset="30"
          fill="none"
        />
      </svg>
      <div className="text-lg font-bold text-blue-200 animate-pulse">{text}</div>
    </div>
  );
}
