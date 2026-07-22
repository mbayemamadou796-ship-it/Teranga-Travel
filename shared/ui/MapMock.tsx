/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SenegalDestination } from '../types';
import { MapPin } from 'lucide-react';

interface MapMockProps {
  selectedDestination?: SenegalDestination | null;
  onSelectDestination?: (dest: SenegalDestination) => void;
}

export default function MapMock({ selectedDestination, onSelectDestination }: MapMockProps) {
  // Relative position percentage of Senegal's shape
  const destinationsCoords: { name: SenegalDestination; x: number; y: number; description: string }[] = [
    { name: 'Dakar', x: 10, y: 35, description: 'La Presqu\'île vibrante' },
    { name: 'Saint-Louis', x: 25, y: 10, description: 'L\'Île Coloniale' },
    { name: 'Sine Saloum', x: 15, y: 55, description: 'Les Bolongs Sauvages' },
    { name: 'Casamance', x: 14, y: 80, description: 'La Forêt Luxuriante' },
    { name: 'Kédougou', x: 80, y: 78, description: 'Les Montagnes & Cascades' },
  ];

  return (
    <div id="interactive-map-container" className="relative w-full aspect-[4/3] max-w-2xl mx-auto rounded-3xl bg-blue-50 border-2 border-blue-100 overflow-hidden shadow-sm">
      {/* Ocean background styling */}
      <div className="absolute inset-0 bg-radial from-blue-50 to-blue-100 opacity-60 pointer-events-none" />
      
      {/* Custom Senegal land schematic */}
      <svg
        viewBox="0 0 500 375"
        className="absolute inset-0 w-full h-full text-amber-100 fill-current opacity-90 stroke-amber-200 stroke-2"
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.05))' }}
      >
        {/* Simplified Senegal polygon outline */}
        <path d="M 50 150 L 150 10 L 250 10 L 300 20 L 400 30 L 450 100 L 480 150 L 450 220 L 420 300 L 480 340 L 440 370 L 350 360 L 320 310 L 250 310 L 200 320 L 100 340 L 70 340 L 70 300 L 120 300 L 140 280 L 120 265 L 50 265 L 60 220 L 80 190 Z" />
        
        {/* River Senegal schematic border */}
        <path d="M 150 10 Q 200 5, 250 10 T 320 18 T 400 32 T 450 102" fill="none" stroke="#2563eb" strokeWidth="2" strokeDasharray="3,3" opacity="0.6" />
        {/* River Casamance schematic */}
        <path d="M 60 305 Q 100 300, 140 305 T 200 300" fill="none" stroke="#2563eb" strokeWidth="1.5" opacity="0.6" />
      </svg>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Map Labels */}
      <div className="absolute top-4 left-6 pointer-events-none">
        <h4 className="font-sans font-semibold text-gray-800 text-sm tracking-wide uppercase">Carte du Sénégal</h4>
        <p className="text-xs text-gray-500 font-mono">Zones MVP Teranga Travel</p>
      </div>

      <div className="absolute bottom-4 left-6 pointer-events-none">
        <div className="flex items-center gap-1.5 text-xs text-blue-700 font-medium bg-blue-50/80 px-2.5 py-1 rounded-full border border-blue-100">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Océan Atlantique
        </div>
      </div>

      {/* Compass rose symbol */}
      <div className="absolute top-4 right-6 w-12 h-12 opacity-30 flex items-center justify-center font-mono text-[10px] text-gray-600 border border-gray-400 rounded-full">
        <span className="absolute top-0.5">N</span>
        <span className="absolute right-0.5">E</span>
        <span className="absolute bottom-0.5">S</span>
        <span className="absolute left-0.5">O</span>
        <div className="w-1.5 h-1.5 bg-amber-800 rounded-full" />
      </div>

      {/* Destination Markers */}
      {destinationsCoords.map((dest) => {
        const isSelected = selectedDestination === dest.name;
        return (
          <button
            key={dest.name}
            id={`map-marker-${dest.name.toLowerCase().replace(' ', '-')}`}
            onClick={() => onSelectDestination?.(dest.name)}
            className="absolute group -translate-x-1/2 -translate-y-1/2 flex flex-col items-center focus:outline-none transition-transform hover:scale-110 cursor-pointer"
            style={{ left: `${dest.x}%`, top: `${dest.y}%` }}
          >
            {/* Pulsing effect for selected/hovered */}
            <span className={`absolute w-8 h-8 rounded-full bg-emerald-500/30 transition-all duration-300 scale-125 ${
              isSelected ? 'animate-ping scale-150' : 'scale-0 group-hover:scale-100'
            }`} />

            {/* Marker pin */}
            <div className={`p-1.5 rounded-full border-2 transition-all duration-300 shadow-md ${
              isSelected 
                ? 'bg-emerald-600 text-white border-white scale-125' 
                : 'bg-white text-emerald-700 border-emerald-500 group-hover:bg-emerald-50'
            }`}>
              <MapPin size={isSelected ? 18 : 15} className="stroke-[2.5]" />
            </div>

            {/* Tooltip text */}
            <div className={`mt-1 bg-white border border-gray-100 px-2.5 py-1 rounded-xl shadow-lg flex flex-col items-center text-center max-w-[140px] pointer-events-none transition-all duration-200 ${
              isSelected 
                ? 'opacity-100 translate-y-0 scale-100 z-10' 
                : 'opacity-80 group-hover:opacity-100 translate-y-0.5 scale-95 z-0'
            }`}>
              <span className="font-sans font-bold text-gray-900 text-[11px] leading-tight">{dest.name}</span>
              <span className="text-[9px] text-gray-500 font-medium whitespace-nowrap">{dest.description}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
