"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const Footer = () => {
  const year = new Date().getFullYear();
  const pathname = usePathname();

  const links = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Plans", href: "/plans" },
    { name: "Faq", href: "/faq" },
    { name: "Contact", href: "/contact" },
  ];

  // =========================
  // NEWSLETTER STATE
  // =========================
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subStatus, setSubStatus] = useState<null | "success" | "error">(null);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!newsletterEmail || loading) return;

    setLoading(true);
    setSubStatus(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      if (res.ok) {
        setSubStatus("success");
        setNewsletterEmail("");
      } else {
        setSubStatus("error");
      }
    } catch (err) {
      setSubStatus("error");
    }

    setLoading(false);

    setTimeout(() => {
      setSubStatus(null);
    }, 6000);
  };

  return (
    <footer className="relative bg-[#020617]/70 text-white pt-28 pb-8 overflow-hidden px-8">

      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_20%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_20%)]" />

      <div className="relative max-w-7xl mx-auto px-6">

        <div className="grid md:grid-cols-4 gap-12">

          {/* LOGO */}
          <div>
            <h2 className="text-3xl font-semibold tracking-wide">
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope">
                Aver
              </span>
              Exchange
            </h2>

            <p className="mt-4 text-sm text-white/60 max-w-xs">
              Our company has been developing stable cryptocurrency income for 6 years.
            </p>
          </div>

          {/* CONTACT */}
          <div>
            <h3 className="text-sm tracking-widest mb-4">GET IN TOUCH</h3>
            <p className="text-sm text-white/60">Email: exchangeaver@gmail.com</p>
            <p className="text-sm text-white/60 mt-2">Location: Cheyenne, Wyoming</p>
          </div>

          {/* LINKS */}
          <div>
            <h3 className="text-sm tracking-widest mb-4">USEFUL LINKS</h3>

            <ul className="space-y-2 text-sm text-white/60">
              {links.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`hover:text-cyan-400 transition ${
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
            <h3 className="text-sm tracking-widest mb-4">
              SUBSCRIBE TO OUR NEWSLETTER
            </h3>

            <div className="flex items-center border-b border-white/20 py-2 group">
              <input
                type="email"
                placeholder="Email Address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                className="bg-transparent outline-none text-sm flex-1 text-white/70 placeholder-white/40"
              />

              <button
                type="button"
                onClick={handleSubscribe}
                className="relative w-6 h-6 flex items-center justify-center text-cyan-400"
              >
                {/* =========================
                    LOADING SPINNER
                ========================= */}
                {loading ? (
                  <div className="w-5 h-5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send
                    size={18}
                    className="transition group-hover:translate-x-1 group-hover:text-green-400"
                  />
                )}
              </button>
            </div>

            {/* STATUS */}
            {subStatus === "success" && (
              <p className="text-green-400 text-xs mt-3">
                Successfully subscribed!
              </p>
            )}

            {subStatus === "error" && (
              <p className="text-red-400 text-xs mt-3">
                Something went wrong.
              </p>
            )}
          </div>

        </div>

        <div className="mt-36 flex justify-between text-sm text-white/50">
          <p>Copyright © {year} Averexchange All Rights Reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;