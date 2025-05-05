import React from "react";
import { useClientStore } from "../store/client";

const Hero: React.FC = () => {
  const client = useClientStore((state) => state.client);
  console.log("client:", client);

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

      {client ? (
        <div className="text-pink-800 font-bold mb-6 text-3xl relative z-10">
          Salut, {client.name as string}
        </div>
      ) : null}

      <h1 className="text-lg md:text-2xl text-pink-900 mb-4 max-w-2xl relative z-10">
        Vă mulțumim că sunteți alături de noi! Comandați deserturi Mochi!
      </h1>
    </section>
  );
};

export default Hero;
