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
      <div className="container-custom mx-auto grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative flex items-center gap-4"
        >
          <div className="relative aspect-[4/5] w-2/3 overflow-hidden rounded-2xl border-4 border-white shadow-lg">
            <Image src="/wp-admin/uploads/clean wadrobe.webp" alt="Clean Kitchen" fill className="object-cover" />
          </div>
          <div className="flex w-1/3 flex-col gap-4">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ type: "spring", stiffness: 100, delay: 0.4 }}
              className="z-10 flex aspect-square flex-col items-center justify-center rounded-full bg-[#00B7EB] p-4 text-center text-white shadow-md"
            >
              <span className="text-3xl font-bold md:text-5xl">6+</span>
              <span className="text-[10px] font-semibold uppercase leading-tight md:text-sm">Years of<br />Experiences</span>
            </motion.div>
            <div className="relative aspect-[3/5] overflow-hidden rounded-2xl border-4 border-white shadow-lg">
              <Image src="/wp-admin/uploads/cleaned kitchen.webp" alt="Cleaning detail" fill className="object-cover" />
            </div>
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
          <motion.h2 variants={itemVariants} className="text-4xl font-bold leading-tight text-[#004A8C] md:text-5xl">Reliable &amp; Affordable <br /> Cleaning Experts</motion.h2>
          <motion.p variants={itemVariants} className="leading-relaxed text-gray-600">Focused on professional cleaning excellence, Camz Cleaning provides trusted services designed to keep your space spotless and well-maintained.</motion.p>

          <div className="space-y-8">
            <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex-shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
                  <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
                    <Image src="/home.png" alt="Home" width={64} height={64} className="object-contain" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#004A8C]">Trusted Home Care</h4>
                <p className="mt-3 leading-7 text-gray-500">Camz Cleaning provides dependable residential cleaning that keeps your home fresh, hygienic, and comfortable using safe and effective methods.</p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
              <div className="flex-shrink-0">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-[3px] border-[#BFD3E1]">
                  <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#D8E2E8]">
                    <Image src="/about-icon-2.webp" alt="Office" width={64} height={64} className="object-contain" />
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-2xl font-bold text-[#004A8C]">Workplace Cleaning Experts</h4>
                <p className="mt-3 leading-7 text-gray-500">From small offices to large workplaces, Camz Cleaning ensures spotless, organized, and productive environments with reliable and affordable solutions.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
