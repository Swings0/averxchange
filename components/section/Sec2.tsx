"use client";

import Image from "next/image";

const steps = [
  {
    title: "Register & Log in",
    desc: "Creating an account is the first step. Then you need to log in.",
  },
  {
    title: "Add Funds",
    desc: "Pick a payment method and securely fund your account.",
  },
  {
    title: "Select a Service",
    desc: "Choose the service you need and get started instantly.",
  },
  {
    title: "Enjoy Results",
    desc: "Track performance and enjoy seamless results.",
  },
];

const Sec2 = () => {
  return (
    <section className="relative w-full py-24 lg:px-10 bg-black/30 text-white overflow-hidden">

      {/* 🌌 Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(0,255,200,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(0,150,255,0.08),transparent_40%)]" />

      {/* 🌫 TOP FADE ONLY (soft + clean) */}
<div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Title */}
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          How It <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-800">Works</span>
        </h2>

        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left Image */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">

            <Image
              src="/Pay.jpg"
              alt="Payment"
              width={500}
              height={400}
              className="object-cover lg:w-full lg:h-90 md:w-full md:h-80 w-full h-64"
            />

            {/* overlay */}
            <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/10 via-black/10 to-transparent" />
          </div>

          {/* Timeline */}
          <div className="relative">

            {/* vertical line */}
            <div className="absolute left-4 top-0 h-full w-0.5 bg-linear-to-b from-cyan-500 to-blue-500 opacity-30" />

            <div className="space-y-10">
              {steps.map((step, i) => (
                <div key={i} className="relative pl-12">

                  {/* Dot */}
                  <div className="absolute left-0 top-2 w-8 h-8 rounded-full bg-[#020617] border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-1">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.desc}
                  </p>

                </div>
              ))}
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Sec2;