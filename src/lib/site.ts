export const SITE = {
  name: 'Auto-École Pacifique Bilingue',
  shortName: 'Auto-École Pacifique',
  city: 'Kribi',
  address: 'Kribi — Dombe, Cameroun',
  phone: '+237 6 99 00 00 00',
  phoneRaw: '237699000000',
  email: 'contact@autoecole-pacifique.cm',
  group: 'AFJANES GROUP',
  siblingSchool: 'Auto-École AFJANES',
  social: {
    facebook: 'https://facebook.com/autoecolepacifique',
    instagram: '',
    tiktok: '',
  },
};

export const telLink = `tel:${SITE.phoneRaw}`;

export function whatsappLink(message?: string): string {
  const text = message
    ? encodeURIComponent(message)
    : encodeURIComponent("Bonjour Auto-École Pacifique, je souhaite m'informer sur vos formations.");
  return `https://wa.me/${SITE.phoneRaw}?text=${text}`;
}
