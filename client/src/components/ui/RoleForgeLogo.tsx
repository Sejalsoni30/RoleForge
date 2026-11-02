import React from 'react';

interface RoleForgeLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export const RoleForgeLogo: React.FC<RoleForgeLogoProps> = ({
  size = 'md',
  showWordmark = true,
  showSubtitle = false,
  className = '',
  iconOnly = false,
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { box: 'w-9 h-9', icon: 36, text: 'text-lg', sub: 'text-[10px]' },
    lg: { box: 'w-11 h-11', icon: 44, text: 'text-xl', sub: 'text-[11px]' },
    xl: { box: 'w-14 h-14', icon: 56, text: 'text-2xl', sub: 'text-xs' },
  };

  const current = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className={`${current.box} rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-600 p-[1px] shadow-sm shadow-indigo-500/25 flex items-center justify-center transition-transform duration-200 group-hover:scale-105 shrink-0`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          <defs>
            <linearGradient id="rf-blade-white" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FFFFFF" />
              <stop offset="100%" stop-color="#E0E7FF" />
            </linearGradient>
            <linearGradient id="rf-blade-subtle" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#C7D2FE" />
              <stop offset="100%" stop-color="#818CF8" />
            </linearGradient>
            <linearGradient id="rf-core-spark" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38BDF8" />
              <stop offset="100%" stop-color="#60A5FA" />
            </linearGradient>
          </defs>

          {/* Left Vertical Spine / Document Edge */}
          <path
            d="M12 10C12 8.89543 12.8954 8 14 8H20C21.1046 8 22 8.89543 22 10V38C22 39.1046 21.1046 40 20 40H14C12.8954 40 12 39.1046 12 38V10Z"
            fill="url(#rf-blade-white)"
          />

          {/* Upper Precision Beam (Target Match) */}
          <path
            d="M20 8H31.5C33.433 8 34.536 10.2026 33.346 11.7259L29.088 17.1741C28.477 17.9555 27.537 18.413 26.542 18.413H20V8Z"
            fill="url(#rf-blade-white)"
          />

          {/* Lower Dynamic Tier (Resume Engine) */}
          <path
            d="M20 20H28C29.8713 20 30.9763 22.0957 29.9113 23.6353L26.8447 28.0683C26.2536 28.9231 25.3323 29.419 24.3213 29.419H20V20Z"
            fill="url(#rf-blade-subtle)"
          />

          {/* Radiant Forge Spark */}
          <polygon points="35,28 37.5,23 40,28 37.5,33" fill="url(#rf-core-spark)" />
          <circle cx="37.5" cy="28" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Typography */}
      {showWordmark && !iconOnly && (
        <div className="flex flex-col leading-none">
          <span
            className={`${current.text} font-bold tracking-tight text-slate-900 font-display`}
          >
            Role<span className="text-indigo-600">Forge</span>
          </span>
          {showSubtitle && (
            <span
              className={`${current.sub} font-semibold uppercase tracking-wider text-slate-400 mt-1`}
            >
              Resume-to-Job Compiler
            </span>
          )}
        </div>
      )}
    </div>
  );
};

