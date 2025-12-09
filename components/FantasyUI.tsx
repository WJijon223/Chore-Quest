import React from 'react';
import { LucideIcon } from 'lucide-react';

// --- Card Component ---
interface ParchmentCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
}

export const ParchmentCard: React.FC<ParchmentCardProps> = ({ children, className = '', title }) => (
  <div className={`relative bg-parchment-200 border-2 border-parchment-800 rounded-lg shadow-[5px_5px_15px_rgba(0,0,0,0.3)] p-6 ${className}`}>
    {/* Decorative Corners */}
    <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-parchment-800 rounded-tl-sm -mt-1 -ml-1"></div>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-parchment-800 rounded-tr-sm -mt-1 -mr-1"></div>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-parchment-800 rounded-bl-sm -mb-1 -ml-1"></div>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-parchment-800 rounded-br-sm -mb-1 -mr-1"></div>
    
    {title && (
      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-parchment-800 text-parchment-100 px-4 py-1 rounded-sm shadow-md font-serif font-bold uppercase tracking-wider text-sm border border-gold">
        {title}
      </div>
    )}
    {children}
  </div>
);

// --- Button Component ---
interface FantasyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'secondary' | 'ghost';
  icon?: LucideIcon;
}

export const FantasyButton: React.FC<FantasyButtonProps> = ({ children, variant = 'primary', icon: Icon, className = '', ...props }) => {
  const baseStyles = "relative font-serif font-bold py-2 px-6 rounded-sm shadow-md transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border-2";
  
  const variants = {
    primary: "bg-parchment-800 text-parchment-100 border-gold hover:bg-parchment-900 hover:text-gold shadow-[0_4px_0_rgb(62,39,35)] active:shadow-none active:translate-y-1",
    danger: "bg-danger text-white border-red-900 hover:bg-danger-light shadow-[0_4px_0_rgb(100,0,0)] active:shadow-none active:translate-y-1",
    secondary: "bg-parchment-300 text-parchment-900 border-parchment-800 hover:bg-parchment-400",
    ghost: "bg-transparent text-parchment-900 border-transparent hover:bg-parchment-800/10",
  };

  return (
    <button className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

// --- Progress Bar (Health/XP) ---
interface ProgressBarProps {
  current: number;
  max: number;
  color?: string; // hex or tailwind class
  label?: string;
  type?: 'health' | 'xp';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, max, type = 'health', label }) => {
  const percentage = Math.min(100, Math.max(0, (current / max) * 100));
  
  const barColor = type === 'health' 
    ? 'bg-gradient-to-r from-red-800 via-red-600 to-red-500' 
    : 'bg-gradient-to-r from-yellow-700 via-yellow-500 to-yellow-300';
  
  const containerBorder = type === 'health' ? 'border-red-900' : 'border-yellow-900';

  return (
    <div className="w-full">
      {label && <div className="flex justify-between text-xs font-serif font-bold mb-1 uppercase tracking-widest opacity-80">{label} <span>{current}/{max}</span></div>}
      <div className={`h-6 w-full bg-black/40 rounded-full border-2 ${containerBorder} relative overflow-hidden shadow-inner`}>
        <div 
          className={`h-full ${barColor} transition-all duration-500 ease-out flex items-center justify-end pr-2`}
          style={{ width: `${percentage}%` }}
        >
           {/* Glare effect */}
           <div className="absolute top-0 left-0 w-full h-1/2 bg-white/20"></div>
        </div>
      </div>
    </div>
  );
};

// --- Input Field ---
interface FantasyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const FantasyInput: React.FC<FantasyInputProps> = ({ label, className = '', ...props }) => (
  <div className="w-full mb-4">
    {label && <label className="block font-serif text-parchment-900 font-bold mb-1 text-sm uppercase">{label}</label>}
    <input 
      className={`w-full bg-parchment-100 border-b-2 border-parchment-800 p-2 font-sans focus:outline-none focus:border-gold transition-colors placeholder-parchment-800/40 text-parchment-900 ${className}`} 
      {...props} 
    />
  </div>
);
