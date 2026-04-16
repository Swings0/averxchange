"use client";

import { useEffect, useState } from "react";

type TickerItem = {
  name: string;
  price: number;
  change: number;
};

const initialData: TickerItem[] = [
  { name: "BTC/USD", price: 62450, change: 2.3 },
  { name: "ETH/USD", price: 3410, change: -1.1 },
  { name: "SOL/USD", price: 148.2, change: 3.6 },
  { name: "BNB/USD", price: 580.9, change: 0.8 },
  { name: "EUR/USD", price: 1.084, change: -0.2 },
  { name: "GOLD", price: 2385, change: 1.2 },
];

export default function CustomTicker() {
  const [data, setData] = useState(initialData);

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) =>
        prev.map((item) => {
          const rand = (Math.random() - 0.5) * 2;

          return {
            ...item,
            price: +(item.price + rand).toFixed(2),
            change: +(item.change + (Math.random() - 0.5)).toFixed(2),
          };
        })
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full overflow-hidden  border-blue-500 border-y-3 bg-white/80 backdrop-blur-md">

      {/* LEFT FADE */}
      <div className="absolute left-0 top-0 h-full w-20 bg-linear-to-r from-white/90 to-transparent z-10" />

      {/* RIGHT FADE */}
      <div className="absolute right-0 top-0 h-full w-20 bg-linear-to-l from-white/90 to-transparent z-10" />

      {/* TICKER */}
      <div className="flex w-max animate-scroll gap-10 px-6 py-2 hover:paused">

        {[...data, ...data].map((item, i) => {
          const isUp = item.change >= 0;

          return (
            <div
              key={i}
              className="flex items-center gap-2 whitespace-nowrap text-xs"
            >
              {/* SYMBOL */}
              <span className="text-gray-900 font-semibold">
                {item.name}
              </span>

              {/* PRICE */}
              <span className="text-gray-700 font-mono">
                ${item.price.toLocaleString()}
              </span>

              {/* CHANGE */}
              <span
                className={`font-medium ${
                  isUp ? "text-green-600" : "text-red-500"
                }`}
              >
                {isUp ? "+" : ""}
                {item.change}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}