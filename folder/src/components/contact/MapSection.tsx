// components/common/MapSection.tsx

export default function MapSection() {
  return (
    <section className="py-20 bg-white">
      <div className="container-custom">

        {/* Heading */}
        {/* <div className="text-center mb-10">
          <span className="inline-block px-4 py-1 rounded-full bg-[#02C0E6] text-white text-sm mb-4">
            Our Location
          </span>

          <h2 className="text-4xl md:text-5xl font-bold text-[#0B4E9B]">
            Visit Camz Cleaning
          </h2>

          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Find us in Calgary, Alberta, Canada. We proudly serve residential
            and commercial clients across the surrounding areas.
          </p>
        </div> */}

        {/* Map */}
        <div className="overflow-hidden rounded-3xl shadow-xl border border-gray-200">
          <iframe
            title="Map showing Calgary, Alberta, Canada"
            src="https://www.google.com/maps?q=Calgary,AB,Canada&output=embed"
            width="100%"
            height="500"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full"
          />
        </div>
      </div>
    </section>
  );
}