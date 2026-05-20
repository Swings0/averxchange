"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bitcoin } from "lucide-react";
import {
  earningsNames,
  earningsCountries,
  earningsAmounts,
} from "@/lib/earnings-data";

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateToast() {
  return {
    name: randomItem(earningsNames),
    country: randomItem(earningsCountries),
    amount: randomItem(earningsAmounts),
  };
}

export default function EarningsToast() {
  const [toast, setToast] = useState<null | {
    name: string;
    country: string;
    amount: number;
  }>(null);

  const [visible, setVisible] = useState(false);

  // ✅ prevent hydration mismatch
  useEffect(() => {
    const first = generateToast();
    setToast(first);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (!toast) return;

    const cycle = () => {
      setVisible(false);

      setTimeout(() => {
        setToast(generateToast());
        setVisible(true);
      }, 900);
    };

    const interval = setInterval(cycle, 7000);

    return () => clearInterval(interval);
  }, [toast]);

  // ✅ prevent server render mismatch completely
  if (!toast) return null;

  return (
    <div className="fixed right-3 top-24 z-50 w-fit max-w-[calc(100vw-1.5rem)]">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div
            key={`${toast.name}-${toast.country}-${toast.amount}`}
            initial={{ opacity: 0, x: 40, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 30, scale: 0.98 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="w-[220px] sm:w-[240px] md:w-[260px] rounded-2xl border border-cyan-400/20 bg-white/10 backdrop-blur-xl shadow-2xl shadow-cyan-900/20"
          >
            <div className="flex items-center gap-2.5 p-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-400/10">
                <Bitcoin className="h-5 w-5 text-cyan-300" />
              </div>

              <div className="leading-tight">
                <p className="text-xs font-semibold text-cyan-300">Earnings</p>

                <p className="text-xs font-medium text-white/90">
                  {toast.name} from{" "}
                  <span className="uppercase text-cyan-300">
                    {toast.country}
                  </span>
                </p>

                <p className="text-sm font-semibold text-white">
                  just earned ${toast.amount.toLocaleString()}.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}