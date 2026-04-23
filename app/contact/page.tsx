"use client";

import { Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section className="relative min-h-screen pt-60 lg:px-32 px-16 bg-[#020617]/95 text-white overflow-hidden">

           <div className="pb-20 ">
              <h1
                 className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope text-4xl md:text-6xl font-bold text-center">
                 Contact Us
              </h1>
                <p className="text-center text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
                   Have questions or need assistance? Our support team is here to help. Reach out to us for any inquiries, feedback, or support related to your trading experience with Aver Exchange.
               </p>
         </div>

      {/* 🌌 BACKGROUND GLOW (same theme) */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(0,255,200,0.06),transparent_25%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(0,150,255,0.05),transparent_25%)]" />

      <div className="relative max-w-3xl grid lg:grid-cols-2 gap-20 items-start">

        {/* ================= LEFT (FORM) ================= */}
        <div className="bg-white/5 backdrop-blur-md border  border-white/10 rounded-lg p-8 shadow-xl">

          {/* FULL NAME */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Full name"
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
            />
          </div>

          {/* EMAIL */}
          <div className="mb-6">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
            />
          </div>

          {/* SUBJECT */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Subject"
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition"
            />
          </div>

          {/* MESSAGE */}
          <div className="mb-8">
            <textarea
              placeholder="Your message"
              rows={5}
              className="w-full bg-transparent border-b border-white/20 py-3 outline-none text-sm text-white placeholder-white/40 focus:border-cyan-400 transition resize-none"
            />
          </div>

          {/* BUTTON (same style as your earlier sections) */}
          <button className="px-6 py-2 rounded-lg border border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black transition-all duration-300 hover:scale-105">
            Send Message
          </button>
        </div>

        {/* ================= RIGHT (INFO) ================= */}
        <div>

          {/* TAG */}
          <p className="text-cyan-400 text-sm tracking-widest mb-3">
            CONTACT US
          </p>

          {/* TITLE */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            GET IN <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-cyan-200">TOUCH</span>
          </h2>

          <p className="text-white/60 mb-10">
            Let's ask your questions
          </p>

          {/* INFO BLOCKS */}
          <div className="space-y-6">

            {/* EMAIL */}
            <div className="flex items-start gap-4 group">
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