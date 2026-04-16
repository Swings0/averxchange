'use client'

import { ConstellationBackground } from "../ui/constellation"
import Image from "next/image"

const Sec1 = () => {
  return (
    <main className="relative py-32 px-6 lg:px-8">

      {/* dark overlay like Hero */}
      <div className="absolute inset-0 bg-black/50"></div>

      <div className="relative z-20 flex flex-col lg:flex-row lg:space-x-20 items-start lg:items-center">

        {/* LEFT TEXT SECTION */}
        <div className="space-y-6 max-w-2xl">

          <h1 className="text-sm md:text-lg text-gray-300 font-manrope tracking-wide">
            About Us
          </h1>

          <h2 className="text-3xl lg:text-5xl font-bold font-inter text-white leading-tight">
            Welcome to <br />
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-900">
              AverExchange
            </span>
          </h2>

          <p className="text-gray-300 leading-relaxed text-sm font-manrope">
            Our company has spent the past six years developing advanced tools in the field of
            cryptocurrency analytics and algorithmic trading systems. Today, our team consists of
            experienced IT professionals focused on building innovative financial technology solutions.
            <br />
            We have developed an intelligent trading system designed to analyze market patterns and
            assist in identifying potential opportunities across different market conditions, including
            both rising and falling trends in the cryptocurrency market.
            <br /><br />
            This technology is built to support data-driven decision-making through automated analysis
            and real-time market monitoring. While no system can guarantee profits, our goal is to
            provide users with improved insights and structured trading support.
            <br />
            As awareness of automated trading tools continues to grow globally, we remain committed to
            transparency, continuous improvement, and responsible use of technology in financial markets.
          </p>

          <button className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white font-semibold font-manrope py-3 px-6 rounded-lg hover:scale-95 transform transition-transform duration-300">
            Learn More
          </button>
        </div>

        {/* RIGHT IMAGE SECTION */}
        <div className="mt-12 lg:mt-0 w-full flex justify-center lg:justify-end">

          <div className="relative group">

            {/* glow effect */}
            <div className="absolute -inset-2 bg-cyan-500/20 blur-2xl rounded-2xl opacity-60 group-hover:opacity-80 transition"></div>

            <Image
              src="/About0.jpg"
              alt="About AverExchange"
              width={500}
              height={500}
              className="relative shadow-2xl border-4 border-cyan-500/90 rounded-bl-full rounded-tr-full "
            />

          </div>

        </div>

      </div>
    </main>
  )
}

export default Sec1