import React from 'react';

interface SectionCardProps {
  title?: string;
  level: number;
  children: React.ReactNode;
}

export default function SectionCard({ title, level, children }: SectionCardProps) {
  // Determine padding based on heading level
  const paddingClass = level === 2 ? 'p-6' : 'p-4';
  // Determine border style - H2 gets a stronger visual separation
  const borderClass = level === 2 ? 'border-l-4 border-primary' : 'border-l-2 border-muted';
  // Title styling
  const titleClass = level === 2 
    ? 'text-xl font-bold text-primary mb-3' 
    : 'text-lg font-semibold text-primary mb-2';

  return (
    <div className={`bg-card rounded-xl shadow-sm border ${borderClass} ${paddingClass} mb-6 transition-all hover:shadow-md`}>
      {title && level === 2 && <h2 className={titleClass}>{title}</h2>}
      {title && level === 3 && <h3 className={titleClass}>{title}</h3>}
      <div className="prose prose-sm dark:prose-invert max-w-none">
        {children}
      </div>
    </div>
  );
}