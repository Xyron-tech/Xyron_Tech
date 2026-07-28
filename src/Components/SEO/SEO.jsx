import { Helmet } from "react-helmet-async";

export default function SEO({
  title,
  description,
  keywords,
}) {
  return (
    <Helmet>

      <title>{title}</title>

      <meta name="description" content={description} />

      <meta name="keywords" content={keywords} />

      <meta name="author" content="Xyron Web Tech" />

      <meta name="robots" content="index, follow" />

      <link
        rel="canonical"
        href="https://xron-web-tech.vercel.app/"
      />

      <meta property="og:type" content="website" />

      <meta property="og:title" content={title} />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:image"
        content="https://xron-web-tech.vercel.app/logo.webp"
      />

      <meta
        property="og:url"
        content="https://xron-web-tech.vercel.app/"
      />

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content="https://xron-web-tech.vercel.app/logo.webp"
      />

    </Helmet>
  );
}