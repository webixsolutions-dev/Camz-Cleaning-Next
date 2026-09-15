import { CustomCleaningRequestForm } from "../page";

export const metadata = {
  title: "Cleaning Checklist | CAMZ Cleaning",
  description: "Build a CAMZ Cleaning checklist with an estimated time and no customer-facing price.",
};

export default function ChecklistOnlyPage() {
  return <CustomCleaningRequestForm lockedMode="time" />;
}
