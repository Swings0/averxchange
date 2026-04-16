"use client";

const plans = [
  { name: "Bronze Plan", from: "$500", to: "$1,200" },
  { name: "Silver Plan", from: "$1,000", to: "$2,500" },
  { name: "Gold Plan", from: "$2,000", to: "$5,000" },
  { name: "Platinum Plan", from: "$5,000", to: "$15,000" },
  { name: "Diamond Plan", from: "$10,000", to: "$30,000" },
  { name: "Elite Plan", from: "$50,000", to: "$120,000" },
  { name: "Legacy Plan", from: "$500,000", to: "$1,500,000" },
];

const Sec3 = () => {
  return (
    <section className="relative py-24 text-white overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(0,255,200,0.08),transparent_20%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(0,150,255,0.08),transparent_40%)]" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm tracking-widest uppercase">
            Offers
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Investment <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-900">Plans</span>
          </h2>
        </div>

        {/* Grid */}
        <div className="flex flex-wrap justify-center gap-8">

          {plans.map((plan, i) => (
            <div
              key={i}
              className="group relative w-full sm:w-[45%] lg:w-[30%] min-h-107 p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all duration-300 hover:border-cyan-400/40 hover:shadow-xl hover:shadow-cyan-500/10 flex flex-col justify-between"
            >
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-linear-to-br from-cyan-500/10 to-blue-500/10" />

              <div className="relative z-10 flex flex-col h-full">

                {/* Top Content */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    {plan.name}
                  </h3>

                  <div className="mb-6">
                    <p className="text-sm text-gray-400 ">Investment Range</p>

                    <h4 className="text-3xl font-bold mt-1 bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-900">
                      {plan.from}
                    </h4>

                    <p className="text-gray-400 text-sm mt-1">
                      → {plan.to}
                    </p>
                  </div>

                  <div className="h-px bg-white/10 mb-6" />

                  <ul className="text-sm text-gray-400 space-y-2 mb-6">
                    <li>• Duration: 21 Days</li>
                    <li>• Secure Investment</li>
                    <li>• Automated Trading</li>
                    <li>• Real-time Monitoring</li>
                  </ul>
                </div>

                {/* Button (center-bottom feel) */}
                <div className="mt-auto flex justify-center">
                  <button className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white font-semibold font-manrope py-3 px-6 rounded-lg hover:scale-95 transform transition-transform duration-300">
                    Invest Now
                  </button>
                </div>

              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Sec3;