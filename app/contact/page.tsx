"use client";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { Mail, MapPin } from "lucide-react";
import { useState } from "react";

const Contact = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<null | "success" | "error">(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const key = e.target.placeholder.toLowerCase();

    setForm({
      ...form,
      [key === "full name"
        ? "name"
        : key === "email address"
        ? "email"
        : key === "your message"
        ? "message"
        : "subject"]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ VALIDATION: block empty fields
    if (!form.name || !form.email || !form.subject || !form.message) {
      setError("All fields are required.");
      setTimeout(() => setError(null), 6000);
      return;
    }

    setLoading(true);
    setStatus(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
      setStatus("error");
    }

    setLoading(false);

    // ✅ auto-hide success/error after 6 seconds
    setTimeout(() => {
      setStatus(null);
    }, 6000);
  };

  return (
    <section>
      <Navbar />

      <div className="relative min-h-screen pt-60 lg:px-32 px-16 bg-[#020617]/95 text-white overflow-hidden">

        <div className="pb-20 ">
          <h1 className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope text-4xl md:text-6xl font-bold text-center">
            Contact Us
          </h1>

          <p className="text-center text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
            Have questions or need assistance? Our support team is here to help.
            Reach out to us for any inquiries, feedback, or support related to
            your trading experience with Aver Exchange.
          </p>
        </div>

        {/* 🌌 BACKGROUND GLOW */}
        <div className="absolute inset-0 bg-[radial-linear(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_25%)]" />
        <div className="absolute inset-0 bg-[radial-linear(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_25%)]" />

        <div className="relative max-w-3xl grid lg:grid-cols-2 gap-20 items-start">

          {/* ================= LEFT (FORM) ================= */}
          <form
            onSubmit={handleSubmit}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-8 shadow-xl"
          >

            {/* FULL NAME */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
              />
            </div>

            {/* EMAIL */}
            <div className="mb-6">
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
              />
            </div>

            {/* SUBJECT */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Subject"
                value={form.subject}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
              />
            </div>

            {/* MESSAGE */}
            <div className="mb-8">
              <textarea
                placeholder="Your message"
                rows={5}
                value={form.message}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition resize-none"
              />
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 hover:scale-105"
            >
              {loading ? "Sending..." : "Send Message"}
            </button>

            {/* SUCCESS MESSAGE */}
            {status === "success" && (
              <p className="text-green-400 text-sm mt-4">
                Message sent successfully!
              </p>
            )}

            {/* ERROR MESSAGE */}
            {status === "error" && (
              <p className="text-red-400 text-sm mt-4">
                Error sending message. Try again.
              </p>
            )}

            {/* VALIDATION ERROR */}
            {error && (
              <p className="text-yellow-400 text-sm mt-4">
                {error}
              </p>
            )}
          </form>

          {/* ================= RIGHT (INFO) ================= */}
          <div>

            <p className="text-cyan-400 text-sm tracking-widest mb-3">
              CONTACT US
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              GET IN <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-cyan-200">TOUCH</span>
            </h2>

            <p className="text-white/60 mb-10">
              Let's ask your questions
            </p>

            {/* EMAIL */}
            <div className="flex items-start gap-4 group mb-6">
              <div className="w-12 h-12 flex items-center justify-center rounded-full border border-cyan-400/30 text-cyan-400 group-hover:bg-cyan-400/10 transition">
                <Mail size={20} />
              </div>

              <div>
                <h4 className="text-sm tracking-widest text-white">
                  EMAIL
                </h4>
                <p className="text-white/60 text-sm mt-1">
                  exchangeaver@gmail.com
                </p>
              </div>
            </div>

            {/* LOCATION */}
            <div className="flex items-start gap-4 group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full border border-cyan-400/30 text-cyan-400 group-hover:bg-cyan-400/10 transition">
                <MapPin size={20} />
              </div>

              <div>
                <h4 className="text-sm tracking-widest text-white">
                  LOCATION
                </h4>
                <p className="text-white/60 text-sm mt-1">
                  Cheyenne, Wyoming
                </p>
              </div>
            </div>

          </div>

        </div>
      </div>

      <Footer />
    </section>
  );
};

export default Contact;


// const contact = () => {
//     return (
//         <main className="pt-60 bg-[#020617]/70">
//             {/* <Sec9 /> */}
//         </main>
//     )
// }

// export default contact;