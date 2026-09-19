// "use client";
// import React, { useEffect, useRef } from "react";
// import { FaStar } from "react-icons/fa6";
// import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

// const Counter = ({ value }: { value: string }) => {
//   const ref = useRef<HTMLSpanElement | null>(null);
//   const isInView = useInView(ref, { once: true, amount: 0.5 });
//   const numericValue = parseInt(value.replace(/\D/g, ""), 10);
//   const suffix = value.replace(/[0-9]/g, "");
//   const motionValue = useMotionValue(0);
//   const springValue = useSpring(motionValue, { damping: 30, stiffness: 100 });

//   useEffect(() => {
//     if (isInView) motionValue.set(numericValue);
//   }, [isInView, motionValue, numericValue]);

//   useEffect(() => {
//     const unsubscribe = springValue.on("change", (latest) => {
//       if (ref.current) ref.current.textContent = Math.floor(latest).toString() + suffix;
//     });
//     return unsubscribe;
//   }, [springValue, suffix]);

//   return <span ref={ref}>0{suffix}</span>;
// };

// const StatsSection = () => {
//   const stats = [
//     { label: "Completed Projects", value: "120+" },
//     { label: "Team Members", value: "8+" },
//     { label: "Google Rating", value: "5", hasStar: true },
//   ];

//   return (
//     <section className="bg-[#0B4E9B] px-6 py-12">
//       <div className="container-custom mx-auto flex flex-wrap items-center justify-between">
//         {stats.map((stat, index) => (
//           <React.Fragment key={stat.label}>
//             <div className="min-w-[150px] flex-1 py-3 text-center text-white">
//               <div className="mb-3 flex items-center justify-center gap-1 text-5xl font-semibold md:text-6xl">
//                 <Counter value={stat.value} />
//                 {stat.hasStar && (
//                   <motion.div initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, type: "spring" }} viewport={{ once: true }}>
//                     <FaStar className="text-4xl text-white md:text-5xl" />
//                   </motion.div>
//                 )}
//               </div>
//               <p className="text-lg font-semibold tracking-wide opacity-95">{stat.label}</p>
//             </div>
//             {index !== stats.length - 1 && <div className="hidden h-24 w-px self-center bg-white/30 lg:block" />}
//           </React.Fragment>
//         ))}
//       </div>
//     </section>
//   );
// };

// export default StatsSection;

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
    { label: "Completed Projects", value: "500+" },
    { label: "Trained Team Members", value: "8+" },
    { label: "Google Review Rating", value: "5", hasStar: true },
    { label: "Local Service Areas", value: "5+" },
  ];

  return (
    <section className="bg-gradient-to-r from-[#072d5c] via-[#0B4E9B] to-[#072d5c] px-6 py-14 shadow-inner">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className="relative text-center text-white">
              <div className="mb-2 flex items-center justify-center gap-1 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                <Counter value={stat.value} />
                {stat.hasStar && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                    viewport={{ once: true }}
                    className="inline-block"
                  >
                    <FaStar className="text-3xl text-amber-400 sm:text-4xl md:text-5xl" />
                  </motion.div>
                )}
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-200 sm:text-sm">
                {stat.label}
              </p>
              {index !== stats.length - 1 && (
                <div className="hidden absolute top-1/2 -right-4 h-12 w-px -translate-y-1/2 bg-white/20 lg:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
