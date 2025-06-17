
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title: string;
  description: string;
  url: string;
  image?: string;
  type?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  url, 
  image,
  type = 'website' 
}: SEOHeadProps) => {
  const siteUrl = window.location.origin;
  const fullUrl = url.startsWith('http') ? url : `${siteUrl}${url}`;
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : `${siteUrl}/favicon.ico`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullUrl} />

      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Sistema de Reportes" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:url" content={fullUrl} />

      {/* Additional Meta Tags */}
      <meta property="article:author" content="Sistema de Reportes" />
      <meta property="article:section" content="Reportes" />
    </Helmet>
  );
};
