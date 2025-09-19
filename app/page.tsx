import React from "react";

const page = () => {
  return (
    <div className="w-full h-full min-h-screen bg-gradient-to-br from-[#fefae0] to-[#faedcd] relative">
      <header className="flex items-center justify-between pl-4 pr-4 h-20 w-full bg-[#fdf0d5] fixed">
        <h1 className="text-[#e09f3e] font-bold text-base">
          Tim 9 - AmbaToBuy
        </h1>
        <a
          href="#products"
          className="text-[#e09f3e] hidden sm:block font-semibold mr-8"
        >
          Product
        </a>
      </header>

      <img
        className="absolute w-10 top-28 left-[10%] rotate-12 sm:w-20 sm:top-32"
        src={"./star.png"}
      />

      <img
        className="absolute w-10 top-[170px] -rotate-12 animate-bounce sm:top-[280px] sm:w-16 right-[10%]"
        src="./star.png"
      />

      <div className="flex flex-col items-center h-full min-h-screen w-full">
        <h1 className="text-4xl font-bold sm:text-6xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25] mt-28 sm:mt-40">
          AmbaToBuy
        </h1>
        <p className="text-xl font-bold sm:text-2xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25] mt-2">
          I'm about to buy it now <span className="text-red-500">🔥🔥</span>
        </p>
        <p className="text-base font-bold sm:text-lg text-[#606c38] text-center pl-8 pr-8 mt-4">
          Nikmati kelezatan makanan dan minuman dengan harga yang ramah di
          kantong
        </p>

        <a
          href="#products"
          className="mt-8 bg-gradient-to-br from-[#dda15e] to-[#bc6c25] pl-5 pr-5 pt-3 pb-3 rounded-full font-bold text-[#fefae0] cursor-pointer"
        >
          Lihat Produk Kami ✨
        </a>
      </div>

      {/* Produk */}
      <div id="products" className="mb-40">
        <h1 className="text-center mb-16 text-4xl font-bold sm:text-6xl text-transparent bg-clip-text bg-gradient-to-tl from-[#dda15e] to-[#bc6c25]">
          Produk Kami
        </h1>

        <div className="container mx-auto px-4 sm:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Kentang Spiral */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src="./kentang-spiral.jpg"
                alt="kentang-spiral"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">
                  Kentang Spiral
                </h3>
                <h2 className="text-[#606c38] font-bold">
                  Rp 5.000 - Rp 10.000
                </h2>
              </div>
            </div>

            {/* Sushi */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src="./Sushi.png"
                alt="sushi"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">Sushi</h3>
                <h2 className="text-[#606c38] font-bold">Rp 2.000/each</h2>
              </div>
            </div>

            {/* Jasuke */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src="./jasuke.jpg"
                alt="jasuke"
                className="w-full h-48 object-cover object-top"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">Jasuke</h3>
                <h2 className="text-[#606c38] font-bold">Rp 5.000</h2>
              </div>
            </div>

            {/* Es Milo */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <img
                src="./milo.jpg"
                alt="milo"
                className="w-full h-48 object-cover"
              />
              <div className="p-4 text-center">
                <h3 className="text-lg font-semibold text-[#bc6c25]">
                  Es Milo
                </h3>
                <h2 className="text-[#606c38] font-bold">Rp 5.000</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-[#fdf0d5] py-6 text-center">
        <p className="text-[#606c38] font-semibold">
          Web ini dibuat oleh{" "}
          <span className="text-[#bc6c25]">AmbaToBuy - Tim 9</span>
        </p>
        <a
          href="https://instagram.com/your_ig_here"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#e09f3e] hover:underline font-bold"
        >
          @your_ig_here
        </a>
      </footer>
    </div>
  );
};

export default page;
