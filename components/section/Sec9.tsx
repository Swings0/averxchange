"use client";

import { useState } from "react";

const faqs = [
  {
    q: "What Are Your Investment Options?",
    a: "We offer a variety of investment plans tailored to different financial goals, ranging from short-term growth to long-term wealth building.",
  },
  {
    q: "How Secure Are My Investments?",
    a: "Your investments are safeguarded with the highest level of security measures. We use advanced encryption and secure platforms to ensure that your financial data and assets are protected from any potential threats.",
  },
  {
    q: "Can I Withdraw My Investments Anytime?",
    a: "Yes, withdrawals are flexible depending on your selected plan. Some plans allow instant withdrawals while others follow scheduled payout cycles.",
  },
  {
    q: "Do You Provide Financial Planning Services?",
    a: "Yes, we provide strategic financial planning services to help you maximize returns and align your investments with your long-term goals.",
  },
  {
    q: "How Can I Get Started With Your Services?",
    a: "Getting started is easy. Simply contact us through our website or call our customer service line. Our team will guide you through the process, answer any questions you have, and help you choose the investment options that best suit your needs.",
  },
];

const Sec9 = () => {
  const [active, setActive] = useState<number | null>(1);

  const toggle = (index: number) => {
    setActive(active === index ? null : index);
  };

  return (
    <section className="relative py-32 bg-[#020617]/95 text-white overflow-hidden px-10">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.05),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16">

        {/* LEFT */}
        <div>
          <h2 className="text-4xl md:text-5xl font-bold">
            ANY <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-800">QUESTIONS</span>
          </h2>

          <p className="text-gray-400 mt-4">
            We've Got Answers
          </p>
        </div>

        {/* RIGHT */}
        <div className="space-y-6">

          {faqs.map((item, i) => {
            const isOpen = active === i;

            return (
              <div
                key={i}
                className="border-b border-white/10 pb-4"
              >

                {/* Question Row */}
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex items-center justify-between text-left group"
                >
                  <h3
                    className={`text-lg md:text-xl font-medium transition ${
                      isOpen ? "text-cyan-400" : "text-white"
                    }`}
                  >
                    {item.q}
                  </h3>

                  {/* Number */}
                  <span
                    className={`text-lg transition ${
                      isOpen ? "text-cyan-400" : "text-gray-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                </button>

                {/* Animated Answer */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? "max-h-40 mt-4" : "max-h-0"
                  }`}
                >
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.a}
                  </p>
                </div>

                {/* Active underline glow */}
                <div
                  className={`h-2px mt-3 transition-all ${
                    isOpen
                      ? "bg-linear-to-r from-cyan-400 to-blue-500"
                      : "bg-white/10"
                  }`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Sec9;