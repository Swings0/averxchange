import Navbar from "@/components/layout/Navbar";
import Hero from "@/components/section/Hero";
import CustomTicker from "@/components/widget/CustomTicker";
import Sec1 from "@/components/section/Sec1";
import Sec2 from "@/components/section/Sec2";
import Sec3 from "@/components/section/Sec3";
import Sec4 from "@/components/section/Sec4";
import Sec5 from "@/components/section/Sec5";
import Sec6 from "@/components/section/Sec6";
// import Ticker from "@/components/widget/ticker";


const page = () => {
  return (
    <main>
      <Navbar />
      <Hero />
      <CustomTicker />
      <Sec1 />
      <Sec2 />
      <Sec3 />
      <Sec4 />  
      <Sec5 />  
      <Sec6 />  
      {/* <Ticker /> */}
    </main>
  )
}

export default page