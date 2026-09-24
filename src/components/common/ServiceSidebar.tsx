import Image from "next/image";
import Link from "next/link";
import { IoCallOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

const ServiceSidebar = () => {
  const services = [
    { name: "Commercial Cleaning", href: "/commercial-cleaning-services/" },
    { name: "Residential Cleaning", href: "/residential-cleaning-services/" },
    { name: "Vehicle Cleaning Service", href: "/vehicle-cleaning-service/" },
    { name: "Seasonal Property Service", href: "/seasonal-property-service/" },
  ];

  return (
    <div className="w-full space-y-2">
      <div className="rounded-[1.5rem] bg-[#0B4E9B] p-8 text-white shadow-xl">
        <h2 className="mb-6 text-2xl font-extrabold tracking-tight">
          Cleaning Services
        </h2>
        <ul className="space-y-4">
          {services.map((service) => (
            <li key={service.name}>
              <Link
                href={service.href}
                className="flex items-center gap-3 text-sm font-bold transition-colors hover:text-[#00CFE8] md:text-base"
              >
                <IoCheckmarkCircleOutline size={20} aria-hidden="true" />
                {service.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="group relative h-[350px] overflow-hidden rounded-[1.5rem]">
        <Image
          src="/wp-admin/uploads/help-bg.webp"
          alt="Cleaning service background"
          fill
          sizes="(max-width: 1024px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex flex-col justify-center bg-[#0B4E9B]/85 p-8 text-white">
          <div className="mb-6 w-fit rounded-full bg-white/20 p-3">
            <IoCallOutline size={30} aria-hidden="true" />
          </div>
          <h2 className="mb-4 text-3xl font-extrabold leading-tight">
            Need Help Choosing a Service?
          </h2>
          <p className="mb-8 leading-relaxed text-white">
            Contact Camz Cleaning if you need help with service selection,
            coverage or booking details.
          </p>
          <Link
            href="/contact-us/"
            className="w-fit rounded-xl border-2 border-white/70 px-6 py-2.5 text-sm font-bold transition-all hover:bg-white hover:text-[#0B4E9B]"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceSidebar;
