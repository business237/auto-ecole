import { useEffect, useState } from 'react';

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-pacifique-blue-500 via-pacifique-red-500 to-pacifique-blue-600 transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  light?: boolean;
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  centered = false,
  light = false,
  className = '',
}: SectionHeadingProps) {
  return (
    <div className={`${centered ? 'text-center mx-auto max-w-2xl' : 'max-w-2xl'} ${className}`}>
      {eyebrow && (
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${
            light
              ? 'bg-white/10 text-pacifique-blue-200 border border-white/15'
              : 'bg-pacifique-blue-50 text-pacifique-blue-600 border border-pacifique-blue-100'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-pacifique-blue-300' : 'bg-pacifique-red-500'}`} />
          {eyebrow}
        </span>
      )}
      <h2
        className={`mt-4 font-display text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-4xl ${
          light ? 'text-white' : 'text-pacifique-navy-900'
        }`}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={`mt-4 text-base sm:text-lg leading-relaxed ${
            light ? 'text-pacifique-blue-100/75' : 'text-pacifique-navy-700/75'
          }`}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
