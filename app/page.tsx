// import Navbar from "@/components/layout/Navbar";
// import Footer from "@/components/layout/Footer";
import Hero from "@/components/section/Hero";
import CustomTicker from "@/components/widget/CustomTicker";
import Sec1 from "@/components/section/Sec1";
import Sec2 from "@/components/section/Sec2";
import Sec3 from "@/components/section/Sec3";
import Sec4 from "@/components/section/Sec4";
import Sec5 from "@/components/section/Sec5";
import Sec6 from "@/components/section/Sec6";
import Sec7 from "@/components/section/Sec7";
import Sec8 from "@/components/section/Sec8";
import Sec9 from "@/components/section/Sec9";
import Sec10 from "@/components/section/Sec10";

// import Ticker from "@/components/widget/ticker";


const page = () => {
  return (
    <main>
      {/* <Navbar /> */}
      <Hero />
      <CustomTicker />
      <Sec1 />
      <Sec2 />
      <Sec3 />
      <Sec4 />  
      <Sec5 />  
      <Sec6 />  
      <Sec7 />
      <Sec8 />
      <Sec9 />
      <Sec10 />
      {/* <Footer /> */}
      {/* <Ticker /> */}
    </main>
  )
}

export default page