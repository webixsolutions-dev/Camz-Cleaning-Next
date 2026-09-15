import BookingClient, {
  type Category,
  type Service,
} from "@/components/booking/BookingClient";
import { createPublicServerClient } from "@/lib/supabase/public-server";
import { pageSeo } from "@/lib/seo";

export const metadata = pageSeo({
  title: "Book a Cleaning Service Online | Camz Cleaning",
  description:
    "Choose a Camz Cleaning service, enter the property or vehicle details and request your preferred appointment online.",
  path: "/booking/",
});

// Services come from Supabase. Render at request time so deployments do not
// require database availability while Next.js is compiling static pages.
export const dynamic = "force-dynamic";

const CATEGORY_ORDER = [
  "residential",
  "commercial",
  "vehicle",
  "seasonal",
] as const;

export default async function BookingPage() {
  const supabase = createPublicServerClient();

  const [categoryResult, serviceResult] = await Promise.all([
    supabase
      .from("categories")
      .select("id, name, icon_str, color_hex, type")
      .order("created_at", { ascending: true }),

    supabase
      .from("services")
      .select(
        "id, category_id, title, description, price, icon_str, pricing_type, service_type, is_active, has_addons, tax_rate",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
  ]);

  if (categoryResult.error) throw categoryResult.error;
  if (serviceResult.error) throw serviceResult.error;

  const allCategories = (categoryResult.data ?? []) as Category[];

  const getDescriptor = (category: Category) =>
    `${category.name} ${category.type}`.toLowerCase();

  const residentialCategory = allCategories.find((category) =>
    getDescriptor(category).includes("residential"),
  );

  const actualSeasonalCategory = allCategories.find((category) =>
    getDescriptor(category).includes("seasonal"),
  );

  // Some existing DBs still use "Specialty" for the fourth category.
  // If a real Seasonal category does not exist, use Specialty as the
  // Seasonal Property category on the public booking page.
  const seasonalFallbackCategory =
    actualSeasonalCategory ??
    allCategories.find((category) =>
      getDescriptor(category).includes("specialty"),
    );

  const normalizedCategories: Category[] = [];

  const residential = allCategories.find((category) =>
    getDescriptor(category).includes("residential"),
  );

  const commercial = allCategories.find((category) =>
    getDescriptor(category).includes("commercial"),
  );

  const vehicle = allCategories.find((category) =>
    getDescriptor(category).includes("vehicle"),
  );

  if (residential) {
    normalizedCategories.push({
      ...residential,
      name: "Residential",
    });
  }

  if (commercial) {
    normalizedCategories.push({
      ...commercial,
      name: "Commercial",
    });
  }

  if (vehicle) {
    normalizedCategories.push({
      ...vehicle,
      name: "Vehicle",
    });
  }

  if (seasonalFallbackCategory) {
    normalizedCategories.push({
      ...seasonalFallbackCategory,
      name: "Seasonal Property",
      type: "seasonal",
    });
  }

  // Final fixed order:
  // Residential -> Commercial -> Vehicle -> Seasonal Property
  const categoryRank = (category: Category) => {
    const descriptor = `${category.name} ${category.type}`.toLowerCase();

    if (descriptor.includes("residential")) return CATEGORY_ORDER.indexOf("residential");
    if (descriptor.includes("commercial")) return CATEGORY_ORDER.indexOf("commercial");
    if (descriptor.includes("vehicle")) return CATEGORY_ORDER.indexOf("vehicle");
    return CATEGORY_ORDER.indexOf("seasonal");
  };

  const categories = normalizedCategories.sort(
    (a, b) => categoryRank(a) - categoryRank(b),
  );

  const visibleCategoryIds = new Set(
    categories.map((category) => category.id),
  );

  const services = ((serviceResult.data ?? []) as Service[])
    .map((service) => {
      // Move-In / Move-Out stays inside Residential.
      if (
        service.service_type === "move_in_out" &&
        residentialCategory
      ) {
        return {
          ...service,
          category_id: residentialCategory.id,
          title: service.title.includes("Residential")
            ? service.title
            : `${service.title} (Residential)`,
        };
      }

      return service;
    })
    .filter((service) => visibleCategoryIds.has(service.category_id));

  return (
    <BookingClient
      categories={categories}
      services={services}
    />
  );
}
