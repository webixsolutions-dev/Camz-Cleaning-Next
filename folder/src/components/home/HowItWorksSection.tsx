"use client";

import { CalendarDays, ListChecks, Sparkles, type LucideIcon } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";

type Step = {
  number: string;
  title: string;
  description: string;
  Icon: LucideIcon;
};

const steps: Step[] = [
  {
    number: "01",
    Icon: ListChecks,
    title: "Select Service",
    description: "Choose the cleaning service that best fits your home or office needs.",
  },
  {
    number: "02",
    Icon: CalendarDays,
    title: "Set Schedule",
    description: "Choose a convenient date and time that best fits your schedule.",
  },
  {
    number: "03",
    Icon: Sparkles,
    title: "Cleaning Done",
    description: "Our team finishes the job carefully, leaving your space spotless and refreshed.",
  },
];

const circleVariants: Variants = {
  hidden: { scale: 0.65, opacity: 0, y: 20 },
  visible: (index: number) => ({
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { delay: index * 0.2, duration: 0.6, type: "spring" },
  }),
};

const HowItWorksSection = () => {
  return (
    <section className="overflow-hidden bg-white px-6 py-16 md:px-12 lg:px-24">
      <div className="container-custom mx-auto text-center">
        <div className="mb-10 flex flex-col items-center">
          <span className="mb-4 rounded-full bg-[#00B7EB] px-4 py-1.5 text-sm font-semibold text-white">
            How It Works
          </span>
          <h2 className="mb-4 text-4xl font-extrabold leading-tight text-[#004A8C] md:text-5xl">
            Schedule Your Cleaning Anytime
          </h2>
          <p className="max-w-3xl text-gray-600">
            Book your cleaning service in just minutes through a quick, simple,
            and flexible process tailored to fit your schedule, making it easy
            and convenient for you.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[1fr_auto_1fr_auto_1fr] md:gap-4">
          {steps.map((step, index) => {
            const Icon = step.Icon;
            return (
              <div key={step.number} className="contents">
                <motion.div
                  custom={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.35 }}
                  variants={circleVariants}
                  className="flex w-full flex-col items-center text-center"
                >
                  <div className="relative mb-8 flex h-44 w-44 items-center justify-center rounded-full border border-[#BDE8F2] bg-white p-3 shadow-sm">
                    <div className="relative flex h-full w-full items-center justify-center rounded-full bg-[#00B7EB]">
                      <Icon className="h-16 w-16 stroke-[1.5] text-white" />
                      <div className="absolute -bottom-4 -right-4 flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-[#004A8C] text-3xl font-bold text-white shadow-md">
                        {step.number}
                      </div>
                    </div>
                  </div>
                  <h4 className="mb-2 text-2xl font-extrabold text-[#004A8C]">
                    {step.title}
                  </h4>
                  <p className="mx-auto max-w-[280px] text-sm text-gray-600">
                    {step.description}
                  </p>
                </motion.div>

                {index < steps.length - 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 + index * 0.15, duration: 0.5 }}
                    className="hidden self-start pt-20 md:block"
                  >
                    <div className="relative h-6 w-28">
                      <Image src="/arrow.png" alt="Process flow" fill className="object-contain" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
