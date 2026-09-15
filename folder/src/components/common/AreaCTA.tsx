import Link from "next/link";

interface AreaCTAProps {
  city: string;
}

const AreaCTA = ({ city }: AreaCTAProps) => {
  const headings: Record<string, string> = {
    Calgary: "Book a Cleaning Service in Calgary",
    Airdrie: "Book Cleaning Services in Airdrie",
    Cochrane: "Book Cleaning Services in Cochrane",
    Chestermere: "Book Cleaning Services in Chestermere",
  };

  const heading = headings[city] ?? `Book Cleaning Services in ${city}`;

  return (
    <section className="relative w-full overflow-hidden px-6 py-16">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/wp-admin/uploads/area-cta.webp')" }}
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[#316194]/75" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl space-y-7 text-center">
        <span className="inline-block rounded-full border border-[#00CFE8] px-5 py-1.5 text-xs font-bold uppercase tracking-widest text-white">
          Online Booking
        </span>

        <h2 className="text-4xl font-extrabold leading-tight text-white md:text-6xl">
          {heading}
        </h2>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white md:text-xl">
          Choose your service, provide the {city} address and relevant details,
          and request your preferred appointment online. Availability and scope
          are confirmed after review.
        </p>

        <Link
          href="/booking/"
          className="inline-block rounded-xl border-2 border-white/70 px-10 py-4 text-lg font-bold text-white shadow-xl transition-all duration-300 hover:bg-white hover:text-[#0B4E9B]"
        >
          Book Online
        </Link>
      </div>
    </section>
  );
};

export default AreaCTA;
