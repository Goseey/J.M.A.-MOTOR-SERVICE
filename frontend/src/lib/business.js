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
  phoneTel: '+353852246411', // Ireland country code
  whatsappNumber: process.env.REACT_APP_WHATSAPP_NUMBER || '', // 353852246411 (no plus)
  email: 'info@jmamotorservice.ie',
  googleRating: 5.0,
  reviewCount: 8,
};

export const links = {
  call: `tel:${BUSINESS.phoneTel}`,
  directions: `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(BUSINESS.address)}`,
  mapsSearch: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(BUSINESS.name + ' ' + BUSINESS.address)}`,
  mapsEmbed: `https://www.google.com/maps?q=${encodeURIComponent(BUSINESS.address)}&output=embed`,
  whatsapp: BUSINESS.whatsappNumber ? `https://wa.me/${BUSINESS.whatsappNumber}` : '',
};
