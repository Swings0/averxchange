import {
  ShieldCheck,
  BadgeCheck,
  Briefcase,
  Building2,
  Zap,
  Banknote,
} from "lucide-react";

const features = [
  {
    title: "Expert Management",
    desc: "Our team offers expert management services, ensuring your business objectives are met efficiently. We provide the strategic guidance needed to achieve your goals.",
    icon: Briefcase,
  },
  {
    title: "Registered Company",
    desc: "As a registered and reputable company, we adhere to the highest standards of professionalism and reliability. Trust us to support your business with integrity and dedication.",
    icon: Building2,
  },
  {
    title: "Secure Investment",
    desc: "Your investments are secure with us. We prioritize safety and transparency, ensuring your financial growth is protected and optimized.",
    icon: ShieldCheck,
  },
  {
    title: "Verified Security",
    desc: "We implement robust security measures to safeguard your investments. Our verified security protocols ensure your assets are always safe.",
    icon: BadgeCheck,
  },
  {
    title: "Instant Withdrawal",
    desc: "Enjoy the convenience of instant withdrawals. Access your funds quickly and easily whenever you need them, with no hassle.",
    icon: Zap,
  },
  {
    title: "Reliable Company",
    desc: "Our reputation as a reliable company is built on trust and consistent performance. Partner with us for a stable and prosperous financial journey.",
    icon: Banknote,
  },
];

const Sec4 = () => {
  return (
    <section className="relative py-24 bg-[#020617]/70 text-white overflow-hidden">

      {/* Top Fade */}
<div className="absolute top-0 left-0 w-full h-32 bg-linear-to-b from-black/20 via-black/10 to-transparent pointer-events-none" />

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,200,0.06),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-6 z-30">

        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-cyan-400 text-sm tracking-widest uppercase">
            Choose Investment
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Why Choose <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-800">Our Investment Plan</span>
          </h2>

          <p className="text-gray-400 max-w-2xl mx-auto mt-4 text-sm md:text-base">
            We help agencies define their new business objectives and create professional software tailored to their needs.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-x-16 gap-y-14">

          {features.map((item, i) => {
            const Icon = item.icon;

            return (
              <div key={i} className="group flex items-start gap-5">

                {/* Icon */}
                <div className="relative">
                  <div className="w-14 h-14 rounded-full border border-cyan-400/30 flex items-center justify-center 
                    bg-white/3 backdrop-blur-md
                    group-hover:border-cyan-400 transition">

                    <Icon className="text-cyan-400 w-6 h-6" />
                  </div>

                  {/* glow */}
                  <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl opacity-0 group-hover:opacity-100 transition" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-cyan-400">
                    {item.title}
                  </h3>

                  {/* Divider line */}
                  <div className="h-px bg-white/10 my-3" />

                  <p className="text-gray-400 text-sm leading-relaxed">
                    {item.desc}
                  </p>
                </div>

              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

export default Sec4;