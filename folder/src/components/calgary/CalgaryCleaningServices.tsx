import Image from "next/image";

const CalgaryCleaningServices = () => {
  const checklistItems = [
    "Trusted local house cleaners",
    "Affordable cleaning with transparent pricing",
    "Clear service scopes before the appointment",
    "Online booking for service requests",
    "Flexible scheduling subject to availability",
    "A skilled local cleaning team",
  ];

  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div className="space-y-8">
          <span className="inline-block rounded-full bg-[#00CEE6] px-5 py-1.5 text-sm font-semibold text-white">
            Calgary Cleaning Services
          </span>
          <h2 className="text-4xl font-extrabold leading-[1.1] text-[#004A8C] md:text-5xl">
            Why Choose Camz Cleaning in Calgary?
          </h2>
          <p className="leading-relaxed text-gray-700">
            Camz Cleaning provides residential, commercial, mobile vehicle and
            seasonal property cleaning in Calgary with clear service scopes and
            a straightforward online booking process.
          </p>
          <p className="leading-relaxed text-gray-700">
            Customers can choose the service they need, provide the relevant
            property or vehicle details and request a preferred appointment.
            Scheduling is confirmed after the request is reviewed for scope and
            availability.
          </p>
          <ul className="space-y-3">
            {checklistItems.map((item) => (
              <li key={item} className="flex items-start gap-3 font-semibold text-gray-700">
                <span className="mt-2 h-2.5 w-2.5 flex-shrink-0 rounded-full bg-[#00CEE6]" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border-[10px] border-white shadow-2xl">
          <Image
            src="/p4.webp"
            alt="Cleaning service in Calgary"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      </div>
    </section>
  );
};

export default CalgaryCleaningServices;
