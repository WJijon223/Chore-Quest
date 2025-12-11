import React, { useState } from 'react';
import { ParchmentCard, FantasyButton, FantasyInput } from '../components/FantasyUI';
import { updateUsernameAndFinalize } from '../services/firebase';
import { User } from '../types';

interface GoogleHeroSetupProps {
  user: User;
}

const GoogleHeroSetup: React.FC<GoogleHeroSetupProps> = ({ user }) => {
  const [username, setUsername] = useState(user.username);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    if (!username.trim()) {
      setError("Please choose a name for your hero.");
      return;
    }
    try {
      await updateUsernameAndFinalize(user.id, username);
    } catch (error) {
      console.error("Error updating username:", error);
      setError("Could not set hero name. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-parchment-100">
      <ParchmentCard className="w-full max-w-lg shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-black text-parchment-900 mb-2 tracking-wider">Welcome, Hero!</h1>
          <p className="font-serif italic text-parchment-800">Your legend is about to begin. Choose your name.</p>
        </div>

        {error && (
          <div className="bg-danger/20 border border-danger text-danger-dark px-4 py-3 rounded-lg relative mb-6 text-center">
            <strong className="font-bold">Halt!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6">
            <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-parchment-800" />
            <FantasyInput
                label="Choose Your Hero Name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="flex-grow"
            />
        </div>

        <FantasyButton onClick={handleSetup} className="w-full justify-center text-lg">
          Begin My Quest
        </FantasyButton>
      </ParchmentCard>
    </div>
  );
};

export default GoogleHeroSetup;
