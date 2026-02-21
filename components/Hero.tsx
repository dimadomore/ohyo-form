import React from "react";
import { useClientStore } from "../store/client";

const Hero: React.FC = () => {
  const client = useClientStore((state) => state.client);

  return (
    <section className="w-full bg-[#e5752d] overflow-hidden">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 flex items-end justify-between min-h-[200px] sm:min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
        <div className="text-white pb-6 sm:pb-8 md:pb-12 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg">
          <h1 className="font-extrabold uppercase leading-none tracking-tight text-3xl sm:text-4xl md:text-5xl lg:text-6xl">
            Comandați
            <br />
            deserturi mochi!
          </h1>
          <p className="mt-2 sm:mt-3 font-semibold uppercase text-xs sm:text-sm md:text-base text-white/90 leading-snug">
            Vă mulțumim că sunteți alături de noi!
          </p>
          {client && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2.5">
              <span className="text-white/80 text-sm font-medium">Salut,</span>
              <span className="font-extrabold text-white text-base tracking-wide">
                {client.name}
              </span>
              <span className="text-lg">👋</span>
            </div>
          )}
        </div>

        <div className="self-end flex-shrink-0">
          <img
            src="/guy.png"
            alt="MOTI"
            className="h-[160px] sm:h-[240px] md:h-[320px] lg:h-[400px] w-auto object-contain object-bottom"
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
