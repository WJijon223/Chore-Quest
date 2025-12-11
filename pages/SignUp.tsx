import React, { useState } from 'react';
import { ParchmentCard, FantasyButton, FantasyInput } from '../components/FantasyUI';
import { Key, Scroll } from 'lucide-react';
import { auth } from '../services/firebase';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';

interface SignUpProps {
  onSignUp: (user: FirebaseUser, username?: string) => void;
  onNavigateToLogin: () => void;
}

const SignUp: React.FC<SignUpProps> = ({ onSignUp, onNavigateToLogin }) => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match, adventurer!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      onSignUp(userCredential.user, username);
    } catch (error) {
      console.error("Error signing up with email and password", error);
      alert("Could not create account. The email might be in use already.");
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      onSignUp(result.user);
    } catch (error) {
      console.error("Error signing up with Google", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ParchmentCard className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-black text-parchment-900 mb-2 tracking-wider">JOIN THE GUILD</h1>
          <div className="h-1 w-24 bg-parchment-800 mx-auto mb-2"></div>
          <p className="font-serif italic text-parchment-800">Begin your legend today</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <FantasyInput
            label="Email Address"
            type="email"
            placeholder="hero@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <FantasyInput
            label="Chosen Hero Name"
            type="text"
            placeholder="Sir Cleans-a-Lot"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FantasyInput
                label="Secret Word"
                type="password"
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="mb-0"
            />
            <FantasyInput
                label="Confirm Secret"
                type="password"
                placeholder="••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                className="mb-0"
            />
          </div>

          <div className="pt-6 flex flex-col gap-3">
            <FantasyButton type="submit" className="w-full justify-center text-lg" icon={Scroll}>
              Form Pact
            </FantasyButton>

            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-parchment-800/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-parchment-200 text-parchment-800 font-serif">Or join via</span>
                </div>
            </div>

            <FantasyButton
                type="button"
                variant="secondary"
                className="w-full justify-center"
                icon={Key}
                onClick={handleGoogleSignUp}
            >
              Sign Up with Google
            </FantasyButton>
          </div>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-parchment-800/20">
          <button onClick={onNavigateToLogin} className="text-parchment-900 font-bold hover:text-gold underline decoration-parchment-800/50 hover:decoration-gold font-serif text-sm">
            Already a member? Return to Login
          </button>
        </div>
      </ParchmentCard>
    </div>
  );
};

export default SignUp;
