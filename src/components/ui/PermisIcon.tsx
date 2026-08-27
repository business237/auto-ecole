import React from 'react';
import { 
  Car, 
  Truck, 
  Bus, 
  BookOpen, 
  RefreshCw, 
  Award, 
  ShieldCheck, 
  Bike 
} from 'lucide-react';

interface PermisIconProps {
  titre?: string | null;
  className?: string;
  size?: number;
}

// Custom Tractor SVG Icon for Permis G (Engins agricoles / Tracteurs)
export function TractorIcon({ className = 'h-6 w-6', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Front small wheel */}
      <circle cx="6" cy="18" r="2.5" />
      {/* Rear large wheel */}
      <circle cx="18" cy="16" r="4.5" />
      {/* Wheel details */}
      <circle cx="18" cy="16" r="1.5" />
      {/* Tractor body & cabin */}
      <path d="M6 15.5V11h5l3 3h3" />
      <path d="M14 8h-4l-1 3" />
      <path d="M14 8v6" />
      <path d="M14 8h3a1 1 0 0 1 1 1v4" />
      {/* Exhaust pipe */}
      <path d="M8 8V5" />
      <path d="M7 5h2" />
      {/* Hood */}
      <path d="M3.5 15.5H6" />
    </svg>
  );
}

// Custom Motorcycle SVG Icon for Permis A
export function MotoIcon({ className = 'h-6 w-6', size = 24 }: { className?: string; size?: number }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      {/* Front wheel */}
      <circle cx="5.5" cy="16.5" r="3.5" />
      {/* Rear wheel */}
      <circle cx="18.5" cy="16.5" r="3.5" />
      {/* Frame & Engine */}
      <path d="M5.5 16.5l4.5-7h4l3 7" />
      <path d="M10 9.5l2 4h4" />
      {/* Handlebars */}
      <path d="M9 7.5l1 2" />
      <path d="M8 7.5h2.5" />
      {/* Seat */}
      <path d="M13 11.5h3.5" />
      {/* Tank */}
      <path d="M10 9.5c1-1 3-1 4 0" />
    </svg>
  );
}

export function getPermisCategory(titre?: string | null): {
  type: 'A' | 'B' | 'C' | 'D' | 'G' | 'CODE' | 'OTHER';
  label: string;
  badgeBg: string;
  badgeText: string;
} {
  if (!titre) {
    return { type: 'B', label: 'Permis B', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' };
  }

  const normalized = titre.toLowerCase().trim();

  // Permis A (Moto)
  if (
    normalized.includes('permis a') ||
    normalized.includes('moto') ||
    normalized.includes('deux-roues') ||
    normalized.includes('2 roues')
  ) {
    return { type: 'A', label: 'Permis A • Moto', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700' };
  }

  // Permis G (Tracteur, Engins agricoles / chantier)
  if (
    normalized.includes('permis g') ||
    normalized.includes('tracteur') ||
    normalized.includes('agricole') ||
    normalized.includes('chantier') ||
    normalized.includes('engin')
  ) {
    return { type: 'G', label: 'Permis G • Tracteur & Engins', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700' };
  }

  // Permis D (Bus / Transport en commun)
  if (
    normalized.includes('permis d') ||
    normalized.includes('bus') ||
    normalized.includes('transport en commun') ||
    normalized.includes('autocar')
  ) {
    return { type: 'D', label: 'Permis D • Transport / Bus', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700' };
  }

  // Permis C / CE (Poids lourds, Camion, Remorque)
  if (
    normalized.includes('permis c') ||
    normalized.includes('permis ce') ||
    normalized.includes('poids lourd') ||
    normalized.includes('camion') ||
    normalized.includes('remorque')
  ) {
    return { type: 'C', label: 'Permis C/CE • Poids Lourds', badgeBg: 'bg-orange-50', badgeText: 'text-orange-700' };
  }

  // Code de la route
  if (normalized.includes('code') || normalized.includes('théorie')) {
    return { type: 'CODE', label: 'Code de la Route', badgeBg: 'bg-indigo-50', badgeText: 'text-indigo-700' };
  }

  // Permis B (Voiture / Légers)
  if (
    normalized.includes('permis b') ||
    normalized.includes('voiture') ||
    normalized.includes('auto') ||
    normalized.includes('véhicule léger')
  ) {
    return { type: 'B', label: 'Permis B • Voiture', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' };
  }

  // Default
  return { type: 'B', label: 'Formation Conduite', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700' };
}

export default function PermisIcon({ titre, className = 'h-6 w-6', size = 24 }: PermisIconProps) {
  const { type } = getPermisCategory(titre);

  switch (type) {
    case 'A':
      return <MotoIcon className={className} size={size} />;
    case 'G':
      return <TractorIcon className={className} size={size} />;
    case 'C':
      return <Truck className={className} size={size} />;
    case 'D':
      return <Bus className={className} size={size} />;
    case 'CODE':
      return <BookOpen className={className} size={size} />;
    case 'B':
    default:
      return <Car className={className} size={size} />;
  }
}
