import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://xyronwebtech.com";
export const SITE_NAME = "Xyron Web Tech";
export const SITE_ALT_NAMES = ["XyronWebTech", "Xyron WebTech", "xyronwebtech", "Xyron Tech"];
export const DEFAULT_IMAGE = `${SITE_URL}/logo.webp`;

export const DEFAULT_KEYWORDS = [
  "Xyron Web Tech",
  "XyronWebTech",
  "xyronwebtech",
  "xyron web tech",
  "xyron webtech",
  "Xyron Tech",
  "xyron technology",
  "xyron website development",
  "xyron web design",
  "web development company",
  "website development company",
  "web design company India",
  "responsive website development",
  "SEO friendly websites",
  "business website development",
  "ecommerce website development",
  "professional website design",
  "website development Tamil Nadu",
  "custom website development",
  "modern web development",
].join(", ");

export const DEFAULT_DESCRIPTION =
  "Xyron Web Tech (xyronwebtech.com) — professional web development company building modern, responsive, SEO-friendly websites for businesses, startups and brands across India.";

const SOCIAL_LINKS = [
  "https://www.instagram.com/xyronwebtech.websites",
  "https://youtube.com/@xyron_tech",
];

function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        url: SITE_URL,
        logo: {
          "@type": "ImageObject",
          url: DEFAULT_IMAGE,
        },
        image: DEFAULT_IMAGE,
        email: "xyronwebtechnology@gmail.com",
        telephone: "+91-9994472896",
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tamil Nadu",
          addressCountry: "IN",
        },
        sameAs: SOCIAL_LINKS,
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        alternateName: SITE_ALT_NAMES,
        description: DEFAULT_DESCRIPTION,
        publisher: {
          "@id": `${SITE_URL}/#organization`,
        },
        inLanguage: "en-IN",
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: SITE_NAME,
        url: SITE_URL,
        image: DEFAULT_IMAGE,
        description: DEFAULT_DESCRIPTION,
        priceRange: "₹₹",
        areaServed: {
          "@type": "Country",
          name: "India",
        },
        address: {
          "@type": "PostalAddress",
          addressRegion: "Tamil Nadu",
          addressCountry: "IN",
        },
        serviceType: [
          "Web Development",
          "Website Design",
          "Responsive Web Design",
          "E-Commerce Development",
          "SEO Optimization",
          "Website Maintenance",
        ],
        provider: {
          "@id": `${SITE_URL}/#organization`,
        },
      },
    ],
  };
}

export default function SEO({
  title = `${SITE_NAME} | XyronWebTech — Professional Website Development Company`,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
}) {
  const canonicalUrl = `${SITE_URL}${path}`;

  return (
    <Helmet>
      <html lang="en-IN" />

      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={SITE_NAME} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="application-name" content="XyronWebTech" />
      <meta name="apple-mobile-web-app-title" content="XyronWebTech" />
      <meta name="format-detection" content="telephone=yes" />
      <meta name="geo.region" content="IN-TN" />
      <meta name="geo.placename" content="Tamil Nadu, India" />
      <meta name="language" content="English" />

      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${SITE_NAME} — XyronWebTech Logo`} />
      <meta property="og:locale" content="en_IN" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${SITE_NAME} — XyronWebTech Logo`} />

      <script type="application/ld+json">
        {JSON.stringify(buildStructuredData())}
      </script>
    </Helmet>
  );
}
