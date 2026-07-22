import React from 'react';

interface TerangaLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  textPosition?: 'right' | 'bottom';
  textColor?: string;
  subtitleColor?: string;
}

export const TerangaLogo: React.FC<TerangaLogoProps> = ({
  className = '',
  size = 44,
  showText = true,
  textPosition = 'right',
  textColor = 'text-gray-900',
  subtitleColor = 'text-gray-500',
}) => {
  return (
    <div className={`flex items-center ${textPosition === 'bottom' ? 'flex-col text-center gap-3' : 'flex-row gap-3'} ${className}`}>
      {/* Dynamic crisp SVG Logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-sm select-none transition-transform hover:scale-105 duration-300"
      >
        {/* Background rounded rect card matching the mobile icon */}
        <rect x="2" y="2" width="96" height="96" rx="24" fill="white" stroke="#f1f5f9" strokeWidth="1.5" />

        {/* Circular Dashed Connectors (Blue sky-blue) */}
        <circle cx="50" cy="46" r="32" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.85" />
        
        {/* Connecting dotted lines radiating from center tree */}
        <line x1="50" y1="46" x2="20" y2="46" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
        <line x1="50" y1="46" x2="80" y2="46" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
        <line x1="50" y1="46" x2="32" y2="72" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
        <line x1="50" y1="46" x2="68" y2="72" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="2 2" opacity="0.6" />
        
        {/* Central Node representing Senegal core connection */}
        <circle cx="50" cy="46" r="2.5" fill="#38bdf8" stroke="white" strokeWidth="1" />

        {/* --- BAOBAB TREE (Dual Color: Green left, Orange/Gold right) --- */}
        
        {/* Left Canopy (Green) */}
        <path
          d="M 50 20 C 42 20, 36 24, 34 30 C 31 32, 29 36, 31 41 C 32 45, 36 47, 40 46 C 43 45, 46 47, 49 49 L 50 49 Z"
          fill="#15803d"
        />
        {/* Right Canopy (Orange) */}
        <path
          d="M 50 20 C 58 20, 64 24, 66 30 C 69 32, 71 36, 69 41 C 68 45, 64 47, 60 46 C 57 45, 54 47, 51 49 L 50 49 Z"
          fill="#ea580c"
        />

        {/* White Senegal Map Silhouette inside leaf canopy */}
        <path
          d="M 45 28 C 44 29, 43 28, 42 29 C 41.5 29.5, 41.5 30.5, 42 31 C 42.5 31.5, 43.5 31, 44 31.5 C 44.5 31.5, 45 32, 45.5 31.8 C 46 31.5, 46.5 32, 47 31.8 L 48 31.5 L 48 30 L 47 29 C 46 28, 45.5 28, 45 28 Z"
          fill="white"
          opacity="0.9"
        />

        {/* Tree Trunk & Branches (Divided Color) */}
        {/* Left trunk (Green) */}
        <path
          d="M 50 46 L 47 58 C 45 61, 41 63, 37 64 C 36 64.5, 37 65.5, 38 65 C 43 64.5, 47 61, 49 58 L 50 58 Z"
          fill="#15803d"
        />
        {/* Right trunk (Orange) */}
        <path
          d="M 50 46 L 53 58 C 55 61, 59 63, 63 64 C 64 64.5, 63 65.5, 62 65 C 57 64.5, 53 61, 51 58 L 50 58 Z"
          fill="#ea580c"
        />

        {/* Roots */}
        <path d="M 47 58 C 45 61, 43 65, 38 66 C 39 67, 44 65, 48 61 Z" fill="#15803d" />
        <path d="M 53 58 C 55 61, 57 65, 62 66 C 61 67, 56 65, 52 61 Z" fill="#ea580c" />
        <path d="M 50 58 L 49 68 L 51 68 Z" fill="#15803d" />

        {/* --- TRAVEL ICONS OVER DASHER CIRCLE --- */}

        {/* 1. Safari Hat & Backpack (Green - Mid Left) */}
        <g transform="translate(13, 39)">
          <circle cx="5" cy="5" r="7.5" fill="white" stroke="#15803d" strokeWidth="1" />
          {/* Hat top outline */}
          <path d="M 2 5.5 C 2 4, 3 3, 5 3 C 7 3, 8 4, 8 5.5 Z" fill="#16a34a" />
          <ellipse cx="5" cy="6" rx="4.5" ry="1.2" fill="#15803d" />
          {/* Bag */}
          <rect x="3.5" y="6" width="3" height="3" rx="0.5" fill="#16a34a" />
        </g>

        {/* 2. Hotel & Wave pool (Cyan/Teal - Mid Right) */}
        <g transform="translate(72, 39)">
          <circle cx="5" cy="5" r="7.5" fill="white" stroke="#0891b2" strokeWidth="1" />
          <rect x="2.5" y="2.5" width="4" height="6" rx="0.5" fill="#0891b2" />
          {/* Windows */}
          <rect x="3.5" y="3.5" width="1" height="1" fill="white" />
          <rect x="3.5" y="5" width="1" height="1" fill="white" />
          {/* Wave */}
          <path d="M 7 5 Q 8 4.5, 9 5 Q 10 5.5, 11 5" stroke="#0ea5e9" strokeWidth="0.75" fill="none" />
          <path d="M 7 6.5 Q 8 6, 9 6.5 Q 10 7, 11 6.5" stroke="#0ea5e9" strokeWidth="0.75" fill="none" />
        </g>

        {/* 3. Traditional Hut (Orange - Bottom Right) */}
        <g transform="translate(62, 66)">
          <circle cx="5" cy="5" r="7.5" fill="white" stroke="#ea580c" strokeWidth="1" />
          {/* Roof */}
          <path d="M 5 2 L 2 5 L 8 5 Z" fill="#ea580c" />
          {/* Walls */}
          <rect x="3" y="5" width="4" height="3.5" fill="#f97316" />
          {/* Door */}
          <rect x="4.2" y="6.2" width="1.6" height="2.3" rx="0.3" fill="white" />
        </g>

        {/* 4. Camera & Suitcase (Blue - Bottom Left) */}
        <g transform="translate(23, 66)">
          <circle cx="5" cy="5" r="7.5" fill="white" stroke="#2563eb" strokeWidth="1" />
          {/* Suitcase */}
          <rect x="2.5" y="4" width="3.5" height="4.5" rx="0.5" fill="#2563eb" />
          <path d="M 3.5 4 L 3.5 3 L 5 3 L 5 4" stroke="#2563eb" strokeWidth="0.75" fill="none" />
          {/* Camera */}
          <rect x="5" y="5" width="4" height="3" rx="0.5" fill="#3b82f6" />
          <circle cx="7" cy="6.5" r="1" fill="white" />
        </g>

        {/* 5. Flying Airplane & Birds (Sky Blue - Top Right & Top Center) */}
        <g transform="translate(60, 20)">
          {/* Small Plane */}
          <path
            d="M 2 7 L 4 5 L 7 5 L 4 2 L 3 2 L 5 5 L 2 5 L 1 4 L 0 4 L 1 5.5 L 0 7 L 1 7 L 2 5.5 Z"
            fill="#0284c7"
            transform="rotate(25)"
          />
        </g>
        
        {/* Birds Silhouette (Top center) */}
        <path d="M 35 15 Q 37.5 13, 40 15 Q 42.5 13, 45 15" stroke="#15803d" strokeWidth="0.75" fill="none" />
        <path d="M 42 11 Q 44 9.5, 46 11 Q 48 9.5, 50 11" stroke="#ea580c" strokeWidth="0.75" fill="none" />
        <path d="M 52 14 Q 54 12.5, 56 14 Q 58 12.5, 60 14" stroke="#0ea5e9" strokeWidth="0.75" fill="none" />
      </svg>

      {/* Brand Text */}
      {showText && (
        <div className={textPosition === 'bottom' ? 'text-center' : 'text-left'}>
          <h1 className={`font-sans font-extrabold text-lg tracking-tight leading-none ${textColor}`}>
            Teranga Travel
          </h1>
          <p className={`text-[9px] font-mono tracking-widest uppercase mt-1 ${subtitleColor}`}>
            Connecting Senegal
          </p>
        </div>
      )}
    </div>
  );
};
