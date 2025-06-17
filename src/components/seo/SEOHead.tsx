
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: 'website' | 'article';
  siteName?: string;
  twitterCard?: 'summary' | 'summary_large_image';
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  url,
  image,
  type = 'article',
  siteName = 'Sistema de Reportes',
  twitterCard = 'summary_large_image'
}) => {
  const fullTitle = `${title} | ${siteName}`;
  
  return (
    <Helmet>
      {/* Metadatos básicos */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      
      {/* Open Graph para Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={siteName} />
      {image && <meta property="og:image" content={image} />}
      {image && <meta property="og:image:alt" content={`Imagen del reporte: ${title}`} />}
      
      {/* Twitter Cards */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
      {image && <meta name="twitter:image:alt" content={`Imagen del reporte: ${title}`} />}
      
      {/* Metadatos adicionales */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content={siteName} />
    </Helmet>
  );
};
