export const SITE = {
  name: 'Auto-École Pacifique Bilingue',
  shortName: 'Auto-École Pacifique',
  city: 'Kribi',
  address: 'Kribi, Dombe - Derrière Bocom',
  phone: '+237 6 58 11 83 80',
  phoneRaw: '237658118380',
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
