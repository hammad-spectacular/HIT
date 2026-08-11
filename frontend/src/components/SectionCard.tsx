import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  variant?: 'default' | 'today' | 'manage' | 'history' | 'insights' | 'review' | 'journal';
  children: ReactNode;
}

export default function SectionCard({ title, subtitle, variant = 'default', children }: Props) {
  const cardClass =
    variant === 'today'
      ? 'section-card-today'
      : variant === 'manage'
        ? 'section-card-manage'
        : variant === 'history'
          ? 'section-card-history'
          : variant === 'insights'
            ? 'section-card-insights'
            : variant === 'review'
              ? 'section-card-review'
              : variant === 'journal'
              ? 'section-card-journal'
              : 'section-card';

  return (
    <section className={cardClass}>
      <div className="mb-4 sm:mb-5">
        <h2 className="section-heading text-lg sm:text-xl">{title}</h2>
        {subtitle && <p className="section-subheading">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
