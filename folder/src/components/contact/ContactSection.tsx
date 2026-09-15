import Link from "next/link";
import {
  IoCallOutline,
  IoMailOutline,
  IoLocationOutline,
  IoCalendarOutline,
} from "react-icons/io5";
import BusinessHours from "./BusinessHours";

const ContactSection = () => {
  return (
    <section className="bg-[#EFFAFC] px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto space-y-12">
        {/* Top Row */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left Side */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-[#00CFE8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">
                Get In Touch
              </span>

              <h2 className="mt-4 text-4xl font-extrabold leading-tight text-[#0B4E9B] md:text-5xl">
                Ask a Question or Request Help With Your Booking
              </h2>

              <p className="max-w-xl leading-relaxed text-gray-600">
                Send a message if you need help choosing a service, confirming
                coverage or providing extra booking details. For the fastest
                appointment request, use the online booking system.
              </p>
            </div>

            <div className="space-y-6">
              <a
                href="tel:+15878371977"
                className="group flex items-center gap-5"
              >
                <div className="rounded-full bg-[#0B4E9B] p-4 text-white shadow-lg shadow-blue-200 transition group-hover:bg-[#00B7EB]">
                  <IoCallOutline size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#0B4E9B]">
                    Phone
                  </h3>
                  <p className="font-medium text-gray-600 transition group-hover:text-[#00B7EB]">
                    +1 587-837-1977
                  </p>
                </div>
              </a>

              <a
                href="mailto:info@camzcleaning.com"
                className="group flex items-center gap-5"
              >
                <div className="rounded-full bg-[#0B4E9B] p-4 text-white shadow-lg shadow-blue-200 transition group-hover:bg-[#00B7EB]">
                  <IoMailOutline size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#0B4E9B]">
                    Email
                  </h3>
                  <p className="font-medium text-gray-600 transition group-hover:text-[#00B7EB]">
                    info@camzcleaning.com
                  </p>
                </div>
              </a>

              <a
                href="https://maps.google.com/?q=Calgary,AB,Canada"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5"
              >
                <div className="rounded-full bg-[#0B4E9B] p-4 text-white shadow-lg shadow-blue-200 transition group-hover:bg-[#00B7EB]">
                  <IoLocationOutline size={28} />
                </div>

                <div>
                  <h3 className="text-xl font-extrabold text-[#0B4E9B]">
                    Service Area
                  </h3>
                  <p className="font-medium text-gray-600 transition group-hover:text-[#00B7EB]">
                    Calgary, AB, Canada
                  </p>
                </div>
              </a>
            </div>
          </div>

          {/* Right Side */}
          <div className="self-start rounded-[2rem] bg-[#0B4E9B] p-8 text-white shadow-2xl md:p-10 lg:p-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
              <IoCalendarOutline size={34} />
            </div>

            <h2 className="mb-5 text-3xl font-extrabold leading-tight md:text-4xl">
              Ready to Request an Appointment?
            </h2>

            <p className="mb-8 max-w-xl leading-8 text-blue-100">
              Choose your cleaning service, provide the required details and
              select your preferred appointment online. Camz Cleaning will review
              your request before confirming availability, scope and price.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap">
              <Link
                href="/booking/"
                className="inline-flex items-center justify-center rounded-xl bg-[#02C0E6] px-8 py-3 font-bold text-white transition hover:bg-white hover:text-[#0B4E9B]"
              >
                Book Online
              </Link>

              <a
                href="mailto:info@camzcleaning.com"
                className="inline-flex items-center justify-center rounded-xl border-2 border-white px-8 py-3 font-bold text-white transition hover:bg-white hover:text-[#0B4E9B]"
              >
                Send an Email
              </a>
            </div>
          </div>
        </div>

        {/* Full Width Business Hours */}
        <BusinessHours />
      </div>
    </section>
  );
};

export default ContactSection;
