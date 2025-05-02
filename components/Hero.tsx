import React from "react";
import { useSearchParams } from "next/navigation";

const Hero: React.FC = () => {
  const searchParams = useSearchParams();
  const client = searchParams.get("client") || "";

  return (
    <section className="w-full bg-pink-100 py-16 px-4 flex flex-col items-center text-center">
      <img
        src="/mochi-logo.avif"
        alt="Mochi Logo"
        className="w-auto h-28 mb-6 object-contain"
        loading="lazy"
      />
      {client && (
        <div className="text-pink-700 font-bold mb-6 text-3xl">
          Salut, {client}
        </div>
      )}
      {/* <h1 className="text-5xl md:text-6xl font-extrabold text-pink-700 mb-4">
        Mochi proaspăt pentru afacerea ta
      </h1> */}
      <p className="text-lg md:text-2xl text-pink-800 mb-8 max-w-2xl">
        Comandă deserturi japoneze mochi pentru restaurantul sau punctul tău de
        vânzare. Gustos, rapid, comod!
      </p>
      {/* <div className="w-full max-w-3xl h-32 bg-white rounded-xl shadow flex items-center justify-center text-pink-400 text-xl">
        Aici în curând vor apărea oferte speciale!
      </div> */}
    </section>
  );
};

export default Hero;
