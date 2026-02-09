import React from 'react';

export const Logo = ({ variant = 'full', size = 'md', color = 'default' }) => {
  const sizes = {
    xs: { width: 100, fontSize: 14, iconSize: 28 },
    sm: { width: 120, fontSize: 18, iconSize: 32 },
    md: { width: 150, fontSize: 22, iconSize: 40 },
    lg: { width: 200, fontSize: 28, iconSize: 48 },
    xl: { width: 250, fontSize: 36, iconSize: 56 },
  };

  const colors = {
    default: { primary: '#DC2626', secondary: '#10B981', text: '#0F172A' },
    white: { primary: '#FFFFFF', secondary: '#F8FAFC', text: '#FFFFFF' },
    dark: { primary: '#DC2626', secondary: '#10B981', text: '#0F172A' },
    gradient: { primary: '#DC2626', secondary: '#F59E0B', text: '#0F172A' },
  };

  const { fontSize, iconSize } = sizes[size];
  const colorScheme = colors[color];
  const isWhite = color === 'white';

  // Modern turf/field icon
  if (variant === 'icon') {
    return (
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="turfGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle cx="24" cy="24" r="22" fill={isWhite ? 'rgba(255,255,255,0.15)' : 'url(#turfGradient)'} />
        {/* Turf/field lines */}
        <rect x="12" y="14" width="24" height="20" rx="2" stroke="white" strokeWidth="2" fill="none" />
        <line x1="24" y1="14" x2="24" y2="34" stroke="white" strokeWidth="2" />
        <circle cx="24" cy="24" r="5" stroke="white" strokeWidth="2" fill="none" />
        {/* Corner arcs */}
        <path d="M12 18 Q16 18 16 14" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M36 18 Q32 18 32 14" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M12 30 Q16 30 16 34" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M36 30 Q32 30 32 34" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <svg width={iconSize} height={iconSize} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle cx="24" cy="24" r="22" fill={isWhite ? 'rgba(255,255,255,0.15)' : 'url(#logoGradient)'} />
        {/* Turf/field lines */}
        <rect x="12" y="14" width="24" height="20" rx="2" stroke="white" strokeWidth="2" fill="none" />
        <line x1="24" y1="14" x2="24" y2="34" stroke="white" strokeWidth="2" />
        <circle cx="24" cy="24" r="5" stroke="white" strokeWidth="2" fill="none" />
        {/* Corner arcs */}
        <path d="M12 18 Q16 18 16 14" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M36 18 Q32 18 32 14" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M12 30 Q16 30 16 34" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M36 30 Q32 30 32 34" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
        <span style={{ 
          fontSize: fontSize, 
          fontWeight: 800, 
          color: colorScheme.text,
          fontFamily: 'Poppins, sans-serif',
          letterSpacing: '-0.02em',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            background: isWhite ? 'transparent' : 'linear-gradient(135deg, #DC2626, #F59E0B)',
            WebkitBackgroundClip: isWhite ? 'unset' : 'text',
            WebkitTextFillColor: isWhite ? colorScheme.text : 'transparent',
            backgroundClip: isWhite ? 'unset' : 'text',
          }}>Turf</span>
          <span style={{ color: isWhite ? colorScheme.text : '#0F172A' }}>Now</span>
        </span>
        <span style={{ 
          fontSize: fontSize * 0.38, 
          fontWeight: 500, 
          color: isWhite ? 'rgba(255,255,255,0.7)' : '#64748B',
          letterSpacing: '0.05em'
        }}>
          Book Instantly
        </span>
      </div>
    </div>
  );
};

export default Logo;
