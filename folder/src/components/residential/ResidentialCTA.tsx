import Link from "next/link";

const ResidentialCTA = () => (
  <section className="bg-[#0B4E9B] px-6 py-16 text-center text-white md:px-12 lg:px-24">
    <div className="mx-auto max-w-4xl">
      <h2 className="text-3xl font-extrabold md:text-5xl">Book Residential Cleaning Online</h2>
      <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-blue-50">
        Choose your residential cleaning service, provide the home details and request your preferred appointment online.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-5">
        <Link href="/booking/" className="rounded-xl bg-white px-8 py-4 font-bold text-[#0B4E9B]">Book Online</Link>
        <Link href="/calgary-cleaning-services/" className="font-bold text-white underline underline-offset-4">Residential cleaning services in Calgary</Link>
      </div>
    </div>
  </section>
);

export default ResidentialCTA;
