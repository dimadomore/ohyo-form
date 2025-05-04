import React from "react";
import { useSearchParams } from "next/navigation";

const Hero: React.FC = () => {
  const searchParams = useSearchParams();
  const client = searchParams.get("client") || "";

  return (
    <section
      className="w-full flex flex-col items-center text-center relative overflow-hidden px-6 py-4 bg-pink-100"
      style={{
        backgroundImage: 'url("/background.avif")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Overlay for better visibility */}
      <div className="absolute inset-0 bg-white/30 backdrop-blur-sm z-0" />
      <img
        src="/mochi-logo.avif"
        alt="Mochi Logo"
        className="w-auto h-28 mb-6 object-contain relative z-10"
        loading="lazy"
      />
      {client && (
        <div className="text-pink-800 font-bold mb-6 text-3xl relative z-10">
          Salut, {client}
        </div>
      )}
      {/* <h1 className="text-5xl md:text-6xl font-extrabold text-pink-700 mb-4">
        Mochi proaspăt pentru afacerea ta
      </h1> */}
      <p className="text-lg md:text-2xl text-pink-800 mb-8 max-w-2xl relative z-10">
        Comandă deserturi japoneze mochi pentru restaurantul sau punctul tău de
        vânzare.
      </p>
      {/* <div className="w-full max-w-3xl h-32 bg-white rounded-xl shadow flex items-center justify-center text-pink-400 text-xl">
        Aici în curând vor apărea oferte speciale!
      </div> */}
    </section>
  );
};

export default Hero;
