import React from 'react';
import { User, Swords, Scroll, LogOut } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'bosses';
  onNavigate: (page: 'dashboard' | 'bosses') => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col max-w-7xl mx-auto shadow-[0_0_100px_rgba(0,0,0,0.5)] min-w-[350px]">
      {/* Navigation Bar */}
      <nav className="bg-parchment-800 text-parchment-200 px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-50 border-b-4 border-gold">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="bg-gold text-parchment-900 p-1 rounded-sm border border-parchment-100">
             <Swords size={24} />
          </div>
          <span className="font-serif font-black text-xl tracking-widest hidden sm:block text-gold">CHORE QUEST</span>
        </div>

        <div className="flex gap-1 md:gap-4">
          <NavButton 
            active={activePage === 'dashboard'} 
            onClick={() => onNavigate('dashboard')} 
            icon={User}
            label="Profile"
          />
          <NavButton 
            active={activePage === 'bosses'} 
            onClick={() => onNavigate('bosses')} 
            icon={Scroll}
            label="Bosses"
          />
        </div>

        <button onClick={onLogout} className="text-parchment-400 hover:text-danger-light transition-colors p-2">
          <LogOut size={20} />
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 bg-parchment-200/50 overflow-hidden">
        {children}
      </main>
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ active, onClick, icon: Icon, label }) => (
  <button 
    onClick={onClick}
    className={`
      flex items-center gap-2 px-4 py-2 rounded-sm font-serif font-bold transition-all
      ${active 
        ? 'bg-parchment-200 text-parchment-900 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)] translate-y-[1px]' 
        : 'text-parchment-300 hover:text-gold hover:bg-parchment-900'}
    `}
  >
    <Icon size={18} />
    <span className="hidden sm:block">{label}</span>
  </button>
);

export default Layout;
