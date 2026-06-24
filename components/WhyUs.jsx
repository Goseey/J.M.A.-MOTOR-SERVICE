import React from 'react';
import { MapPin, MessageSquare, Wrench, PhoneCall, Navigation, Users } from 'lucide-react';

const POINTS = [
  { icon: MapPin, title: 'Local Dublin City Centre Garage',
    description: 'A genuine local workshop on Brunswick Pl — easy to reach without leaving the city.' },
  { icon: MessageSquare, title: 'Clear Direct Communication',
    description: 'No jargon, no upselling. We tell you what your car needs and what can wait.' },
  { icon: Wrench, title: 'Practical Repair & Maintenance',
    description: 'From quick fixes to full services — handled with care and the right parts.' },
  { icon: PhoneCall, title: 'Easy Phone Contact',
    description: 'Call us directly during opening hours. A real person, not a queue.' },
  { icon: Navigation, title: 'Convenient Location',
    description: 'Right in the centre — drop the car off and continue your day on foot, by bus or LUAS.' },
  { icon: Users, title: 'Trusted by Local Customers',
    description: 'Built on word-of-mouth and repeat work from drivers across Dublin.' },
];

export default function WhyUs() {
  return (
    <section
      id="why-us"
      data-testid="why-us-section"
      className="relative py-24 sm:py-32 bg-ink-900 overflow-hidden"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            'url("https://images.pexels.com/photos/4489735/pexels-photo-4489735.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=800&w=1200")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'grayscale(100%) contrast(0.85)',
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900/95 to-ink-950" aria-hidden="true" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="flex items-center gap-3 mb-5">
              <span className="h-px w-8 bg-gold-400" />
              <span className="text-[11px] uppercase tracking-widest2 text-gold-300" data-testid="why-us-overline">
                Why Choose Us
              </span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight leading-[1.05]" data-testid="why-us-headline">
              A workshop built on <span className="text-metal-gold">honest work</span>, not marketing.
            </h2>
            <p className="mt-5 text-white/65 leading-relaxed">
              J.M.A. Motor Service is a no-nonsense Dublin city centre garage focused on doing the
              job properly. The kind of place you tell a friend about.
            </p>
            <div className="mt-8 hidden lg:block">
              <div className="gold-divider" />
              <p className="mt-6 text-[12px] uppercase tracking-widest2 text-white/45">
                Brunswick Pl · Dublin D02 VK57
              </p>
            </div>
          </div>

          <ol className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-white/[0.04] rounded-sm overflow-hidden">
            {POINTS.map(({ icon: Icon, title, description }, i) => (
              <li
                key={title}
                data-testid={`why-us-point-${i}`}
                className="group bg-ink-800/80 hover:bg-ink-700/80 p-6 sm:p-7 transition-colors duration-500 flex gap-4"
              >
                <div className="shrink-0 icon-plate inline-flex items-center justify-center h-11 w-11 rounded-sm text-gold-300">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest2 text-white/35">0{i + 1}</span>
                    <h3 className="font-display text-base font-semibold tracking-tight text-white">{title}</h3>
                  </div>
                  <p className="mt-2 text-[13.5px] text-white/60 leading-relaxed">{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
