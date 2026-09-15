const CalgaryMainContent = () => {
  const points = [
    {
      title: "Trusted Local House Cleaners",
      description:
        "Professional cleaning for Calgary homes with a clear scope based on your needs.",
    },
    {
      title: "Affordable Cleaning with Transparent Pricing",
      description:
        "Service pricing is based on the property, condition, frequency and requested tasks.",
    },
    {
      title: "Reliable Cleaning for Homes and Businesses",
      description:
        "Flexible residential and commercial cleaning options subject to availability.",
    },
  ];

  return (
    <section className="bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto rounded-3xl border border-[#0B4E9B]/10 bg-[#F8FBFD] p-8 shadow-sm md:p-12">
        <span className="inline-block rounded-full bg-[#00CEE6] px-5 py-1.5 text-sm font-semibold text-white">
          Calgary
        </span>

        <h2 className="mt-5 max-w-4xl text-4xl font-extrabold leading-tight text-[#004A8C] md:text-5xl">
          Professional Home and Commercial Cleaning Services in Calgary
        </h2>

        <div className="mt-7 max-w-5xl space-y-5 leading-relaxed text-gray-700">
          <p>
            Camz Cleaning provides dependable residential and commercial
            cleaning services across Calgary for homes, apartments, offices and
            other business spaces. Our cleaning plans are tailored to the
            property, required tasks and preferred schedule, helping clients
            maintain cleaner, healthier and more comfortable spaces.
          </p>

          <p>
            Whether you need routine house cleaning, deep cleaning or ongoing
            commercial cleaning, our team focuses on consistent service, clear
            cleaning scopes and careful attention to the areas that matter most.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {points.map((point) => (
            <article
              key={point.title}
              className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#0B4E9B]/10"
            >
              <h3 className="text-lg font-extrabold text-[#0B4E9B]">
                {point.title}
              </h3>
              <p className="mt-3 leading-relaxed text-gray-700">
                {point.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CalgaryMainContent;
