import React, { useState } from 'react';
import { ParchmentCard, FantasyButton, FantasyInput } from '../components/FantasyUI';
import { Sword, Scroll } from 'lucide-react';

interface GoogleHeroSetupProps {
  onComplete: (heroName: string) => void;
}

const GoogleHeroSetup: React.FC<GoogleHeroSetupProps> = ({ onComplete }) => {
  const [heroName, setHeroName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroName.trim()) {
      onComplete(heroName);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ParchmentCard className="w-full max-w-md shadow-2xl animate-fade-in-up text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-parchment-300 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-parchment-800">
             <Scroll className="text-parchment-900" size={32} />
          </div>
          <h1 className="text-3xl font-serif font-black text-parchment-900 mb-2">Who goes there?</h1>
          <div className="h-1 w-24 bg-parchment-800 mx-auto mb-4"></div>
          <p className="font-serif italic text-parchment-800">
            The spirits have granted you entry, but every hero needs a name in these lands.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FantasyInput 
            label="Declare Your Hero Name" 
            placeholder="e.g. Sir Clean-a-Lot"
            value={heroName}
            onChange={(e) => setHeroName(e.target.value)}
            required
            autoFocus
          />
          
          <FantasyButton type="submit" className="w-full justify-center text-lg" icon={Sword}>
            Begin Adventure
          </FantasyButton>
        </form>
      </ParchmentCard>
    </div>
  );
};

export default GoogleHeroSetup;