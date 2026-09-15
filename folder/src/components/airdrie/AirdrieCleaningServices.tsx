import Link from "next/link";

const AirdrieCleaningServices = () => {
  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <div className="inline-block rounded-full bg-[#00CEE6] px-5 py-1.5 text-sm font-semibold tracking-wide text-white">
            Airdrie
          </div>

          <h2 className="text-4xl font-extrabold leading-[1.1] text-[#004A8C] md:text-5xl">
            Professional Residential and Commercial Cleaning Services in Airdrie
          </h2>

          <div className="space-y-5 font-medium leading-relaxed text-gray-700">
            <p>
              Life in Airdrie can be busy, making it hard to keep your home or
              business spotless. Camz Cleaning provides trusted local services
              from residential and commercial cleaning to vehicle care and
              seasonal maintenance all handled by our certified team, ensuring
              convenience, quality, and a fresh, worry-free space every time.
            </p>

            <p>
              We proudly serve the entire Airdrie area with reliable and
              affordable services. Whether you are comparing Airdrie house
              cleaning prices or checking general cleaning services For Calgary
              prices, we offer transparent quotes and consistent quality.
            </p>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#004A8C] px-5 py-2 text-white shadow-md">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-sm font-semibold tracking-wide md:text-base">
              100% Satisfaction Assured
            </span>
          </div>

          <div className="pt-2">
            <Link
              href="/contact-us"
              className="inline-block rounded-xl bg-gradient-to-r from-[#0091C1] to-[#004A8C] px-10 py-4 font-bold text-white transition-shadow duration-300 hover:shadow-lg active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </div>

        {/* Image */}
        <div className="relative group">
          <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-[#00CEE6]/10 to-[#004A8C]/10 blur-2xl transition-all duration-500 group-hover:blur-xl" />

          <div className="relative z-10 overflow-hidden rounded-3xl border-[10px] border-white shadow-2xl">
            <img
              src="/wp-admin/uploads/cleaned floor.webp"
              alt="Freshly cleaned floor in an Airdrie property"
              className="block h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AirdrieCleaningServices;