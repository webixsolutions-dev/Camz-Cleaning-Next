"use client";

import Image from "next/image";
import Link from "next/link";
import {
  IoCallOutline,
  IoCheckmarkCircleOutline,
  IoLocationOutline,
  IoLogoFacebook,
  IoLogoInstagram,
  IoLogoLinkedin,
  IoLogoYoutube,
  IoMailOutline,
} from "react-icons/io5";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about-us/" },
    { name: "Our Services", href: "/services/" },
    { name: "Our Gallery", href: "/gallery/" },
    { name: "Our Blog", href: "/blog/" },
    { name: "Contact Us", href: "/contact-us/" },
  ];

  const services = [
    { name: "Commercial Cleaning", href: "/commercial-cleaning-services/" },
    { name: "Residential Cleaning", href: "/residential-cleaning-services/" },
    { name: "Vehicle Cleaning", href: "/vehicle-cleaning-service/" },
    { name: "Seasonal Property Service", href: "/seasonal-property-service/" },
  ];

  const socialLinks = [
    { label: "Instagram", href: "https://www.instagram.com/camzcleaning", icon: <IoLogoInstagram size={20} /> },
    { label: "X", href: "https://x.com/camzcleaning", icon: <FaXTwitter size={18} /> },
    { label: "Facebook", href: "https://web.facebook.com/Camzcleaning1?_rdc=1&_rdr#", icon: <IoLogoFacebook size={20} /> },
    { label: "LinkedIn", href: "https://www.linkedin.com/company/camzcleaning", icon: <IoLogoLinkedin size={20} /> },
    { label: "YouTube", href: "https://www.youtube.com/@CamzCleaning", icon: <IoLogoYoutube size={20} /> },
  ];

  return (
    <footer className="border-t border-white bg-gradient-to-r from-[#1E5D9E] to-[#16497D] px-6 pb-8 pt-16 text-white md:px-12 lg:px-24">
      <div className="container-custom mx-auto mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-6">
          <Image src="/wp-admin/uploads/footer-logo.webp" alt="Camz Cleaning" width={304} height={87} className="h-auto w-auto" />
          <p className="text-sm leading-relaxed text-white">
            Camz Cleaning provides residential, commercial, vehicle and seasonal
            property cleaning, with online booking for preferred appointments.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold">Follow Us:</span>
            <div className="flex gap-3">
              {socialLinks.map((link) => (
                <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={`Camz Cleaning on ${link.label}`} className="transition-colors hover:text-cyan-300">
                  {link.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-xl font-extrabold">Quick Links</h3>
          <ul className="space-y-3">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="flex items-center gap-2 text-blue-50 transition-colors hover:text-cyan-300">
                  <IoCheckmarkCircleOutline size={18} aria-hidden="true" />
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-xl font-extrabold">Our Services</h3>
          <ul className="space-y-3">
            {services.map((service) => (
              <li key={service.name}>
                <Link href={service.href} className="flex items-center gap-2 text-blue-50 transition-colors hover:text-cyan-300">
                  <IoCheckmarkCircleOutline size={18} aria-hidden="true" />
                  {service.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-xl font-extrabold">Contact Info</h3>
          <ul className="space-y-5">
            <li>
              <a href="mailto:info@camzcleaning.com" className="flex items-center gap-3 transition-colors hover:text-[#00B7EB]">
                <span className="rounded-md bg-white/10 p-2"><IoMailOutline size={20} aria-hidden="true" /></span>
                info@camzcleaning.com
              </a>
            </li>
            <li>
              <a href="tel:+15878371977" className="flex items-center gap-3 transition-colors hover:text-[#00B7EB]">
                <span className="rounded-md bg-white/10 p-2"><IoCallOutline size={20} aria-hidden="true" /></span>
                +1 587-837-1977
              </a>
            </li>
            <li>
              <a href="https://maps.google.com/?q=Calgary,AB,Canada" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 transition-colors hover:text-[#00B7EB]">
                <span className="rounded-md bg-white/10 p-2"><IoLocationOutline size={20} aria-hidden="true" /></span>
                Calgary, AB, Canada
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="container-custom mx-auto flex flex-col items-center justify-between gap-4 border-t border-white/70 pt-8 text-sm font-medium md:flex-row">
        <p>Copyright © {currentYear} Camz Cleaning. All rights reserved.</p>
        <Link href="/privacy-policy/" className="flex items-center gap-2 transition-colors hover:text-cyan-300">
          <IoCheckmarkCircleOutline size={18} aria-hidden="true" />
          Privacy Policy
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
