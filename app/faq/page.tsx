import Sec9 from "@/components/section/Sec9";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";





const faq = () => {
    return (
        <section>
          <Navbar />
            <div className="pt-60 bg-[#020617]/70">
                <div className="mb-20">
                    <h1 className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope text-4xl md:text-6xl font-bold text-center">
                        FAQ
                    </h1>
                    <p className="text-center text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
                        Learn more about Aver Exchange, our mission, and our commitment to providing a secure and user-friendly cryptocurrency trading experience.
                    </p>
                </div>
                <Sec9 />
            </div>
         <Footer />
        </section>
    )
}

export default faq;