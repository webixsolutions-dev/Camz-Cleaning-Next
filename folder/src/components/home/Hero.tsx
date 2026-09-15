"use client";

import Image from "next/image";
import Link from "next/link";
import { TfiHeadphoneAlt } from "react-icons/tfi";

export default function Hero() {
  return (
    <section className="relative overflow-hidden text-white">
      <Image
        src="/hero-bg.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(31,95,155,0.9)] to-[rgba(2,192,230,0.9)]" />

      <div className="absolute inset-0 opacity-10 bg-[url('/pattern.png')] bg-cover bg-center" />

      <div className="relative container-custom grid items-center gap-10 md:grid-cols-2">
        {/* LEFT CONTENT */}
        <div>
          {/* Eyebrow */}
          <span className="mb-2 inline-block rounded-full border border-white/30 bg-[#02C0E6] px-4 py-1 text-base">
            Freshness You Can Feel
          </span>

          {/* Heading */}
          <h1 className="mb-6 text-4xl font-extrabold leading-tight md:text-[55px]">
            Trusted Cleaning <br />
            Company in Calgary
          </h1>

          {/* Description */}
          <p className="mb-8 w-full max-w-2xl text-white">
            Camz Cleaning provides professional cleaning services for homes,
            offices, commercial spaces, vehicles and seasonal properties. Book
            residential, deep, move-in/move-out or commercial cleaning with a
            skilled team and choose your preferred appointment online.
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Link
              href="/services"
              className="rounded-md border border-white bg-white px-6 py-3 font-medium text-[#1F5F9B] transition-all duration-300 hover:bg-transparent hover:text-white"
            >
              Explore Our Services
            </Link>

            <Link
              href="/booking"
              className="rounded-md border border-white bg-transparent px-6 py-3 font-medium text-white transition-all duration-300 hover:bg-white hover:text-black"
            >
              Book Online
            </Link>
          </div>

          {/* Phone */}
          <div className="mt-6 flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-3">
              <TfiHeadphoneAlt size={24} />
            </div>

            <div>
              <p className="text-sm">HAVE ANY QUESTION?</p>
              <p className="text-lg font-semibold">+1 587-837-1977</p>
            </div>
          </div>
        </div>

        {/* RIGHT IMAGE */}
        <div className="relative mt-10 flex justify-center md:justify-end">
          <Image
            src="/Banner-Image.webp"
            alt="Camz Cleaning professional cleaning service"
            width={650}
            height={650}
            className="scale-105 object-contain"
            priority
          />
        </div>
      </div>
    </section>
  );
}