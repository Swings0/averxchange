import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Sec1 from "@/components/section/Sec1";
import Sec2 from "@/components/section/Sec2";
import Sec10 from "@/components/section/Sec10";




const About = () => {
    return (
        <section>
            <Navbar />
             <div className="pt-60 bg-[#020617]/95">
                <div className="">
                    <h1 className="bg-clip-text text-transparent bg-linear-to-r from-cyan-700 to-cyan-300 font-manrope text-4xl md:text-6xl font-bold text-center">
                        About Us
                    </h1>
                    <p className="text-center text-sm text-gray-400 mt-4 max-w-2xl mx-auto">
                        Learn more about Aver Exchange, our mission, and our commitment to providing a secure and user-friendly cryptocurrency trading experience.
                    </p>
                </div>
                <Sec1 />
                <Sec2 />
                <Sec10 />
            </div>
          <Footer />
        </section>
    )
}

export default About;