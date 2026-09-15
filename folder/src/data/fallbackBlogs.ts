export type FallbackBlog = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  faqs: { question: string; answer: string }[];
  steps: { title: string; description: string }[];
  detail_images: string[];
};

export const fallbackBlogs: FallbackBlog[] = [
  {
    id: "guide-neglected-house",
    title: "How to Clean a Neglected House Step by Step",
    description:
      "A neglected home is easier to tackle when the work is divided into clear stages. Start with ventilation and visible trash, then declutter one room at a time. Work from high surfaces down, clean kitchens and bathrooms carefully, vacuum soft surfaces, mop hard floors and finish by disinfecting frequently touched areas.",
    image_url: "/wp-admin/uploads/clean wadrobe.webp",
    created_at: "2026-08-20T12:00:00Z",
    detail_images: ["/wp-admin/uploads/cleaned floor.webp"],
    steps: [
      { title: "Start with airflow and trash", description: "Open windows when conditions allow and remove visible waste before detailed cleaning begins." },
      { title: "Declutter room by room", description: "Keep the job manageable by sorting one room at a time before wiping or washing surfaces." },
      { title: "Deep clean high-use areas", description: "Give kitchens and bathrooms extra attention, then vacuum, mop and disinfect touch points." },
    ],
    faqs: [
      { question: "What should I clean first?", answer: "Remove visible trash and clutter first so surfaces and floors can be cleaned properly." },
      { question: "When is professional help useful?", answer: "Professional cleaning can help when buildup is heavy, time is limited or the property needs a structured deep clean." },
    ],
  },
  {
    id: "guide-commercial-company",
    title: "How to Choose a Commercial Cleaning Company",
    description:
      "Compare commercial cleaning providers by scope, scheduling, communication and how clearly they explain pricing. A useful quote should reflect the property size, washrooms, flooring, foot traffic, access requirements and cleaning frequency instead of relying on a one-size-fits-all promise.",
    image_url: "/wp-admin/uploads/stairs cleaning.webp",
    created_at: "2026-08-21T12:00:00Z",
    detail_images: ["/wp-admin/uploads/floor cleaning.webp"],
    steps: [
      { title: "Define the cleaning scope", description: "List work areas, shared spaces, washrooms, floors and any special access requirements." },
      { title: "Compare like-for-like quotes", description: "Make sure each provider is pricing the same frequency and task list before comparing totals." },
      { title: "Confirm scheduling and communication", description: "Ask how schedule changes, access instructions and service concerns are handled." },
    ],
    faqs: [
      { question: "What affects commercial cleaning prices?", answer: "Property size, condition, frequency, flooring, washrooms, foot traffic and special tasks can all affect pricing." },
    ],
  },
  {
    id: "guide-weekly-schedule",
    title: "A Simple 7-Day Cleaning Schedule for Busy Homes",
    description:
      "A weekly cleaning routine can keep chores from building up. Assign small jobs to each day: reset common areas, clean bathrooms, focus on the kitchen, handle floors, catch up on laundry and reserve one day for deeper or seasonal tasks. Short, repeatable sessions are usually easier to maintain than one exhausting cleaning day.",
    image_url: "/wp-admin/uploads/Room cleaning.webp",
    created_at: "2026-08-22T12:00:00Z",
    detail_images: ["/wp-admin/uploads/whole bathroom cleaning.webp"],
    steps: [
      { title: "Plan small daily tasks", description: "Use short sessions for surfaces, clutter and high-use rooms instead of waiting for everything to pile up." },
      { title: "Give kitchens and bathrooms dedicated days", description: "These rooms benefit from regular cleaning because moisture, food residue and high-touch surfaces build up quickly." },
      { title: "Use one flexible catch-up day", description: "Leave room in the schedule for deeper cleaning, seasonal jobs or anything missed earlier in the week." },
    ],
    faqs: [
      { question: "Does every room need cleaning every day?", answer: "No. A rotating schedule spreads the work across the week while daily resets focus only on the areas that need them." },
    ],
  },
];
