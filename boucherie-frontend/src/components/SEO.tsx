import Head from 'next/head';
import { useRouter } from 'next/router';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  article?: boolean;
}

const SEO = ({ title, description, image, article }: SEOProps) => {
  const { asPath } = useRouter();
  const siteUrl = 'https://carrefour-s-des-viandes-9ahs.vercel.app'; // À mettre à jour après déploiement final
  const defaultDescription = "Carrefour'S des Viandes - Votre boucherie d'excellence à Ouagadougou. Viandes fraîches, charcuteries artisanales et service de qualité.";
  const defaultTitle = "Carrefour'S des Viandes | Boucherie d'Excellence";
  const defaultImage = `${siteUrl}/logo-carrefour.png`;

  const seo = {
    title: title ? `${title} | Carrefour'S des Viandes` : defaultTitle,
    description: description || defaultDescription,
    image: `${siteUrl}${image || defaultImage}`,
    url: `${siteUrl}${asPath}`,
  };

  return (
    <Head>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />
      <link rel="canonical" href={seo.url} />

      {seo.url && <meta property="og:url" content={seo.url} />}
      {(article ? true : null) && <meta property="og:type" content="article" />}
      {seo.title && <meta property="og:title" content={seo.title} />}
      {seo.description && <meta property="og:description" content={seo.description} />}
      {seo.image && <meta property="og:image" content={seo.image} />}

      <meta name="twitter:card" content="summary_large_image" />
      {seo.title && <meta name="twitter:title" content={seo.title} />}
      {seo.description && <meta name="twitter:description" content={seo.description} />}
      {seo.image && <meta name="twitter:image" content={seo.image} />}

      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#991b1b" />
    </Head>
  );
};

export default SEO;
