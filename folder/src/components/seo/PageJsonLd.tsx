import { jsonLdSchemas, type JsonLdPath } from "@/lib/jsonLdSchemas";

type PageJsonLdProps =
  | { path: JsonLdPath; schema?: never }
  | { path?: never; schema: unknown };

export default function PageJsonLd(props: PageJsonLdProps) {
  const schema = "path" in props && props.path
    ? jsonLdSchemas[props.path]
    : props.schema;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
