import Link from "next/link";

const FinalCTASection = () => {
  return (
    <section className="bg-[#0B4E9B] px-6 py-16 text-center text-white md:px-12 lg:px-24">
      <div className="mx-auto max-w-4xl">
        <h2 className="text-3xl font-extrabold md:text-5xl">
          Ready to Choose Your Cleaning Service?
        </h2>
        <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-blue-50">
          Select the service you need, provide the relevant details and request
          your preferred appointment online.
        </p>
        <Link
          href="/booking/"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-4 font-bold text-[#0B4E9B] transition-colors hover:bg-[#EFFAFC]"
        >
          Book a Cleaning Service Online
        </Link>
      </div>
    </section>
  );
};

export default FinalCTASection;
