'use client'

const Sec8 = () => {
    return (
      <section className="relative py-24 bg-[#020617]/80 text-white overflow-hidden">
            <div className="justify-center items-center flex flex-col space-y-3 mb-24 px-4 text-center">
                <h4 className="text-cyan-400 tracking-widest text-sm mb-3">BONUS</h4>
                <h5 className="text-3xl md:text-5xl font-bold ">
                    Referral <span className="bg-clip-text text-transparent bg-linear-to-r from-cyan-300 to-cyan-800">Bonus Level</span>
                </h5>
                <p className="text-gray-400 mt-1 max-w-2xl lg:text-md text-sm mx-auto">
                    Get On First Level Refferal Commission
                </p>
            </div>

            {/* Responsive layout */}
            <ul className="flex flex-col md:flex-row justify-center items-center gap-16 md:gap-32 lg:gap-56">

                {/* Level 1 */}
                <li className="flex flex-col items-center">
                    <div className="flex items-end gap-1 mb-6">
                        <span className="text-white text-4xl mr-3 relative top-1">Level</span> 
                        <span className="text-8xl font-serif font-semibold leading-none bg-linear-to-b from-cyan-300 to-teal-800 bg-clip-text text-transparent">
                            1
                        </span>
                    </div>
                    <p className="text-3xl text-cyan-600">30%</p>
                </li>

                {/* Level 2 */}
                <li className="flex flex-col items-center">
                    <div className="flex items-end gap-1 mb-6">
                        <span className="text-white text-4xl mr-3 relative top-1">Level</span> 
                        <span className="text-8xl font-serif font-semibold leading-none bg-linear-to-b from-cyan-300 to-teal-800 bg-clip-text text-transparent">
                            2
                        </span>
                    </div>
                    <p className="text-3xl text-cyan-600">20%</p>
                </li>

                {/* Level 3 */}
                <li className="flex flex-col items-center">
                    <div className="flex items-end gap-1 mb-6">
                        <span className="text-white text-4xl mr-3 relative top-1">Level</span> 
                        <span className="text-8xl font-serif font-semibold leading-none bg-linear-to-b from-cyan-300 to-teal-800 bg-clip-text text-transparent">
                            3
                        </span>
                    </div>
                    <p className="text-3xl text-cyan-600">10%</p>
                </li>
            </ul>
        </section>
    )
}

export default Sec8;