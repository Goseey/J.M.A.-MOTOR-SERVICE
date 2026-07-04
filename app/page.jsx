import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import WhyUs from '@/components/WhyUs';
import Reviews from '@/components/Reviews';
import Contact from '@/components/Contact';
import ServiceRequestForm from '@/components/ServiceRequestForm';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import FloatingActions from '@/components/FloatingActions';
import { BUSINESS } from '@/lib/business';

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-ink-950 text-white antialiased" data-testid="app-root">
      <Header />
      <main>
        <Hero />
        <Reviews />
        <Services />
        <WhyUs />
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
