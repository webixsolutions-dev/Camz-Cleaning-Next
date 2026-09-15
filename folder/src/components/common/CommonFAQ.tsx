"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FAQItem {
  id: number | string;
  question: string;
  answer: string;
}

interface CommonFAQProps {
  faqs: FAQItem[];
}

const CommonFAQ = ({ faqs }: CommonFAQProps) => {
  const [activeId, setActiveId] = useState<number | string | null>(
    faqs.length > 0 ? faqs[0].id : null,
  );

  const toggleAccordion = (id: number | string) => {
    setActiveId((current) => (current === id ? null : id));
  };

  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <span className="mb-4 inline-block rounded-full bg-[#00B7EB] px-5 py-1 text-xs font-bold uppercase text-white">
            FAQs
          </span>
          <h2 className="mb-2 text-4xl font-extrabold text-[#004A8C] md:text-5xl">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-base text-gray-600">
            Find clear answers about service scope, scheduling, pricing and
            online booking.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq) => {
            const isActive = activeId === faq.id;
            const buttonId = `faq-button-${faq.id}`;
            const panelId = `faq-panel-${faq.id}`;

            return (
              <div key={faq.id} className="overflow-hidden">
                <button
                  id={buttonId}
                  type="button"
                  onClick={() => toggleAccordion(faq.id)}
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  className={`flex w-full items-center justify-between rounded-xl p-3 text-left text-white transition-all duration-300 md:px-8 md:py-3 ${
                    isActive
                      ? "bg-[#00B7EB] shadow-lg"
                      : "bg-[#004A8C] hover:bg-[#003d75]"
                  }`}
                >
                  <span className="text-lg font-semibold">{faq.question}</span>
                  {isActive ? (
                    <ChevronUp className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>

                <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  initial={false}
                  animate={{
                    height: isActive ? "auto" : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="-mt-2 rounded-b-xl border-x border-b border-gray-100 p-4 pt-8 text-lg leading-relaxed text-gray-700 md:px-8">
                    {faq.answer}
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CommonFAQ;
