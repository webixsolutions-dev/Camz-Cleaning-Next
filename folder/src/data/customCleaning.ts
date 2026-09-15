import {
  Building2,
  Construction,
  Home,
  Hotel,
  KeyRound,
  Paintbrush,
  Sparkles,
  SprayCan,
  WandSparkles,
  type LucideIcon,
} from "lucide-react";

export type Priority = "must_do" | "if_time" | "not_required";

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

export interface CleaningArea {
  id: string;
  name: string;
  description: string;
  tasks: string[];
  showFor?: string[];
}

export const serviceTypes: ServiceType[] = [
  { id: "standard", name: "Standard Cleaning", description: "Routine care for a consistently fresh space.", icon: SprayCan },
  { id: "deep", name: "Deep Cleaning", description: "Detailed cleaning for buildup and overlooked areas.", icon: Sparkles },
  { id: "move-in", name: "Move-In Cleaning", description: "Prepare an empty property before settling in.", icon: KeyRound },
  { id: "move-out", name: "Move-Out Cleaning", description: "Leave the property ready for its next occupant.", icon: Home },
  { id: "post-construction", name: "Post Construction", description: "Remove fine dust and residue after renovation.", icon: Construction },
  { id: "carpet", name: "Carpet Cleaning", description: "Target carpeted rooms, stairs, stains, and odours.", icon: Paintbrush },
  { id: "commercial", name: "Office / Commercial", description: "A custom checklist for professional spaces.", icon: Building2 },
  { id: "airbnb", name: "Airbnb Turnover", description: "Guest-ready cleaning between stays.", icon: Hotel },
  { id: "custom", name: "Custom Cleaning", description: "Build a cleaning request around your exact needs.", icon: WandSparkles },
];

export const cleaningAreas: CleaningArea[] = [
  {
    id: "all-areas",
    name: "All Areas",
    description: "Floors, surfaces, fixtures, and general finishing touches.",
    tasks: [
      "Dust surfaces", "Dust and hand-wipe furniture tops", "Dust baseboards, chair rails, and door panels",
      "Dust ceiling fans within reach", "Vacuum carpets", "Vacuum and damp-mop hard floors",
      "Dust blinds, window sills, and lock ledges", "Dust picture frames", "Dust lamps and lamp shades",
      "Clean mirrors", "Disinfect door knobs and switch plates", "Empty all trash",
    ],
  },
  {
    id: "kitchen",
    name: "Kitchen",
    description: "Counters, sink, appliance exteriors, and eating areas.",
    tasks: [
      "Dust surfaces", "Dust cabinet fronts, door panels, and baseboards", "Dust top of refrigerator",
      "Clean and disinfect countertops", "Clean and disinfect sink", "Clean microwave inside and out",
      "Clean and shine outside of oven and range", "Clean and shine outside of dishwasher",
      "Clean and shine outside of refrigerator", "Clean and disinfect kitchen table", "Vacuum and damp-mop floors", "Empty trash",
    ],
  },
  {
    id: "bathrooms",
    name: "Bathrooms",
    description: "Sanitize showers, tubs, toilets, fixtures, and floors.",
    tasks: [
      "Dust surfaces", "Dust blinds, window sills, and lock ledges", "Dust cabinets, door panels, and baseboards",
      "Clean and disinfect surfaces", "Clean, disinfect, and shine showers and tubs",
      "Clean and disinfect toilets inside and out", "Disinfect door knobs and switch plates",
      "Shine fixtures", "Clean mirrors", "Vacuum and damp-mop floors", "Empty trash",
    ],
  },
  {
    id: "bedrooms",
    name: "Bedrooms",
    description: "Furniture, floors, linens, and room surfaces.",
    tasks: [
      "Dust surfaces", "Dust and hand-wipe furniture tops", "Dust furniture", "Dust baseboards, chair rails, and door panels",
      "Dust blinds, window sills, and lock ledges", "Vacuum carpets", "Vacuum and damp-mop non-carpet floors",
      "Change sheets upon request", "Make beds upon request", "Empty trash",
    ],
  },
  {
    id: "living-dining",
    name: "Living / Dining",
    description: "Shared living spaces, furniture, tables, and floors.",
    tasks: ["Dust all surfaces", "Hand-wipe furniture tops", "Vacuum upholstered furniture", "Clean dining table", "Clean mirrors and glass", "Vacuum carpets", "Vacuum and damp-mop hard floors", "Empty trash"],
  },
  {
    id: "laundry",
    name: "Laundry",
    description: "Appliance exteriors, utility surfaces, and floors.",
    tasks: ["Dust surfaces", "Wipe washer and dryer exteriors", "Clean utility sink", "Wipe shelves and cabinet fronts", "Vacuum and damp-mop floors", "Empty trash"],
  },
  {
    id: "hallways-stairs",
    name: "Hallways / Stairs",
    description: "High-traffic floors, rails, ledges, and trim.",
    tasks: ["Dust railings and ledges", "Dust baseboards", "Spot-clean door panels", "Vacuum hallways", "Vacuum stairs", "Damp-mop hard floors", "Remove cobwebs"],
  },
  {
    id: "basement",
    name: "Basement",
    description: "Finished or unfinished lower-level spaces.",
    tasks: ["Dust accessible surfaces", "Remove cobwebs", "Vacuum carpets", "Vacuum and damp-mop hard floors", "Clean windows and ledges", "Empty trash"],
  },
  {
    id: "garage",
    name: "Garage",
    description: "Accessible surfaces, floors, and entry points.",
    tasks: ["Sweep garage floor", "Remove cobwebs", "Dust accessible shelves", "Wipe interior entry door", "Collect and bag loose trash"],
  },
  {
    id: "outdoor",
    name: "Outdoor",
    description: "Optional entry, patio, and exterior touchpoints.",
    tasks: ["Sweep front entry", "Sweep patio or balcony", "Wipe exterior door", "Clean exterior glass within reach", "Remove accessible cobwebs"],
  },
  {
    id: "deep-extras",
    name: "Deep Cleaning Extras",
    description: "Detail work automatically shown for deep cleaning.",
    showFor: ["deep", "post-construction"],
    tasks: ["Damp-wipe baseboards and window sills", "Damp-wipe door panels and frames", "Vacuum upholstered furniture", "Remove cobwebs", "Damp-wipe kitchen cabinet fronts", "Damp-wipe bathroom cabinet fronts"],
  },
  {
    id: "move-extras",
    name: "Move-In / Out Extras",
    description: "Empty-property details for move services.",
    showFor: ["move-in", "move-out"],
    tasks: ["Clean inside empty cabinets and drawers", "Clean inside closets", "Clean inside refrigerator", "Clean inside oven", "Wipe baseboards and window sills", "Wipe door panels and frames", "Spot-clean walls", "Remove remaining trash"],
  },
  {
    id: "carpet-details",
    name: "Carpet Cleaning Details",
    description: "Carpeted rooms, stairs, stains, and treatment needs.",
    showFor: ["carpet"],
    tasks: ["Clean carpeted rooms", "Clean carpeted stairs", "Pre-treat visible stains", "Deodorize carpets", "Clean area rugs", "Move light furniture where safe"],
  },
];

