import React from "react";
import { useClientStore } from "../store/client";

const Hero: React.FC = () => {
  const client = useClientStore((state) => state.client);

  return (
    <section className="bg-white flex flex-col items-center w-full text-center">
      <div className="flex flex-col items-center bg-white p-6">
        {client ? (
          <div className="text-pink-800 font-bold mb-6 text-3xl relative z-10">
            Salut, {client.name as string}
          </div>
        ) : null}

        <h1 className="text-lg md:text-2xl text-pink-900 mb-4 max-w-2xl relative z-10">
          Vă mulțumim că sunteți alături de noi! Comandați deserturi Mochi!
        </h1>
      </div>
      <div
        className="xl:w-7/12 w-full lg:h-96 flex mx-auto flex-col md:h-80 h-64 items-center text-center relative overflow-hidden bg-pink-100"
        style={{
          backgroundImage: 'url("/background.avif")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      ></div>
    </section>
  );
};

export default Hero;
