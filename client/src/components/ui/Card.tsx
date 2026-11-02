import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'subtle' | 'interactive' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  className,
  variant = 'default',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-white border border-slate-200/80 shadow-card',
    subtle: 'bg-slate-50/60 border border-slate-200/60 shadow-none',
    interactive:
      'bg-white border border-slate-200/80 shadow-card hover:shadow-elevated hover:border-indigo-200 transition-all duration-200 cursor-pointer',
    bordered: 'bg-transparent border-2 border-dashed border-slate-200',
  };

  return (
    <div
      className={cn('rounded-2xl p-6 transition-all', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

