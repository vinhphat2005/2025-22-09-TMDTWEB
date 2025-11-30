import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEO = ({ 
  title, 
  description, 
  image, 
  url, 
  type = 'website',
  keywords = ''
}) => {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:5173';
  const defaultImage = `${siteUrl}/skrt.png`;
  const defaultTitle = 'SKRT - Fashion Ecommerce';
  const defaultDescription = 'Shop the latest fashion trends at SKRT. Quality products, fast shipping, and excellent customer service.';

  const pageTitle = title ? `${title} | SKRT` : defaultTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = image || defaultImage;
  const pageUrl = url ? `${siteUrl}${url}` : siteUrl;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:site_name" content="SKRT" />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={pageUrl} />
      <meta property="twitter:title" content={pageTitle} />
      <meta property="twitter:description" content={pageDescription} />
      <meta property="twitter:image" content={pageImage} />

      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="SKRT Team" />
    </Helmet>
  );
};

SEO.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  url: PropTypes.string,
  type: PropTypes.string,
  keywords: PropTypes.string,
};

export default SEO;
