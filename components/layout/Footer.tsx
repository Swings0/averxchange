"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Footer = () => {
  const year = new Date().getFullYear();
  const pathname = usePathname(); // ✅ added

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Plans", href: "/plans" },
    { name: "Faq", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="relative bg-[#020617]/70 text-white pt-28 pb-8 overflow-hidden px-8">

      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_20%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_20%)]" />

      <div className="relative max-w-7xl mx-auto px-6">

        {/* GRID */}
        <div className="grid md:grid-cols-4 gap-12">

          {/* LOGO + TEXT */}
          <div>
            <h2 className="text-3xl font-semibold tracking-wide">
              <span className="text-3xl tracking-tight font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope">
                Aver
              </span>
              Exchange
            </h2>

            <p className="mt-4 text-sm text-white/60 leading-relaxed max-w-xs">
              Our company has been developing stable cryptocurrency income for 6 years.
              Today averexchange employees are leaders in the field of IT technologies.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm tracking-widest text-white mb-4">
              GET IN TOUCH
            </h3>

            <p className="text-sm text-white/60">
              Email: exchangeaver@gmail.com
            </p>
            <p className="text-sm text-white/60 mt-2">
              Location: Cheyenne, Wyoming
            </p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-sm tracking-widest text-white mb-4">
              USEFUL LINKS
            </h3>

            <ul className="space-y-2 text-sm text-white/60">
              {links.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`block transition hover:text-cyan-400 hover:translate-x-1 ${
                      pathname === item.href ? "text-cyan-400" : ""
                    }`}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* NEWSLETTER */}
          <div>
            <h3 className="text-sm tracking-widest text-white mb-4">
              SUBSCRIBE TO OUR NEWSLETTER
            </h3>

            <div className="flex items-center border-b border-white/20 py-2 group">
              <input
                type="email"
                placeholder="Email Address"
                className="bg-transparent outline-none text-sm flex-1 text-white/70 placeholder-white/40"
              />
              <button className="text-cyan-400 transition group-hover:translate-x-1 group-hover:text-green-400">
                <Send size={18} />
              </button>
            </div>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="mt-36 flex flex-col md:flex-row justify-between items-center text-sm text-white/50 lg:pl-2">

          <p className="texts-sm">Copyright © {year} Averexchange All Rights Reserved</p>

        </div>
      </div>
    </footer>
  );
};

export default Footer;