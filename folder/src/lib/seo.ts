import type { Metadata } from "next";

const siteUrl = "https://camzcleaning.com";

type SeoOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
};

function normalizePath(path: string) {
  if (path === "/") return "/";
  const withLeadingSlash = path.startsWith("/") ? path : `/${path}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash : `${withLeadingSlash}/`;
}

export function pageSeo({
  title,
  description,
  path,
  noIndex = false,
}: SeoOptions): Metadata {
  const normalizedPath = normalizePath(path);
  const canonical =
    normalizedPath === "/" ? siteUrl : `${siteUrl}${normalizedPath}`;

  return {
    title,
    description,
    alternates: { canonical },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Camz Cleaning",
      type: "website",
    },
  };
}
