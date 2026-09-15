"use client";
import React, { useState } from "react";
import { IoChevronDown, IoChevronUp } from "react-icons/io5";

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0);
  const faqs = [
    { question: "1. What cleaning services do you offer?", answer: "We provide residential, commercial, vehicle, and seasonal property cleaning services tailored to your specific needs." },
    { question: "2. Do you bring your own cleaning supplies?", answer: "Yes, our team arrives fully equipped with safe, professional-grade cleaning products and tools." },
    { question: "3. How can I book a cleaning service?", answer: "You can contact us directly or use our booking form to schedule your preferred service and time." },
    { question: "4. Do you offer flexible cleaning schedules?", answer: "Yes, we provide flexible scheduling options including weekly, bi-weekly, one-time, and after-hours cleaning services to suit your convenience." },
  ];

  return (
    <section className="bg-white px-6 py-20 md:px-12 lg:px-24">
      <div className="container-custom mx-auto grid grid-cols-1 items-start gap-16 lg:grid-cols-2">
        <div className="relative h-full min-h-[300px]">
          <div className="overflow-hidden rounded-[2.5rem] shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/wp-admin/uploads/stairs cleaning.webp" alt="stairs cleaning" className="h-[600px] w-full object-cover" />
          </div>
        </div>
        <div className="space-y-6">
          <div className="space-y-4">
            <span className="rounded-full bg-[#00CFE8] px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white md:text-xs">FAQs</span>
            <h2 className="my-4 text-4xl font-extrabold leading-tight text-[#0B4E9B] md:text-5xl">Frequently Asked Questions</h2>
            <p className="max-w-lg text-sm leading-relaxed text-gray-600">Find clear answers to common questions about our cleaning services, booking process, pricing, and service areas to help you decide confidently.</p>
          </div>
          <div className="space-y-4 pt-4">
            {faqs.map((faq, index) => (
              <div key={faq.question} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className={`flex w-full items-center justify-between rounded-xl p-5 text-left font-bold text-white transition-all duration-300 ${openIndex === index ? "bg-[#00CFE8]" : "bg-[#0B4E9B] hover:bg-[#094282]"}`}
                >
                  <span className="text-sm md:text-base">{faq.question}</span>
                  {openIndex === index ? <IoChevronUp size={20} /> : <IoChevronDown size={20} />}
                </button>
                {openIndex === index && <div className="px-5 pb-2 text-sm leading-relaxed text-gray-600 md:text-base">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
