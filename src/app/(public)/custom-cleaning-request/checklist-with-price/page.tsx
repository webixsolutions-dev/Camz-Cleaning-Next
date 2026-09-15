import { CustomCleaningRequestForm } from "../page";

export const metadata = {
  title: "Cleaning Checklist With Price | CAMZ Cleaning",
  description: "Build a CAMZ Cleaning checklist with estimated time, price, and GST.",
};

export default function ChecklistWithPricePage() {
  return <CustomCleaningRequestForm lockedMode="price" />;
}
