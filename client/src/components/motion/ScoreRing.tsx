import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

export const ScoreRing: React.FC<ScoreRingProps> = ({
  score,
  size = 120,
  strokeWidth = 10,
  label = 'RoleForge Estimate',
  className = '',
}) => {
  const [currentScore, setCurrentScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const end = normalizedScore;
    if (start === end) {
      setCurrentScore(end);
      return;
    }
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      setCurrentScore(Math.round(ease * end));
      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [normalizedScore]);

  // Color gradient based on score
  const getColor = (s: number) => {
    if (s >= 80) return '#059669'; // Emerald
    if (s >= 65) return '#4f46e5'; // Indigo
    if (s >= 50) return '#d97706'; // Amber
    return '#e11d48'; // Rose
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Animated score circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(normalizedScore)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            {currentScore}%
          </span>
        </div>
      </div>
      {label && (
        <span className="mt-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </span>
      )}
    </div>
  );
};

