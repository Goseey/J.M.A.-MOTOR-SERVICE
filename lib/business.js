// Centralized business info — single source of truth for the entire site.
export const BUSINESS = {
  name: 'J.M.A. Motor Service',
  shortName: 'JMA',
  tagline: 'Motor Service',
  address: 'Brunswick Pl, City centre, Dublin, D02 VK57',
  city: 'Dublin',
  postcode: 'D02 VK57',
  plusCode: '8QV4+4C Dublin',
  phoneDisplay: '085 224 6411',
  phoneTel: '+353852246411',
  // Defaults to the business phone number (digits only) so WhatsApp links work
  // out of the box; NEXT_PUBLIC_WHATSAPP_NUMBER overrides it when set.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '353852246411',
  email: 'info@jmamotorservice.ie',
  tiktokUrl: 'https://www.tiktok.com/@j.m.a.motor.servi7',
};

export const links = {
  call: `tel:${BUSINESS.phoneTel}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BUSINESS.address)}`,
  mapsSearch: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.name + ' ' + BUSINESS.address)}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&output=embed`,
  whatsapp: BUSINESS.whatsappNumber ? `https://wa.me/${BUSINESS.whatsappNumber}` : '',
  tiktok: BUSINESS.tiktokUrl,
};
