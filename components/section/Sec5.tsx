"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";



const investors = [
  { name: "Ericson Fulal", amount: "$196,929", img: "/investors1.jpg" },
  { name: "Ellawilson Nelson", amount: "$299,601", img: "/investors2.jpg" },
  { name: "Alexander Muisline", amount: "$1,400,600", img: "/investors3.jpg" },
  { name: "Amelia Stone", amount: "$410,988", img: "/investors4.jpg" },
  { name: "Chris Wayne", amount: "$650,230", img: "/investors5.jpg" },
  { name: "Dylan John", amount: "$320,500", img: "/investors6.jpg" },
  { name: "Daniel Cruz", amount: "$710,120", img: "/investors7.jpg" },
  { name: "Michael Brown", amount: "$780,440", img: "/investors8.jpg" },
  { name: "Sophia Lee", amount: "$250,800", img: "/investors9.jpg" },
  { name: "Olivia Harris", amount: "$605,300", img: "/investors10.jpg" },
  { name: "James Carter", amount: "$190,870", img: "/investors11.jpg" },
  { name: "Ethan Walker", amount: "$515,920", img: "/investors12.jpg" },
  { name: "Isabella Moore", amount: "$830,150", img: "/investors13.jpg" },
  { name: "Noah Scott", amount: "$540,210", img: "/investors14.jpg" },
  { name: "Mia Robinson", amount: "$1,250,000", img: "/investors15.jpg" },
];

export default function TopInvestors() {
  return (
    <section className="relative py-24 bg-[#020617]/80 text-white overflow-hidden">

      {/* Glow background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,200,0.06),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-6 py-5">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-cyan-400 text-sm tracking-widest uppercase">
            Our Investors
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-4">
            Top <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-800">Investors</span>
          </h2>
        </div>

        {/* Glass container */}
        <div className="rounded-3xl border border-white/10 bg-white/3 backdrop-blur-xl p-10">

          <Swiper
            modules={[Autoplay]}
            spaceBetween={30}
            slidesPerView={4}
            loop={true}
            speed={4000} // smooth continuous feel
            autoplay={{
              delay: 0, // makes it continuous instead of jumping
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            breakpoints={{
              320: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 4 },
            }}
          >
            {investors.map((inv, i) => (
              <SwiperSlide key={i}>
                <div className="group text-center">

                  {/* Avatar */}
                  <div className="relative mx-auto w-28 h-28 mb-4">
                    <img
                      src={inv.img}
                      alt={inv.name}
                      className="w-full h-full object-cover rounded-full border border-cyan-400/30"
                    />

                    <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-xl opacity-0 group-hover:opacity-100 transition" />
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold">
                    {inv.name}
                  </h3>

                  {/* Role */}
                  <p className="text-cyan-400 text-sm mb-1">
                    Investor
                  </p>

                  {/* Amount */}
                  <p className="text-gray-400 text-sm">
                    Invested:{" "}
                    <span className="text-white font-semibold">
                      {inv.amount}
                    </span>
                  </p>

                </div>
              </SwiperSlide>
            ))}
          </Swiper>

        </div>
      </div>
    </section>
  );
}