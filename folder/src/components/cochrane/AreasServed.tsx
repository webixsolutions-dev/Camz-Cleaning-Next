"use client";

import Link from "next/link";

const AreasServed = () => {
  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <img
            src="/wp-admin/uploads/sink cleaning.webp"
            alt="Clean bathroom sink after cleaning service"
            className="block h-auto w-full"
          />
        </div>

        {/* Content */}
        <div className="flex flex-col space-y-6">
          <h2 className="mb-2 text-4xl font-extrabold text-[#004A8C] md:text-5xl">
            Areas We Serve
          </h2>

          <p className="font-medium leading-relaxed text-gray-700">
            CamzCleaning proudly serves Calgary, Airdrie, Cochrane, and
            Chestermere. We provide professional seasonal property services,
            move-in/move-out cleaning, and home maintenance, ensuring your home
            and yard stay spotless, safe, and well-maintained throughout the
            year.
          </p>

          <div className="pt-4">
            <Link
              href="/contact-us"
              className="inline-block rounded-lg bg-gradient-to-r from-[#0091C1] to-[#004A8C] px-10 py-3 font-bold text-white transition-all duration-300 hover:shadow-lg active:scale-95"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AreasServed;