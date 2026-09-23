"use client";

import { useEffect, useState } from "react";
import { Mail, Phone, Menu, X, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [areasOpen, setAreasOpen] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    setIsAuthed(
      document.cookie
        .split(";")
        .some((c) => c.trim().startsWith("sb-") && c.includes("auth-token"))
    );
  }, [pathname]);

  // --> SIMPLE REDIRECT TO MAGIC ROUTE <--
  const handleDashboardClick = () => {
    // Middleware khud handle karega ke isko kahan bhejna hai
    window.location.href = "/dashboard";
  };

  const serviceLinks = [
    { name: "COMMERCIAL CLEANING", href: "/commercial-cleaning-services" },
    { name: "RESIDENTIAL CLEANING", href: "/residential-cleaning-services" },
    { name: "AIRBNB CLEANING", href: "/airbnb-cleaning-services/" },
    { name: "SEASONAL CLEANING", href: "/seasonal-property-service" },
  ];

  const areaLinks = [
    { name: "CALGARY", href: "/calgary-cleaning-services" },
    { name: "AIRDRIE", href: "/airdrie-cleaning-services" },
    { name: "COCHRANE", href: "/cochrane-cleaning-services" },
    { name: "CHESTERMERE", href: "/chestermere-cleaning-services" },
  ];

  return (
    <header className="w-full shadow-sm relative z-50">
      {/* 🔵 TOP BAR */}
      <div className="bg-[#4276B2] text-white hidden md:block text-sm md:text-lg py-2">
        <div className="container-custom mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 md:gap-0">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-center sm:text-left">
            <a href="mailto:info@camzcleaning.com" className="flex items-center gap-2 text-sm hover:text-[#00B7EB] transition-colors">
              <Mail size={18} />
              info@camzcleaning.com
            </a>
            <a href="tel:+15878371977" className="flex items-center gap-2 text-sm hover:text-[#00B7EB] transition-colors">
              <Phone size={18} />
              +1 587-837-1977
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden md:block">Follow Us:</span>
            <a href="https://www.instagram.com/camzcleaning"><FaInstagram size={16} /></a>
            <a href="https://x.com/camzcleaning"><FaTwitter size={16} /></a>
            <a href="https://web.facebook.com/Camzcleaning1?_rdc=1&_rdr#"><FaFacebookF size={16} /></a>
            <a href="https://www.linkedin.com/company/camzcleaning"><FaLinkedinIn size={16} /></a>
            <a href="https://www.youtube.com/@CamzCleaning"><FaYoutube size={16} /></a>
          </div>
        </div>
      </div>

      {/* ⚪ NAVBAR */}
      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:gap-4 lg:px-6 lg:py-3.5 xl:gap-5 xl:px-7 2xl:px-8">
          <Link href="/" className="-ml-2 shrink-0 self-center sm:-ml-3 lg:-ml-4">
            <Image
              src="/logo.webp"
              alt="Camz Cleaning"
              width={608}
              height={174}
              priority
              className="block h-auto max-w-none"
              style={{
                width: "clamp(220px, 17vw, 320px)",
                height: "auto",
              }}
            />
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-2.5 whitespace-nowrap text-[12px] font-semibold text-[#0B4E9B] lg:flex xl:gap-4 xl:text-[14px] 2xl:gap-5 2xl:text-[15px]">
            <Link href="/" className="hover:text-[#00B7EB] transition-colors">HOME</Link>
            <Link href="/about-us" className="hover:text-[#00B7EB] transition-colors">ABOUT US</Link>

            <div className="relative group py-2">
              <button onClick={() => router.push("/services")} className="flex items-center gap-1.5 cursor-pointer transition-colors group-hover:text-[#00B7EB]">
                SERVICES <ChevronDown size={16} />
              </button>
              <div className="absolute left-1/2 top-[calc(100%+8px)] z-50 hidden w-64 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50 group-hover:block">
                {serviceLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="block rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-blue-50 hover:text-[#00B7EB]">{link.name}</Link>
                ))}
              </div>
            </div>

            <div className="relative group cursor-pointer py-2">
              <div className="flex items-center gap-1.5 group-hover:text-[#00B7EB] transition-colors">
                AREAS <ChevronDown size={16} />
              </div>
              <div className="absolute left-1/2 top-[calc(100%+8px)] z-50 hidden w-52 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl shadow-slate-300/50 group-hover:block">
                {areaLinks.map((link) => (
                  <Link key={link.name} href={link.href} className="block rounded-xl px-4 py-3 text-sm font-bold transition-all hover:bg-blue-50 hover:text-[#00B7EB]">{link.name}</Link>
                ))}
              </div>
            </div>

            <Link href="/booking" className="hover:text-[#00B7EB] transition-colors">ONLINE BOOKING</Link>
            <Link href="/contact-us" className="hover:text-[#00B7EB] transition-colors">CONTACT US</Link>
          </nav>

          {/* Desktop Button */}
          <div className="hidden shrink-0 lg:block">
            {isAuthed ? (
              <button onClick={handleDashboardClick} className="bg-[#0B4E9B] whitespace-nowrap text-white px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg text-[13px] xl:text-[14px] font-bold hover:bg-[#00B7EB] transition-all cursor-pointer">
                Dashboard
              </button>
            ) : (
              <Link href="/login">
                <button className="bg-[#0B4E9B] whitespace-nowrap text-white px-4 xl:px-6 py-2.5 xl:py-3 rounded-lg text-[13px] xl:text-[14px] font-bold hover:bg-[#00B7EB] transition-all">Login</button>
              </Link>
            )}
          </div>

          <button className="lg:hidden text-[#0B4E9B]" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle navigation menu">
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* 📱 Mobile / tablet menu */}
        {isOpen && (
          <div className="max-h-[80vh] overflow-y-auto border-t bg-white font-bold text-[#0B4E9B] lg:hidden">
            <div className="flex flex-col">
              <Link href="/" onClick={() => setIsOpen(false)} className="border-b px-6 py-5">HOME</Link>
              <Link href="/about-us" onClick={() => setIsOpen(false)} className="border-b px-6 py-5">ABOUT US</Link>

              <div className="border-b">
                <div className="flex items-center">
                  <Link
                    href="/services"
                    onClick={() => setIsOpen(false)}
                    className="min-w-0 flex-1 px-6 py-5"
                  >
                    SERVICES
                  </Link>
                  <button
                    type="button"
                    onClick={() => setServicesOpen((open) => !open)}
                    className="flex h-full shrink-0 items-center justify-center px-6 py-5"
                    aria-label="Toggle services menu"
                    aria-expanded={servicesOpen}
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {servicesOpen && (
                  <div className="border-t bg-slate-50 py-2">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-9 py-3 text-sm font-semibold hover:bg-blue-50 hover:text-[#00B7EB]"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-b">
                <button
                  type="button"
                  onClick={() => setAreasOpen((open) => !open)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left"
                  aria-expanded={areasOpen}
                >
                  <span>AREAS</span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${areasOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {areasOpen && (
                  <div className="border-t bg-slate-50 py-2">
                    {areaLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsOpen(false)}
                        className="block px-9 py-3 text-sm font-semibold hover:bg-blue-50 hover:text-[#00B7EB]"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/booking" onClick={() => setIsOpen(false)} className="border-b px-6 py-5">ONLINE BOOKING</Link>
              <Link href="/contact-us" onClick={() => setIsOpen(false)} className="border-b px-6 py-5">CONTACT US</Link>

              <div className="p-6">
                {isAuthed ? (
                  <button onClick={() => { handleDashboardClick(); setIsOpen(false); }} className="w-full rounded-md bg-[#0B4E9B] py-3 text-white cursor-pointer">
                    Dashboard
                  </button>
                ) : (
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <button className="w-full rounded-md bg-[#0B4E9B] py-3 text-white">Login</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
