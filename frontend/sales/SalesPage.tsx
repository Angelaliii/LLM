import React from "react";
import { Link } from "react-router-dom";
import Hero from "./components/Hero";
import FeatureGrid from "./components/FeatureGrid";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import NavBar from "./components/NavBar";
import PricingPlans from "./components/PricingPlans";
import LiveDemo from "./components/LiveDemo";

const SalesPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <a
        href="#main-content"
        className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        跳轉至主要內容
      </a>

      <NavBar />

      <main id="main-content" className="pt-16">
        <Hero />
        <FeatureGrid />
        <LiveDemo />
        <PricingPlans />
        <FAQ />
      </main>

      <Footer />
    </div>
  );
};

export default SalesPage;