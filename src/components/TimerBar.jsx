import React, { useEffect, useRef, useState } from "react";

export default function TimerBar({ endAt, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(() => {
    const secs = Math.ceil((endAt - Date.now()) / 1000);
    return secs > 0 ? secs : 0;
  });

  const intervalRef = useRef(null);
  const initialDuration = useRef(timeLeft);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      const remaining = Math.ceil((endAt - Date.now()) / 1000);
      setTimeLeft(remaining > 0 ? remaining : 0);

      if (remaining <= 0) {
        clearInterval(intervalRef.current);
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [endAt, onComplete]);

  const percent =
    initialDuration.current > 0
      ? (timeLeft / initialDuration.current) * 100
      : 0;

  return (
    <div className="w-full max-w-[290px]">
      {/* CHANGED: text-theme-primary to text-white */}
      <div className="mb-2 text-4xl font-extrabold text-white text-center">
        {timeLeft}s
      </div>
      {/* CHANGED: Swapped custom theme colors for standard ones for better contrast */}
      <div className="relative w-full h-6 bg-gray-800 rounded-full overflow-hidden shadow-inner border border-gray-700">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] via-[#00ffcc] to-[#2474ff] rounded-full shadow-lg transition-all duration-1000 linear"
          style={{
            width: `${percent}%`,
          }}
        />
        <div
          // CHANGED: text-theme-primary to text-white
          className="absolute inset-0 flex items-center justify-center font-semibold text-white text-lg"
          style={{ letterSpacing: "1px" }}
        >
          Trading...
        </div>
      </div>
    </div>
  );
}