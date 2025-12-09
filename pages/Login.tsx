import React from 'react';
import { ParchmentCard, FantasyButton, FantasyInput } from '../components/FantasyUI';
import { Feather, Key } from 'lucide-react';

interface LoginProps {
  onLogin: () => void;
  onNavigateToSignUp: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onNavigateToSignUp }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ParchmentCard className="w-full max-w-md shadow-2xl animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-serif font-black text-parchment-900 mb-2 tracking-wider">CHORE QUEST</h1>
          <div className="h-1 w-24 bg-parchment-800 mx-auto mb-2"></div>
          <p className="font-serif italic text-parchment-800">Sign the contract to begin your adventure</p>
        </div>

        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
          <FantasyInput label="Email Address" type="email" placeholder="hero@example.com" />
          <FantasyInput label="Secret Word (Password)" type="password" placeholder="••••••••" />
          
          <div className="pt-4 flex flex-col gap-3">
            <FantasyButton type="submit" className="w-full justify-center text-lg" icon={Feather}>
              Enter Realm
            </FantasyButton>
            
            <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-parchment-800/30"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-parchment-200 text-parchment-800 font-serif">Or invoke spirit summons</span>
                </div>
            </div>

            <FantasyButton type="button" variant="secondary" className="w-full justify-center" icon={Key}>
              Sign in with Google
            </FantasyButton>
          </div>
        </form>

        <div className="mt-8 text-center text-sm font-serif pt-4 border-t border-parchment-800/20">
          <span className="text-parchment-800">New to the guild? </span>
          <button onClick={onNavigateToSignUp} className="font-bold text-parchment-900 hover:text-gold underline decoration-dotted transition-colors">
            Sign Up
          </button>
        </div>
      </ParchmentCard>
    </div>
  );
};

export default Login;