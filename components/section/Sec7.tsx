"use client";

import { useEffect, useRef } from "react";

const Sec7 = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous (important for hot reload)
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://widgets.tradingview-widget.com/w/en/tv-market-summary.js";
    script.type = "module";
    script.async = true;

    containerRef.current.appendChild(script);

    const widget = document.createElement("tv-market-summary");
    widget.setAttribute("direction", "horizontal");
    widget.setAttribute("color-theme", "white");

    containerRef.current.appendChild(widget);
  }, []);

  return (
    <section className="w-full py-24 bg-[#020617] relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(radial_at_center,rgba(0,255,255,0.08),transparent_70%)]" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
       
        <div className="text-center mb-12">
          <p className="text-teal-400 tracking-widest text-sm mb-3">
            LIVE MARKET DATA
          </p>

          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Track <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-teal-600">Global Markets</span> in Real-Time
          </h2>

          <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
            Stay updated with real-time financial insights and market trends.
          </p>
        </div>

  
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 md:p-6 shadow-lg">
          <div ref={containerRef} className="w-full" />
        </div>
      </div>
    </section>
  );
};

export default Sec7;