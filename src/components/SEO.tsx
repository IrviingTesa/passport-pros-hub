import { Helmet } from "react-helmet-async";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string;
  type?: "website" | "article";
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
  noindex?: boolean;
}

const SITE_URL =
  typeof window !== "undefined" ? window.location.origin : "https://asesoresmigratorios.mx";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.jpg`;

export const SEO = ({
  title,
  description,
  canonical,
  image = DEFAULT_IMAGE,
  type = "website",
  jsonLd,
  noindex = false,
}: SEOProps) => {
  const fullCanonical = canonical
    ? canonical.startsWith("http")
      ? canonical
      : `${SITE_URL}${canonical}`
    : SITE_URL;

  const truncatedTitle = title.length > 60 ? title.slice(0, 57) + "..." : title;
  const truncatedDesc =
    description.length > 160 ? description.slice(0, 157) + "..." : description;

  return (
    <Helmet>
      <title>{truncatedTitle}</title>
      <meta name="description" content={truncatedDesc} />
      <link rel="canonical" href={fullCanonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:title" content={truncatedTitle} />
      <meta property="og:description" content={truncatedDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:image" content={image} />
      <meta property="og:locale" content="es_MX" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={truncatedTitle} />
      <meta name="twitter:description" content={truncatedDesc} />
      <meta name="twitter:image" content={image} />

      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : [jsonLd])}
        </script>
      )}
    </Helmet>
  );
};
