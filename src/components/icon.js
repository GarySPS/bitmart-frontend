// src/components/icon.js

import React from "react";

const icons = {
  "arrow-bottom": "M13 5a1 1 0 1 0-2 0v11.586l-5.293-5.293a1 1 0 0 0-1.414 1.414l7 7a1 1 0 0 0 1.414 0l7-7a1 1 0 0 0-1.414-1.414L13 16.586V5z",
  "arrow-left": "M10.707 6.707a1 1 0 0 0-1.414-1.414l-6 6a1 1 0 0 0 0 1.414l6 6a1 1 0 0 0 1.414-1.414L6.414 13H20a1 1 0 1 0 0-2H6.414l4.293-4.293z",
  "swap": "M16.5 13.5h-9a.5.5 0 0 1 0-1h9a.5.5 0 0 1 0 1zm-9-4h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0 0 1zm0 0",
  // Icons for the new bottom navigation bar
  "home": "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5z",

  // --- UPDATED TRADE ICON ---
  "chart": "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  
  // --- UPDATED WALLET ICON ---
  "wallet": "M20 4H4c-1.11 0-2 .89-2 2v12c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z",

  "history": "M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-12h2v4h4v2h-6v-6z",
  "user": "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z",
  
  // (Your other icons are kept below)
  "chart-bar": "M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z",
  "trade": "M16.5 13.5h-9a.5.5 0 0 1 0-1h9a.5.5 0 0 1 0 1zm-9-4h9a.5.5 0 0 0 0-1h-9a.5.5 0 0 0 0 1zm0 0",
  "file-text": "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM16 18H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z",
  "newspaper": "M21 5H3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1zM3 17V7h10v10H3zm12 0h4V7h-4v10zM5 9h6v2H5zm0 4h6v2H5z",
  "info": "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"
};

export default function Icon({ className = "", name, size = 24, title }) {
  const path = icons[name];

  if (!path) return null;

  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={title ? undefined : "true"}
      role="img"
      xmlns="http://www.w.org/2000/svg"
    >
      {title ? <title>{title}</title> : null}
      <path d={path} />
    </svg>
  );
}