"use client";
import Image from "next/image";
import { motion, type Variants } from "framer-motion";

const AboutSection = () => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="overflow-hidden bg-[#EFFAFC] px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto space-y-12">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="grid h-[320px] w-full grid-cols-2 gap-4 sm:h-[440px] lg:h-[560px]"
          >
            <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
              <Image src="/wp-admin/uploads/clean wadrobe.webp" alt="Clean wardrobe" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover object-center" />
            </div>
            <div className="relative h-full min-w-0 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
              <Image src="/wp-admin/uploads/cleaned kitchen.webp" alt="Clean kitchen" fill sizes="(max-width: 1024px) 50vw, 25vw" className="object-cover object-center" />
            </div>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-6"
          >
            <motion.span variants={itemVariants} className="inline-block rounded-full bg-[#00B7EB] px-4 py-1 text-sm font-semibold text-white">About Us</motion.span>
            <motion.h2 variants={itemVariants} className="text-4xl font-bold leading-tight text-[#004A8C] md:text-5xl">Reliable &amp; Affordable <br /> Cleaning Services</motion.h2>
            <motion.div variants={itemVariants} className="space-y-4 leading-relaxed text-gray-600">
              <p>Camz Cleaning is a professionally operated cleaning company proudly serving Calgary and surrounding communities. Our journey started from home with a small, dedicated team and a simple goal: to provide reliable, affordable, and quality cleaning services to local families and businesses.</p>
              <p>As a growing local company, we believe professional cleaning should be accessible without compromising on quality. Our dedicated team works carefully to understand each client&apos;s needs and provide dependable service with attention to detail.</p>
              <p>From regular home cleaning to deep cleaning, move-in/move-out cleaning, and other cleaning needs, we continue to grow while staying focused on the values we started with — quality service, fair pricing, reliability, and customer satisfaction.</p>
              <p>We are proud to be a Calgary-based business and grateful for every customer who supports our growing team.</p>
            </motion.div>
          </motion.div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-[#BFD3E1] bg-white/70 p-6 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
              <div className="flex-shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
                  <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
                    <Image src="/home.png" alt="Home" width={64} height={64} className="object-contain" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-2xl font-bold text-[#004A8C]">Trusted Home Care</h4>
                <p className="mt-3 leading-7 text-gray-500">Camz Cleaning provides dependable residential cleaning that keeps your home fresh, hygienic, and comfortable using safe and effective methods.</p>
              </div>
            </div>

            <div className="flex h-full flex-col items-center gap-5 rounded-2xl border border-[#BFD3E1] bg-white/70 p-6 text-center shadow-sm sm:flex-row sm:items-start sm:text-left">
              <div className="flex-shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
                  <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
                    <Image src="/about-icon-2.webp" alt="Office" width={64} height={64} className="object-contain" />
                  </div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-2xl font-bold text-[#004A8C]">Workplace Cleaning Experts</h4>
                <p className="mt-3 leading-7 text-gray-500">From small offices to large workplaces, Camz Cleaning ensures spotless, organized, and productive environments with reliable and affordable solutions.</p>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
