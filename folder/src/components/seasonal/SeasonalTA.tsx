import Link from "next/link";

const SeasonalCTA = () => (
  <section className="bg-[#0B4E9B] px-6 py-16 text-center text-white md:px-12 lg:px-24">
    <div className="mx-auto max-w-4xl">
      <h2 className="text-3xl font-extrabold md:text-5xl">Book Seasonal Property Service Online</h2>
      <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-blue-50">
        Provide the property details, requested tasks and preferred appointment so Camz Cleaning can review the service scope and availability.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
        <Link href="/booking/" className="rounded-xl bg-white px-8 py-4 font-bold text-[#0B4E9B]">Book Online</Link>
        <Link href="/calgary-cleaning-services/" className="font-bold text-white underline underline-offset-4">Seasonal property services in Calgary</Link>
      </div>
    </div>
  </section>
);

export default SeasonalCTA;
