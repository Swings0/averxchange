'use client';
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen lg:py-36 md:py-36 py-40 px-6 lg:px-8">
      
     <div className="absolute inset-0 bg-[url('/hero.jpg')] bg-cover bg-center opacity-60"></div>

      <div className="z-20 relative flex flex-col lg:flex-row lg:space-x-72 items-start lg:items-center">
        
        {/* LEFT CONTENT */}
        <div className="space-y-4 max-w-xl">
          <h1 className="text-sm md:text-lg text-gray-300 font-manrope">
            Welcome to Aver Exchange
          </h1>

          <p className="text-3xl lg:text-[2.7rem] font-bold font-inter text-white leading-tight">
            A PROFITABLE PLATFORM <br /> FOR HIGH-MARGIN <br /> INVESTMENT
          </p>
         <Link href="/register">
          <button className="bg-linear-to-r from-cyan-300 to-cyan-900 text-white font-semibold font-manrope mt-4 py-3 px-6 rounded-lg hover:scale-95 transform transition-transform duration-300 cursor-pointer">
            Get Started
          </button>
         </Link>
        </div>

        {/* RIGHT STATS */}
        <div className="flex flex-col space-y-10 mt-12 lg:mt-0 w-full lg:w-auto justify-center items-center">
          
          <div className="lg:mr-16 md:mr-0 mr-10">
            <h2 className="text-3xl lg:text-4xl md:text-5xl font-serif tracking-tight font-semibold text-gray-200">
              25609
            </h2>
            <h5 className="font-serif bg-clip-text bg-linear-to-r from-cyan-300 to-cyan-900 text-transparent">
              All Members
            </h5>
          </div>

          <div className="lg:ml-28">
            <h2 className="lg:text-6xl md:text-5xl text-3xl font-serif tracking-tight font-semibold text-white">
              12.8M
            </h2>
            <h5 className="font-serif bg-clip-text bg-linear-to-r from-cyan-300 to-cyan-900 text-transparent">
              Average Investment
            </h5>
          </div>

          <div className="lg:mr-16">
            <h2 className="lg:text-4xl md:text-5xl text-3xl font-serif tracking-tight font-semibold text-gray-200">
              200
            </h2>
            <h5 className="font-serif bg-clip-text bg-linear-to-r from-cyan-300 to-cyan-900 text-transparent">
              Countries supported
            </h5>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Hero;