import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sec3 from "@/components/section/Sec3";
import Sec4 from "@/components/section/Sec4";
import Sec6 from "@/components/section/Sec6";




const Plans = () => {
    return (
        <section>
          <Navbar />
            <div className="pt-60 bg-[#020617]/95">
                <div className="">
                    <h1 className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope text-4xl md:text-6xl font-bold text-center">
                        Plans
                    </h1>
                    {/* <p className="text-center text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
                        Discover the perfect plan for your trading needs. We offers flexible options to suit you.
                    </p> */}
                </div>
                <Sec3 />
                <Sec4 />
                <Sec6 />
            </div>
          <Footer />
        </section>
    )
}

export default Plans;