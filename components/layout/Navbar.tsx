'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { LogIn, Menu, X } from "lucide-react";
import { Button } from "../ui/button";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed z-50 w-full transition-all duration-300 text-white ${
        scrolled
          ? "bg-black/50 backdrop-blur-md shadow-md"
          : "bg-transparent"
      }`}
    >
      <div className="flex items-center justify-between py-2 px-6 lg:px-8 h-16">
        
        {/* LOGO */}
        <div className="flex items-center gap-2 ">
          <Image
            src="/Aver_logo1.png"
            alt="Aver Exchange Logo"
            width={50}
            height={50}
            className="pt-1"
          />
          <h1 className="text-xl lg:text-2xl tracking-tight font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope">
            Aver Exchange
          </h1>
        </div>

        {/* DESKTOP MENU */}
        <div className="hidden lg:flex">
          <ul className="flex items-center gap-6 font-manrope">
            <li className="hover:text-cyan-400 transition-colors duration-300">
              <a href="/">Home</a>
            </li>
            <li className="hover:text-cyan-400 transition-colors duration-300">
              <a href="/about">About</a>
            </li>
            <li className="hover:text-cyan-400 transition-colors duration-300">
              <a href="/trade">Plans</a>
            </li>
            <li className="hover:text-cyan-400 transition-colors duration-300">
              <a href="/trade">FAQ</a>
            </li>
            <li className="hover:text-cyan-400 transition-colors duration-300">
              <a href="/contact">Contact</a>
            </li>
          </ul>
        </div>

        {/* DESKTOP BUTTON */}
        <div className="hidden lg:flex items-center gap-4">
          <button className="flex items-center gap-2 py-2 rounded-lg hover:scale-105 transition-transform duration-300">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300">
              Sign In
            </span>
            <LogIn size={20} strokeWidth={2.25} className="text-cyan-500" />
          </button>
        </div>

        {/* HAMBURGER */}
        <div className="lg:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* ✅ ANIMATED MOBILE MENU */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          menuOpen ? "max-h-125 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-black/90 backdrop-blur-md px-6 py-6 space-y-6 font-manrope">
          <a href="/" className="block hover:text-cyan-400">Home</a>
          <a href="/about" className="block hover:text-cyan-400">About</a>
          <a href="/trade" className="block hover:text-cyan-400">Plans</a>
          <a href="/trade" className="block hover:text-cyan-400">FAQ</a>
          <a href="/contact" className="block hover:text-cyan-400">Contact</a>

          <button className="flex items-center gap-2 pt-4">
            <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300">
              Sign In
            </span>
            <LogIn size={20} className="text-cyan-500" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;