import React from 'react';
import { Helmet } from 'react-helmet-async';
import Hero from '../components/Hero';
import TrackingBar from '../components/TrackingBar';
import CorporateSolutions from '../components/CorporateSolutions';
import BusinessSolutions from '../components/BusinessSolutions';
import Location from '../components/Location';
import Testimonials from '../components/Testimonials';
import NewsSnippet from '../components/NewsSnippet';

export default function Home() {
  const localSchema = {
    "@context": "https://schema.org",
    "@type": "GovernmentOffice",
    "name": "Ghana Post Company Limited",
    "image": "http://localhost:5173/images/logo.png",
    "@id": "",
    "url": "http://localhost:5173",
    "telephone": "+233302668138",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "General Post Office",
      "addressLocality": "Accra Central",
      "postalCode": "GA-183-8164",
      "addressCountry": "GH"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 5.5458315,
      "longitude": -0.2074361
    },
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday"
      ],
      "opens": "08:00",
      "closes": "17:00"
    } 
  };

  return (
    <>
      <Helmet>
        <title>Ghana Post | Reliable Postal & Logistics Services</title>
        <meta name="description" content="Ghana Post offers fast, secure, and reliable postal, courier, and e-commerce logistics services across Ghana and internationally." />
        <script type="application/ld+json">
          {JSON.stringify(localSchema)}
        </script>
      </Helmet>
      
      <Hero />
      <TrackingBar />
      
      {/* Adjust CorporateSolutions margin top since TrackingBar is floating */}
      <div className="-mt-12">
        <CorporateSolutions />
      </div>
      <BusinessSolutions />
      <Testimonials />
      <NewsSnippet />
      <Location />
    </>
  );
}
