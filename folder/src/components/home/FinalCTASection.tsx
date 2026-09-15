import Link from "next/link";

const FinalCTASection = () => {
  return (
    <section className="relative overflow-hidden bg-[#134D91] px-6 py-20 text-white md:px-12 lg:px-24">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/wp-admin/uploads/clean-lobby.webp')" }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 bg-[#134F95]/90" aria-hidden="true" />

      <div className="container-custom relative z-10 mx-auto">
        <div className="max-w-3xl space-y-6">
          <span className="inline-block rounded-full border border-cyan-300 px-5 py-1.5 text-sm font-semibold text-cyan-200">
            Online Booking
          </span>
          <h2 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Ready to Request a Cleaning Appointment?
          </h2>
          <p className="text-lg leading-relaxed text-blue-50 md:text-xl">
            Choose your service, provide the relevant property or vehicle
            details and request your preferred appointment online. Camz Cleaning
            confirms availability, scope and price after review.
          </p>
          <Link
            href="/booking/"
            className="inline-block rounded-xl border-2 border-white px-10 py-3 text-lg font-bold text-white transition-colors hover:bg-white hover:text-[#004A8C]"
          >
            Book Online
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
