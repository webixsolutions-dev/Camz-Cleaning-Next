import Link from "next/link";

const serviceAreas = [
  {
    city: "Calgary",
    description:
      "Residential, commercial, mobile vehicle and seasonal property cleaning with online booking.",
    href: "/calgary-cleaning-services/",
    dark: true,
  },
  {
    city: "Airdrie",
    description:
      "Cleaning options for homes, businesses, vehicles and seasonal properties, subject to service scope and availability.",
    href: "/airdrie-cleaning-services/",
    dark: false,
  },
  {
    city: "Cochrane",
    description:
      "Residential, commercial, mobile vehicle and seasonal property cleaning with scope and scheduling confirmed after review.",
    href: "/cochrane-cleaning-services/",
    dark: false,
  },
  {
    city: "Chestermere",
    description:
      "Cleaning services for homes, businesses, vehicles and seasonal properties based on the requested scope and appointment availability.",
    href: "/chestermere-cleaning-services/",
    dark: true,
  },
];

const AreasServed = () => {
  return (
    <section className="bg-[#EFFAFC] px-6 py-12 md:px-12 lg:px-24">
      <div className="container-custom mx-auto">
        <div className="mb-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#00B7EB] px-5 py-1.5 text-sm font-semibold text-white">
            Service Areas
          </span>
          <h2 className="text-4xl font-bold text-[#004A8C] md:text-5xl">
            Areas Served by Camz Cleaning
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-gray-600">
            Review local cleaning service information for Calgary, Airdrie,
            Cochrane and Chestermere.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {serviceAreas.map((area) => (
            <article
              key={area.city}
              className={`flex min-h-[190px] flex-col rounded-xl p-8 shadow-lg ${
                area.dark ? "bg-[#2964A8] text-white" : "bg-[#00A9CE] text-white"
              }`}
            >
              <h3 className="text-3xl font-bold">{area.city}</h3>
              <p className="mt-4 flex-1 leading-relaxed">{area.description}</p>
              <Link
                href={area.href}
                className="mt-6 inline-block w-fit font-bold underline decoration-white/60 underline-offset-4 hover:decoration-white"
              >
                View cleaning services in {area.city}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AreasServed;
