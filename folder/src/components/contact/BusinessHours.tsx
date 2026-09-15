"use client";

import { useEffect, useMemo, useState } from "react";
import { IoChevronDown, IoTimeOutline } from "react-icons/io5";

type DayHours = {
  day: string;
  open: number | null;
  close: number | null;
  label: string;
};

const HOURS: DayHours[] = [
  { day: "Monday", open: 9 * 60, close: 18 * 60, label: "9 a.m.–6 p.m." },
  { day: "Tuesday", open: 9 * 60, close: 18 * 60, label: "9 a.m.–6 p.m." },
  { day: "Wednesday", open: 9 * 60, close: 18 * 60, label: "9 a.m.–6 p.m." },
  { day: "Thursday", open: 9 * 60, close: 18 * 60, label: "9 a.m.–6 p.m." },
  { day: "Friday", open: 9 * 60, close: 18 * 60, label: "9 a.m.–6 p.m." },
  { day: "Saturday", open: 10 * 60, close: 16 * 60, label: "10 a.m.–4 p.m." },
  { day: "Sunday", open: null, close: null, label: "Closed" },
];

const dayIndex: Record<string, number> = {
  Monday: 0,
  Tuesday: 1,
  Wednesday: 2,
  Thursday: 3,
  Friday: 4,
  Saturday: 5,
  Sunday: 6,
};

function getCalgaryStatus() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Edmonton",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const weekday = values.weekday ?? "Monday";
  const hour = Number(values.hour ?? 0);
  const minute = Number(values.minute ?? 0);
  const minutesNow = hour * 60 + minute;
  const todayIndex = dayIndex[weekday] ?? 0;
  const today = HOURS[todayIndex];

  const isOpen =
    today.open !== null &&
    today.close !== null &&
    minutesNow >= today.open &&
    minutesNow < today.close;

  return { todayIndex, isOpen };
}

const BusinessHours = () => {
  const [expanded, setExpanded] = useState(true);
  const [status, setStatus] = useState({
    todayIndex: 0,
    isOpen: false,
  });

  useEffect(() => {
    const updateStatus = () => setStatus(getCalgaryStatus());
    updateStatus();

    const timer = window.setInterval(updateStatus, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const leftColumn = useMemo(() => HOURS.slice(0, 4), []);
  const rightColumn = useMemo(() => HOURS.slice(4), []);

  const renderRow = (item: DayHours) => {
    const isToday = HOURS[status.todayIndex]?.day === item.day;

    return (
      <div
        key={item.day}
        className={`grid grid-cols-[120px_1fr] gap-4 border-b border-gray-100 py-4 last:border-b-0 sm:grid-cols-[140px_1fr] ${
          isToday ? "font-bold text-[#0B4E9B]" : "text-gray-700"
        }`}
      >
        <span>{item.day}</span>
        <span>{item.label}</span>
      </div>
    );
  };

  return (
    <div className="w-full overflow-hidden rounded-[2rem] border border-[#D9EAF3] bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((current) => !current)}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between gap-4 bg-[#F3F6F8] px-6 py-5 text-left transition hover:bg-[#EAF3F7] md:px-8"
      >
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E3F7FB] text-[#07889E]">
            <IoTimeOutline size={28} />
          </span>

          <div>
            <p
              className={`text-lg font-extrabold ${
                status.isOpen ? "text-[#07889E]" : "text-gray-800"
              }`}
            >
              {status.isOpen ? "Open now" : "Closed now"}
            </p>
            <p className="mt-0.5 text-sm text-gray-500">Business hours</p>
          </div>
        </div>

        <IoChevronDown
          size={22}
          className={`shrink-0 text-gray-600 transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {expanded && (
        <div className="px-6 py-3 md:px-8">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
            <div>{leftColumn.map(renderRow)}</div>

            <div className="hidden lg:block lg:w-px lg:self-stretch lg:bg-[#E5EDF2]" />

            <div>{rightColumn.map(renderRow)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BusinessHours;
