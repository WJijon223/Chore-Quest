import React, { useState } from 'react';
import { auth, db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { FantasyButton, FantasyInput, ParchmentCard } from '../components/FantasyUI';

interface GoogleHeroSetupProps {
  onSetupComplete: () => void;
}

const GoogleHeroSetup: React.FC<GoogleHeroSetupProps> = ({ onSetupComplete }) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Please choose a name for your hero!');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, { username: username.trim() });
        onSetupComplete();
      } else {
        throw new Error("No authenticated user found.");
      }
    } catch (err) {
      console.error("Error updating username:", err);
      setError("Failed to save hero name. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ParchmentCard className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-serif font-bold text-parchment-900">Choose Your Hero Name</h1>
          <p className="font-serif text-parchment-800 mt-2">Your legend begins now. What shall the bards sing of you?</p>
        </div>
        <form onSubmit={handleSaveUsername} className="space-y-4">
          <FantasyInput
            label="Hero Name"
            type="text"
            placeholder="Sir Cleans-a-Lot"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          {error && <p className="text-danger text-sm text-center">{error}</p>}
          <div className="pt-2">
            <FantasyButton type="submit" className="w-full justify-center" disabled={loading}>
              {loading ? 'Saving...' : 'Begin My Quest'}
            </FantasyButton>
          </div>
        </form>
      </ParchmentCard>
    </div>
  );
};

export default GoogleHeroSetup;
