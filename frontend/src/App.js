import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Services from './components/Services';
import WhyUs from './components/WhyUs';
import Reviews from './components/Reviews';
import Contact from './components/Contact';
import ServiceRequestForm from './components/ServiceRequestForm';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import FloatingActions from './components/FloatingActions';
import { BUSINESS } from './lib/business';
import './App.css';

function App() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-ink-950 text-white antialiased" data-testid="app-root">
      <Header scrolled={scrolled} />
      <main>
        <Hero />
        <Services />
        <WhyUs />
        <Reviews />
        <Contact />
        <ServiceRequestForm />
        <FAQ />
      </main>
      <Footer />
      <FloatingActions />

      {/* Hidden, real-text contact info for SEO + crawlers */}
      <div className="sr-only">
        {BUSINESS.name} — {BUSINESS.address} — Phone: {BUSINESS.phoneDisplay} — Plus code: {BUSINESS.plusCode}
      </div>
    </div>
  );
}

export default App;
