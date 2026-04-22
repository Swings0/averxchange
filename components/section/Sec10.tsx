"use client";

const logos = [
  "/logos1.jpg", "/logos2.jpg", "/logos3.png", "/logos4.jpg",
  "/logos5.png", "/logos6.jpg", "/logos7.png", "/logos8.jpg",
  "/logos9.jpg", "/logos10.jpg", "/logos11.jpg", "/logos12.jpg",
  "/logos13.jpg", "/logos14.jpg", "/logos15.jpg", "/logos16.jpg",
  "/logos17.jpg", "/logos18.jpg", "/logos19.jpg", "/logos20.jpg",
  "/logos21.jpg", "/logos22.jpg", "/logos23.jpg", "/logos24.jpg",
  "/logos25.jpg", "/logos26.jpg", "/logos27.jpg", "/logos28.jpg",
  "/logos29.jpg", "/logos30.png", "/logos31.jpg", "/logos32.jpg",
];

// duplicate for seamless loop
const loopLogos = [...logos, ...logos];

export default function Sec10() {
  return (
    <section className="relative py-20 bg-[#020617]/90 overflow-hidden px-8">

      {/* Glow */}
      {/* <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,200,0.05),transparent_50%)]" /> */}

      <div className="relative max-w-7xl mx-auto px-6">

        {/* Fade edges */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-linear-to-r from-[#020617] to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-linear-to-l from-[#020617] to-transparent z-10" />

          {/* Slider */}
          <div className="flex w-max animate-marquee gap-10">

            {loopLogos.map((logo, i) => (
              <div
                key={i}
                className="flex items-center justify-center transition duration-300"
              >
                <img
                  src={logo}
                  alt={`logo-${i}`}
                  className="h-16 w-28 transition rounded-md duration-300"
                />
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}