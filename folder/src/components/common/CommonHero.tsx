import React from "react";
import Image from "next/image";

interface HeroProps {
  backgroundImage: string;
  title: string | React.ReactNode;
  imagePosition?: string;
}

const CommonHeroSection = ({
  backgroundImage,
  title,
  imagePosition = "center",
}: HeroProps) => {
  return (
    <section className="relative flex h-[420px] items-center justify-center overflow-hidden md:h-[460px]">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{
            objectPosition: imagePosition,
          }}
        />

        {/* Blue overlay */}
        <div className="absolute inset-0 bg-[#265995]/75" />
      </div>

      {/* Heading */}
      <div className="relative z-10 px-4 text-center">
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white drop-shadow-md md:text-6xl">
          {title}
        </h1>
      </div>
    </section>
  );
};

export default CommonHeroSection;