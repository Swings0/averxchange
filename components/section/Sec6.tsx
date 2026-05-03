"use client";

import { useEffect, useState } from "react";
import {
  transactionNames,
  transactionGateways,
  transactionAmounts,
} from "@/lib/live-transactions-data";

const randomItem = <T,>(arr: T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const randomAmount = () => {
  const amount =
    transactionAmounts[
      Math.floor(Math.random() * transactionAmounts.length)
    ];

  return `$ ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const randomDate = () =>
  new Date().toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

const generateItem = () => ({
  id: crypto.randomUUID(),
  name: randomItem(transactionNames),
  amount: randomAmount(),
  gateway: randomItem(transactionGateways),
  date: randomDate(),
});

const getRandomInterval = () => {
  const base = 12;
  const variance = Math.floor(Math.random() * 5) - 2; // -2 to +2
  return (base + variance) * 1000; // ~10–14 seconds
};

const Sec6 = () => {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(Array.from({ length: 6 }).map(generateItem));

    let timeout: ReturnType<typeof setTimeout>;

    const loop = () => {
      timeout = setTimeout(() => {
        setData((prev) => {
          const newItem = generateItem();
          return [newItem, ...prev].slice(0, 8);
        });

        loop();
      }, getRandomInterval());
    };

    loop();

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="relative py-24 bg-[#020617] text-white overflow-hidden">

      <div className="pointer-events-none absolute top-0 left-0 w-full h-64 bg-linear-to-b from-transparent via-[#020617]/60 to-[#020617] z-10" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,200,0.05),transparent_60%)]" />

      <div className="relative max-w-6xl mx-auto px-6 z-40">

        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-bold">
            Live{" "}
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-700">
              Transactions
            </span>
          </h2>

          <p className="text-gray-400 mt-3 text-sm">
            Real-time deposits happening on the platform
          </p>
        </div>

        <div className="rounded-2xl overflow-hidden border border-cyan-400/20 bg-white/5 backdrop-blur-xl">

          <div className="grid grid-cols-4 px-6 py-4 bg-linear-to-r from-cyan-400/90 via-emerald-400/80 to-emerald-500/90 text-black text-sm font-semibold">
            <span>Name</span>
            <span>Amount</span>
            <span>Gateway</span>
            <span className="text-right">Time</span>
          </div>

          {data.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-4 px-6 py-5 text-sm border-t border-white/5 hover:bg-white/5 transition duration-300"
            >
              <span className="text-gray-300">{item.name}</span>
              <span className="text-white">{item.amount}</span>
              <span className="text-gray-400">{item.gateway}</span>
              <span className="text-gray-500 text-right">{item.date}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Sec6;