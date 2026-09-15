const SITE_URL = "https://camzcleaning.com";

const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const sitePart = {
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: "Camz Cleaning",
};

const businessRef = {
  "@type": "LocalBusiness",
  "@id": BUSINESS_ID,
  name: "Camz Cleaning",
  url: `${SITE_URL}/`,
};

const provider = {
  "@type": "LocalBusiness",
  "@id": BUSINESS_ID,
  name: "Camz Cleaning",
  url: `${SITE_URL}/`,
  telephone: "+1-587-837-1977",
  email: "info@camzcleaning.com",
};

const city = (name: string) => ({
  "@type": "City",
  name,
  containedInPlace: {
    "@type": "AdministrativeArea",
    name: "Alberta",
  },
});

const allServiceAreas = [
  city("Calgary"),
  city("Airdrie"),
  city("Cochrane"),
  city("Chestermere"),
];

type ServiceSchemaOptions = {
  path: string;
  name: string;
  description: string;
  serviceType: string;
  areaServed: ReturnType<typeof city>[];
  offers?: string[];
};

const servicePageSchema = ({
  path,
  name,
  description,
  serviceType,
  areaServed,
  offers = [],
}: ServiceSchemaOptions) => {
  const pageUrl = `${SITE_URL}${path}`;
  const pageId = `${pageUrl}#webpage`;
  const serviceId = `${pageUrl}#service`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageId,
        url: pageUrl,
        name,
        description,
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@id": serviceId,
        },
      },
      {
        "@type": "Service",
        "@id": serviceId,
        name,
        serviceType,
        description,
        url: pageUrl,
        provider,
        areaServed,
        ...(offers.length > 0
          ? {
              hasOfferCatalog: {
                "@type": "OfferCatalog",
                name: `${serviceType} options`,
                itemListElement: offers.map((offer) => ({
                  "@type": "Offer",
                  itemOffered: {
                    "@type": "Service",
                    name: offer,
                  },
                })),
              },
            }
          : {}),
      },
    ],
  };
};

export const jsonLdSchemas = {
  "/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": BUSINESS_ID,
        name: "Camz Cleaning",
        url: `${SITE_URL}/`,
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/wp-admin/uploads/footer-logo.webp`,
        },
        image: `${SITE_URL}/wp-admin/uploads/footer-logo.webp`,
        telephone: "+1-587-837-1977",
        email: "info@camzcleaning.com",
        description:
          "Camz Cleaning provides reliable residential, commercial, vehicle and seasonal cleaning services in Calgary. Choose your service and book online.",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Calgary",
          addressRegion: "AB",
          addressCountry: "CA",
        },
        areaServed: allServiceAreas,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: "Cleaning services",
          itemListElement: [
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Residential cleaning",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Commercial cleaning",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Vehicle cleaning",
              },
            },
            {
              "@type": "Offer",
              itemOffered: {
                "@type": "Service",
                name: "Seasonal property cleaning",
              },
            },
          ],
        },
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: `${SITE_URL}/`,
        name: "Camz Cleaning",
        publisher: {
          "@id": BUSINESS_ID,
        },
        inLanguage: "en-CA",
      },
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: `${SITE_URL}/`,
        name: "Affordable Cleaning Company in Calgary | Camz Cleaning",
        description:
          "Camz Cleaning provides reliable residential, commercial, vehicle and seasonal cleaning services in Calgary. Choose your service and book online.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
      },
    ],
  },

  "/about-us/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about-us/#webpage`,
        url: `${SITE_URL}/about-us/`,
        name: "About Camz Cleaning | Our Team and Standards",
        description:
          "Learn about Camz Cleaning, our practical experience, service approach and commitment to dependable care for homes, businesses, vehicles and properties.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: provider,
      },
    ],
  },

  "/services/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/services/#webpage`,
        url: `${SITE_URL}/services/`,
        name: "Our Professional Cleaning Services | Camz Cleaning",
        description:
          "Explore residential, commercial, vehicle and seasonal property cleaning services from Camz Cleaning and choose the right option for your needs.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@id": `${SITE_URL}/services/#services`,
        },
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}/services/#services`,
        name: "Camz Cleaning Services",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Residential Cleaning",
            url: `${SITE_URL}/residential-cleaning-services/`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Commercial Cleaning",
            url: `${SITE_URL}/commercial-cleaning-services/`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: "Vehicle Cleaning",
            url: `${SITE_URL}/vehicle-cleaning-service/`,
          },
          {
            "@type": "ListItem",
            position: 4,
            name: "Seasonal Property Service",
            url: `${SITE_URL}/seasonal-property-service/`,
          },
        ],
      },
    ],
  },

  "/commercial-cleaning-services/": servicePageSchema({
    path: "/commercial-cleaning-services/",
    name: "Commercial Cleaning & Janitorial Services in Calgary",
    description:
      "Commercial cleaning services for Calgary offices, shops, shared facilities and post-construction spaces. Request a tailored plan and book online.",
    serviceType: "Commercial cleaning and janitorial services",
    areaServed: allServiceAreas,
    offers: [
      "Office and workplace cleaning",
      "Shared facility cleaning",
      "Washroom and staff kitchen cleaning",
      "Floor cleaning",
      "Waste removal",
      "High-touch surface cleaning",
    ],
  }),

  "/residential-cleaning-services/": servicePageSchema({
    path: "/residential-cleaning-services/",
    name: "Residential & House Cleaning Services in Calgary",
    description:
      "Residential cleaning in Calgary for regular, deep and move-in/move-out needs. Choose your service, preferred schedule and book online.",
    serviceType: "Residential and house cleaning",
    areaServed: allServiceAreas,
    offers: [
      "Regular home cleaning",
      "Deep cleaning",
      "Move-in and move-out cleaning",
      "Kitchen cleaning",
      "Bathroom cleaning",
      "Bedrooms and living areas",
      "Floor, rug and carpet vacuuming",
    ],
  }),

  "/vehicle-cleaning-service/": servicePageSchema({
    path: "/vehicle-cleaning-service/",
    name: "Mobile Vehicle Cleaning and Car Detailing in Calgary",
    description:
      "Camz Cleaning provides mobile vehicle cleaning in Calgary, with service also available in Airdrie, Cochrane and Chestermere. Appointment availability depends on the location, weather, safe parking and selected cleaning package.",
    serviceType: "Mobile vehicle cleaning and car detailing",
    areaServed: allServiceAreas,
    offers: [
      "Exterior vehicle cleaning",
      "Interior vacuuming",
      "Dashboard and console cleaning",
      "Window and mirror cleaning",
      "Seat, mat and carpet care",
      "Wheel and tire cleaning",
    ],
  }),

  "/seasonal-property-service/": servicePageSchema({
    path: "/seasonal-property-service/",
    name: "Seasonal Property Cleaning & Care in Calgary",
    description:
      "Camz Cleaning supports seasonal homes and vacation rentals in Calgary, with service also available in Airdrie, Cochrane and Chestermere. Choose the tasks needed for the property, season and guest schedule.",
    serviceType: "Seasonal property and vacation rental cleaning",
    areaServed: allServiceAreas,
    offers: [
      "Vacation rental turnover cleaning",
      "Seasonal property cleanup",
      "Winter snow and access support",
      "Basic yard and garden area cleanup",
      "Indoor cleaning between guests",
      "Floor and accessible window cleaning",
      "Property preparation",
    ],
  }),

  "/calgary-cleaning-services/": servicePageSchema({
    path: "/calgary-cleaning-services/",
    name: "Cleaning Services in Calgary | Home & Office Cleaners",
    description:
      "Book professional cleaning services in Calgary for homes, offices, vehicles and seasonal properties. Choose your service and preferred appointment online.",
    serviceType: "Cleaning services in Calgary",
    areaServed: [city("Calgary")],
    offers: [
      "Residential cleaning",
      "Commercial cleaning",
      "Mobile vehicle cleaning",
      "Seasonal property services",
    ],
  }),

  "/airdrie-cleaning-services/": servicePageSchema({
    path: "/airdrie-cleaning-services/",
    name: "Cleaning Services in Airdrie for Homes & Businesses",
    description:
      "Book residential, commercial, vehicle and seasonal property cleaning services in Airdrie. Choose your service and preferred appointment online.",
    serviceType: "Cleaning services in Airdrie",
    areaServed: [city("Airdrie")],
    offers: [
      "Residential cleaning",
      "Commercial cleaning",
      "Mobile vehicle cleaning",
      "Seasonal property services",
    ],
  }),

  "/cochrane-cleaning-services/": servicePageSchema({
    path: "/cochrane-cleaning-services/",
    name: "Cleaning Services in Cochrane for Homes & Businesses",
    description:
      "Book residential, commercial, vehicle and seasonal property cleaning in Cochrane. Choose the service and preferred appointment online.",
    serviceType: "Cleaning services in Cochrane",
    areaServed: [city("Cochrane")],
    offers: [
      "Residential cleaning",
      "Commercial cleaning",
      "Mobile vehicle cleaning",
      "Seasonal property services",
    ],
  }),

  "/chestermere-cleaning-services/": servicePageSchema({
    path: "/chestermere-cleaning-services/",
    name: "Cleaning Services in Chestermere | Homes & Businesses",
    description:
      "Book residential, commercial, vehicle and seasonal property cleaning in Chestermere. Choose your service and preferred appointment online.",
    serviceType: "Cleaning services in Chestermere",
    areaServed: [city("Chestermere")],
    offers: [
      "Residential cleaning",
      "Commercial cleaning",
      "Mobile vehicle cleaning",
      "Seasonal property services",
    ],
  }),

  "/booking/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/booking/#webpage`,
        url: `${SITE_URL}/booking/`,
        name: "Book a Cleaning Service Online | Camz Cleaning",
        description:
          "Choose a Camz Cleaning service, enter the property or vehicle details and request your preferred appointment online.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
      },
    ],
  },

  "/gallery/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/gallery/#webpage`,
        url: `${SITE_URL}/gallery/`,
        name: "Cleaning Project Gallery | Camz Cleaning",
        description:
          "View recent residential, commercial, vehicle and seasonal property cleaning projects completed by Camz Cleaning.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@id": `${SITE_URL}/gallery/#gallery`,
        },
      },
      {
        "@type": "ImageGallery",
        "@id": `${SITE_URL}/gallery/#gallery`,
        name: "Cleaning Project Gallery | Camz Cleaning",
        description:
          "View recent residential, commercial, vehicle and seasonal property cleaning projects completed by Camz Cleaning.",
        url: `${SITE_URL}/gallery/`,
        about: businessRef,
        inLanguage: "en-CA",
      },
    ],
  },

  "/blog/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${SITE_URL}/blog/#webpage`,
        url: `${SITE_URL}/blog/`,
        name: "Cleaning Tips & Guides | Camz Cleaning Blog",
        description:
          "Read practical cleaning tips, property-care guides and service advice from Camz Cleaning for homes, workplaces, vehicles and seasonal properties.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@id": `${SITE_URL}/blog/#blog`,
        },
      },
      {
        "@type": "Blog",
        "@id": `${SITE_URL}/blog/#blog`,
        name: "Cleaning Tips & Guides | Camz Cleaning Blog",
        description:
          "Read practical cleaning tips, property-care guides and service advice from Camz Cleaning for homes, workplaces, vehicles and seasonal properties.",
        url: `${SITE_URL}/blog/`,
        publisher: {
          "@type": "LocalBusiness",
          "@id": BUSINESS_ID,
          name: "Camz Cleaning",
          url: `${SITE_URL}/`,
        },
        inLanguage: "en-CA",
      },
    ],
  },

  "/custom-cleaning-request/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/custom-cleaning-request/#webpage`,
        url: `${SITE_URL}/custom-cleaning-request/`,
        name: "Custom Cleaning Request | Camz Cleaning",
        description:
          "Build a room-by-room cleaning checklist and request a custom quote from Camz Cleaning.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@id": `${SITE_URL}/custom-cleaning-request/#service`,
        },
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/custom-cleaning-request/#service`,
        name: "Custom Cleaning Request",
        serviceType: "Custom cleaning services",
        description:
          "Build a room-by-room cleaning checklist and request a custom quote from Camz Cleaning.",
        url: `${SITE_URL}/custom-cleaning-request/`,
        provider,
        areaServed: allServiceAreas,
      },
    ],
  },

  "/contact-us/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": `${SITE_URL}/contact-us/#webpage`,
        url: `${SITE_URL}/contact-us/`,
        name: "Contact Camz Cleaning | Request a Cleaning Quote",
        description:
          "Contact Camz Cleaning with questions about residential, commercial, vehicle or seasonal property services, or use online booking to request an appointment.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        mainEntity: {
          "@type": "LocalBusiness",
          "@id": BUSINESS_ID,
          name: "Camz Cleaning",
          url: `${SITE_URL}/`,
          telephone: "+1-587-837-1977",
          email: "info@camzcleaning.com",
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+1-587-837-1977",
            email: "info@camzcleaning.com",
            contactType: "customer service",
            areaServed: "CA",
            availableLanguage: ["English"],
          },
        },
      },
    ],
  },

  "/privacy-policy/": {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/privacy-policy/#webpage`,
        url: `${SITE_URL}/privacy-policy/`,
        name: "Privacy Policy | Camz Cleaning",
        description:
          "Read the Camz Cleaning privacy policy for website visitors, service requests, bookings and customer information handling.",
        isPartOf: sitePart,
        about: businessRef,
        inLanguage: "en-CA",
        dateModified: "2026-06-19",
      },
    ],
  },
} as const;

type BlogPostingJsonLdInput = {
  id: string;
  title: string;
  description: string;
  image: string;
  publishedAt: string;
};

export function blogPostingJsonLd({
  id,
  title,
  description,
  image,
  publishedAt,
}: BlogPostingJsonLdInput) {
  const url = `${SITE_URL}/blog/${id}/`;

  const imageUrl = image
    ? /^https?:\/\//i.test(image)
      ? image
      : `${SITE_URL}${image.startsWith("/") ? "" : "/"}${image}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#blogposting`,
    headline: title,
    description,
    ...(imageUrl ? { image: imageUrl } : {}),
    datePublished: publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
    },
    author: {
      "@type": "Organization",
      name: "Camz Cleaning",
      url: `${SITE_URL}/`,
    },
    publisher: {
      "@type": "Organization",
      "@id": BUSINESS_ID,
      name: "Camz Cleaning",
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/wp-admin/uploads/footer-logo.webp`,
      },
    },
    inLanguage: "en-CA",
  };
}

export type JsonLdPath = keyof typeof jsonLdSchemas;