"use client";

import React from "react";

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Qz",
    "alternateName": "Qz Platform",
    "url": "https://qz.bflabs.tech",
    "logo": "https://qz.bflabs.tech/logo.png",
    "sameAs": [
      "https://x.com/bflabs",
      "https://github.com/bflabs"
    ],
    "description": "AI-powered university study platform built around your syllabus.",
    "parentOrganization": {
      "@type": "Organization",
      "name": "BetaForge Labs",
      "url": "https://bflabs.tech"
    }
  };

  return <JsonLd data={data} />;
}

export function WebAppJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Qz",
    "url": "https://qz.bflabs.tech",
    "description": "The AI study partner that knows your university syllabus.",
    "applicationCategory": "EducationApplication",
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0.00",
      "priceCurrency": "GHS"
    }
  };

  return <JsonLd data={data} />;
}
