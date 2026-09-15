"use client";
import React, { useEffect, useRef } from "react";
import { FaStar } from "react-icons/fa6";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

const Counter = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const numericValue = parseInt(value.replace(/\D/g, ""), 10);
  const suffix = value.replace(/[0-9]/g, "");
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });

  useEffect(() => {
    if (isInView) motionValue.set(numericValue);
  }, [isInView, motionValue, numericValue]);

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) ref.current.textContent = Math.floor(latest).toString() + suffix;
    });
    return unsubscribe;
  }, [springValue, suffix]);

  return <span ref={ref}>0{suffix}</span>;
};

const StatsSection = () => {
  const stats = [
    { label: "Completed Projects", value: "120+" },
    { label: "Years Experience", value: "6+" },
    { label: "Team Members", value: "8+" },
    { label: "Google Rating", value: "5", hasStar: true },
  ];

  return (
    <section className="bg-[#0B4E9B] px-6 py-12">
      <div className="container-custom mx-auto flex flex-wrap items-center justify-between">
        {stats.map((stat, index) => (
          <React.Fragment key={stat.label}>
            <div className="min-w-[150px] flex-1 py-3 text-center text-white">
              <div className="mb-3 flex items-center justify-center gap-1 text-5xl font-semibold md:text-6xl">
                <Counter value={stat.value} />
                {stat.hasStar && (
                  <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }} viewport={{ once: true }}>
                    <FaStar className="text-4xl text-white md:text-5xl" />
                  </motion.div>
                )}
              </div>
              <p className="text-lg font-semibold tracking-wide opacity-95">{stat.label}</p>
            </div>
            {index !== stats.length - 1 && <div className="hidden h-24 w-px self-center bg-white/30 lg:block" />}
          </React.Fragment>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
